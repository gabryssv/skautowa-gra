import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { Patrol, Member, Level, Task, INITIAL_LEVELS } from '../types/game';
import type { DbMember, DbTask } from '../types/database';

interface UsePatrolsReturn {
  patrols: Patrol[];
  loading: boolean;
  error: string | null;
  updateTask: (patrolId: string, levelIndex: number, taskId: string, newCurrent: number) => Promise<void>;
  updateMembers: (patrolId: string, members: Member[]) => Promise<void>;
  addMember: (patrolId: string, name: string) => Promise<void>;
  removeMember: (patrolId: string, memberId: string) => Promise<void>;
  updateMemberTasks: (patrolId: string, memberId: string, tasksCompleted: number) => Promise<void>;
  refresh: () => Promise<void>;
}

// Konwertuj dane z bazy na format aplikacji
function buildPatrolFromDb(
  dbPatrol: { id: string; name: string; color: string; current_level: number },
  dbMembers: DbMember[],
  dbTasks: DbTask[]
): Patrol {
  // Zbuduj levels na podstawie INITIAL_LEVELS i danych z bazy
  const levels: Level[] = INITIAL_LEVELS.map((levelTemplate, index) => {
    const tasks: Task[] = levelTemplate.tasks.map(taskTemplate => {
      // Znajdź postęp tego zadania w bazie
      const dbTask = dbTasks.find(t => t.task_key === taskTemplate.id);
      const current = dbTask?.current ?? 0;
      const completed = current >= taskTemplate.target;
      
      return {
        ...taskTemplate,
        current,
        completed,
      };
    });

    const isCompleted = tasks.every(t => t.completed);
    // Pierwszy poziom zawsze odblokowany, kolejne - jeśli poprzedni ukończony
    const isUnlocked = index === 0 || (index > 0 && levels[index - 1]?.isCompleted);

    return {
      level: levelTemplate.level,
      name: levelTemplate.name,
      tasks,
      isUnlocked: index === 0, // Będzie przeliczone poniżej
      isCompleted,
    };
  });

  // Przelicz odblokowanie poziomów
  for (let i = 1; i < levels.length; i++) {
    levels[i].isUnlocked = levels[i - 1].isCompleted;
  }

  // Oblicz currentLevel (liczba ukończonych poziomów)
  let currentLevel = 0;
  for (let i = 0; i < levels.length; i++) {
    if (levels[i].isCompleted) {
      currentLevel = i + 1;
    } else {
      break;
    }
  }

  // Konwertuj członków
  const members: Member[] = dbMembers.map(m => ({
    id: m.id,
    name: m.name,
    tasksCompleted: m.tasks_completed,
  }));

  return {
    id: dbPatrol.id,
    name: dbPatrol.name,
    color: dbPatrol.color,
    currentLevel,
    levels,
    members,
  };
}

export function usePatrols(): UsePatrolsReturn {
  const [patrols, setPatrols] = useState<Patrol[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pobierz wszystkie dane
  const fetchPatrols = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Pobierz zastępy
      const { data: dbPatrols, error: patrolsError } = await supabase
        .from('patrols')
        .select('*')
        .order('name');

      if (patrolsError) throw patrolsError;

      // Pobierz wszystkich członków
      const { data: dbMembers, error: membersError } = await supabase
        .from('members')
        .select('*');

      if (membersError) throw membersError;

      // Pobierz wszystkie taski
      const { data: dbTasks, error: tasksError } = await supabase
        .from('tasks')
        .select('*');

      if (tasksError) throw tasksError;

      // Zbuduj patrole
      const builtPatrols = (dbPatrols || []).map((dbPatrol: { id: string; name: string; color: string; current_level: number }) => {
        const patrolMembers = (dbMembers || []).filter((m: DbMember) => m.patrol_id === dbPatrol.id);
        const patrolTasks = (dbTasks || []).filter((t: DbTask) => t.patrol_id === dbPatrol.id);
        return buildPatrolFromDb(dbPatrol, patrolMembers, patrolTasks);
      });

      // Zaktualizuj zadania "na stopień" na podstawie członków
      for (const patrol of builtPatrols) {
        const totalMemberTasks = patrol.members.reduce((sum: number, m: Member) => sum + m.tasksCompleted, 0);
        for (const level of patrol.levels) {
          for (const task of level.tasks) {
            if (task.id.includes('-t2')) {
              task.current = totalMemberTasks;
              task.completed = totalMemberTasks >= task.target;
            }
          }
          level.isCompleted = level.tasks.every((t: Task) => t.completed);
        }
        // Przelicz odblokowanie
        for (let i = 1; i < patrol.levels.length; i++) {
          patrol.levels[i].isUnlocked = patrol.levels[i - 1].isCompleted;
        }
        // Przelicz currentLevel
        patrol.currentLevel = 0;
        for (let i = 0; i < patrol.levels.length; i++) {
          if (patrol.levels[i].isCompleted) {
            patrol.currentLevel = i + 1;
          } else {
            break;
          }
        }
      }

      setPatrols(builtPatrols);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Błąd pobierania danych');
      console.error('Error fetching patrols:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Pobierz dane przy montowaniu
  useEffect(() => {
    fetchPatrols();
  }, [fetchPatrols]);

  // Subskrybuj zmiany w czasie rzeczywistym
  useEffect(() => {
    const patrolsChannel = supabase
      .channel('patrols-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'patrols' }, () => {
        fetchPatrols();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, () => {
        fetchPatrols();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'tasks' }, () => {
        fetchPatrols();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(patrolsChannel);
    };
  }, [fetchPatrols]);

  // Aktualizuj zadanie
  const updateTask = async (patrolId: string, _levelIndex: number, taskId: string, newCurrent: number) => {
    // Nie pozwól na ręczną edycję zadań "na stopień"
    if (taskId.includes('-t2')) return;

    try {
      // Sprawdź czy task istnieje w bazie
      const { data: existing } = await supabase
        .from('tasks')
        .select('id')
        .eq('patrol_id', patrolId)
        .eq('task_key', taskId)
        .single() as any;

      if (existing) {
        // Zaktualizuj
        await (supabase
          .from('tasks') as any)
          .update({ current: Math.max(0, newCurrent), updated_at: new Date().toISOString() })
          .eq('id', existing.id);
      } else {
        // Utwórz nowy
        await (supabase
          .from('tasks') as any)
          .insert({
            patrol_id: patrolId,
            task_key: taskId,
            current: Math.max(0, newCurrent),
          });
      }
    } catch (err) {
      console.error('Error updating task:', err);
      throw err;
    }
  };

  // Dodaj członka
  const addMember = async (patrolId: string, name: string) => {
    try {
      await (supabase
        .from('members') as any)
        .insert({
          patrol_id: patrolId,
          name: name.trim(),
          tasks_completed: 0,
        });
    } catch (err) {
      console.error('Error adding member:', err);
      throw err;
    }
  };

  // Usuń członka
  const removeMember = async (patrolId: string, memberId: string) => {
    try {
      await supabase
        .from('members')
        .delete()
        .eq('id', memberId)
        .eq('patrol_id', patrolId);
    } catch (err) {
      console.error('Error removing member:', err);
      throw err;
    }
  };

  // Aktualizuj liczbę zadań członka
  const updateMemberTasks = async (patrolId: string, memberId: string, tasksCompleted: number) => {
    try {
      await (supabase
        .from('members') as any)
        .update({ 
          tasks_completed: Math.max(0, tasksCompleted),
          updated_at: new Date().toISOString()
        })
        .eq('id', memberId)
        .eq('patrol_id', patrolId);
    } catch (err) {
      console.error('Error updating member tasks:', err);
      throw err;
    }
  };

  // Zaktualizuj wszystkich członków (zachowane dla kompatybilności)
  const updateMembers = async (_patrolId: string, _members: Member[]) => {
    // Ta funkcja jest teraz mniej potrzebna, ale zachowujemy dla kompatybilności
    // Operacje na członkach robione są pojedynczo przez addMember/removeMember/updateMemberTasks
  };

  return {
    patrols,
    loading,
    error,
    updateTask,
    updateMembers,
    addMember,
    removeMember,
    updateMemberTasks,
    refresh: fetchPatrols,
  };
}

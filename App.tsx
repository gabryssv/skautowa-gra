import { useState, useEffect, useRef } from "react";
import confetti from "canvas-confetti";
import { Patrol, Member } from "./types/game";
import { PatrolProgress } from "./components/PatrolProgress";
import { LevelCard } from "./components/LevelCard";
import { PatrolLeaderPanel } from "./components/PatrolLeaderPanel";
import { Button } from "./components/ui/button";
import { LogOut, Loader2 } from "lucide-react";
import { useAuth } from "./hooks/useAuth";
import { usePatrols } from "./hooks/usePatrols";

function App() {
  const { user, loading: authLoading, signOut, isLeaderOf } = useAuth();
  const { 
    patrols, 
    loading: patrolsLoading, 
    error,
    updateTask, 
    addMember, 
    removeMember, 
    updateMemberTasks 
  } = usePatrols();

  const [selectedPatrolForLeader, setSelectedPatrolForLeader] = useState<string | null>(null);
  
  // Śledź poprzednie ukończone poziomy dla efektu confetti
  const previousCompletedLevels = useRef<Map<string, Set<number>>>(new Map());

  // Efekt confetti przy ukończeniu poziomu
  useEffect(() => {
    for (const patrol of patrols) {
      const prevCompleted = previousCompletedLevels.current.get(patrol.id) || new Set();
      
      for (const level of patrol.levels) {
        if (level.isCompleted && !prevCompleted.has(level.level)) {
          // Nowo ukończony poziom - odpal confetti!
          confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.6 },
            colors: [patrol.color, '#ffd700', '#ff6b6b', '#4ecdc4']
          });
        }
      }
      
      // Zaktualizuj poprzednie ukończone
      const newCompleted = new Set(patrol.levels.filter(l => l.isCompleted).map(l => l.level));
      previousCompletedLevels.current.set(patrol.id, newCompleted);
    }
  }, [patrols]);

  const handleUpdateTask = async (patrolId: string, levelIndex: number, taskId: string, newCurrent: number) => {
    await updateTask(patrolId, levelIndex, taskId, newCurrent);
  };

  const handleUpdateMembers = async (patrolId: string, members: Member[]) => {
    // Ta funkcja jest zachowana dla kompatybilności z PatrolLeaderPanel
    // Operacje wykonywane są przez addMember/removeMember/updateMemberTasks
  };

  const handleAddMember = async (patrolId: string, name: string) => {
    await addMember(patrolId, name);
  };

  const handleRemoveMember = async (patrolId: string, memberId: string) => {
    await removeMember(patrolId, memberId);
  };

  const handleUpdateMemberTasks = async (patrolId: string, memberId: string, tasksCompleted: number) => {
    await updateMemberTasks(patrolId, memberId, tasksCompleted);
  };

  // Loading state
  if (authLoading || patrolsLoading) {
    return (
      <div className="min-h-screen bg-[#0f0f1e] flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-[#ffd700] animate-spin mx-auto mb-4" />
          <p className="text-[#00ff00] text-xs">▶ ŁADOWANIE GRY...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#0f0f1e] flex items-center justify-center">
        <div className="text-center p-6 bg-[#1a1a2e] border-4 border-[#ff6b6b]">
          <p className="text-[#ff6b6b] text-xs mb-4">❌ BŁĄD: {error}</p>
          <Button 
            onClick={() => window.location.reload()}
            className="bg-[#ff6b6b] hover:bg-[#ff5252] text-white border-4 border-[#8b0000]"
          >
            ▶ ODŚWIEŻ STRONĘ
          </Button>
        </div>
      </div>
    );
  }

  // No patrols
  if (patrols.length === 0) {
    return (
      <div className="min-h-screen bg-[#0f0f1e] flex items-center justify-center">
        <div className="text-center p-6 bg-[#1a1a2e] border-4 border-[#ffd700]">
          <p className="text-[#ffd700] text-xs mb-4">⚠️ BRAK ZASTĘPÓW W BAZIE</p>
          <p className="text-gray-400 text-xs">Uruchom skrypt SQL w Supabase Dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f0f1e]" style={{
      backgroundImage: `
        repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px),
        repeating-linear-gradient(90deg, transparent, transparent 2px, rgba(255,255,255,0.03) 2px, rgba(255,255,255,0.03) 4px)
      `
    }}>
      {/* Header */}
      <header className="bg-[#1a1a2e] border-b-4 border-[#ffd700] sticky top-0 z-40 shadow-lg" style={{
        boxShadow: '0 4px 0 #ffd700, 0 8px 0 rgba(0,0,0,0.3)'
      }}>
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-[#ffd700] mb-2" style={{ textShadow: '4px 4px 0 rgba(0,0,0,0.5)' }}>
                ⚔️ SKAUTOWA GRA ⚔️
              </h1>
              <p className="text-[#00ff00] text-xs">▶ ŚLEDŹ POSTĘPY ZASTĘPÓW</p>
            </div>
            <div className="flex gap-2 items-center flex-wrap">
              {user && (
                <>
                  <span className="text-gray-400 text-xs mr-2">
                    {user.email}
                  </span>
                  <Button 
                    onClick={signOut}
                    className="bg-gray-700 hover:bg-gray-600 text-white border-4 border-gray-800 transition-all hover:translate-y-[-2px]"
                    style={{ 
                      boxShadow: '0 4px 0 #333, 0 8px 0 rgba(0,0,0,0.3)'
                    }}
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    WYLOGUJ
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="space-y-12">
          {patrols.map((patrol) => (
            <div key={patrol.id} className="space-y-6">
              {/* Patrol Header with integrated Leader Button */}
              <PatrolProgress 
                patrol={patrol} 
                onOpenLeaderPanel={() => setSelectedPatrolForLeader(patrol.id)}
                canEdit={!user || isLeaderOf === patrol.id}
              />

              {/* Level Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {patrol.levels.map((level) => (
                  <LevelCard 
                    key={level.level} 
                    level={level} 
                    patrolColor={patrol.color}
                    allLevels={patrol.levels}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 p-6 bg-[#1a1a2e] border-4 border-[#ffd700]" style={{
          boxShadow: '0 4px 0 #ffd700, 0 8px 0 rgba(0,0,0,0.3)'
        }}>
          <h3 className="mb-4 text-[#ffd700]">💡 JAK GRAĆ?</h3>
          <ul className="space-y-2 text-[#00ff00] text-xs">
            <li>▶ Każdy zastęp startuje bez poziomu</li>
            <li>▶ Ukończ wszystkie zadania z Poziomu 1, aby zdobyć Poziom 1</li>
            <li>▶ Kolejne poziomy odblokowują się po zaliczeniu poprzedniego</li>
            <li>▶ Zastępowi logują się, by zarządzać swoim zastępem</li>
            <li>▶ Zadania na stopień sumują się z wszystkich członków automatycznie</li>
            <li>▶ Postępy synchronizują się automatycznie między urządzeniami</li>
          </ul>
        </div>
      </main>

      {/* Patrol Leader Panels */}
      {patrols.map(patrol => (
        <PatrolLeaderPanel
          key={patrol.id}
          isOpen={selectedPatrolForLeader === patrol.id}
          onClose={() => setSelectedPatrolForLeader(null)}
          patrol={patrol}
          onUpdateMembers={handleUpdateMembers}
          onUpdateTask={handleUpdateTask}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
          onUpdateMemberTasks={handleUpdateMemberTasks}
        />
      ))}
    </div>
  );
}

export default App;
export interface Task {
  id: string;
  name: string;
  current: number;
  target: number;
  completed: boolean;
}

export interface Member {
  id: string;
  name: string;
  tasksCompleted: number; // Number of badge tasks completed by this member
}

export interface Level {
  level: number;
  name: string;
  tasks: Task[];
  isUnlocked: boolean;
  isCompleted: boolean;
}

export interface Patrol {
  id: string;
  name: string;
  color: string;
  currentLevel: number;
  levels: Level[];
  members: Member[]; // Members of the patrol
}

export const INITIAL_LEVELS: Omit<Level, 'isUnlocked' | 'isCompleted'>[] = [
  {
    level: 1,
    name: "Poziom 1 - Początek Przygody",
    tasks: [
      { id: "l1-t1", name: "Zbiórki zastępu", current: 0, target: 4, completed: false },
      { id: "l1-t2", name: "Zadania na stopień (suma wszystkich członków)", current: 0, target: 20, completed: false },
      { id: "l1-t3", name: "Zbudowanie jednej nowej konstrukcji w miejscu zbiórki", current: 0, target: 1, completed: false },
      { id: "l1-t4", name: "Zrobić sztandar swojego państwa", current: 0, target: 1, completed: false },
      { id: "l1-t5", name: "Mieć imiona postaci fabularnych w zastępie", current: 0, target: 1, completed: false },
      { id: "l1-t6", name: "Relacja ze zbiórki (zdjęcie)", current: 0, target: 1, completed: false },
      { id: "l1-t7", name: "Przygotować małą aktywność na zimowisko", current: 0, target: 1, completed: false }
    ]
  },
  {
    level: 2,
    name: "Poziom 2 - Rozwój Zastępu",
    tasks: [
      { id: "l2-t1", name: "Zbiórki zastępu", current: 0, target: 9, completed: false }, // 4 + 5 = 9 total
      { id: "l2-t2", name: "Zadania na stopień (suma wszystkich członków)", current: 0, target: 40, completed: false },
      { id: "l2-t3", name: "Zbudowanie kuchni zastępu", current: 0, target: 1, completed: false },
      { id: "l2-t4", name: "Zrobić stroje fabularne", current: 0, target: 1, completed: false },
      { id: "l2-t5", name: "Każda osoba ma postać w zastępie wraz z historią", current: 0, target: 1, completed: false },
      { id: "l2-t6", name: "Relacja zdjęciowa ze zbiórki wraz z opisem", current: 0, target: 1, completed: false },
      { id: "l2-t7", name: "Przygotować aktywność na zimowisko", current: 0, target: 1, completed: false }
    ]
  },
  {
    level: 3,
    name: "Poziom 3 - Mistrzostwo",
    tasks: [
      { id: "l3-t1", name: "Zbiórki zastępu", current: 0, target: 15, completed: false }, // 4 + 5 + 6 = 15 total
      { id: "l3-t2", name: "Zadania na stopień (suma wszystkich członków)", current: 0, target: 60, completed: false },
      { id: "l3-t3", name: "Zbudowanie kompleksowego obozowiska zastępu", current: 0, target: 1, completed: false },
      { id: "l3-t4", name: "Nowy członek zastępu", current: 0, target: 1, completed: false },
      { id: "l3-t5", name: "Misja wyznaczona przez drużynowego", current: 0, target: 1, completed: false },
      { id: "l3-t6", name: "Zrobić bronie fabularne do strojów", current: 0, target: 1, completed: false },
      { id: "l3-t7", name: "Przygotować scenkę przedstawiającą naród i postacie", current: 0, target: 1, completed: false },
      { id: "l3-t8", name: "Filmik ze zbiórki skonsultowany z drużynowym", current: 0, target: 1, completed: false },
      { id: "l3-t9", name: "Porządna aktywność na zimowisko", current: 0, target: 1, completed: false }
    ]
  }
];

export function initializeLevels(): Level[] {
  return INITIAL_LEVELS.map((level, index) => ({
    ...level,
    tasks: level.tasks.map(task => ({ ...task })),
    isUnlocked: index === 0,
    isCompleted: false
  }));
}

export function calculateLevelProgress(level: Level): number {
  const completedTasks = level.tasks.filter(t => t.completed).length;
  return level.tasks.length > 0 ? (completedTasks / level.tasks.length) * 100 : 0;
}

export function isLevelComplete(level: Level): boolean {
  return level.tasks.every(task => task.completed);
}

// Get the cumulative target from all previous levels for a specific task type
export function getPreviousLevelsTarget(levels: Level[], currentLevelIndex: number, taskId: string): number {
  let total = 0;
  // Get task type (e.g., "l1-t1", "l2-t1" -> "-t1")
  const taskType = taskId.substring(taskId.indexOf('-t'));
  
  for (let i = 0; i < currentLevelIndex; i++) {
    const previousTask = levels[i].tasks.find(t => t.id.endsWith(taskType));
    if (previousTask) {
      total += previousTask.target;
    }
  }
  
  return total;
}

// Get incremental progress for a task (current - previous targets)
export function getIncrementalProgress(task: Task, levels: Level[], currentLevelIndex: number): { current: number; target: number } {
  const previousTarget = getPreviousLevelsTarget(levels, currentLevelIndex, task.id);
  const incrementalTarget = task.target - previousTarget;
  const incrementalCurrent = Math.max(0, task.current - previousTarget);
  
  return {
    current: Math.min(incrementalCurrent, incrementalTarget),
    target: incrementalTarget
  };
}
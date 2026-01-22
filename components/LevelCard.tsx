import { Level, getIncrementalProgress } from "../types/game";
import { Progress } from "./ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { CheckCircle2, Lock, Circle } from "lucide-react";
import { Badge } from "./ui/badge";

interface LevelCardProps {
  level: Level;
  patrolColor: string;
  allLevels: Level[]; // Need all levels to calculate incremental progress
}

export function LevelCard({ level, patrolColor, allLevels }: LevelCardProps) {
  const completedTasks = level.tasks.filter(t => t.completed).length;
  const totalTasks = level.tasks.length;
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;
  const levelIndex = allLevels.findIndex(l => l.level === level.level);

  return (
    <Card 
      className={`relative overflow-hidden transition-all duration-300 bg-[#1a1a2e] border-4 ${
        level.isCompleted 
          ? 'animate-pulse' 
          : level.isUnlocked 
          ? '' 
          : 'opacity-60'
      }`}
      style={{
        borderColor: level.isCompleted || level.isUnlocked ? patrolColor : '#333',
        boxShadow: level.isCompleted || level.isUnlocked 
          ? `0 4px 0 ${patrolColor}, 0 8px 0 rgba(0,0,0,0.5)` 
          : '0 4px 0 #333, 0 8px 0 rgba(0,0,0,0.5)'
      }}
    >
      {/* Level Badge */}
      <div 
        className="absolute top-0 right-0 w-16 h-16 flex items-center justify-center border-4 border-black"
        style={{ backgroundColor: patrolColor }}
      >
        <span className="text-white text-xs">LVL<br/>{level.level}</span>
      </div>

      {/* Lock Overlay */}
      {!level.isUnlocked && (
        <div className="absolute inset-0 bg-[#0f0f1e]/90 flex items-center justify-center z-10">
          <div className="text-center">
            <Lock className="w-12 h-12 mx-auto mb-2 text-gray-400" />
            <p className="text-[#ff6b6b] text-xs">🔒 LOCKED</p>
          </div>
        </div>
      )}

      {/* Completed Overlay */}
      {level.isCompleted && (
        <div 
          className="absolute inset-0 pointer-events-none border-4 border-[#ffd700]"
          style={{
            background: 'repeating-linear-gradient(45deg, transparent, transparent 10px, rgba(255,215,0,0.1) 10px, rgba(255,215,0,0.1) 20px)'
          }}
        />
      )}

      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-white pr-16">
          {level.name}
          {level.isCompleted && (
            <Badge className="bg-[#ffd700] text-black border-2 border-black text-xs">
              ★ DONE!
            </Badge>
          )}
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span className="text-[#00ff00]">▶ PROGRESS</span>
            <span className="text-white">{completedTasks}/{totalTasks}</span>
          </div>
          <div className="h-4 bg-black border-2 border-gray-600 relative overflow-hidden">
            <div 
              className="h-full transition-all duration-500"
              style={{ 
                width: `${progress}%`,
                backgroundColor: patrolColor,
                backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.2) 4px, rgba(0,0,0,0.2) 8px)'
              }}
            />
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-3 pt-2">
          {level.tasks.map((task) => {
            const incremental = getIncrementalProgress(task, allLevels, levelIndex);
            
            return (
            <div key={task.id} className="space-y-1">
              <div className="flex items-start gap-2">
                {task.completed ? (
                  <span className="text-[#00ff00] text-xs mt-0.5">✓</span>
                ) : (
                  <span className="text-gray-500 text-xs mt-0.5">□</span>
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-xs ${task.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                      {task.name}
                    </span>
                    <span 
                      className={`text-xs flex-shrink-0 ${
                        task.completed ? 'text-[#00ff00]' : 'text-gray-400'
                      }`}
                    >
                      {incremental.current}/{incremental.target}
                    </span>
                  </div>
                  {!task.completed && incremental.target > 1 && (
                    <div className="h-2 bg-black border border-gray-600 mt-1 relative overflow-hidden">
                      <div 
                        className="h-full transition-all duration-300"
                        style={{ 
                          width: `${(incremental.current / incremental.target) * 100}%`,
                          backgroundColor: patrolColor
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>
          )})}
        </div>
      </CardContent>
    </Card>
  );
}
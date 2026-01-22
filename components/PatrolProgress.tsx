import { Patrol } from "../types/game";
import { Trophy, Users, TrendingUp } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { Button } from "./ui/button";

interface PatrolProgressProps {
  patrol: Patrol;
  onOpenLeaderPanel: () => void;
  canEdit?: boolean;
}

export function PatrolProgress({ patrol, onOpenLeaderPanel, canEdit = true }: PatrolProgressProps) {
  const totalLevels = patrol.levels.length;
  const completedLevels = patrol.levels.filter(l => l.isCompleted).length;
  
  // Find the current level being worked on (first uncompleted level)
  const workingOnLevelIndex = patrol.levels.findIndex(l => !l.isCompleted);
  const workingOnLevelData = workingOnLevelIndex >= 0 ? patrol.levels[workingOnLevelIndex] : null;

  return (
    <Card className="overflow-hidden bg-[#1a1a2e] border-4" style={{
      borderColor: patrol.color,
      boxShadow: `0 4px 0 ${patrol.color}, 0 8px 0 rgba(0,0,0,0.5)`
    }}>
      <div 
        className="h-2 transition-all duration-500 relative"
        style={{ 
          backgroundColor: '#0f0f1e'
        }}
      >
        <div 
          className="h-full"
          style={{
            width: `${(completedLevels / totalLevels) * 100}%`,
            backgroundColor: patrol.color,
            backgroundImage: 'repeating-linear-gradient(90deg, transparent, transparent 4px, rgba(0,0,0,0.3) 4px, rgba(0,0,0,0.3) 8px)'
          }}
        />
      </div>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div 
              className="w-16 h-16 flex items-center justify-center border-4 border-black text-2xl"
              style={{ backgroundColor: patrol.color }}
            >
              {patrol.name.includes('Wilk') ? '🐺' : '🦩'}
            </div>
            <div>
              <h2 className="text-white mb-1" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.5)' }}>
                {patrol.name.toUpperCase()}
              </h2>
              <p className="text-[#00ff00] text-xs">▶ ZASTĘP SKAUTOWY</p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end mb-1">
                <Trophy className="w-6 h-6 text-[#ffd700]" />
                <span className="text-[#ffd700] text-xl" style={{ textShadow: '2px 2px 0 rgba(0,0,0,0.5)' }}>
                  {patrol.currentLevel === 0 ? 'BRAK POZIOMU' : `POZIOM ${patrol.currentLevel}`}
                </span>
              </div>
              <p className="text-white text-xs">
                {completedLevels}/{totalLevels} POZIOMÓW OK
              </p>
            </div>

            <Button
              onClick={onOpenLeaderPanel}
              className="bg-[#4ecdc4] hover:bg-[#3ab8ae] text-black border-4 border-[#2a8c83] transition-all hover:translate-y-[-2px]"
              style={{
                boxShadow: '0 4px 0 #2a8c83'
              }}
            >
              <Users className="w-4 h-4 mr-2" />
              PANEL ZASTĘPOWEGO
            </Button>
          </div>
        </div>

        {/* Current Level Stats */}
        {workingOnLevelData && !workingOnLevelData.isCompleted && (
          <div 
            className="mt-4 p-4 border-4 border-black"
            style={{ backgroundColor: `${patrol.color}30` }}
          >
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp 
                className="w-4 h-4"
                style={{ color: patrol.color }}
              />
              <span className="text-white text-xs">AKTUALNY CEL: {workingOnLevelData.name}</span>
            </div>
            <div className="flex gap-4 text-xs flex-wrap">
              {workingOnLevelData.tasks.map((task, idx) => (
                <div key={task.id} className="flex items-center gap-1 bg-black/50 px-2 py-1 border-2 border-gray-700">
                  <span className={task.completed ? 'text-[#00ff00]' : 'text-white'}>
                    {task.current}/{task.target}
                  </span>
                  <span>
                    {idx === 0 ? '🔥' : idx === 1 ? '✅' : '🏗️'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {patrol.currentLevel === 0 && (
          <div className="mt-4 p-4 bg-[#ff6b6b]/20 border-4 border-[#ff6b6b]">
            <p className="text-[#ff6b6b] text-center text-xs">
              ⚠️ ROZPOCZNIJ OD POZIOMU 1 - UKOŃCZ WSZYSTKIE ZADANIA ABY ZDOBYĆ POZIOM! ⚠️
            </p>
          </div>
        )}

        {patrol.currentLevel > 0 && patrol.currentLevel < totalLevels && workingOnLevelData && (
          <div className="mt-4 p-4 bg-[#ffd700] border-4 border-black">
            <p className="text-black text-center text-xs">
              🎉 POZIOM {patrol.currentLevel} UKOŃCZONY! Pracujcie nad Poziomem {patrol.currentLevel + 1}! 🎉
            </p>
          </div>
        )}

        {patrol.currentLevel === totalLevels && !workingOnLevelData && (
          <div className="mt-4 p-4 bg-gradient-to-r from-[#ffd700] to-[#ffed4e] border-4 border-black">
            <p className="text-black text-center text-xs animate-pulse">
              👑 WSZYSTKIE POZIOMY UKOŃCZONE! JESTEŚCIE MISTRZAMI! 👑
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
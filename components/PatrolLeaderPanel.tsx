import { useState } from "react";
import { Patrol, Member } from "../types/game";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, Plus, Minus, Trash2, Award, CheckSquare, Loader2 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Checkbox } from "./ui/checkbox";
import { useAuth } from "../hooks/useAuth";

interface PatrolLeaderPanelProps {
  isOpen: boolean;
  onClose: () => void;
  patrol: Patrol;
  onUpdateMembers: (patrolId: string, members: Member[]) => void;
  onUpdateTask?: (patrolId: string, levelIndex: number, taskId: string, newCurrent: number) => void;
  onAddMember?: (patrolId: string, name: string) => Promise<void>;
  onRemoveMember?: (patrolId: string, memberId: string) => Promise<void>;
  onUpdateMemberTasks?: (patrolId: string, memberId: string, tasksCompleted: number) => Promise<void>;
}

export function PatrolLeaderPanel({ 
  isOpen, 
  onClose, 
  patrol, 
  onUpdateMembers, 
  onUpdateTask,
  onAddMember,
  onRemoveMember,
  onUpdateMemberTasks 
}: PatrolLeaderPanelProps) {
  const { user, signIn, isLeader } = useAuth();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [error, setError] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Sprawdź czy user jest zastępowym tego zastępu
  const canEdit = user && isLeader(patrol.id);

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Podaj email i hasło");
      return;
    }

    setIsLoggingIn(true);
    setError("");

    const { error: signInError } = await signIn(email, password, rememberMe);
    
    setIsLoggingIn(false);
    
    if (signInError) {
      setError("Nieprawidłowy email lub hasło");
    } else {
      // Po zalogowaniu sprawdź czy jest zastępowym tego patrolu
      // useAuth automatycznie zaktualizuje stan
    }
  };

  const handleClose = () => {
    setEmail("");
    setPassword("");
    setError("");
    setNewMemberName("");
    onClose();
  };

  const addMember = async () => {
    if (!newMemberName.trim() || !onAddMember) return;
    
    setIsAdding(true);
    try {
      await onAddMember(patrol.id, newMemberName.trim());
      setNewMemberName("");
    } catch (err) {
      console.error('Error adding member:', err);
    }
    setIsAdding(false);
  };

  const removeMember = async (memberId: string) => {
    if (!onRemoveMember) return;
    try {
      await onRemoveMember(patrol.id, memberId);
    } catch (err) {
      console.error('Error removing member:', err);
    }
  };

  const incrementMemberTasks = async (memberId: string, currentTasks: number) => {
    if (!onUpdateMemberTasks) return;
    try {
      await onUpdateMemberTasks(patrol.id, memberId, currentTasks + 1);
    } catch (err) {
      console.error('Error incrementing tasks:', err);
    }
  };

  const decrementMemberTasks = async (memberId: string, currentTasks: number) => {
    if (!onUpdateMemberTasks || currentTasks === 0) return;
    try {
      await onUpdateMemberTasks(patrol.id, memberId, currentTasks - 1);
    } catch (err) {
      console.error('Error decrementing tasks:', err);
    }
  };

  const totalTasks = patrol.members.reduce((sum, member) => sum + member.tasksCompleted, 0);

  // Sprawdź czy user jest zalogowany i jest zastępowym TEGO patrolu
  const isAuthenticated = user && isLeader(patrol.id);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-[#1a1a2e] border-4" style={{
        borderColor: patrol.color,
        boxShadow: `0 4px 0 ${patrol.color}, 0 8px 0 rgba(0,0,0,0.5)`
      }}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-[#ffd700]" style={{ textShadow: '3px 3px 0 rgba(0,0,0,0.5)' }}>
            <Users className="w-5 h-5" />
            👥 PANEL ZASTĘPOWEGO - {patrol.name.toUpperCase()}
          </DialogTitle>
          <DialogDescription className="text-[#00ff00] text-xs">
            ▶ ZARZĄDZAJ CZŁONKAMI I ICH ZADANIAMI
          </DialogDescription>
        </DialogHeader>

        {!isAuthenticated ? (
          <div className="space-y-4 py-4">
            {user ? (
              // Zalogowany, ale nie jest zastępowym tego patrolu
              <div className="text-center py-8">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                <p className="text-[#ff6b6b] text-sm mb-2">❌ Brak dostępu</p>
                <p className="text-gray-400 text-xs">
                  Jesteś zalogowany jako {user.email}, ale nie jesteś zastępowym {patrol.name}.
                </p>
              </div>
            ) : (
              // Niezalogowany - formularz logowania
              <>
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-white">EMAIL ZASTĘPOWEGO</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="zastepowy@druzyna.pl"
                    className="bg-black border-2 border-gray-600 text-white"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-white">HASŁO</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleLogin()}
                    placeholder="***********"
                    className="bg-black border-2 border-gray-600 text-white"
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="rememberMe"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                    className="border-gray-600 data-[state=checked]:bg-[#00ff00] data-[state=checked]:border-[#00ff00]"
                  />
                  <Label htmlFor="rememberMe" className="text-gray-400 text-xs cursor-pointer">
                    Nie wylogowuj mnie
                  </Label>
                </div>

                {error && <p className="text-xs text-[#ff6b6b]">❌ {error}</p>}
                
                <Button 
                  onClick={handleLogin}
                  disabled={isLoggingIn}
                  className="w-full bg-[#00ff00] hover:bg-[#00dd00] text-black border-4 border-[#008800]"
                  style={{
                    boxShadow: '0 4px 0 #008800'
                  }}
                >
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      LOGOWANIE...
                    </>
                  ) : (
                    '▶ ZALOGUJ SIĘ'
                  )}
                </Button>
                
                <p className="text-xs text-gray-500 text-center">
                  Tylko zastępowy {patrol.name} może edytować ten panel.
                </p>
              </>
            )}
          </div>
        ) : (
          <Tabs defaultValue="members" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-[#0f0f1e] border-2 border-gray-700">
              <TabsTrigger 
                value="members"
                className="data-[state=active]:bg-[#1a1a2e] data-[state=active]:text-white data-[state=active]:border-2"
                style={{ borderColor: patrol.color }}
              >
                <Users className="w-4 h-4 mr-2" />
                CZŁONKOWIE
              </TabsTrigger>
              <TabsTrigger 
                value="tasks"
                className="data-[state=active]:bg-[#1a1a2e] data-[state=active]:text-white data-[state=active]:border-2"
                style={{ borderColor: patrol.color }}
              >
                <CheckSquare className="w-4 h-4 mr-2" />
                ZADANIA POZIOMÓW
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="space-y-6 mt-6">
              {/* Stats Card */}
              <Card className="bg-[#0f0f1e] border-4" style={{
                borderColor: patrol.color,
                boxShadow: `0 4px 0 ${patrol.color}`
              }}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center justify-between">
                    <span>📊 STATYSTYKI ZASTĘPU</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black p-3 border-2 border-gray-700">
                      <p className="text-xs text-gray-400">Liczba członków</p>
                      <p className="text-2xl text-white">{patrol.members.length}</p>
                    </div>
                    <div className="bg-black p-3 border-2 border-[#ffd700]">
                      <p className="text-xs text-gray-400">Suma zadań na stopień</p>
                      <p className="text-2xl text-[#ffd700]">{totalTasks}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Add Member Section */}
              <Card className="bg-[#0f0f1e] border-4 border-[#00ff00]" style={{
                boxShadow: '0 4px 0 #00ff00'
              }}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Plus className="w-4 h-4" />
                    DODAJ NOWEGO CZŁONKA
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex gap-2">
                    <Input
                      value={newMemberName}
                      onChange={(e) => setNewMemberName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addMember()}
                      placeholder="Imię i nazwisko..."
                      className="bg-black border-2 border-gray-600 text-white flex-1"
                    />
                    <Button
                      onClick={addMember}
                      disabled={isAdding || !newMemberName.trim()}
                      className="bg-[#00ff00] hover:bg-[#00dd00] text-black border-4 border-[#008800]"
                      style={{
                        boxShadow: '0 4px 0 #008800'
                      }}
                    >
                      {isAdding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Members List */}
              <Card className="bg-[#0f0f1e] border-4" style={{
                borderColor: patrol.color,
                boxShadow: `0 4px 0 ${patrol.color}`
              }}>
                <CardHeader>
                  <CardTitle className="text-white flex items-center gap-2">
                    <Users className="w-4 h-4" />
                    CZŁONKOWIE ZASTĘPU ({patrol.members.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {patrol.members.length === 0 ? (
                    <div className="text-center py-8 text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-sm">Brak członków. Dodaj pierwszego członka!</p>
                    </div>
                  ) : (
                    patrol.members.map((member) => (
                      <div
                        key={member.id}
                        className="flex items-center justify-between gap-4 p-4 bg-black border-2 border-gray-700"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <Award className="w-4 h-4 text-[#ffd700]" />
                            <span className="text-white text-sm">{member.name}</span>
                          </div>
                          <p className="text-xs text-gray-400 mt-1">
                            Zadań zaliczonych: <span className="text-[#00ff00]">{member.tasksCompleted}</span>
                          </p>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-[#ff6b6b] hover:bg-[#ff5252] text-white border-2 border-black w-8 h-8 p-0"
                            onClick={() => decrementMemberTasks(member.id, member.tasksCompleted)}
                            disabled={member.tasksCompleted === 0}
                          >
                            <Minus className="w-4 h-4" />
                          </Button>

                          <div className="min-w-[50px] text-center bg-[#0f0f1e] border-2 border-gray-600 px-3 py-1">
                            <span className="text-sm text-[#00ff00]">{member.tasksCompleted}</span>
                          </div>

                          <Button
                            size="sm"
                            className="text-white border-2 border-black w-8 h-8 p-0"
                            onClick={() => incrementMemberTasks(member.id, member.tasksCompleted)}
                            style={{
                              backgroundColor: patrol.color
                            }}
                          >
                            <Plus className="w-4 h-4" />
                          </Button>

                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-transparent hover:bg-[#ff6b6b] text-[#ff6b6b] hover:text-white border-2 border-[#ff6b6b] w-8 h-8 p-0 ml-2"
                            onClick={() => removeMember(member.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </CardContent>
              </Card>

              {/* Info Box */}
              <div className="p-4 bg-[#ffd700]/10 border-2 border-[#ffd700]">
                <p className="text-xs text-[#ffd700]">
                  💡 Suma zadań wszystkich członków automatycznie aktualizuje postęp "Zadania na stopień" na poziomach.
                </p>
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-6 mt-6">
              {/* Task Management Section */}
              {patrol.levels.map((level, levelIndex) => (
                <Card key={level.level} className="bg-[#0f0f1e] border-4" style={{
                  borderColor: level.isUnlocked ? patrol.color : '#333',
                  boxShadow: level.isUnlocked ? `0 4px 0 ${patrol.color}` : '0 4px 0 #333'
                }}>
                  <CardHeader>
                    <CardTitle className="text-white flex items-center justify-between">
                      <span>{level.name}</span>
                      {level.isCompleted && (
                        <span className="text-xs text-[#00ff00] flex items-center gap-1 bg-black px-2 py-1 border-2 border-[#00ff00]">
                          ✓ DONE
                        </span>
                      )}
                      {!level.isUnlocked && (
                        <span className="text-xs text-[#ff6b6b] bg-black px-2 py-1 border-2 border-[#ff6b6b]">
                          LOCKED
                        </span>
                      )}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {level.tasks.map((task) => {
                      const isBadgeTask = task.id.includes("-t2");
                      return (
                        <div 
                          key={task.id} 
                          className={`flex items-center justify-between gap-4 p-3 border-2 ${
                            task.completed ? 'bg-[#00ff00]/10 border-[#00ff00]' : 'bg-black/50 border-gray-700'
                          } ${isBadgeTask ? 'opacity-60' : ''}`}
                        >
                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              {task.completed ? (
                                <span className="text-[#00ff00] text-xs">✓</span>
                              ) : (
                                <span className="text-gray-500 text-xs">□</span>
                              )}
                              <span className={`text-xs ${task.completed ? 'text-[#00ff00]' : 'text-white'}`}>
                                {task.name}
                              </span>
                            </div>
                            {isBadgeTask && (
                              <p className="text-[10px] text-[#ffd700] mt-1">🔒 Auto: suma zadań członków</p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              className="bg-[#ff6b6b] hover:bg-[#ff5252] text-white border-2 border-black w-8 h-8 p-0"
                              onClick={() => onUpdateTask && onUpdateTask(patrol.id, levelIndex, task.id, task.current - 1)}
                              disabled={task.current === 0 || !level.isUnlocked || isBadgeTask}
                            >
                              <Minus className="w-4 h-4" />
                            </Button>
                            
                            <div className="min-w-[60px] text-center bg-black border-2 border-gray-600 px-2 py-1">
                              <span className={`text-xs ${task.completed ? 'text-[#00ff00]' : 'text-white'}`}>
                                {task.current}/{task.target}
                              </span>
                            </div>
                            
                            <Button
                              size="sm"
                              className="text-white border-2 border-black w-8 h-8 p-0"
                              onClick={() => onUpdateTask && onUpdateTask(patrol.id, levelIndex, task.id, task.current + 1)}
                              disabled={task.current >= task.target || !level.isUnlocked || isBadgeTask}
                              style={{
                                backgroundColor: task.current < task.target && level.isUnlocked && !isBadgeTask ? patrol.color : '#333'
                              }}
                            >
                              <Plus className="w-4 h-4" />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </CardContent>
                </Card>
              ))}
            </TabsContent>
          </Tabs>
        )}
      </DialogContent>
    </Dialog>
  );
}
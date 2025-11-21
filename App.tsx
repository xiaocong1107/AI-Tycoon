import React, { useState, useEffect, useRef, useCallback } from 'react';
import WorldMap from './components/WorldMap';
import { AgentList, ActivityLog } from './components/ChatInterface';
import { generateMap, INITIAL_AGENTS, MAP_HEIGHT, MAP_WIDTH, TICK_RATE_MS, TIME_PER_TICK_MINUTES, WIN_AMOUNT } from './constants';
import { Agent, AgentStatus, Interaction, Position, TileType } from './types';
import { generateAgentConversation } from './services/geminiService';
import { Play, Pause, RefreshCw, Trophy } from 'lucide-react';

const App: React.FC = () => {
  const [agents, setAgents] = useState<Agent[]>(INITIAL_AGENTS);
  const [interactions, setInteractions] = useState<Interaction[]>([]);
  const [mapTiles] = useState<TileType[][]>(() => generateMap(MAP_WIDTH, MAP_HEIGHT));
  const [isRunning, setIsRunning] = useState(false);
  const [winner, setWinner] = useState<Agent | null>(null);
  
  const [gameTime, setGameTime] = useState(8 * 60); 
  const interactionQueueRef = useRef<{a: string, b: string}[]>([]);

  // --- Helper Functions ---
  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const isWalkable = (x: number, y: number) => {
    if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) return false;
    const tile = mapTiles[y][x];
    return tile !== 'WALL' && tile !== 'WATER';
  };

  const areAdjacent = (p1: Position, p2: Position) => {
    return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y) <= 1;
  };

  const getNextStepTowards = (current: Position, target: Position, occupied: Set<string>): Position => {
    if (current.x === target.x && current.y === target.y) return current;
    const moves = [
      { x: current.x + Math.sign(target.x - current.x), y: current.y },
      { x: current.x, y: current.y + Math.sign(target.y - current.y) }
    ];
    const dx = Math.abs(target.x - current.x);
    const dy = Math.abs(target.y - current.y);

    if (dx > dy) {
       if (isWalkable(moves[0].x, moves[0].y) && !occupied.has(`${moves[0].x},${moves[0].y}`)) return moves[0];
       if (isWalkable(moves[1].x, moves[1].y) && !occupied.has(`${moves[1].x},${moves[1].y}`)) return moves[1];
    } else {
       if (isWalkable(moves[1].x, moves[1].y) && !occupied.has(`${moves[1].x},${moves[1].y}`)) return moves[1];
       if (isWalkable(moves[0].x, moves[0].y) && !occupied.has(`${moves[0].x},${moves[0].y}`)) return moves[0];
    }
    return current; 
  };

  const getRandomNeighbor = (pos: Position, occupied: Set<string>): Position => {
     const dirs = [{x:0, y:1}, {x:0, y:-1}, {x:1, y:0}, {x:-1, y:0}];
     const valid = dirs
       .map(d => ({ x: pos.x + d.x, y: pos.y + d.y }))
       .filter(p => isWalkable(p.x, p.y) && !occupied.has(`${p.x},${p.y}`));
     if (valid.length === 0) return pos;
     return valid[Math.floor(Math.random() * valid.length)];
  };

  // --- Interaction & Transaction Logic ---
  const handleInteraction = useCallback(async (agentAId: string, agentBId: string) => {
    const agentA = agents.find(a => a.id === agentAId);
    const agentB = agents.find(a => a.id === agentBId);
    if (!agentA || !agentB) return;

    setAgents(prev => prev.map(a => {
      if (a.id === agentAId || a.id === agentBId) {
        return { ...a, status: AgentStatus.TALKING, currentAction: '交易谈判中 (Negotiating)' };
      }
      return a;
    }));

    // 1. Construct History
    // Filter previous interactions that involve BOTH agents
    const history = interactions
      .filter(i => i.participants.includes(agentAId) && i.participants.includes(agentBId))
      .slice(-3) // Keep last 3 interactions for context
      .map(i => {
         const summary = i.transaction 
            ? `[Deal] ${i.transaction.item} for ¥${i.transaction.amount}` 
            : "[No Deal]";
         // Check if messages exist before accessing
         if (i.messages && i.messages.length > 0) {
           return `Time: ${new Date(i.messages[0].timestamp).toLocaleTimeString()}. Result: ${summary}.`;
         }
         return `Result: ${summary}`;
      }).join('\n');

    const tileType = mapTiles[agentA.position.y][agentA.position.x];
    
    // 2. Generate Dialogue
    const response = await generateAgentConversation(
       agentA, 
       agentB, 
       `${tileType}`, 
       formatTime(gameTime),
       history // Pass history
    );

    let transactionData = undefined;
    // VALIDATION: Ensure amount is a number before processing
    if (response.transaction && response.transaction.success) {
       const { amount, buyerId, sellerId, item } = response.transaction;
       const validAmount = (typeof amount === 'number' && !isNaN(amount)) ? amount : 0;

       if (validAmount > 0 && buyerId && sellerId) {
         transactionData = { amount: validAmount, fromId: buyerId, toId: sellerId, item: item || 'Product' };
         
         setAgents(prev => prev.map(a => {
           if (a.id === buyerId) {
             return { ...a, stats: { ...a.stats, money: (a.stats.money || 0) - validAmount } };
           }
           if (a.id === sellerId) {
             const newMoney = (a.stats.money || 0) + validAmount;
             if (newMoney >= WIN_AMOUNT) {
               setWinner(a);
               setIsRunning(false);
             }
             return { ...a, stats: { ...a.stats, money: newMoney } };
           }
           return a;
         }));
       }
    }

    const newInteraction: Interaction = {
      id: `int-${Date.now()}`,
      participants: [agentAId, agentBId],
      active: false,
      transaction: transactionData,
      messages: response.dialogue.map(line => ({
        speakerId: line.speaker === agentA.name ? agentAId : agentBId,
        speakerName: line.speaker,
        content: line.text,
        timestamp: Date.now()
      }))
    };

    setInteractions(prev => [...prev, newInteraction]);

    setAgents(prev => prev.map(a => {
      if (a.id === agentAId || a.id === agentBId) {
        return { 
          ...a, 
          status: AgentStatus.IDLE,
          stats: {
            ...a.stats,
            mood: Math.min(100, a.stats.mood + 5),
            energy: Math.max(0, a.stats.energy - 2),
            exp: a.stats.exp + 2
          }
        };
      }
      return a;
    }));

  }, [agents, mapTiles, gameTime, interactions]); // Added interactions dependency for memory

  // --- Game Loop ---
  useEffect(() => {
    if (!isRunning) return;

    const tick = setInterval(() => {
      setGameTime(prev => (prev + TIME_PER_TICK_MINUTES) % 1440);
      
      setAgents(currentAgents => {
        const nextAgents = currentAgents.map(agent => ({...agent}));
        const occupiedPositions = new Set(nextAgents.map(a => `${a.position.x},${a.position.y}`));

        nextAgents.forEach(agent => {
          if (agent.status === AgentStatus.TALKING || agent.status === AgentStatus.THINKING) return;

          const hour = Math.floor(gameTime / 60);
          let desiredStatus = AgentStatus.IDLE;
          let target: Position | null = null;
          let actionDesc = "";

          const isBoss = agent.type === 'BOSS';
          const workStart = isBoss ? 8 : 9;
          const workEnd = isBoss ? 20 : 17;

          if (hour >= workStart && hour < workEnd) {
             desiredStatus = AgentStatus.WORKING;
             target = agent.workPosition;
          } else if (hour >= 22 || hour < 7) {
             desiredStatus = AgentStatus.RESTING;
             target = agent.homePosition;
          } else {
             desiredStatus = AgentStatus.IDLE;
             target = null; 
             if (!isBoss && Math.random() < 0.3) {
                const bosses = currentAgents.filter(a => a.type === 'BOSS');
                const randomBoss = bosses[Math.floor(Math.random() * bosses.length)];
                target = randomBoss.workPosition;
                actionDesc = "逛街 (Shopping)";
             }
          }

          if (target) {
             if (agent.position.x === target.x && agent.position.y === target.y) {
                agent.status = desiredStatus;
                if (desiredStatus === AgentStatus.WORKING) actionDesc = "营业中 (Business)";
                else if (desiredStatus === AgentStatus.RESTING) actionDesc = "休息 (Resting)";
             } else {
                agent.status = AgentStatus.MOVING;
                if (desiredStatus === AgentStatus.WORKING) actionDesc = "上班 (Commute)";
                else if (desiredStatus === AgentStatus.RESTING) actionDesc = "回家 (Home)";
             }
          } else {
             if (!actionDesc) actionDesc = "闲逛 (Wandering)";
             agent.status = AgentStatus.IDLE;
          }
          
          agent.currentAction = actionDesc;

          if (agent.status === AgentStatus.WORKING) {
             agent.stats.energy = Math.max(0, agent.stats.energy - 1);
             agent.stats.mood = Math.max(0, agent.stats.mood - 0.2);
          } else if (agent.status === AgentStatus.RESTING) {
             agent.stats.energy = Math.min(100, agent.stats.energy + 5);
          } else {
             agent.stats.energy = Math.max(0, agent.stats.energy - 0.5);
          }

          if (agent.status === AgentStatus.RESTING) return;

          if (agent.status !== AgentStatus.WORKING && Math.random() < 0.20) {
             const nearby = nextAgents.find(other => 
               other.id !== agent.id && 
               areAdjacent(agent.position, other.position) &&
               (other.status === AgentStatus.IDLE || other.status === AgentStatus.MOVING || other.status === AgentStatus.WORKING)
             );
             if (nearby) {
                interactionQueueRef.current.push({ a: agent.id, b: nearby.id });
                agent.status = AgentStatus.THINKING;
                nearby.status = AgentStatus.THINKING;
                return; 
             }
          }

          if (target) {
             agent.position = getNextStepTowards(agent.position, target, occupiedPositions);
          } else {
             if (Math.random() > 0.4) {
                agent.position = getRandomNeighbor(agent.position, occupiedPositions);
             }
          }
        });
        return nextAgents;
      });
    }, TICK_RATE_MS);
    return () => clearInterval(tick);
  }, [isRunning, mapTiles, gameTime]);

  useEffect(() => {
    if (interactionQueueRef.current.length > 0) {
      const pair = interactionQueueRef.current.shift();
      if (pair) handleInteraction(pair.a, pair.b);
    }
  }, [gameTime, handleInteraction]);

  const restart = () => {
    setAgents(INITIAL_AGENTS);
    setInteractions([]);
    setGameTime(8 * 60);
    setWinner(null);
    setIsRunning(false);
  }

  return (
    <div className="h-screen bg-slate-100 flex flex-col overflow-hidden font-sans text-slate-900 relative">
      {/* Win Modal */}
      {winner && (
        <div className="absolute inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm animate-in fade-in duration-500">
           <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full text-center border-4 border-amber-400">
              <div className="mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mb-4">
                 <Trophy size={40} className="text-amber-500" />
              </div>
              <h2 className="text-2xl font-bold text-slate-800 mb-2">商业大亨诞生！</h2>
              <p className="text-slate-600 mb-6">
                恭喜 <span className="font-bold text-lg text-blue-600">{winner.name}</span> 
                率先赚取了 100万！
              </p>
              <button onClick={restart} className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-lg transition-colors flex items-center justify-center gap-2">
                <RefreshCw size={20}/> 重新开始 (Restart)
              </button>
           </div>
        </div>
      )}

      {/* Header */}
      <header className="h-12 bg-white border-b border-slate-200 flex items-center justify-between px-4 shadow-sm z-20 flex-none">
        <div className="flex items-center gap-3">
           <div className="bg-blue-600 text-white p-1 rounded-md">
             <Trophy size={16} />
           </div>
           <h1 className="text-base font-bold tracking-tight text-slate-800">
             AI Tycoon <span className="text-slate-400 font-normal text-xs ml-2">商业模拟 (Target: ¥1,000,000)</span>
           </h1>
        </div>
        <button 
           onClick={() => setIsRunning(!isRunning)}
           className={`flex items-center gap-2 px-3 py-1 rounded-full font-bold shadow-sm transition-all text-xs ${
             isRunning ? 'bg-amber-50 text-amber-700 border border-amber-200' : 'bg-emerald-600 text-white'
           }`}
         >
           {isRunning ? <><Pause size={12}/> 暂停</> : <><Play size={12}/> 开始</>}
         </button>
      </header>

      {/* 3-Column Dashboard Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left: Compact Agent List */}
        <AgentList agents={agents} timeString={formatTime(gameTime)} />

        {/* Center: Map (Auto centered) */}
        <div className="flex-1 bg-slate-100 flex flex-col items-center justify-center relative overflow-hidden p-4">
           {/* Background Pattern */}
           <div className="absolute inset-0 opacity-5 pointer-events-none" style={{backgroundImage: 'radial-gradient(#cbd5e1 1px, transparent 1px)', backgroundSize: '20px 20px'}}></div>
           
           <div className="relative group shadow-2xl rounded-xl border-4 border-slate-700/10 bg-slate-800">
              <WorldMap mapTiles={mapTiles} agents={agents} />
              {/* Legend */}
              <div className="absolute -bottom-10 left-0 right-0 flex justify-center gap-4 text-[10px] font-bold text-slate-400">
                <span className="flex items-center gap-1"><span className="text-sm">🏠</span> 住宅</span>
                <span className="flex items-center gap-1"><span className="text-sm">🏢</span> 公司</span>
                <span className="flex items-center gap-1"><span className="text-sm">🏦</span> 银行</span>
              </div>
           </div>
        </div>

        {/* Right: Business Log */}
        <ActivityLog interactions={interactions} agents={agents} />
      </div>
    </div>
  );
};

export default App;
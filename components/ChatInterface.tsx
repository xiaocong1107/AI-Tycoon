import React, { useRef, useEffect } from 'react';
import { Agent, Interaction, AgentStatus } from '../types';
import { Users, MessageSquareText, Zap, Smile, TrendingUp, Briefcase, User, Coins, ArrowRight } from 'lucide-react';

// --- Agent List Side Panel (Compact) ---
interface AgentListProps {
  agents: Agent[];
  timeString: string;
}

export const AgentList: React.FC<AgentListProps> = ({ agents, timeString }) => {
  // Sort agents: Bosses first, then by money
  const sortedAgents = [...agents].sort((a, b) => {
    if (a.type !== b.type) return a.type === 'BOSS' ? -1 : 1;
    return (b.stats.money || 0) - (a.stats.money || 0);
  });

  return (
    <div className="bg-white h-full flex flex-col border-r border-slate-200 w-72 flex-none shadow-lg z-10">
      {/* Compact Header */}
      <div className="p-3 border-b border-slate-100 bg-slate-50 flex items-center justify-between flex-none h-12">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
           <Users size={16} />
           <h2>财富榜 (Wealth)</h2>
        </div>
        <div className="text-xs font-mono bg-white border border-slate-200 px-2 py-0.5 rounded text-blue-600 font-bold">
           {timeString}
        </div>
      </div>
      
      {/* Auto-distribute height list */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden bg-slate-50/50">
        {sortedAgents.map(agent => (
          <div 
            key={agent.id} 
            className={`flex-1 flex items-center gap-2 px-3 border-b border-slate-100 transition-colors min-h-[60px]
              ${agent.type === 'BOSS' ? 'bg-amber-50/40 hover:bg-amber-50' : 'bg-white hover:bg-slate-50'}
            `}
          >
            {/* Avatar & Badge */}
            <div className="relative flex-none">
                <div className="w-10 h-10 text-xl bg-white rounded-full border border-slate-200 flex items-center justify-center shadow-sm">
                    {agent.emoji}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full flex items-center justify-center text-[8px] border border-white text-white shadow-sm ${
                    agent.type === 'BOSS' ? 'bg-amber-500' : 'bg-blue-400'
                }`}>
                    {agent.type === 'BOSS' ? 'B' : 'C'}
                </div>
            </div>
            
            {/* Info */}
            <div className="flex-1 min-w-0 flex flex-col justify-center gap-0.5">
                <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-slate-700 truncate">{agent.name}</span>
                    <span className={`font-mono text-xs font-bold ${agent.type === 'BOSS' ? 'text-amber-700' : 'text-slate-500'}`}>
                        ¥{(agent.stats.money || 0).toLocaleString()}
                    </span>
                </div>
                
                <div className="flex items-center justify-between text-[10px] text-slate-500">
                     <span className="truncate max-w-[80px]">{agent.role}</span>
                     {/* Mini Action Status */}
                     <span className={`flex items-center gap-1 max-w-[90px] truncate px-1.5 rounded-full ${
                         agent.status === AgentStatus.WORKING ? 'bg-orange-100 text-orange-600' :
                         agent.status === AgentStatus.TALKING ? 'bg-emerald-100 text-emerald-600' :
                         'bg-slate-100 text-slate-400'
                     }`}>
                        {agent.status === AgentStatus.WORKING ? '营业' : 
                         agent.status === AgentStatus.TALKING ? '交易' : '闲逛'}
                     </span>
                </div>
                
                {/* Micro Stats Lines */}
                <div className="flex gap-1 mt-1 opacity-60">
                    <div className="h-0.5 bg-slate-200 flex-1 rounded-full overflow-hidden">
                        <div className="h-full bg-yellow-400" style={{width: `${agent.stats.energy}%`}}/>
                    </div>
                    <div className="h-0.5 bg-slate-200 flex-1 rounded-full overflow-hidden">
                        <div className="h-full bg-pink-400" style={{width: `${agent.stats.mood}%`}}/>
                    </div>
                </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// --- Business Log Right Panel (Vertical) ---
interface ActivityLogProps {
  interactions: Interaction[];
  agents: Agent[];
}

export const ActivityLog: React.FC<ActivityLogProps> = ({ interactions, agents }) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [interactions]);

  return (
    <div className="bg-white h-full flex flex-col border-l border-slate-200 w-[380px] flex-none shadow-xl z-10">
      <div className="p-3 border-b border-slate-200 bg-slate-50 flex items-center justify-between flex-none h-12">
        <div className="flex items-center gap-2 text-slate-700 font-bold text-sm">
           <TrendingUp size={16} className="text-emerald-600"/>
           <h2>商业动态 (Business Log)</h2>
        </div>
        <span className="text-[10px] bg-slate-200 px-2 py-0.5 rounded-full text-slate-500">Live</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50/50" ref={scrollRef}>
        {interactions.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 text-sm italic opacity-60">
            <Coins size={32} className="mb-2 stroke-1"/>
            <p>等待市场开启...</p>
          </div>
        )}
        
        {interactions.map((interaction) => (
          <div key={interaction.id} className="animate-in fade-in slide-in-from-right-4 duration-500">
             
             {/* Transaction Highlight Card */}
             {interaction.transaction && (
                 <div className="mb-2 bg-white rounded-lg border border-emerald-100 shadow-sm overflow-hidden ring-2 ring-emerald-50">
                    <div className="bg-emerald-50 p-2 flex items-center justify-between border-b border-emerald-100">
                        <span className="text-[10px] font-bold text-emerald-700 flex items-center gap-1">
                            <Briefcase size={10}/> DEAL CLOSED
                        </span>
                        <span className="text-xs font-mono font-bold text-emerald-600">
                            +¥{(interaction.transaction.amount || 0).toLocaleString()}
                        </span>
                    </div>
                    <div className="p-2 text-xs flex items-center justify-between gap-2 text-slate-600">
                        <div className="flex items-center gap-1">
                             <span className="font-bold text-slate-800">{interaction.messages.find(m => m.speakerId === interaction.transaction?.fromId)?.speakerName.split(' ')[0]}</span>
                             <ArrowRight size={10} className="text-slate-300"/>
                             <span className="font-bold text-slate-800">{interaction.messages.find(m => m.speakerId === interaction.transaction?.toId)?.speakerName.split(' ')[0]}</span>
                        </div>
                        <div className="truncate text-right font-medium text-amber-600 max-w-[120px]">
                            {interaction.transaction.item || 'Service'}
                        </div>
                    </div>
                 </div>
             )}

             {/* Chat Bubble Summary - Now Full Content */}
             <div className={`p-3 rounded-xl border shadow-sm text-xs flex flex-col gap-2 ${interaction.transaction ? 'bg-amber-50 border-amber-200' : 'bg-white border-slate-200'}`}>
               <div className="flex justify-between items-center opacity-50 text-[9px] border-b border-black/5 pb-1 mb-1">
                  <span>{interaction.messages[0] ? new Date(interaction.messages[0].timestamp).toLocaleTimeString() : '--:--'}</span>
                  <span>{interaction.messages[0]?.speakerName.split(' ')[0]} & {interaction.messages[1]?.speakerName.split(' ')[0]}</span>
               </div>
               
               {/* Display all messages */}
               <div className="space-y-2">
                   {interaction.messages.map((msg, idx) => (
                       <div key={idx} className="flex gap-2 items-start">
                           <span className={`font-bold min-w-[45px] text-right text-[10px] pt-0.5 ${
                             msg.speakerName.includes('BOSS') || agents.find(a => a.name === msg.speakerName)?.type === 'BOSS' 
                             ? 'text-amber-600' 
                             : 'text-slate-500'
                           }`}>
                             {msg.speakerName.split(' ')[0]}:
                           </span>
                           <span className="text-slate-700 leading-relaxed flex-1 break-words">
                             {msg.content}
                           </span>
                       </div>
                   ))}
               </div>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
};
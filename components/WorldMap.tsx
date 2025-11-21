import React from 'react';
import { Agent, TileType, AgentStatus } from '../types';
import { TILE_SIZE, MAP_WIDTH, MAP_HEIGHT, TILE_VISUALS } from '../constants';
import { MessageCircle, Zap, Moon, Briefcase, DollarSign } from 'lucide-react';

interface WorldMapProps {
  mapTiles: TileType[][];
  agents: Agent[];
}

const WorldMap: React.FC<WorldMapProps> = ({ mapTiles, agents }) => {
  const widthPx = MAP_WIDTH * TILE_SIZE;
  const heightPx = MAP_HEIGHT * TILE_SIZE;

  return (
    <div 
      className="relative overflow-hidden bg-slate-900 select-none"
      style={{ width: widthPx, height: heightPx }}
    >
      {/* Render Tiles */}
      <div 
        className="absolute inset-0 grid"
        style={{ 
          gridTemplateColumns: `repeat(${MAP_WIDTH}, ${TILE_SIZE}px)`,
          gridTemplateRows: `repeat(${MAP_HEIGHT}, ${TILE_SIZE}px)`
        }}
      >
        {mapTiles.map((row, y) => (
          row.map((tile, x) => {
            const visual = TILE_VISUALS[tile];
            return (
              <div 
                key={`${x}-${y}`}
                className={`${visual.color} flex items-center justify-center text-lg border-[0.5px] border-black/5 relative`}
              >
                {['WALL', 'HOUSE', 'OFFICE', 'WATER'].includes(tile) && (
                  <span className="drop-shadow-sm filter scale-90">{visual.char}</span>
                )}
              </div>
            );
          })
        ))}
      </div>

      {/* Render Agents */}
      {agents.map((agent) => (
        <div
          key={agent.id}
          className={`absolute transition-all duration-700 ease-in-out flex flex-col items-center justify-center z-20 pointer-events-none`}
          style={{
            width: TILE_SIZE,
            height: TILE_SIZE,
            left: agent.position.x * TILE_SIZE,
            top: agent.position.y * TILE_SIZE,
          }}
        >
          {/* Status Icons */}
          {agent.status === AgentStatus.TALKING && (
             <div className="absolute -top-5 left-0 right-0 flex justify-center animate-bounce z-30">
                <MessageCircle size={14} className="text-white fill-emerald-500 drop-shadow-md" />
             </div>
          )}
           {agent.status === AgentStatus.WORKING && (
             <div className="absolute -top-4 right-[-2px] z-30">
                <Briefcase size={10} className="text-slate-700 fill-orange-400" />
             </div>
          )}
           {agent.status === AgentStatus.RESTING && (
             <div className="absolute -top-4 right-[-2px] z-30">
                <Moon size={10} className="text-indigo-800 fill-indigo-300" />
             </div>
          )}

          {/* Agent Body */}
          <div 
            className={`w-6 h-6 rounded-full flex items-center justify-center text-sm shadow-md border border-white ring-1 ring-black/10 ${agent.color} relative`}
          >
             {agent.emoji}
             {/* Low Energy */}
             {agent.stats.energy < 30 && (
                <Zap size={8} className="absolute -bottom-1 -right-1 text-yellow-400 fill-yellow-400 animate-pulse" />
             )}
          </div>
          
          {/* Name Label */}
          <span className="absolute -bottom-3 text-[8px] font-bold bg-black/70 text-white px-1 py-0 rounded-full whitespace-nowrap backdrop-blur-sm z-30">
            {agent.name.split(' ')[0]}
          </span>
        </div>
      ))}
    </div>
  );
};

export default WorldMap;
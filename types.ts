export type Position = {
  x: number;
  y: number;
};

export enum AgentStatus {
  IDLE = 'IDLE', // Wandering
  MOVING = 'MOVING', // Commuting
  WORKING = 'WORKING', // At work
  RESTING = 'RESTING', // At home
  TALKING = 'TALKING',
  THINKING = 'THINKING',
}

export type AgentType = 'BOSS' | 'CUSTOMER';

export interface AgentStats {
  mood: number;   // 0-100
  energy: number; // 0-100
  exp: number;    // 0-infinity
  money: number;  // Currency
}

export interface Agent {
  id: string;
  name: string;
  emoji: string;
  role: string;       
  type: AgentType;    // Boss or Customer
  personality: string;
  
  // Location Data
  position: Position;
  homePosition: Position;
  workPosition: Position;
  targetPosition: Position | null; 
  
  status: AgentStatus;
  currentAction: string; 
  color: string;
  stats: AgentStats;
}

export interface ChatMessage {
  speakerId: string;
  speakerName: string;
  content: string;
  timestamp: number;
}

export interface Interaction {
  id: string;
  participants: string[]; 
  messages: ChatMessage[];
  active: boolean;
  transaction?: {
    amount: number;
    fromId: string;
    toId: string;
    item: string;
  };
}

export type TileType = 'GRASS' | 'PATH' | 'WALL' | 'WATER' | 'FLOOR' | 'HOUSE' | 'OFFICE';

export interface WorldMap {
  width: number;
  height: number;
  tiles: TileType[][];
}
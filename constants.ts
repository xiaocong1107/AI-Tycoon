import { Agent, AgentStatus, TileType } from './types';

export const TILE_SIZE = 36; 
export const MAP_WIDTH = 16;
export const MAP_HEIGHT = 12;
export const TICK_RATE_MS = 800; 
export const TIME_PER_TICK_MINUTES = 15; 
export const WIN_AMOUNT = 1000000; // 1 Million to win

const COMMON_STATS = { mood: 80, energy: 100, exp: 0, money: 100000 };

export const INITIAL_AGENTS: Agent[] = [
  // --- BOSSES ---
  {
    id: 'boss-it',
    name: '马极客 (Ma Geek)',
    emoji: '👨‍💻',
    role: 'IT创业者',
    type: 'BOSS',
    personality: '极客，语速快，喜欢谈论AI和未来科技，试图兜售昂贵的软件服务。',
    position: { x: 13, y: 2 },
    homePosition: { x: 1, y: 1 },
    workPosition: { x: 13, y: 2 }, // IT Park
    targetPosition: null,
    status: AgentStatus.IDLE,
    currentAction: '寻找投资 (Pitching)',
    color: 'bg-blue-600',
    stats: { ...COMMON_STATS }
  },
  {
    id: 'boss-food',
    name: '牛老板 (Chef Niu)',
    emoji: '👨‍🍳',
    role: '餐饮老板',
    type: 'BOSS',
    personality: '热情，嗓门大，总是邀请人来尝尝新菜，精打细算。',
    position: { x: 13, y: 9 },
    homePosition: { x: 1, y: 10 },
    workPosition: { x: 13, y: 9 }, // Restaurant
    targetPosition: null,
    status: AgentStatus.IDLE,
    currentAction: '准备食材 (Cooking)',
    color: 'bg-orange-500',
    stats: { ...COMMON_STATS }
  },
  {
    id: 'boss-finance',
    name: '钱总 (Mr. Money)',
    emoji: '🕴️',
    role: '金融老板',
    type: 'BOSS',
    personality: '沉稳，精明，满口金融术语，只对大生意感兴趣。',
    position: { x: 8, y: 6 },
    homePosition: { x: 4, y: 1 },
    workPosition: { x: 8, y: 6 }, // Central Bank/Office
    targetPosition: null,
    status: AgentStatus.IDLE,
    currentAction: '分析大盘 (Analyzing)',
    color: 'bg-emerald-600',
    stats: { ...COMMON_STATS }
  },
  {
    id: 'boss-free',
    name: '苏设计师 (Su Design)',
    emoji: '🎨',
    role: '自由职业者',
    type: 'BOSS',
    personality: '随性，追求自由，提供设计和艺术咨询，不喜欢被约束。',
    position: { x: 5, y: 5 },
    homePosition: { x: 4, y: 10 },
    workPosition: { x: 5, y: 5 }, // Park/Cafe
    targetPosition: null,
    status: AgentStatus.IDLE,
    currentAction: '寻找灵感 (Designing)',
    color: 'bg-purple-500',
    stats: { ...COMMON_STATS }
  },

  // --- CUSTOMERS ---
  {
    id: 'cust-1',
    name: '小张 (Zhang)',
    emoji: '🙍‍♂️',
    role: '普通职员',
    type: 'CUSTOMER',
    personality: '努力工作，想买好吃的和电子产品，但也想省钱。',
    position: { x: 2, y: 5 },
    homePosition: { x: 1, y: 4 },
    workPosition: { x: 11, y: 5 },
    targetPosition: null,
    status: AgentStatus.IDLE,
    currentAction: '闲逛 (Wandering)',
    color: 'bg-slate-400',
    stats: { ...COMMON_STATS }
  },
  {
    id: 'cust-2',
    name: '李阿姨 (Aunt Li)',
    emoji: '👩',
    role: '退休人员',
    type: 'CUSTOMER',
    personality: '喜欢聊天，对理财产品感兴趣，也喜欢美食。',
    position: { x: 6, y: 6 },
    homePosition: { x: 1, y: 7 },
    workPosition: { x: 6, y: 6 }, // Park
    targetPosition: null,
    status: AgentStatus.IDLE,
    currentAction: '晨练 (Exercising)',
    color: 'bg-slate-400',
    stats: { ...COMMON_STATS }
  },
  {
    id: 'cust-3',
    name: '王同学 (Student Wang)',
    emoji: '🧑‍🎓',
    role: '大学生',
    type: 'CUSTOMER',
    personality: '好奇心强，喜欢新奇的科技产品，预算有限。',
    position: { x: 9, y: 2 },
    homePosition: { x: 4, y: 4 },
    workPosition: { x: 9, y: 2 }, // Library
    targetPosition: null,
    status: AgentStatus.IDLE,
    currentAction: '学习 (Studying)',
    color: 'bg-slate-400',
    stats: { ...COMMON_STATS }
  },
  {
    id: 'cust-4',
    name: '赵医生 (Dr. Zhao)',
    emoji: '👨‍⚕️',
    role: '医生',
    type: 'CUSTOMER',
    personality: '忙碌，注重生活品质，愿意为好的服务付费。',
    position: { x: 3, y: 8 },
    homePosition: { x: 1, y: 8 },
    workPosition: { x: 3, y: 8 },
    targetPosition: null,
    status: AgentStatus.IDLE,
    currentAction: '休息 (Resting)',
    color: 'bg-slate-400',
    stats: { ...COMMON_STATS }
  },
  {
    id: 'cust-5',
    name: '孙网红 (Influencer Sun)',
    emoji: '🤳',
    role: '网络博主',
    type: 'CUSTOMER',
    personality: '喜欢打卡网红店，购买时尚单品，追求潮流。',
    position: { x: 10, y: 8 },
    homePosition: { x: 4, y: 7 },
    workPosition: { x: 10, y: 8 },
    targetPosition: null,
    status: AgentStatus.IDLE,
    currentAction: '直播 (Streaming)',
    color: 'bg-slate-400',
    stats: { ...COMMON_STATS }
  },
];

// Map Visual Constants
export const TILE_VISUALS: Record<TileType, { char: string, color: string }> = {
  GRASS: { char: '🌱', color: 'bg-emerald-200' },
  PATH: { char: '⬜', color: 'bg-stone-200' },
  WALL: { char: '🌲', color: 'bg-emerald-800' }, 
  WATER: { char: '💧', color: 'bg-blue-400' },
  FLOOR: { char: '🟦', color: 'bg-slate-300' }, 
  HOUSE: { char: '🏠', color: 'bg-orange-200' },
  OFFICE: { char: '🏢', color: 'bg-indigo-200' },
};

// Generate a structured map
export const generateMap = (width: number, height: number): TileType[][] => {
  const map: TileType[][] = Array(height).fill(null).map(() => Array(width).fill('GRASS'));
  
  // 1. Residential Zone (Left side)
  for(let y = 0; y < height; y++) {
      map[y][1] = 'PATH';
      map[y][4] = 'PATH';
  }
  // Randomize housing locations slightly based on constants positions logic manually
  map[1][1] = 'HOUSE'; 
  map[4][1] = 'HOUSE'; 
  map[7][1] = 'HOUSE'; 
  map[10][1] = 'HOUSE';
  map[1][4] = 'HOUSE'; 
  map[4][4] = 'HOUSE'; 
  map[7][4] = 'HOUSE';
  map[10][4] = 'HOUSE';

  // 2. Commercial Zone (Right side) - Offices
  for(let y = 0; y < height; y++) {
    map[y][13] = 'PATH';
  }
  map[2][13] = 'OFFICE'; // IT
  map[5][13] = 'OFFICE'; // Spare
  map[9][13] = 'OFFICE'; // Restaurant

  // 3. Central Plaza / Park / Bank
  for(let y = 4; y < 8; y++) {
    for(let x = 6; x < 10; x++) {
      map[y][x] = 'FLOOR';
    }
  }
  map[6][8] = 'OFFICE'; // Bank

  // 4. Connecting Paths (Horizontal)
  for(let x = 0; x < width; x++) {
    map[6][x] = 'PATH';
    map[2][x] = 'PATH'; // Extra path
    map[9][x] = 'PATH'; // Extra path
  }

  // 5. Boundaries / Forest
  for(let x = 0; x < width; x++) {
    map[0][x] = 'WALL';
    map[height-1][x] = 'WALL';
  }
  for(let y = 0; y < height; y++) {
    map[y][0] = 'WALL';
    map[y][width-1] = 'WALL';
  }

  return map;
};
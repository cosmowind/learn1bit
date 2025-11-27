export const THEMES = [
  "Solitude (孤独)",
  "Urban Decay (城市衰败)",
  "Digital Void (数字虚无)",
  "Lost Love (逝去的爱)",
  "Midnight Snack (深夜食堂)",
  "Traffic Jam (堵车)",
  "Rainy Day (雨天)",
  "Coffee Shop (咖啡店)",
];

export const SHAPES_COUNT = 80;
export const SPEED = 8;
export const FOG_NEAR = 5;
export const FOG_FAR = 30;

// Helper to get random ranges
export const randomRange = (min: number, max: number) => Math.random() * (max - min) + min;
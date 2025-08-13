export interface Bullet {
  text: string;
}

export interface ExperienceItem {
  company?: string;
  role?: string;
  bullets?: Bullet[];
  [key: string]: any;
}

export interface CV {
  experience?: ExperienceItem[];
  [key: string]: any;
}

export interface GapItem {
  id: string;
  path: string;
  message: string;
  text?: string;
}

export interface Question {
  id: string;
  type: 'shortText' | 'number' | 'multi';
  label: string;
  options?: string[];
  path?: string;
}

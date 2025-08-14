export function isEmail(s: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export function isPhone(s: string): boolean {
  return /^\+?[0-9\s\-]{7,15}$/.test(s.trim());
}

export function isUrl(s: string): boolean {
  return /^(https?:\/\/)?([\w-]+\.)+[\w-]{2,}(\/\S*)?$/.test(s.trim());
}

export { wordCount, withinLimits } from './limits';

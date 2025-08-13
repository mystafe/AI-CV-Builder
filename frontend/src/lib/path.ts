export function setByPath(obj: any, path: string, value: any) {
  const parts = path.replace(/\[(\d+)\]/g, '.$1').split('.');
  let cur = obj;
  for (let i = 0; i < parts.length - 1; i++) {
    const key = parts[i];
    if (!(key in cur) || typeof cur[key] !== 'object') {
      cur[key] = Number.isNaN(Number(parts[i + 1])) ? {} : [];
    }
    cur = cur[key];
  }
  cur[parts[parts.length - 1]] = value;
}

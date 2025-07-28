export const asArray = <T>(v: unknown): T[] => (Array.isArray(v) ? (v as T[]) : []);
export default asArray;

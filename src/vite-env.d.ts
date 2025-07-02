/// <reference types="vite/client" />

declare module '*.json' {
  const value: unknown;
  export default value;
}

declare module '*.md' {
  const Component: React.ComponentType;
  export default Component;
}

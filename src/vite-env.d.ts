/// <reference types="vite/client" />

declare module '*.json' {
  const value: unknown;
  export default value;
}

declare module '*.md' {
  const Component: React.ComponentType;
  export default Component;
}

interface ImportMetaEnv {
  readonly VITE_GA_ID?: string;
  readonly VITE_SMTP_API_KEY?: string;
  readonly VITE_SENTRY_DSN?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

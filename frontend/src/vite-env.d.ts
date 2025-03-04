/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly MODE: string;
  readonly VITE_STRIPE_PUBLIC_KEY: string;
  readonly VITE_API_CLIENT_URL: string;
  readonly VITE_SOCKET_SERVER_URL: string;
  readonly NODE_ENV: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

/// <reference types="vite/client" />

interface ViteTypeOptions {
  strictImportMetaEnv: unknown;
}

interface ImportMetaEnv {
  readonly VITE_LOG_LEVEL?: 'DEBUG' | 'INFO' | 'WARN' | 'ERROR' | 'SILENT';
}

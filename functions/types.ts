export interface D1Result<T = unknown> {
  results?: T[];
  success: boolean;
  error?: string;
  meta?: unknown;
}

export interface D1PreparedStatement {
  bind(...values: unknown[]): D1PreparedStatement;
  first<T = unknown>(colName?: string): Promise<T | null>;
  run<T = unknown>(): Promise<{ success: boolean; meta: { last_row_id: number; changes: number } }>;
  all<T = unknown>(): Promise<D1Result<T>>;
}

export interface D1Database {
  prepare(query: string): D1PreparedStatement;
  dump(): Promise<ArrayBuffer>;
  batch<T = unknown>(statements: D1PreparedStatement[]): Promise<D1Result<T>[]>;
  exec<T = unknown>(query: string): Promise<D1Result<T>>;
}

export interface Env {
  DB: D1Database;
  ENVIRONMENT?: string;
  GTM_CONTAINER_ID?: string;
  GTM_ENABLED?: string;
  ADMIN_BOOTSTRAP_USER?: string;
  ADMIN_BOOTSTRAP_PASSWORD?: string;
}

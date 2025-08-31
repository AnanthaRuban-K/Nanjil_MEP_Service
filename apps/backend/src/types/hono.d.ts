// src/types/hono.d.ts
import 'hono';

declare module 'hono' {
  interface ContextVariableMap {
    userId: string;
    user: {
      id: string;
      role: string;
    };
  }
}

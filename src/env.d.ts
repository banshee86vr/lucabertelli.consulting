/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare namespace NodeJS {
  interface ProcessEnv {
    SECRET_EVENTS_API_PASSWORD: string;
    SECRET_EVENTS_API_URL: string;
    SECRET_EVENTS_API_USERNAME: string;
    SECRET_LOAD_EVENTS: string;
  }
}

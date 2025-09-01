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

type KVNamespace = import("@cloudflare/workers-types").KVNamespace;
type ENV = {
  lb_consulting: KVNamespace;
};

// use a default runtime configuration (advanced mode).
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare namespace App {
  interface Locals extends Runtime {}
}

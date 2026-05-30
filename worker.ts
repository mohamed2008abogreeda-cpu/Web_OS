// @ts-ignore
import handler from "./.open-next/worker.js";
import { SyncRoom } from "./src/lib/SyncRoom";

export { SyncRoom };

export default {
  async fetch(request: Request, env: any, ctx: any) {
    return handler.fetch(request, env, ctx);
  }
};

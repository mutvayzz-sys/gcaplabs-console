/**
 * agent37.ts — historical remnant.
 *
 * The console was migrated to HermesHQ as its upstream control/data plane
 * (src/lib/hermeshq.ts). The Agent37 hosted-cloud client is no longer used;
 * this file remains only as a re-export shim for Agent37Error so existing
 * import sites don't break. The canonical definition now lives in src/lib/http.ts
 * as RuntimeError (Agent37Error is a back-compat alias there).
 *
 * Delete this file once all imports are updated to use RuntimeError directly.
 */
export { Agent37Error } from "@/lib/http";
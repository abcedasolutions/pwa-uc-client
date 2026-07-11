import { registerSW } from "virtual:pwa-register";

export function setupServiceWorker(options: { onNeedRefresh: () => void; onOfflineReady: () => void }) {
  return registerSW({
    immediate: true,
    onNeedRefresh: options.onNeedRefresh,
    onOfflineReady: options.onOfflineReady,
  });
}

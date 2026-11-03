/**
 * Registo do service worker (PWA offline).
 * Nunca regista em dev nem nas pré-visualizações da Lovable — nesses
 * contextos, remove registos antigos de /sw.js. `?sw=off` desliga manualmente.
 */
export async function registerPwa() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

  const host = window.location.hostname.toLowerCase();
  const primeiroRotulo = host.split(".")[0];
  const dominioPlataforma =
    host.endsWith(".lovable.app") || host.endsWith(".gpt-eng.com") || host.endsWith(".gptengineer.run");
  const ehPrevisualizacao =
    dominioPlataforma && /^(?:id-preview|preview)(?:-[a-z0-9]+)?--.+$/.test(primeiroRotulo);
  const ehDominioLovable =
    host === "lovableproject.com" ||
    host.endsWith(".lovableproject.com") ||
    host === "lovableproject-dev.com" ||
    host.endsWith(".lovableproject-dev.com") ||
    host === "beta.lovable.dev" ||
    host.endsWith(".beta.lovable.dev");
  const swDesligado = new URLSearchParams(window.location.search).get("sw") === "off";

  const bloqueado =
    !import.meta.env.PROD || window.top !== window.self || ehPrevisualizacao || ehDominioLovable || swDesligado;

  if (bloqueado) {
    const registos = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registos.filter((r) => r.active?.scriptURL.endsWith("/sw.js")).map((r) => r.unregister()),
    );
    return;
  }

  const { registerSW } = await import("virtual:pwa-register");
  registerSW({ immediate: true });
}

const CACHE_ATUAL = "mare-shell-v1";
const RECURSOS_INICIAIS = ["/", "/manifest.webmanifest", "/icon-192.png", "/icon-512.png"];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_ATUAL)
      .then((cache) => cache.addAll(RECURSOS_INICIAIS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys()
      .then((chaves) => Promise.all(chaves.filter((chave) => chave.startsWith("mare-shell-") && chave !== CACHE_ATUAL).map((chave) => caches.delete(chave))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (evento) => {
  const requisicao = evento.request;
  const url = new URL(requisicao.url);

  // Não guarda respostas autenticadas ou dados da API no cache do aparelho.
  if (requisicao.method !== "GET" || url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (requisicao.mode === "navigate") {
    evento.respondWith(
      fetch(requisicao)
        .then((resposta) => {
          const copia = resposta.clone();
          void caches.open(CACHE_ATUAL).then((cache) => cache.put("/", copia));
          return resposta;
        })
        .catch(async () => (await caches.match(requisicao)) || (await caches.match("/"))),
    );
    return;
  }

  if (url.pathname.startsWith("/assets/") || url.pathname.endsWith(".png") || url.pathname.endsWith(".webmanifest")) {
    evento.respondWith(
      caches.match(requisicao).then((emCache) => {
        const atualizado = fetch(requisicao).then((resposta) => {
          if (resposta.ok) void caches.open(CACHE_ATUAL).then((cache) => cache.put(requisicao, resposta.clone()));
          return resposta;
        });
        return emCache || atualizado;
      }),
    );
  }
});

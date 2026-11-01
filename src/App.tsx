import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import PublicRoute from "./PublicRoute";
import ProtectedRoute from "./ProtectedRoute";

const Home = lazy(() => import("./pages/home"));
const Hero = lazy(() => import("./pages/hero"));
const Cadastro = lazy(() => import("./pages/cadastro"));
const Login = lazy(() => import("./pages/login"));
const Perfil = lazy(() => import("./pages/perfil"));
const Explorar = lazy(() => import("./pages/explorar"));
const Salvos = lazy(() => import("./pages/salvos"));
const Criarpost = lazy(() => import("./pages/criarpost"));
const Contato = lazy(() => import("./pages/contato"));
const Configuracoes = lazy(() => import("./pages/configuracoes"));
const Faq = lazy(() => import("./pages/faq"));
const Sobre = lazy(() => import("./pages/sobre"));
const Musica = lazy(() => import("./pages/musica"));
const Resultados = lazy(() => import("./pages/resultados"));
const Artista = lazy(() => import("./pages/artista"));
const Post = lazy(() => import("./pages/post"));
const Filtrar = lazy(() => import("./pages/filtrar"));
const PerfilPublico = lazy(() => import("./pages/perfilPublico"));
const ListaSeguidores = lazy(() => import("./pages/listaSeguidores"));
const Notificacoes = lazy(() => import("./pages/notificacoes"));
const Legal = lazy(() => import("./pages/legal"));
const VerificarEmail = lazy(() => import("./pages/verificarEmail"));

function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          className: "mare-toast",
          style: {
            background: "#151d2b",
            color: "#f3f6fb",
            border: "1px solid #2d3a4f",
            borderRadius: "14px",
            padding: "12px 16px",
            boxShadow: "0 12px 36px rgba(0,0,0,.35)",
            fontFamily: "Inter, sans-serif",
          },
          success: { iconTheme: { primary: "#58a9e8", secondary: "#151d2b" } },
          error: { iconTheme: { primary: "#fb7185", secondary: "#151d2b" } },
        }}
      />

      <Suspense
        fallback={
          <div
            role="status"
            className="flex min-h-screen items-center justify-center gap-3 bg-[var(--cor-fundo)] text-sm text-[#9aa6ba]"
          >
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-[var(--cor-borda-suave)] border-t-[var(--cor-destaque)]" />
            Carregando página...
          </div>
        }
      >
        <Routes>
          {/* Inicial */}
          <Route element={<PublicRoute />}>
            <Route path="/login" element={<Login />} />
            <Route path="/cadastro" element={<Cadastro />} />
            <Route path="/" element={<Hero />} />
            <Route path="/sobre" element={<Sobre />} />
          </Route>

          {/* Páginas públicas */}
          <Route path="/contato" element={<Contato />} />
          <Route path="/faq" element={<Faq />} />
          <Route path="/termos" element={<Legal tipo="termos" />} />
          <Route path="/privacidade" element={<Legal tipo="privacidade" />} />
          <Route path="/verificar-email" element={<VerificarEmail />} />

          <Route element={<ProtectedRoute />}>
            <Route path="/home" element={<Home />} />
            <Route path="/explorar" element={<Explorar />} />
            <Route path="/perfil" element={<Perfil />} />
            <Route path="/u/:username" element={<PerfilPublico />} />
            <Route path="/filtrar" element={<Filtrar />} />
            <Route path="/salvos" element={<Salvos />} />
            <Route path="/criarpost" element={<Criarpost />} />
            <Route path="/musica" element={<Musica />} />
            <Route path="/musica/:id" element={<Musica />} />
            <Route path="/artista/:id" element={<Artista />} />
            <Route path="/post/:id" element={<Post />} />
            <Route path="/configuracoes" element={<Configuracoes />} />
            <Route path="/buscar" element={<Resultados />} />
            <Route path="/usuarios/:id/:tipo" element={<ListaSeguidores />} />
            <Route path="/notificacoes" element={<Notificacoes />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;

import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/home";
import Hero from "./pages/hero";
import Cadastro from "./pages/cadastro";
import Login from "./pages/login";
import Perfil from "./pages/perfil";
import Explorar from "./pages/explorar";
import Salvos from "./pages/salvos";
import Criarpost from "./pages/criarpost";
import Contato from "./pages/contato";
import Configuracoes from "./pages/configuracoes"
import Faq from "./pages/faq"
import Sobre from "./pages/sobre"
import { Toaster } from "react-hot-toast";
import Musica from "./pages/musica";
import PublicRoute from "./PublicRoute";
import Resultados from "./pages/resultados";
import Artista from "./pages/artista";
import ProtectedRoute from "./ProtectedRoute";
import Post from "./pages/post";
import Filtrar from "./pages/filtrar";
import PerfilPublico from "./pages/perfilPublico";
import ListaSeguidores from "./pages/listaSeguidores";
import Notificacoes from "./pages/notificacoes";
import VerificarEmail from "./pages/verificarEmail";

function App() {
  return (
    <BrowserRouter>
      <Toaster position="bottom-right" />

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
        <Route path="/verificar-email" element={<VerificarEmail />}/>


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
    </BrowserRouter>
  );
}

export default App;

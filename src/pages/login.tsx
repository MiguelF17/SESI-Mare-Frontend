import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import fundoLogin from "../assets/fundoLogin.png";
import logo from "../assets/mare.png";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";
import { ApiError } from "../api";
import { reenviarVerificacao } from "../services/authService";

function Login() {
  const navigate = useNavigate();
  const { entrar, carregando } = useAuth();
  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const location = useLocation();
  const [emailNaoVerificado, setEmailNaoVerificado] = useState(false);
  const [reenviando, setReenviando] = useState(false);

  const mensagemCadastro = location.state?.mensagem;

  const handleReenviarVerificacao = async () => {
    if (!login.trim()) {
      toast.error("Informe seu e-mail ou username.");
      return;
    }

    try {
      setReenviando(true);

      const resposta = await reenviarVerificacao(
        login.trim().toLowerCase()
      );

      toast.success(resposta.message);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível reenviar o e-mail."
      );
    } finally {
      setReenviando(false);
    }
  };

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const usuario = await entrar(login.trim().toLowerCase(), senha);

      toast.success("Login realizado com sucesso!");

      navigate(
        usuario.preferenciasConcluidas ? "/home" : "/filtrar"
      );
    } catch (error) {
      console.error("Erro ao fazer login:", error);

      if (
        error instanceof ApiError &&
        error.code === "EMAIL_NAO_VERIFICADO"
      ) {
        setEmailNaoVerificado(true);
        toast.error("Confirme seu e-mail antes de entrar.");
        return;
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível conectar ao servidor."
      );
    }
  };


  return (
    <main
      className="
  min-h-screen
  w-full
  flex
  items-center
  justify-center
  lg:justify-end
  relative
  overflow-x-hidden
  px-4
  py-24
  sm:px-6
  lg:px-20
  bg-[#080A10]
"
      style={{
        fontFamily: "Inter, sans-serif",
      }}
    >
      {/* IMAGEM DE FUNDO */}

      <div
        className="
                    absolute
                    inset-0
                    bg-cover
                    bg-center
                    bg-no-repeat
                "
        style={{
          backgroundImage: `url(${fundoLogin})`,
        }}
      />

      {/* LOGO */}

      <div
        className="
                    absolute
                    top-6
                    left-0
                    z-20
                "
      >
        <Link to="/">
          <img
            src={logo}
            alt="Maré"
            className="
                            w-[120px]
                            h-[60px]
                            object-contain
                        "
          />
        </Link>
      </div>

      {/* CAIXA DE LOGIN */}

      <div
        className="
  relative
  z-10
  w-full
  max-w-[420px]
  mx-auto
  lg:mx-0
  lg:mr-[5%]
"
      >
        <div
          className="
  w-full
  bg-[#111A25]/95
  backdrop-blur-md
  border
  border-[#354052]
  rounded-2xl
  shadow-2xl
  px-5
  py-6
  sm:px-8
"
        >
          {/* CABEÇALHO */}

          <div className="text-center mb-5">
            <h1
              className="
                                text-3xl
                                font-bold
                                text-[#E4EFFF]
                            "
            >
              Login
            </h1>

            <p
              className="
                                text-sm
                                text-[#B8C7D9]
                                mt-1
                            "
            >
              Bem-vindo de volta à Maré.
            </p>
          </div>

          {mensagemCadastro && (
            <div className="mb-4 rounded-lg border border-[#58AAF0]/30 bg-[#58AAF0]/10 py-3 px-2 text-sm text-[#A9D8FF]">
              {mensagemCadastro}
            </div>
          )}

          {/* FORMULÁRIO */}

          <form
            onSubmit={handleSubmit}
            className="
                            w-full
                            space-y-4
                        "
          >
            {/* LOGIN */}

            <div className="space-y-2">
              <label
                htmlFor="login"
                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-[#E4EFFF]
                                "
              >
                E-mail ou usuário
              </label>

              <input
                id="login"
                type="text"
                required
                value={login}
                onChange={(e) => {
                  setLogin(e.target.value.toLowerCase());
                  setEmailNaoVerificado(false);
                }}
                placeholder="Digite seu e-mail ou usuário"
                className="
                                    w-full
                                    px-4
                                    py-3
                                    rounded-lg
                                    bg-[#080A10]
                                    border
                                    border-[#354052]
                                    text-[#E4EFFF]
                                    placeholder-[#68788C]
                                    outline-none
                                    transition
                                    duration-200
                                    focus:border-[#58AAF0]
                                    focus:ring-1
                                    focus:ring-[#58AAF0]
                                "
              />
            </div>

            {/* SENHA */}

            <div className="space-y-2">
              <label
                htmlFor="senha"
                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-[#E4EFFF]
                                "
              >
                Senha
              </label>

              <div className="relative">
                <input
                  id="senha"
                  type={mostrarSenha ? "text" : "password"}
                  required
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  placeholder="Digite sua senha"
                  className="
                                        w-full
                                        px-4
                                        py-3
                                        pr-12
                                        rounded-lg
                                        bg-[#080A10]
                                        border
                                        border-[#354052]
                                        text-[#E4EFFF]
                                        placeholder-[#68788C]
                                        outline-none
                                        transition
                                        duration-200
                                        focus:border-[#58AAF0]
                                        focus:ring-1
                                        focus:ring-[#58AAF0]
                                    "
                />

                <button
                  type="button"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                  className="
                                        absolute
                                        right-3
                                        top-1/2
                                        -translate-y-1/2
                                        text-[#8FA1B5]
                                        hover:text-[#58AAF0]
                                        transition
                                        cursor-pointer
                                    "
                  aria-label={mostrarSenha ? "Ocultar senha" : "Mostrar senha"}
                >
                  {mostrarSenha ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
            </div>

            {/* ESQUECEU A SENHA */}

            <div className="flex justify-end">
              <Link
                to="/recuperar-senha"
                className="
                                    text-xs
                                    text-[#58AAF0]
                                    hover:text-[#7BC3FF]
                                    hover:underline
                                    transition
                                "
              >
                Esqueceu a senha?
              </Link>
            </div>

            {/* BOTÃO */}

            <button
              type="submit"
              disabled={carregando}
              className="
    w-full h-12
    bg-[#58AAF0] hover:bg-[#3F95D8]
    text-[#080D14] font-semibold
    rounded-lg transition duration-200
    cursor-pointer disabled:opacity-60
    disabled:cursor-not-allowed
  "
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>

            {emailNaoVerificado && (
              <div className="text-center space-y-2">
                <p className="text-sm text-[#B8C7D9]">
                  Seu e-mail ainda não foi confirmado.
                </p>

                <button
                  type="button"
                  onClick={handleReenviarVerificacao}
                  disabled={reenviando || !login.trim()}
                  className="
        text-sm
        text-[#58AAF0]
        hover:text-[#7BC3FF]
        hover:underline
        transition
        cursor-pointer
        disabled:opacity-50
        disabled:cursor-not-allowed
      "
                >
                  {reenviando
                    ? "Enviando e-mail..."
                    : "Reenviar e-mail de verificação"}
                </button>
              </div>
            )}

            {/* CADASTRO */}

            <p
              className="
                                text-center
                                text-sm
                                text-[#8FA1B5]
                                pt-2
                            "
            >
              Não tem uma conta?
              <Link
                to="/cadastro"
                className="
                                    text-[#58AAF0]
                                    hover:text-[#7BC3FF]
                                    hover:underline
                                    ml-1
                                    transition
                                "
              >
                Criar conta
              </Link>
            </p>
          </form>
        </div>
      </div>
    </main>
  );
}

export default Login;

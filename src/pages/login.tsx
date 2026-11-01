import { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import fundoLogin from "../assets/fundoLogin.jpg";
import logo from "../assets/logomare.png";
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
  const mensagemCadastro = location.state?.mensagem;
  const [emailReenvio, setEmailReenvio] = useState<string>(location.state?.email ?? "");
  const [reenviando, setReenviando] = useState(false);
  const [emailPendente, setEmailPendente] = useState(false);

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    try {
      const usuario = await entrar(login.trim().toLowerCase(), senha);
      setEmailPendente(false);

      toast.success("Login realizado com sucesso!");

      navigate(
        usuario.preferenciasConcluidas ? "/home" : "/filtrar"
      );
    } catch (error) {
      console.error("Erro ao fazer login:", error);

      if (error instanceof ApiError && error.code === "EMAIL_NAO_VERIFICADO") {
        setEmailPendente(true);
        setEmailReenvio(login.trim());
      }

      toast.error(
        error instanceof Error
          ? error.message
          : "Não foi possível conectar ao servidor."
      );
    }
  };

  const handleReenviarVerificacao = async () => {
    if (!emailReenvio.trim()) {
      toast.error("Informe seu e-mail ou usuário para reenviar a confirmação.");
      return;
    }
    setReenviando(true);
    try {
      const resposta = await reenviarVerificacao(emailReenvio.trim());
      toast.success(resposta.message);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível reenviar o e-mail.");
    } finally {
      setReenviando(false);
    }
  };


  return (
    <main
      className="
  min-h-screen
  w-full
  flex
  items-start
  justify-center
  lg:justify-end
  relative
  overflow-x-hidden
  px-4
  pt-24
  pb-8
  sm:px-6
  lg:px-20
  lg:items-center
  lg:py-24
  bg-[var(--cor-fundo)]
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
                    bg-[length:auto_100%]
                    bg-left-center
                    sm:bg-cover
                    sm:bg-center
                    bg-no-repeat
                "
        style={{
          backgroundImage: `url(${fundoLogin})`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--cor-fundo)]/35 via-[var(--cor-fundo)]/65 to-[var(--cor-fundo)]/90 lg:bg-gradient-to-l lg:from-[var(--cor-fundo)]/5 lg:via-[var(--cor-fundo)]/30 lg:to-[var(--cor-fundo)]/80" />

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
  bg-[var(--cor-cartao-autenticacao)]
  backdrop-blur-md
  border
  border-[var(--cor-borda)]
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
                                text-[var(--cor-texto-destaque)]
                            "
            >
              Login
            </h1>

            <p
              className="
                                text-sm
                                text-[var(--cor-texto-autenticacao-suave)]
                                mt-1
                            "
            >
              Bem-vindo de volta à Maré.
            </p>
          </div>

          {mensagemCadastro && (
            <div className="mb-4 rounded-lg border border-[var(--cor-destaque)]/30 bg-[var(--cor-destaque)]/10 py-3 px-2 text-sm text-[#A9D8FF]">
              {mensagemCadastro}
            </div>
          )}

          {(emailPendente || mensagemCadastro || location.state?.reenviar) && (
            <div className="mb-4 space-y-3 rounded-lg border border-[var(--cor-borda)] bg-[var(--cor-fundo)]/60 p-3">
              <label htmlFor="email-reenvio" className="block text-sm text-[var(--cor-texto-destaque)]">
                Reenviar e-mail de confirmação
              </label>
              <input
                id="email-reenvio"
                type="text"
                autoComplete="email"
                value={emailReenvio}
                onChange={(event) => setEmailReenvio(event.target.value)}
                placeholder="Seu e-mail ou usuário"
                className="w-full rounded-lg border border-[var(--cor-borda)] bg-[var(--cor-fundo)] px-3 py-2 text-[var(--cor-texto-destaque)]"
              />
              <button
                type="button"
                onClick={handleReenviarVerificacao}
                disabled={reenviando}
                className="w-full rounded-lg border border-[var(--cor-destaque)] px-4 py-2 text-sm font-medium text-[var(--cor-destaque)] disabled:opacity-60"
              >
                {reenviando ? "Enviando..." : "Reenviar confirmação"}
              </button>
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
                                    text-[var(--cor-texto-destaque)]
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
                }}
                placeholder="Digite seu e-mail ou usuário"
                className="
                                    w-full
                                    px-4
                                    py-3
                                    rounded-lg
                                    bg-[var(--cor-fundo)]
                                    border
                                    border-[var(--cor-borda)]
                                    text-[var(--cor-texto-destaque)]
                                    placeholder-[#68788C]
                                    outline-none
                                    transition
                                    duration-200
                                    focus:border-[var(--cor-destaque)]
                                    focus:ring-1
                                    focus:ring-[var(--cor-destaque)]
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
                                    text-[var(--cor-texto-destaque)]
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
                                        bg-[var(--cor-fundo)]
                                        border
                                        border-[var(--cor-borda)]
                                        text-[var(--cor-texto-destaque)]
                                        placeholder-[#68788C]
                                        outline-none
                                        transition
                                        duration-200
                                        focus:border-[var(--cor-destaque)]
                                        focus:ring-1
                                        focus:ring-[var(--cor-destaque)]
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
                                        hover:text-[var(--cor-destaque)]
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
                                    text-[var(--cor-destaque)]
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
    bg-[var(--cor-destaque)] hover:bg-[#3F95D8]
    text-[#080D14] font-semibold
    rounded-lg transition duration-200
    cursor-pointer disabled:opacity-60
    disabled:cursor-not-allowed
  "
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>

            {/* CADASTRO */}

            <p
              className="
                                text-center
                                text-sm
                                text-[var(--cor-texto-autenticacao-suave)]
                                pt-2
                            "
            >
              Não tem uma conta?
              <Link
                to="/cadastro"
                className="
                                    text-[var(--cor-destaque)]
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

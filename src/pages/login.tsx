import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import fundoLogin from "../assets/fundoLogin.png";
import logo from "../assets/mare.png";
import toast from "react-hot-toast";
import { API_URL } from "../api";

function Login() {
  const navigate = useNavigate();

  const [login, setLogin] = useState("");
  const [senha, setSenha] = useState("");
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      const resposta = await fetch(`${API_URL}/login`, {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        body: JSON.stringify({
          login: login,
          senha: senha,
        }),
      });

      const dados = await resposta.json();

      // ERRO NO LOGIN

      if (!resposta.ok) {
        toast.error(dados.error || "Email ou senha incorretos.");

        return;
      }

      localStorage.setItem("token", dados.token);
      localStorage.setItem("usuario", JSON.stringify(dados.usuario));

      if (!dados.usuario.preferenciasConcluidas) {
        navigate("/filtrar");
      } else {
        navigate("/");
      }

      // AVISO DE SUCESSO

      toast.success("Login realizado com sucesso!");

      setTimeout(() => {
        navigate("/filtrar");
      }, 1000);
    } catch (error) {
      console.error("Erro ao conectar com a API:", error);

      toast.error("Não foi possível conectar ao servidor.");
    }
  };

  return (
    <main
      className="
                min-h-screen
                w-full
                flex
                items-center
                justify-end
                relative
                overflow-hidden
                px-6
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
                    mr-0
                    lg:mr-[5%]
                "
      >
        <div
          className="
                        bg-[#111A25]/95
                        backdrop-blur-md
                        border
                        border-[#354052]
                        rounded-2xl
                        shadow-2xl
                        px-8
                        py-6
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
                onChange={(e) => setLogin(e.target.value)}
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
              className="
                                w-full
                                h-12
                                bg-[#58AAF0]
                                hover:bg-[#3F95D8]
                                text-[#080D14]
                                font-semibold
                                rounded-lg
                                transition
                                duration-200
                                cursor-pointer
                                shadow-lg
                                hover:shadow-[#58AAF0]/20
                                hover:scale-[1.01]
                            "
            >
              Entrar
            </button>

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

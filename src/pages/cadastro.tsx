import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Check } from "lucide-react";
import { toast } from "react-hot-toast";
import { useAuth } from "../hooks/useAuth";

import fundoCadastro from "../assets/fundoLogin.jpg";
import logo from "../assets/logomare.png";

function Cadastro() {
  const navigate = useNavigate();
  const { cadastrar, carregando } = useAuth();

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [mostrarConfirmarSenha] =
    useState(false);

  const requisitosSenha = [
    {
      texto: "Pelo menos 8 caracteres",
      valido: formData.senha.length >= 8,
    },
    {
      texto: "Uma letra maiúscula",
      valido: /[A-Z]/.test(formData.senha),
    },
    {
      texto: "Uma letra minúscula",
      valido: /[a-z]/.test(formData.senha),
    },
    {
      texto: "Um número",
      valido: /[0-9]/.test(formData.senha),
    },
    {
      texto: "Um caractere especial",
      valido: /[^A-Za-z0-9]/.test(formData.senha),
    },
  ];

  const senhaValida = requisitosSenha.every(
    (requisito) => requisito.valido
  );

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: name === "username"
        ? value.toLowerCase()
        : value,
    }));
  };


  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>
  ) => {
    e.preventDefault();

    if (!senhaValida) {
      toast.error("Sua senha não atende a todos os requisitos.");
      return;
    }

    try {
      await cadastrar(formData);

      toast.success("Conta criada! Confira seu e-mail para confirmar o cadastro.");

      setFormData({
        username: "",
        email: "",
        senha: "",
        confirmarSenha: "",
      });

      navigate("/login", {
        state: {
          mensagem: "Sua conta foi criada. Confirme o e-mail enviado para ativá-la. Se não encontrar, você pode solicitar um novo envio abaixo.",
          email: formData.email.trim(),
        },
      });
    } catch (error) {
      console.error("Erro ao cadastrar:", error);

      if (
        error instanceof Error &&
        error.message.toLowerCase().includes("conta foi criada")
      ) {
        navigate("/login", {
          state: {
            mensagem: "Sua conta foi criada, mas o primeiro envio falhou. Você pode tentar reenviar a confirmação abaixo.",
            email: formData.email.trim(),
            reenviar: true,
          },
        });
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
          backgroundImage: `url(${fundoCadastro})`,
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

      {/* CAIXA DE CADASTRO */}
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

        {/* CARD */}
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
  py-4
  sm:px-7
"
        >

          {/* CABEÇALHO */}
          <div className="text-center mb-3">
            <h1
              className="
            text-3xl
            font-bold
            text-[var(--cor-texto-destaque)]
        "
            >
              Criar conta
            </h1>

            <p
              className="
            text-xs
            text-[var(--cor-texto-autenticacao-suave)]
            mt-1
        "
            >
              Crie sua conta e faça parte da Maré.
            </p>
          </div>

          {/* FORMULÁRIO */}
          <form
            onSubmit={handleSubmit}
            className="
                            w-full
                            space-y-3
                        "
          >

            {/* USUÁRIO */}
            <div className="space-y-2">

              <label
                htmlFor="usuario"
                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-[var(--cor-texto-destaque)]
                                "
              >
                Usuário
              </label>

              <input
                id="username"
                name="username"
                type="text"
                required
                value={formData.username}
                onChange={handleChange}
                placeholder="Digite seu usuário"
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

            {/* E-MAIL */}
            <div className="space-y-2">

              <label
                htmlFor="email"
                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-[var(--cor-texto-destaque)]
                                "
              >
                E-mail
              </label>

              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Digite seu e-mail"
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
                  name="senha"
                  type={
                    mostrarSenha
                      ? "text"
                      : "password"
                  }
                  required
                  value={formData.senha}
                  onChange={handleChange}
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
                  onClick={() =>
                    setMostrarSenha(
                      !mostrarSenha
                    )
                  }
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
                  aria-label={
                    mostrarSenha
                      ? "Ocultar senha"
                      : "Mostrar senha"
                  }
                >
                  {mostrarSenha ? (
                    <EyeOff size={20} />
                  ) : (
                    <Eye size={20} />
                  )}
                </button>

              </div>

            </div>

              {formData.senha.length > 0 && (
                <div className="grid grid-cols-2 gap-x-2 gap-y-1">
                  {requisitosSenha.map((requisito) => (
                    <div
                      key={requisito.texto}
                      className={`flex items-center gap-1.5 text-[11px] transition-colors ${requisito.valido
                          ? "text-[var(--cor-destaque)]"
                          : "text-[#718096]"
                        }`}
                    >
                      <Check
                        size={12}
                        className={
                          requisito.valido ? "opacity-100" : "opacity-30"
                        }
                      />

                      <span>{requisito.texto}</span>
                    </div>
                  ))}
                </div>
              )}

            {/* CONFIRMAR SENHA */}
            <div className="space-y-2">

              <label
                htmlFor="confirmarSenha"
                className="
                                    block
                                    text-sm
                                    font-medium
                                    text-[var(--cor-texto-destaque)]
                                "
              >
                Confirmar senha
              </label>

              <div className="relative">

                <input
                  id="confirmarSenha"
                  name="confirmarSenha"
                  type={
                    mostrarConfirmarSenha
                      ? "text"
                      : "password"
                  }
                  required
                  value={
                    formData.confirmarSenha
                  }
                  onChange={handleChange}
                  placeholder="Digite sua senha novamente"
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
              </div>

            </div>

            {/* TERMOS */}
            <p
              className="
                                text-xs
                                text-[var(--cor-texto-autenticacao-suave)]
                                pt-1
                                leading-relaxed
                            "
            >
              Ao criar uma conta, você concorda com nossos{" "}
              <Link
                to="/termos"
                className="
                                    text-[var(--cor-destaque)]
                                    hover:text-[#7BC3FF]
                                    hover:underline
                                    transition
                                "
              >
                Termos de Uso
              </Link>{" "}
              e nossa{" "}
              <Link
                to="/privacidade"
                className="
                                    text-[var(--cor-destaque)]
                                    hover:text-[#7BC3FF]
                                    hover:underline
                                    transition
                                "
              >
                Política de Privacidade
              </Link>.
            </p>

            {/* BOTÃO */}
            <button
              type="submit"
              disabled={carregando}
              className="
    w-full h-12
    bg-[var(--cor-destaque)] hover:bg-[#3F95D8]
    text-[var(--cor-tinta)] font-semibold
    rounded-lg transition duration-200
    cursor-pointer disabled:opacity-60
    disabled:cursor-not-allowed
  "
            >
              {carregando ? "Criando conta..." : "Criar conta"}
            </button>

            {/* LOGIN */}
            <p
              className="
                                text-center
                                text-sm
                                text-[#8FA1B5]
                                pt-2
                            "
            >
              Já tem uma conta?

              <Link
                to="/login"
                className="
                                    text-[var(--cor-destaque)]
                                    hover:text-[#7BC3FF]
                                    hover:underline
                                    ml-1
                                    transition
                                "
              >
                Entrar
              </Link>
            </p>

          </form>

        </div>

      </div>

    </main>
  );
}

export default Cadastro;

import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, LoaderCircle, Mail, ShieldCheck } from "lucide-react";
import toast from "react-hot-toast";
import logo from "../assets/logomare.png";
import { redefinirSenha, solicitarRedefinicaoSenha } from "../services/authService";

export default function RecuperarSenha() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const token = params.get("token");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmacao, setConfirmacao] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [enviado, setEnviado] = useState(false);

  async function enviar(evento: FormEvent) {
    evento.preventDefault();
    setCarregando(true);
    try {
      if (!token) {
        const resposta = await solicitarRedefinicaoSenha(email.trim().toLowerCase());
        toast.success(resposta.message);
        setEnviado(true);
      } else {
        if (senha !== confirmacao) throw new Error("As senhas não coincidem.");
        const valida = senha.length >= 8 && senha.length <= 128 && /[a-z]/.test(senha) && /[A-Z]/.test(senha) && /[0-9]/.test(senha) && /[^a-zA-Z0-9]/.test(senha);
        if (!valida) throw new Error("Use 8 a 128 caracteres, com maiúscula, minúscula, número e símbolo.");
        const resposta = await redefinirSenha(token, senha);
        toast.success(resposta.message);
        navigate("/login", { replace: true });
      }
    } catch (erro) {
      toast.error(erro instanceof Error ? erro.message : "Não foi possível concluir a solicitação.");
    } finally { setCarregando(false); }
  }

  return <main className="min-h-screen flex items-center justify-center bg-[var(--cor-fundo)] px-4 py-8">
    <section className="w-full max-w-md rounded-2xl border border-[var(--cor-borda)] bg-[var(--cor-superficie)] p-6 sm:p-8">
      <Link to="/login" className="inline-flex items-center gap-2 text-sm text-[#9aa6ba] hover:text-white"><ArrowLeft size={17} /> Voltar ao login</Link>
      <img src={logo} alt="Maré" className="mx-auto my-7 h-auto w-36" />
      <div className="mb-6 text-center"><div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#58AAF0]/10 text-[var(--cor-destaque)]">{token ? <ShieldCheck /> : <Mail />}</div>
        <h1 className="text-xl font-semibold text-[var(--cor-texto-principal)]">{token ? "Crie uma nova senha" : "Redefinir senha"}</h1>
        <p className="mt-2 text-sm text-[#9aa6ba]">{token ? "Escolha uma senha segura para sua conta." : enviado ? "Enviamos o link de redefinição para o e-mail cadastrado." : "Enviaremos um link de redefinição para o e-mail da sua conta."}</p>
      </div>
      {!enviado || token ? <form onSubmit={enviar} className="space-y-4">
        {!token ? <label className="block text-sm text-[#D0D0D5]">E-mail<input required type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[var(--cor-borda)] bg-[#0b1019] px-4 text-white outline-none focus:border-[var(--cor-destaque)]" placeholder="voce@email.com" /></label> : <>
          <label className="block text-sm text-[#D0D0D5]">Nova senha<input required type="password" autoComplete="new-password" value={senha} onChange={(e) => setSenha(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[var(--cor-borda)] bg-[#0b1019] px-4 text-white outline-none focus:border-[var(--cor-destaque)]" /></label>
          <label className="block text-sm text-[#D0D0D5]">Confirme a nova senha<input required type="password" autoComplete="new-password" value={confirmacao} onChange={(e) => setConfirmacao(e.target.value)} className="mt-2 h-12 w-full rounded-xl border border-[var(--cor-borda)] bg-[#0b1019] px-4 text-white outline-none focus:border-[var(--cor-destaque)]" /></label>
        </>}
        <button disabled={carregando} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[var(--cor-destaque)] font-semibold text-[#080A10] disabled:opacity-60">{carregando && <LoaderCircle size={17} className="animate-spin" />}{token ? "Salvar nova senha" : "Enviar link por e-mail"}</button>
      </form> : <Link to="/login" className="block rounded-xl border border-[var(--cor-borda)] py-3 text-center text-sm text-white">Voltar ao login</Link>}
    </section>
  </main>;
}

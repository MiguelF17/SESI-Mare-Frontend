
import { useEffect, useState, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle, XCircle, LoaderCircle } from "lucide-react";
import { verificarEmail } from "../services/authService";

function VerificarEmail() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get("token");
    const verificacaoIniciada = useRef<string | null>(null);

    const [status, setStatus] = useState<
        "carregando" | "sucesso" | "erro"
    >("carregando");

    const [mensagem, setMensagem] = useState("");

    useEffect(() => {
        if (verificacaoIniciada.current === token) return;

        verificacaoIniciada.current = token;

        async function confirmar() {
            if (!token) {
                setMensagem("Link de verificação inválido.");
                setStatus("erro");
                return;
            }

            try {
                const resposta = await verificarEmail(token);

                setMensagem(resposta.message);
                setStatus("sucesso");
            } catch (error) {
                setMensagem(
                    error instanceof Error
                        ? error.message
                        : "Não foi possível verificar seu e-mail."
                );
                setStatus("erro");
            }
        }

        confirmar();
    }, [token]);

    return (
        <main className="min-h-screen bg-[var(--cor-fundo)] flex items-center justify-center px-4">
            <div className="w-full max-w-md rounded-2xl border border-[var(--cor-borda)] bg-[var(--cor-superficie)] p-8 text-center">
                {status === "carregando" && (
                    <>
                        <LoaderCircle
                            size={48}
                            className="mx-auto mb-5 animate-spin text-[var(--cor-destaque)]"
                        />
                        <h1 className="text-xl font-semibold text-[var(--cor-texto-principal)]">
                            Verificando seu e-mail...
                        </h1>
                        <p className="mt-2 text-sm text-[var(--cor-texto-cinza-400)]">
                            Aguarde enquanto confirmamos sua conta.
                        </p>
                    </>
                )}

                {status === "sucesso" && (
                    <>
                        <CheckCircle
                            size={48}
                            className="mx-auto mb-5 text-green-400"
                        />
                        <h1 className="text-xl font-semibold text-[var(--cor-texto-principal)]">
                            E-mail confirmado!
                        </h1>
                        <p className="mt-2 text-sm text-[var(--cor-texto-cinza-400)]">
                            {mensagem}
                        </p>

                        <Link
                            to="/login"
                            className="mt-6 inline-block rounded-lg bg-[var(--cor-destaque)] px-6 py-3 font-medium text-[var(--cor-tinta)] transition hover:bg-[#72A8DD]"
                        >
                            Ir para o login
                        </Link>
                    </>
                )}

                {status === "erro" && (
                    <>
                        <XCircle
                            size={48}
                            className="mx-auto mb-5 text-red-400"
                        />
                        <h1 className="text-xl font-semibold text-[var(--cor-texto-principal)]">
                            Não foi possível confirmar
                        </h1>
                        <p className="mt-2 text-sm text-[var(--cor-texto-cinza-400)]">
                            {mensagem}
                        </p>

                        <Link
                            to="/login"
                            className="mt-6 inline-block rounded-lg border border-[var(--cor-borda)] px-6 py-3 font-medium text-[var(--cor-texto-principal)] transition hover:bg-[#1b2230]"
                        >
                            Voltar para o login
                        </Link>
                    </>
                )}
            </div>
        </main>
    );
}

export default VerificarEmail;


import { apiRequest } from "../api";

export interface UsuarioAutenticado {
  id: number;
  username: string;
  email: string;
  nome?: string | null;
  preferenciasConcluidas: boolean;
}

interface RespostaLogin {
  message: string;
  token: string;
  usuario: UsuarioAutenticado;
}

interface DadosCadastro {
  username: string;
  email: string;
  senha: string;
}

interface RespostaCadastro {
  message: string;
  usuario: {
    id: number;
    nome: string;
    username: string;
    email: string;
  };
}

interface RespostaVerificacao {
  message: string;
}

interface RespostaReenvio {
  message: string;
}

export async function loginUsuario(
  login: string,
  senha: string
): Promise<RespostaLogin> {
  return apiRequest<RespostaLogin>("/login", {
    method: "POST",
    token: null,
    body: JSON.stringify({ login, senha }),
  });
}

export async function cadastrarUsuario(
  dados: DadosCadastro
): Promise<RespostaCadastro> {
  return apiRequest<RespostaCadastro>("/usuarios", {
    method: "POST",
    token: null,
    body: JSON.stringify(dados),
  });
}

export async function verificarEmail(
  token: string
): Promise<RespostaVerificacao> {
  return apiRequest<RespostaVerificacao>("/usuarios/verificar-email", {
    method: "POST",
    token: null,
    body: JSON.stringify({ token }),
  });
}

export async function reenviarVerificacao(
  login: string
): Promise<RespostaReenvio> {
  return apiRequest<RespostaReenvio>(
    "/usuarios/reenviar-verificacao",
    {
      method: "POST",
      token: null,
      body: JSON.stringify({ login }),
    }
  );
}

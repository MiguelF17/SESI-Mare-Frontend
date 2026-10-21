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
  id: number;
  username: string;
  email: string;
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
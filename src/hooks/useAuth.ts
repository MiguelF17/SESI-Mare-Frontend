import { useState } from "react";
import {
  loginUsuario,
  cadastrarUsuario,
} from "../services/authService";

interface DadosCadastro {
  username: string;
  email: string;
  senha: string;
  confirmarSenha: string;
}

export function useAuth() {
  const [carregando, setCarregando] = useState(false);

  async function entrar(login: string, senha: string) {
    if (carregando) {
      throw new Error("Aguarde a requisição terminar.");
    }

    setCarregando(true);

    try {
      const dados = await loginUsuario(login, senha);

      localStorage.setItem("token", dados.token);
      localStorage.setItem(
        "usuario",
        JSON.stringify(dados.usuario)
      );

      return dados.usuario;
    } finally {
      setCarregando(false);
    }
  }

  async function cadastrar(dados: DadosCadastro) {
    if (carregando) {
      throw new Error("Aguarde a requisição terminar.");
    }

    if (dados.senha !== dados.confirmarSenha) {
      throw new Error("As senhas não são iguais.");
    }

    const senhaValida =
      dados.senha.length >= 8 &&
      /[A-Z]/.test(dados.senha) &&
      /[a-z]/.test(dados.senha) &&
      /[0-9]/.test(dados.senha) &&
      /[^A-Za-z0-9]/.test(dados.senha);

    if (!senhaValida) {
      throw new Error(
        "A senha não atende a todos os requisitos."
      );
    }

    setCarregando(true);

    try {
      return await cadastrarUsuario({
        username: dados.username.trim(),
        email: dados.email.trim(),
        senha: dados.senha,
      });
    } finally {
      setCarregando(false);
    }
  }

  return {
    entrar,
    cadastrar,
    carregando,
  };
}
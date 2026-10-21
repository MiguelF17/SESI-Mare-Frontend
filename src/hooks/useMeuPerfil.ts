import { useEffect, useState } from "react";
import {
  buscarMeuPerfil,
  type MeuPerfil,
} from "../services/usuarioService";

export function useMeuPerfil() {
  const [usuario, setUsuario] = useState<MeuPerfil | null>(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let ativo = true;

    async function carregarPerfil() {
      try {
        const dados = await buscarMeuPerfil();

        if (ativo) {
          setUsuario(dados);
        }
      } catch (erro) {
        console.error("Erro ao buscar perfil:", erro);
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarPerfil();

    return () => {
      ativo = false;
    };
  }, []);

  return { usuario, carregando, setUsuario };
}
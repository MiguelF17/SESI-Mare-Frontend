import { useEffect, useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { apiRequest } from "./api";

export default function ProtectedRoute() {
  const [autorizado, setAutorizado] = useState<boolean | null>(null);

  useEffect(() => {
    async function verificarToken() {
      const token = localStorage.getItem("token");

      if (!token) {
        setAutorizado(false);
        return;
      }

      try {
        await apiRequest("/usuarios/me");
        setAutorizado(true);
      } catch {
        localStorage.removeItem("token");
        localStorage.removeItem("usuario");
        sessionStorage.removeItem("user");
        sessionStorage.removeItem("token");

        setAutorizado(false);
      }
    }

    verificarToken();
  }, []);

  if (autorizado === null) {
    return null;
  }

  if (!autorizado) {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}

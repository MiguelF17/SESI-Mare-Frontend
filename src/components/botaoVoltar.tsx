import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@phosphor-icons/react";

interface BotaoVoltarProps {
  fallback?: string;
  className?: string;
  label?: string;
}

export default function BotaoVoltar({
  fallback = "/explorar",
  className = "",
  label = "Voltar",
}: BotaoVoltarProps) {
  const navigate = useNavigate();

  function voltar() {
    if (window.history.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate(fallback);
    }
  }

  return (
    <button
      type="button"
      onClick={voltar}
      aria-label={label}
      title={label}
      className={`flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full text-[#d1d5db] transition-colors hover:bg-[#202536] hover:text-white ${className}`}
    >
      <ArrowLeftIcon size={22} weight="bold" />
    </button>
  );
}
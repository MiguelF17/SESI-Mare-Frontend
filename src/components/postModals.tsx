
import { createPortal } from "react-dom";
import { Flag, Trash2 } from "lucide-react";

export type ModalAcao =
  | "excluir"
  | "denunciar"
  | "mensagem"
  | null;

interface PostModalsProps {
  modalAcao: ModalAcao;
  setModalAcao: (modal: ModalAcao) => void;
  motivoDenuncia: string;
  setMotivoDenuncia: (motivo: string) => void;
  mensagemModal: string;
  salvandoAcao: boolean;
  onExcluir: () => void;
  onDenunciar: () => void;
}

export default function PostModals({
  modalAcao,
  setModalAcao,
  motivoDenuncia,
  setMotivoDenuncia,
  mensagemModal,
  salvandoAcao,
  onExcluir,
  onDenunciar,
}: PostModalsProps) {
  if (!modalAcao) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={() => {
        if (!salvandoAcao) setModalAcao(null);
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-md rounded-xl border border-[var(--cor-borda)] bg-[var(--cor-superficie)] p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {modalAcao === "excluir" && (
          <>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <Trash2 size={21} />
            </div>

            <h2 className="text-lg font-semibold text-[var(--cor-texto-principal)]">
              Excluir publicação?
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#9ba6b8]">
              Essa ação não poderá ser desfeita. Deseja excluir esta avaliação?
            </p>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={salvandoAcao}
                onClick={() => setModalAcao(null)}
                className="rounded-lg px-4 py-2 text-sm text-[#b5bbc5] hover:bg-[var(--cor-superficie-elevada)] disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={salvandoAcao}
                onClick={onExcluir}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-[var(--cor-texto-principal)] hover:bg-red-600 disabled:opacity-50"
              >
                {salvandoAcao ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </>
        )}

        {modalAcao === "denunciar" && (
          <>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[var(--cor-destaque)]/10 text-[var(--cor-destaque)]">
              <Flag size={21} />
            </div>

            <h2 className="text-lg font-semibold text-[var(--cor-texto-principal)]">
              Denunciar publicação
            </h2>

            <p className="mt-2 text-sm leading-6 text-[#9ba6b8]">
              Explique por que esta publicação deve ser analisada.
            </p>

            <textarea
              value={motivoDenuncia}
              onChange={(event) => setMotivoDenuncia(event.target.value)}
              maxLength={500}
              rows={4}
              placeholder="Descreva o motivo da denúncia..."
              className="mt-4 w-full resize-none rounded-lg border border-[var(--cor-borda)] bg-[var(--cor-superficie-profunda)] p-3 text-sm text-[var(--cor-texto-principal)] outline-none placeholder:text-[var(--cor-texto-discreto)] focus:border-[var(--cor-destaque)]"
            />

            <p className="mt-1 text-right text-xs text-[var(--cor-texto-discreto)]">
              {motivoDenuncia.length}/500
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                disabled={salvandoAcao}
                onClick={() => setModalAcao(null)}
                className="rounded-lg cursor-pointer px-4 py-2 text-sm text-[#b5bbc5] hover:bg-[var(--cor-superficie-elevada)] disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={salvandoAcao || !motivoDenuncia.trim()}
                onClick={onDenunciar}
                className="rounded-lg cursor-pointer bg-[var(--cor-destaque)] px-4 py-2 text-sm font-medium text-[var(--cor-tinta)] hover:bg-[#72b7f5] disabled:opacity-50"
              >
                {salvandoAcao ? "Enviando..." : "Enviar denúncia"}
              </button>
            </div>
          </>
        )}

        {modalAcao === "mensagem" && (
          <>
            <h2 className="text-lg font-semibold text-[var(--cor-texto-principal)]">Maré</h2>

            <p className="mt-3 text-sm leading-6 text-[#b5bbc5]">
              {mensagemModal}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModalAcao(null)}
                className="rounded-lg bg-[var(--cor-destaque)] px-4 py-2 text-sm font-medium text-[var(--cor-tinta)] hover:bg-[#72b7f5]"
              >
                Entendi
              </button>
            </div>
          </>
        )}
      </div>
    </div>,
    document.body
  );
}

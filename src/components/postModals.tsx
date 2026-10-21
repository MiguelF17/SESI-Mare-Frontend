
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
        className="w-full max-w-md rounded-xl border border-[#354052] bg-[#111420] p-5 shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {modalAcao === "excluir" && (
          <>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-red-500/10 text-red-400">
              <Trash2 size={21} />
            </div>

            <h2 className="text-lg font-semibold text-white">
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
                className="rounded-lg px-4 py-2 text-sm text-[#b5bbc5] hover:bg-[#202737] disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={salvandoAcao}
                onClick={onExcluir}
                className="rounded-lg bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-50"
              >
                {salvandoAcao ? "Excluindo..." : "Excluir"}
              </button>
            </div>
          </>
        )}

        {modalAcao === "denunciar" && (
          <>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#58AAF0]/10 text-[#58AAF0]">
              <Flag size={21} />
            </div>

            <h2 className="text-lg font-semibold text-white">
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
              className="mt-4 w-full resize-none rounded-lg border border-[#354052] bg-[#0C121D] p-3 text-sm text-white outline-none placeholder:text-[#697386] focus:border-[#58AAF0]"
            />

            <p className="mt-1 text-right text-xs text-[#697386]">
              {motivoDenuncia.length}/500
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                disabled={salvandoAcao}
                onClick={() => setModalAcao(null)}
                className="rounded-lg px-4 py-2 text-sm text-[#b5bbc5] hover:bg-[#202737] disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={salvandoAcao || !motivoDenuncia.trim()}
                onClick={onDenunciar}
                className="rounded-lg bg-[#58AAF0] px-4 py-2 text-sm font-medium text-[#080A10] hover:bg-[#72b7f5] disabled:opacity-50"
              >
                {salvandoAcao ? "Enviando..." : "Enviar denúncia"}
              </button>
            </div>
          </>
        )}

        {modalAcao === "mensagem" && (
          <>
            <h2 className="text-lg font-semibold text-white">Maré</h2>

            <p className="mt-3 text-sm leading-6 text-[#b5bbc5]">
              {mensagemModal}
            </p>

            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setModalAcao(null)}
                className="rounded-lg bg-[#58AAF0] px-4 py-2 text-sm font-medium text-[#080A10] hover:bg-[#72b7f5]"
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

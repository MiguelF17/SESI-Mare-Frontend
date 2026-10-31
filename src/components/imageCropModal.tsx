
import { useCallback, useState } from "react";
import Cropper, { type Area, type Point } from "react-easy-crop";

interface ImageCropModalProps {
    imagem: string;
    tipo: "foto" | "capa";
    onCancelar: () => void;
    onConfirmar: (arquivo: File) => Promise<void>;
}

async function gerarImagemRecortada(
    imagem: string,
    area: Area,
    tipo: "foto" | "capa"
): Promise<File> {
    const img = new Image();
    img.src = imagem;

    await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("Não foi possível carregar a imagem."));
    });

    const canvas = document.createElement("canvas");
    const contexto = canvas.getContext("2d");

    if (!contexto) {
        throw new Error("Não foi possível recortar a imagem.");
    }

    canvas.width = area.width;
    canvas.height = area.height;

    contexto.drawImage(
        img,
        area.x,
        area.y,
        area.width,
        area.height,
        0,
        0,
        area.width,
        area.height
    );

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (resultado) => {
                if (resultado) resolve(resultado);
                else reject(new Error("Não foi possível gerar a imagem."));
            },
            "image/jpeg",
            0.92
        );
    });

    return new File(
        [blob],
        tipo === "foto" ? "foto-perfil.jpg" : "capa-perfil.jpg",
        { type: "image/jpeg" }
    );
}

export default function ImageCropModal({
    imagem,
    tipo,
    onCancelar,
    onConfirmar,
}: ImageCropModalProps) {
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1.5);
    const [areaRecortada, setAreaRecortada] = useState<Area | null>(null);
    const [salvando, setSalvando] = useState(false);
    const [erro, setErro] = useState("");

    const aoFinalizarRecorte = useCallback(
        (_area: Area, pixels: Area) => {
            setAreaRecortada(pixels);
        },
        []
    );

    async function confirmarRecorte() {
        if (!areaRecortada || salvando) return;

        try {
            setSalvando(true);
            setErro("");

            const arquivo = await gerarImagemRecortada(
                imagem,
                areaRecortada,
                tipo
            );

            await onConfirmar(arquivo);
        } catch (error) {
            console.error(error);
            setErro("Não foi possível recortar a imagem. Tente novamente.");
        } finally {
            setSalvando(false);
        }
    }

    return (
        <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 px-4">
            <div className="max-h-[calc(100dvh-2rem)] w-full max-w-[600px] overflow-y-auto rounded-xl border border-[var(--cor-borda-discreta)] bg-[#0d121c] p-4 sm:p-5">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-serif text-lg text-[var(--cor-texto-principal)]">
                        Ajustar {tipo === "foto" ? "foto de perfil" : "capa"}
                    </h2>

                    <button
                        type="button"
                        onClick={onCancelar}
                        disabled={salvando}
                        className="cursor-pointer text-[var(--cor-texto-cinza-400)] hover:text-[var(--cor-texto-principal)] disabled:opacity-50"
                    >
                        ✕
                    </button>
                </div>


                <div
                    className={`relative mx-auto w-full overflow-hidden bg-black ${tipo === "foto"
                        ? "aspect-square max-w-[380px] rounded-full border-2 border-[var(--cor-destaque)]"
                        : "aspect-[3/1] max-h-[28vh] rounded-lg sm:max-h-none"
                        }`}
                >
                    <Cropper
                        image={imagem}
                        crop={crop}
                        zoom={zoom}
                        minZoom={1}
                        maxZoom={5}
                        aspect={tipo === "foto" ? 1 : 3}
                        objectFit={tipo === "capa" ? "horizontal-cover" : "cover"}
                        cropShape={tipo === "foto" ? "round" : "rect"}
                        showGrid={false}
                        onCropChange={setCrop}
                        onZoomChange={setZoom}
                        onCropComplete={aoFinalizarRecorte}
                    />
                </div>



                <div className="mt-6 rounded-xl border border-[var(--cor-borda-discreta)] bg-[var(--cor-superficie)] p-4">
                    <div className="mb-3 flex items-center justify-between">
                        <label className="font-serif text-sm text-[var(--cor-texto-cinza-200)]">
                            Zoom da imagem
                        </label>

                        <span className="rounded-md bg-[#1c2a3d] px-2 py-1 text-xs text-[var(--cor-destaque)]">
                            {zoom.toFixed(1)}x
                        </span>
                    </div>

                    <div className="flex items-center gap-3">
                        <span className="text-sm text-gray-500">−</span>

                        <input
                            type="range"
                            min={1}
                            max={5}
                            step={0.1}
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            disabled={salvando}
                            aria-label="Zoom da imagem"
                            className="h-2 min-w-0 flex-1 cursor-pointer appearance-none rounded-full bg-[#30394a] accent-[var(--cor-destaque)] disabled:opacity-50"
                        />

                        <span className="text-sm text-[var(--cor-destaque)]">+</span>
                    </div>

                    <p className="mt-2 text-xs text-gray-500">
                        Arraste a imagem para ajustar o enquadramento.
                    </p>
                </div>


                {erro && (
                    <p className="mt-3 text-sm text-red-400">{erro}</p>
                )}

                <div className="mt-5 flex justify-end gap-3">
                    <button
                        type="button"
                        onClick={onCancelar}
                        disabled={salvando}
                        className="rounded-lg cursor-pointer border border-[var(--cor-borda-discreta)] px-4 py-2 text-sm text-[var(--cor-texto-cinza-300)] hover:border-gray-500 disabled:opacity-50"
                    >
                        Cancelar
                    </button>

                    <button
                        type="button"
                        onClick={confirmarRecorte}
                        disabled={salvando || !areaRecortada}
                        className="rounded-lg cursor-pointer bg-[#5ea3ee] px-4 py-2 text-sm text-[var(--cor-texto-principal)] hover:bg-[#7ab4f2] disabled:opacity-50"
                    >
                        {salvando ? "Salvando..." : "Aplicar recorte"}
                    </button>
                </div>
            </div>
        </div>
    );
}

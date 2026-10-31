import { Link } from "react-router-dom";
import { ArrowLeftIcon, FileTextIcon, ShieldCheckIcon } from "@phosphor-icons/react";
import Navbar from "../components/navbar";
import Footer from "../components/footer";

type DocumentoLegalProps = {
  tipo: "termos" | "privacidade";
};

const documentos = {
  termos: {
    titulo: "Termos de Uso",
    resumo: "Regras básicas para usar a Maré e participar da comunidade.",
    icone: ShieldCheckIcon,
    secoes: [
      ["1. Sobre a Maré", "A Maré é uma plataforma demonstrativa para descobrir músicas, publicar avaliações e conversar com outras pessoas sobre música."],
      ["2. Sua conta", "Mantenha seus dados de acesso em segurança e forneça informações corretas ao criar sua conta. Você é responsável pelas atividades realizadas nela."],
      ["3. Publicações e convivência", "Publique opiniões próprias e trate as outras pessoas com respeito. Não use a plataforma para publicar conteúdo ilegal, abusivo ou que viole direitos de terceiros."],
      ["4. Disponibilidade", "Recursos e conteúdos podem mudar enquanto a plataforma evolui. Podemos limitar ou remover conteúdo que descumpra estas regras."],
      ["5. Versão demonstrativa", "Este texto é fictício e serve apenas como conteúdo inicial de demonstração. Não constitui aconselhamento jurídico nem um documento legal final."],
    ],
  },
  privacidade: {
    titulo: "Política de Privacidade",
    resumo: "Um resumo demonstrativo sobre os dados usados para oferecer os recursos da Maré.",
    icone: FileTextIcon,
    secoes: [
      ["1. Dados da conta", "A Maré pode usar informações de cadastro, como nome, nome de usuário e e-mail, para identificar sua conta e oferecer os recursos do serviço."],
      ["2. Atividade na plataforma", "Avaliações, publicações, comentários, curtidas e informações de perfil podem ser exibidos para outras pessoas conforme os recursos da plataforma."],
      ["3. Preferências", "Preferências de notificações e interesses musicais podem ser usadas para personalizar a experiência. As notificações podem ser controladas nas configurações da conta."],
      ["4. Controle e segurança", "Use as configurações para revisar suas informações e proteger seu acesso. A plataforma deve adotar medidas razoáveis para proteger os dados tratados."],
      ["5. Versão demonstrativa", "Este texto é fictício e serve apenas como conteúdo inicial de demonstração. Não descreve necessariamente todas as práticas técnicas nem substitui uma política revisada para publicação."],
    ],
  },
} as const;

export default function Legal({ tipo }: DocumentoLegalProps) {
  const documento = documentos[tipo];
  const Icone = documento.icone;

  return (
    <div className="min-h-screen bg-[var(--cor-fundo)] text-[var(--cor-texto-principal)]">
      <Navbar />
      <main className="mx-auto max-w-4xl px-5 pb-16 pt-28 sm:px-8 sm:pt-36">
        <Link to="/" className="mb-8 inline-flex items-center gap-2 text-sm text-[var(--cor-texto-discreto)] transition hover:text-[var(--cor-destaque)]">
          <ArrowLeftIcon size={16} /> Voltar ao início
        </Link>

        <header className="mb-8 rounded-2xl border border-[var(--cor-borda)] bg-[var(--cor-superficie)] p-6 sm:p-8">
          <Icone size={28} className="mb-4 text-[var(--cor-destaque)]" />
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-[var(--cor-destaque)]">Maré · Documento demonstrativo</p>
          <h1 className="text-3xl font-bold sm:text-4xl">{documento.titulo}</h1>
          <p className="mt-3 max-w-2xl leading-7 text-[var(--cor-texto-discreto)]">{documento.resumo}</p>
          <p className="mt-5 rounded-lg border border-[var(--cor-borda)] bg-[var(--cor-fundo)]/70 px-4 py-3 text-sm leading-6 text-[var(--cor-texto-secundario)]">
            Este conteúdo é fictício e foi incluído como texto inicial para a interface. Ele precisa ser revisado antes de ser usado como documento oficial.
          </p>
        </header>

        <div className="space-y-4">
          {documento.secoes.map(([titulo, texto]) => (
            <section key={titulo} className="rounded-xl border border-[var(--cor-borda)] bg-[var(--cor-superficie)] p-5 sm:p-6">
              <h2 className="mb-2 text-lg font-semibold">{titulo}</h2>
              <p className="leading-7 text-[var(--cor-texto-discreto)]">{texto}</p>
            </section>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}

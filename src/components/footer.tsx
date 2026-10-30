
export default function Footer() {
    return (

        <footer className="bg-[var(--cor-fundo)] px-4 py-12 text-[var(--cor-texto-principal)] sm:px-8 sm:py-16 lg:px-12 lg:py-24">

            <div className="flex flex-col items-center justify-center gap-10 text-center sm:flex-row sm:items-start sm:gap-12 lg:gap-20">

                {/* Logo + nome */}
                <div>
                    <h2 className="text-3xl font-bold">
                        Maré
                    </h2>

                    <p className="text-[var(--cor-texto-cinza-400)] mt-3 max-w-sm">
                        Rede social de músicas, facilitando o compartilhamento, a comunicação e a interação entre os usuários.
                    </p>
                </div>

                {/* Links rápidos */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">
                        Navegação
                    </h3>

                    <div className="flex flex-col gap-2 text-[var(--cor-texto-cinza-300)]">
                        <a href="" className="hover:text-[var(--cor-texto-principal)] transition">
                            Início
                        </a>

                        <a href="" className="hover:text-[var(--cor-texto-principal)] transition">
                            Sobre
                        </a>

                        <a href="" className="hover:text-[var(--cor-texto-principal)] transition">
                            Contato
                        </a>
                    </div>
                </div>

                {/* Contato */}
                <div>
                    <h3 className="text-xl font-semibold mb-4">
                        Contato
                    </h3>

                    <div className="flex flex-col gap-2 text-[var(--cor-texto-cinza-300)]">
                        <p>contato@mare.com</p>
                        <p>(11) 99999-9999</p>
                        <p>São Paulo - SP</p>
                    </div>
                </div>

            </div>

            {/* linha */}
            <div className="border-t border-gray-700 mt-10 pt-6 text-center text-[var(--cor-texto-cinza-400)]">
                © 2026 Maré — Todos os direitos reservados
            </div>

        </footer>
    )
}

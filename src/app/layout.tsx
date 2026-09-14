import './globals.css'
import Link from 'next/link'
import BackgroundSlide from './BackgroundSlide'

export const metadata = {
  title: 'ROBERT ENGENHARIA - Gestão de Manutenção',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="pt-BR">
      <head>
        {/* Essa linha é a "mágica" que força qualquer celular a ativar o layout responsivo */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
      </head>
      
      <body>
        <BackgroundSlide />

        {/* Usando o método seguro do React para injetar CSS Global */}
        <style dangerouslySetInnerHTML={{ __html: `
          * {
            box-sizing: border-box;
          }

          html, body {
            margin: 0;
            padding: 0;
            width: 100%;
            min-height: 100%;
            overflow-x: hidden;
          }

          /* ESTRUTURA PRINCIPAL */
          .Mastermec-app {
            display: flex;
            width: 100%;
            min-height: 100vh;
            position: relative;
            z-index: 1;
          }

          /* MENU LATERAL - DESKTOP (PC) */
          .Mastermec-sidebar {
            width: 260px;
            flex-shrink: 0;
            background: rgba(17, 14, 19, 0.35);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-right: 1px solid rgba(255,255,255,0.08);
            padding: 24px 20px;
            display: flex;
            flex-direction: column;
            gap: 24px;
          }

          .Mastermec-brand {
            background: rgba(255, 176, 0, 0.1);
            padding: 16px;
            border-radius: 14px;
            border: 1px solid rgba(255, 176, 0, 0.2);
          }

          .Mastermec-brand h2 {
            color: #ffb000;
            font-size: 18px;
            margin: 0 0 4px;
            font-weight: 700;
          }

          .Mastermec-brand p {
            color: #9ca3af;
            font-size: 11px;
            text-transform: uppercase;
            margin: 0;
          }

          .Mastermec-nav {
            display: flex;
            flex-direction: column;
            gap: 8px;
          }

          .Mastermec-nav a {
            color: #e5e7eb;
            text-decoration: none;
            padding: 12px 16px;
            border-radius: 10px;
            background: rgba(255,255,255,0.05);
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            font-size: 14px;
            transition: all 0.2s;
          }

          .Mastermec-nav a:hover {
            background: rgba(255,255,255,0.12);
          }

          .Mastermec-nav a .icon {
            font-size: 18px;
          }

          /* ÁREA DE CONTEÚDO (Onde ficam as tabelas) */
          .Mastermec-main {
            flex: 1;
            padding: 30px;
            overflow-y: auto;
            overflow-x: hidden;
          }

          /* ======== O SEGREDO DO CELULAR ======== */
          @media (max-width: 768px) {
            .Mastermec-app {
              display: block; /* Desliga o modo lado a lado */
              padding-bottom: 75px; /* Libera espaço no fundo para o menu não tampar o conteúdo */
            }

            .Mastermec-main {
              padding: 15px; /* Margens menores no celular */
              width: 100%;
            }

            /* Transforma a barra lateral em uma Barra Inferior (App) */
            .Mastermec-sidebar {
              position: fixed;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 70px;
              flex-direction: row;
              padding: 0;
              gap: 0;
              background: rgba(17, 14, 19, 0.95);
              border-top: 1px solid rgba(255,255,255,0.1);
              border-right: none;
              z-index: 9999; /* Fica sempre por cima */
            }

            .Mastermec-brand {
              display: none; /* Esconde a logo no celular para caberem os botões */
            }

            .Mastermec-nav {
              flex-direction: row;
              width: 100%;
              justify-content: space-around;
              align-items: center;
              padding: 0 5px;
            }

            .Mastermec-nav a {
              flex-direction: column; /* Coloca o texto debaixo do ícone */
              padding: 8px 0;
              gap: 4px;
              background: transparent;
              font-size: 10px;
              text-align: center;
              border-radius: 0;
              flex: 1;
            }

            .Mastermec-nav a .icon {
              font-size: 20px; /* Ícone maior no celular para tocar com o dedo */
            }
          }
        ` }} />

        <div className="Mastermec-app">
          <aside className="Mastermec-sidebar">
            
            <div className="Mastermec-brand">
              <h2>⚙️ Robert Eng.</h2>
              <p>Gestão de Frota</p>
            </div>

            <nav className="Mastermec-nav">
              <Link href="/">
                <span className="icon">📊</span>
                <span className="text">Visão Geral</span>
              </Link>

              <Link href="/maquinas">
                <span className="icon">🚜</span>
                <span className="text">Equipamentos</span>
              </Link>

              <Link href="/manutencao">
                <span className="icon">🔧</span>
                <span className="text">Manutenção</span>
              </Link>

              <Link href="/mecanicos">
                <span className="icon">👨‍🔧</span>
                <span className="text">Equipe</span>
              </Link>

              <Link href="/relatorios">
                <span className="icon">📈</span>
                <span className="text">Relatórios</span>
              </Link>
            </nav>
          </aside>

          <main className="Mastermec-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
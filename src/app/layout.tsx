
import "./globals.css";
import Link from "next/link";
import BackgroundSlide from "./BackgroundSlide";

export const metadata = {
  title: "ROBERT ENGENHARIA - Gestão de Manutenção",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1"
        />
      </head>

      <body>
        <BackgroundSlide />

        <style dangerouslySetInnerHTML={{ __html: `
          *,
          *::before,
          *::after {
            box-sizing: border-box;
          }

          html,
          body {
            margin: 0;
            padding: 0;
            width: 100%;
            min-height: 100%;
            overflow-x: hidden;
          }

          .Mastermec-app {
            display: flex;
            width: 100%;
            min-height: 100vh;
            position: relative;
            z-index: 1;
          }

          .Mastermec-sidebar {
            width: 260px;
            flex: 0 0 260px;
            background: rgba(17, 14, 19, 0.35);
            backdrop-filter: blur(12px);
            -webkit-backdrop-filter: blur(12px);
            border-right: 1px solid rgba(255, 255, 255, 0.08);
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
            background: rgba(255, 255, 255, 0.05);
            display: flex;
            align-items: center;
            gap: 12px;
            font-weight: 500;
            font-size: 14px;
            transition: background 0.2s;
          }

          .Mastermec-nav a:hover {
            background: rgba(255, 255, 255, 0.12);
          }

          .Mastermec-nav a:focus-visible {
            outline: 2px solid #ffb000;
            outline-offset: 3px;
          }

          .Mastermec-nav a .icon {
            font-size: 20px;
          }

          .Mastermec-main {
            flex: 1;
            min-width: 0;
            padding: 30px;
            overflow-x: hidden;
          }

          @media (max-width: 768px) {
            .Mastermec-app {
              display: block;
              min-height: 100vh;
              padding-bottom: 76px;
            }

            .Mastermec-main {
              width: 100%;
              min-width: 0;
              padding: 15px;
            }

            .Mastermec-sidebar {
              position: fixed;
              bottom: 0;
              left: 0;
              width: 100%;
              height: 70px;
              padding: 0;
              gap: 0;
              flex-direction: row;
              background: rgba(17, 14, 19, 0.97);
              border-top: 1px solid rgba(255, 255, 255, 0.1);
              border-right: none;
              z-index: 9999;
            }

            .Mastermec-brand {
              display: none;
            }

            .Mastermec-nav {
              width: 100%;
              flex-direction: row;
              justify-content: space-around;
              align-items: stretch;
              gap: 0;
              padding: 0 8px;
            }

            .Mastermec-nav a {
              flex: 1;
              min-width: 0;
              flex-direction: column;
              justify-content: center;
              padding: 7px 4px;
              gap: 3px;
              background: transparent;
              font-size: 12px;
              text-align: center;
              border-radius: 8px;
            }

            .Mastermec-nav a .icon {
              font-size: 21px;
              line-height: 1.2;
            }
          }
        ` }} />

        <div className="Mastermec-app">
          <aside className="Mastermec-sidebar">
            <div className="Mastermec-brand">
              <h2>⚙️ Robert Eng.</h2>
              <p>Gestão de Manutenção</p>
            </div>

            <nav className="Mastermec-nav" aria-label="Menu principal">
              <Link href="/manutencao">
                <span className="icon" aria-hidden="true">🔧</span>
                <span>Serviços</span>
              </Link>

              <Link href="/relatorios">
                <span className="icon" aria-hidden="true">📄</span>
                <span>Relatórios</span>
              </Link>
            </nav>
          </aside>

          <main className="Mastermec-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}

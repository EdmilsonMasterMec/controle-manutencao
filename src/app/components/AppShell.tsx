"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

import {
  LayoutDashboard,
  Truck,
  Wrench,
  Users,
  Menu,
  X,
  ChevronLeft,
  Settings,
  Activity,
} from "lucide-react";

type MenuItem = {
  nome: string;
  descricao: string;
  href: string;
  icone: React.ElementType;
};

const menus: MenuItem[] = [
  {
    nome: "Dashboard",
    descricao: "Visão geral",
    href: "/",
    icone: LayoutDashboard,
  },
  {
    nome: "Equipamentos",
    descricao: "Máquinas cadastradas",
    href: "/maquinas",
    icone: Truck,
  },
  {
    nome: "Manutenção",
    descricao: "Serviços e histórico",
    href: "/manutencao",
    icone: Wrench,
  },
  {
    nome: "Mecânicos",
    descricao: "Equipe técnica",
    href: "/mecanicos",
    icone: Users,
  },
];

export default function AppShell({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  const [menuAberto, setMenuAberto] = useState(false);
  const [menuRecolhido, setMenuRecolhido] = useState(false);

  function fecharMenuMobile() {
    setMenuAberto(false);
  }

  function menuAtivo(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  return (
    <div className="app-shell">

      {/* FUNDO ESCURO DO MENU NO CELULAR */}
      {menuAberto && (
        <button
          className="sidebar-overlay"
          onClick={fecharMenuMobile}
          aria-label="Fechar menu"
        />
      )}

      {/* BOTÃO MENU MOBILE */}
      <button
        className="mobile-menu-button"
        onClick={() => setMenuAberto(true)}
        aria-label="Abrir menu"
      >
        <Menu size={24} />
      </button>

      {/* SIDEBAR */}
      <aside
        className={`
          app-sidebar
          ${menuRecolhido ? "sidebar-recolhida" : ""}
          ${menuAberto ? "sidebar-mobile-aberta" : ""}
        `}
      >

        {/* CABEÇALHO */}
        <div className="sidebar-header">

          <Link
            href="/"
            className="brand"
            onClick={fecharMenuMobile}
          >
            <div className="brand-icon">
              <Activity size={25} />
            </div>

            {!menuRecolhido && (
              <div className="brand-text">
                <strong>
                  Master<span>Mec</span>
                </strong>

                <small>
                  Gestão de Manutenção
                </small>
              </div>
            )}
          </Link>

          {/* FECHAR MOBILE */}
          <button
            className="mobile-close-button"
            onClick={fecharMenuMobile}
            aria-label="Fechar menu"
          >
            <X size={22} />
          </button>

        </div>

        {/* MENU */}
        <nav className="app-navigation">

          <div className="navigation-title">
            {!menuRecolhido && "MENU PRINCIPAL"}
          </div>

          {menus.map((menu) => {
            const Icone = menu.icone;
            const ativo = menuAtivo(menu.href);

            return (
              <Link
                key={menu.href}
                href={menu.href}
                onClick={fecharMenuMobile}
                className={`navigation-item ${
                  ativo ? "navigation-item-ativo" : ""
                }`}
                title={menuRecolhido ? menu.nome : undefined}
              >
                <span className="navigation-icon">
                  <Icone size={21} />
                </span>

                {!menuRecolhido && (
                  <span className="navigation-text">
                    <strong>{menu.nome}</strong>
                    <small>{menu.descricao}</small>
                  </span>
                )}
              </Link>
            );
          })}

        </nav>

        {/* RODAPÉ */}
        <div className="sidebar-footer">

          <div className="sidebar-status">
            <span className="status-dot" />

            {!menuRecolhido && (
              <span>
                Sistema operacional
              </span>
            )}
          </div>

          {!menuRecolhido && (
            <div className="sidebar-version">
              MasterMec • Gestão de Frota
            </div>
          )}

        </div>

        {/* RECOLHER MENU DESKTOP */}
        <button
          className="sidebar-collapse-button"
          onClick={() =>
            setMenuRecolhido(!menuRecolhido)
          }
          title={
            menuRecolhido
              ? "Expandir menu"
              : "Recolher menu"
          }
        >
          <ChevronLeft
            size={18}
            className={
              menuRecolhido
                ? "icone-girado"
                : ""
            }
          />
        </button>

      </aside>

      {/* ÁREA PRINCIPAL */}
      <div
        className={`app-main ${
          menuRecolhido
            ? "app-main-recolhido"
            : ""
        }`}
      >

        {/* TOPO */}
        <header className="app-topbar">

          <div className="topbar-mobile-brand">
            <strong>
              Master<span>Mec</span>
            </strong>
          </div>

          <div className="topbar-info">
            <span className="topbar-title">
              Gestão de Manutenção
            </span>

            <span className="topbar-separator">
              /
            </span>

            <span className="topbar-page">
              {pathname === "/"
                ? "Dashboard"
                : pathname.includes("maquinas")
                ? "Equipamentos"
                : pathname.includes("manutencao")
                ? "Manutenção"
                : pathname.includes("mecanicos")
                ? "Mecânicos"
                : ""}
            </span>
          </div>

          <div className="topbar-right">
            <div className="topbar-system">
              <span className="status-dot" />
              Online
            </div>
          </div>

        </header>

        {/* CONTEÚDO */}
        <main className="app-content">
          {children}
        </main>

      </div>

    </div>
  );
}
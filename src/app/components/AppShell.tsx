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
  Activity,
  Settings2,
} from "lucide-react";

type MenuItem = {
  nome: string;
  descricao: string;
  href: string;
  icone: React.ElementType;
  classe: string;
};

const menus: MenuItem[] = [
  {
    nome: "Dashboard",
    descricao: "Visão geral da operação",
    href: "/",
    icone: LayoutDashboard,
    classe: "menu-dashboard",
  },
  {
    nome: "Equipamentos",
    descricao: "Máquinas e veículos",
    href: "/maquinas",
    icone: Truck,
    classe: "menu-equipamentos",
  },
  {
    nome: "Manutenção",
    descricao: "Serviços e histórico",
    href: "/manutencao",
    icone: Wrench,
    classe: "menu-manutencao",
  },
  {
    nome: "Mecânicos",
    descricao: "Equipe técnica",
    href: "/mecanicos",
    icone: Users,
    classe: "menu-mecanicos",
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

  function nomePagina() {
    if (pathname === "/") return "Dashboard";
    if (pathname.includes("maquinas")) return "Equipamentos";
    if (pathname.includes("manutencao")) return "Manutenção";
    if (pathname.includes("mecanicos")) return "Mecânicos";

    return "Gestão de Manutenção";
  }

  return (
    <div
      className={`app-shell ${
        menuRecolhido ? "shell-recolhido" : ""
      }`}
    >
      {/* ================================================= */}
      {/* FUNDO DO MENU MOBILE */}
      {/* ================================================= */}

      {menuAberto && (
        <button
          className="sidebar-overlay"
          onClick={fecharMenuMobile}
          aria-label="Fechar menu"
        />
      )}

      {/* ================================================= */}
      {/* BOTÃO MOBILE */}
      {/* ================================================= */}

      <button
        className="mobile-menu-button"
        onClick={() => setMenuAberto(true)}
        aria-label="Abrir menu"
      >
        <Menu size={25} />
      </button>

      {/* ================================================= */}
      {/* SIDEBAR */}
      {/* ================================================= */}

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
              <Activity size={25} strokeWidth={2.4} />
            </div>

            {!menuRecolhido && (
              <div className="brand-text">
                <strong>
                  Master<span>Mec</span>
                </strong>

                <small>
                  GESTÃO DE MANUTENÇÃO
                </small>
              </div>
            )}
          </Link>

          <button
            className="mobile-close-button"
            onClick={fecharMenuMobile}
            aria-label="Fechar menu"
          >
            <X size={21} />
          </button>
        </div>

        {/* ================================================= */}
        {/* STATUS DO SISTEMA */}
        {/* ================================================= */}

        {!menuRecolhido && (
          <div className="sidebar-online">
            <span className="online-pulse">
              <span />
            </span>

            <div>
              <strong>Sistema online</strong>
              <small>Operação normal</small>
            </div>
          </div>
        )}

        {/* ================================================= */}
        {/* MENU */}
        {/* ================================================= */}

        <nav className="app-navigation">

          {!menuRecolhido && (
            <div className="navigation-title">
              MENU PRINCIPAL
            </div>
          )}

          <div className="navigation-list">

            {menus.map((menu) => {
              const Icone = menu.icone;
              const ativo = menuAtivo(menu.href);

              return (
                <Link
                  key={menu.href}
                  href={menu.href}
                  onClick={fecharMenuMobile}
                  className={`
                    navigation-item
                    ${menu.classe}
                    ${ativo ? "navigation-item-ativo" : ""}
                  `}
                  title={
                    menuRecolhido
                      ? menu.nome
                      : undefined
                  }
                >
                  <span className="navigation-icon">
                    <Icone
                      size={22}
                      strokeWidth={2.2}
                    />
                  </span>

                  {!menuRecolhido && (
                    <span className="navigation-text">
                      <strong>{menu.nome}</strong>
                      <small>{menu.descricao}</small>
                    </span>
                  )}

                  {!menuRecolhido && ativo && (
                    <span className="navigation-active-dot" />
                  )}
                </Link>
              );
            })}

          </div>
        </nav>

        {/* ================================================= */}
        {/* RODAPÉ */}
        {/* ================================================= */}

        <div className="sidebar-footer">

          {!menuRecolhido && (
            <div className="sidebar-footer-card">
              <div className="sidebar-footer-icon">
                <Settings2 size={17} />
              </div>

              <div>
                <strong>MasterMec</strong>
                <span>Gestão de Frota</span>
              </div>
            </div>
          )}

          <div className="sidebar-version">
            {!menuRecolhido
              ? "Sistema de manutenção • v1.0"
              : "v1"}
          </div>
        </div>

        {/* ================================================= */}
        {/* RECOLHER */}
        {/* ================================================= */}

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

      {/* ================================================= */}
      {/* ÁREA PRINCIPAL */}
      {/* ================================================= */}

      <div
        className={`
          app-main
          ${menuRecolhido ? "app-main-recolhido" : ""}
        `}
      >
        {/* ================================================= */}
        {/* TOPBAR */}
        {/* ================================================= */}

        <header className="app-topbar">

          <div className="topbar-left">

            <div className="topbar-mobile-brand">
              <strong>
                Master<span>Mec</span>
              </strong>
            </div>

            <div className="topbar-breadcrumb">

              <span className="topbar-title">
                MasterMec
              </span>

              <span className="topbar-separator">
                /
              </span>

              <strong className="topbar-page">
                {nomePagina()}
              </strong>

            </div>
          </div>

          <div className="topbar-right">

            <div className="topbar-date">
              <Activity size={15} />
              <span>Gestão de Manutenção</span>
            </div>

            <div className="topbar-system">
              <span className="status-dot" />
              <span>Online</span>
            </div>

          </div>
        </header>

        {/* ================================================= */}
        {/* CONTEÚDO */}
        {/* ================================================= */}

        <main className="app-content">
          <div className="app-page">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}
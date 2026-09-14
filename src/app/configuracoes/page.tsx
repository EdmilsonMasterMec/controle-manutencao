"use client";

import Link from "next/link";

export default function Configuracoes() {
  return (
    <main className="Robert-app">
      <section className="page-container">
        <Link href="/" className="voltar">
          ← Voltar ao Dashboard
        </Link>

        <div className="page-header">
          <div>
            <h1>⚙️ Configurações</h1>
            <p>Configurações do sistema Robert Engenharia</p>
          </div>
        </div>

        <div className="cards-grid">
          <div className="card-premium">
            <h3>🏢 Empresa</h3>
            <p>Informações da Robert Engenharia.</p>
          </div>

          <div className="card-premium">
            <h3>👤 Usuários</h3>
            <p>Gerenciamento de usuários do sistema.</p>
          </div>

          <div className="card-premium">
            <h3>🔔 Notificações</h3>
            <p>Configure alertas e avisos do sistema.</p>
          </div>
        </div>
      </section>
    </main>
  );
}
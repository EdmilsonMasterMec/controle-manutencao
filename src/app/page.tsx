"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Truck,
  Tractor,
  CheckCircle2,
  Wrench,
  AlertCircle,
  ArrowRight,
  Activity,
  Users,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Equipamento = {
  id: number;
  nome: string;
  modelo: string;
  fabricante: string;
  horimetro: string;
  status: string;
};

type Manutencao = {
  id: number;
  equipamento_id: number | null;
  maquina: string;
  tipo: string;
  mecanico: string;
  data: string;
  horimetro: string;
  prioridade: string;
  status: string;
  servicos: any;
};

function ehCaminhao(equipamento: Equipamento) {
  const texto = `
    ${equipamento.nome}
    ${equipamento.modelo}
    ${equipamento.fabricante}
  `.toLowerCase();

  const palavrasCaminhao = [
    "caminhao",
    "caminhão",
    "truck",
    "scania",
    "volvo fh",
    "volvo fm",
    "mercedes",
    "actros",
    "iveco",
    "daf",
    "constellation",
    "cargo",
    "atego",
    "axor",
  ];

  return palavrasCaminhao.some((palavra) =>
    texto.includes(palavra)
  );
}

export default function DashboardPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

    const [
      { data: equipamentosData },
      { data: manutencoesData },
    ] = await Promise.all([
      supabase
        .from("equipamentos")
        .select("*")
        .order("id", { ascending: false }),

      supabase
        .from("manutencoes")
        .select("*")
        .order("id", { ascending: false }),
    ]);

    setEquipamentos(equipamentosData || []);
    setManutencoes(manutencoesData || []);

    setCarregando(false);
  }

  const totalEquipamentos = equipamentos.length;

  const equipamentosOperando = equipamentos.filter(
    (equipamento) =>
      equipamento.status?.toLowerCase().trim() ===
      "operando"
  ).length;

  const equipamentosManutencao = equipamentos.filter(
    (equipamento) =>
      equipamento.status?.toLowerCase().trim() ===
      "em manutenção"
  ).length;

  const manutencoesAbertas = manutencoes.filter(
    (manutencao) =>
      manutencao.status?.toLowerCase().trim() !==
      "concluída"
  ).length;

  const cards = [
    {
      titulo: "Total de equipamentos",
      valor: totalEquipamentos,
      descricao: "Todos os equipamentos cadastrados",
      href: "/maquinas?filtro=total",
      icone: Truck,
      classe: "card-blue",
    },
    {
      titulo: "Operando",
      valor: equipamentosOperando,
      descricao: "Equipamentos em operação",
      href: "/maquinas?filtro=operando",
      icone: CheckCircle2,
      classe: "card-green",
    },
    {
      titulo: "Em manutenção",
      valor: equipamentosManutencao,
      descricao: "Equipamentos em manutenção",
      href: "/maquinas?filtro=manutencao",
      icone: Wrench,
      classe: "card-yellow",
    },
    {
      titulo: "Manutenções abertas",
      valor: manutencoesAbertas,
      descricao: "Serviços ainda não concluídos",
      href: "/maquinas?filtro=abertas",
      icone: AlertCircle,
      classe: "card-red",
    },
  ];

  return (
    <main className="dashboard-page">

      {/* ================================================= */}
      {/* HERO */}
      {/* ================================================= */}

      <section className="dashboard-hero">

        <div className="hero-label">
          <Activity size={20} />
          <span>SISTEMA DE GESTÃO</span>
        </div>

        <h1>Controle de Manutenção</h1>

        <p>
          Acompanhe sua frota, manutenção e equipe em
          um único lugar.
        </p>

        <Link
          href="/maquinas"
          className="hero-equipment-link"
        >
          <Truck size={28} />

          <span>Equipamentos</span>

          <ArrowRight size={28} />
        </Link>

      </section>

      {/* ================================================= */}
      {/* CARDS */}
      {/* ================================================= */}

      <section className="dashboard-cards">

        {cards.map((card) => {
          const Icone = card.icone;

          return (
            <Link
              key={card.titulo}
              href={card.href}
              className={`dashboard-card-link ${card.classe}`}
            >

              <div className="dashboard-card">

                <div className="dashboard-card-icon">
                  <Icone
                    size={34}
                    strokeWidth={2.2}
                  />
                </div>

                <div className="dashboard-card-content">

                  <span className="dashboard-card-title">
                    {card.titulo}
                  </span>

                  <strong className="dashboard-card-value">
                    {carregando ? "..." : card.valor}
                  </strong>

                  <span className="dashboard-card-description">
                    {card.descricao}
                  </span>

                </div>

                <ArrowRight
                  className="dashboard-card-arrow"
                  size={24}
                />

              </div>

            </Link>
          );
        })}

      </section>

      {/* ================================================= */}
      {/* EQUIPAMENTOS */}
      {/* ================================================= */}

      <section className="dashboard-section">

        <div className="section-header">

          <div>
            <h2>Equipamentos</h2>
            <p>Situação atual da frota</p>
          </div>

          <Link
            href="/maquinas"
            className="see-all-link"
          >
            Ver todos
            <ArrowRight size={22} />
          </Link>

        </div>

        <div className="equipment-list">

          {carregando ? (
            <div className="empty-dashboard">
              Carregando equipamentos...
            </div>

          ) : equipamentos.length === 0 ? (
            <div className="empty-dashboard">
              Nenhum equipamento cadastrado.
            </div>

          ) : (

            equipamentos
              .slice(0, 6)
              .map((equipamento) => {

                const caminhão =
                  ehCaminhao(equipamento);

                const IconeEquipamento =
                  caminhão ? Truck : Tractor;

                return (
                  <Link
                    key={equipamento.id}
                    href={`/maquinas?id=${equipamento.id}`}
                    className="equipment-dashboard-item"
                  >

                    <div className="equipment-icon">
                      <IconeEquipamento
                        size={28}
                        strokeWidth={2.1}
                      />
                    </div>

                    <div className="equipment-info">

                      <strong>
                        {equipamento.nome}
                      </strong>

                      <span>
                        {equipamento.fabricante}{" "}
                        {equipamento.modelo}
                      </span>

                    </div>

                    <div className="equipment-status">

                      <span
                        className={`status-dot ${
                          equipamento.status
                            ?.toLowerCase()
                            .includes("manutenção")
                            ? "status-yellow"
                            : equipamento.status
                                ?.toLowerCase()
                                .includes("parada")
                            ? "status-red"
                            : "status-green"
                        }`}
                      />

                      <span>
                        {equipamento.status ||
                          "Sem status"}
                      </span>

                    </div>

                    <ArrowRight
                      size={22}
                      className="equipment-arrow"
                    />

                  </Link>
                );
              })
          )}

        </div>

      </section>

      {/* ================================================= */}
      {/* ACESSO RÁPIDO */}
      {/* ================================================= */}

      <section className="dashboard-quick-access">

        <Link
          href="/maquinas"
          className="quick-card"
        >

          <Truck size={30} />

          <div>
            <strong>Equipamentos</strong>

            <span>
              Cadastrar e consultar equipamentos
            </span>
          </div>

          <ArrowRight size={22} />

        </Link>

        <Link
          href="/manutencao"
          className="quick-card"
        >

          <Wrench size={30} />

          <div>
            <strong>Manutenção</strong>

            <span>
              Registrar e acompanhar serviços
            </span>
          </div>

          <ArrowRight size={22} />

        </Link>

        <Link
          href="/mecanicos"
          className="quick-card"
        >

          <Users size={30} />

          <div>
            <strong>Mecânicos</strong>

            <span>
              Gerenciar equipe técnica
            </span>
          </div>

          <ArrowRight size={22} />

        </Link>

      </section>

    </main>
  );
}
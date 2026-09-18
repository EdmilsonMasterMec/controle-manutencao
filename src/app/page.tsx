"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Truck,
  Wrench,
  Users,
  Activity,
  ArrowRight,
  CircleAlert,
  CheckCircle2,
  Clock3,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Equipamento = {
  id: number;
  nome: string;
  modelo?: string;
  fabricante?: string;
  horimetro?: string;
  status?: string;
};

type Manutencao = {
  id: number;
  equipamento_id?: number | null;
  status?: string;
  tipo?: string;
  data?: string;
};

export default function Home() {
  const [equipamentos, setEquipamentos] =
    useState<Equipamento[]>([]);

  const [manutencoes, setManutencoes] =
    useState<Manutencao[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    setCarregando(true);

    const [equipamentosResult, manutencoesResult] =
      await Promise.all([
        supabase
          .from("equipamentos")
          .select(
            "id,nome,modelo,fabricante,horimetro,status"
          )
          .order("id", {
            ascending: true,
          }),

        supabase
          .from("manutencoes")
          .select(
            "id,equipamento_id,status,tipo,data"
          )
          .order("id", {
            ascending: false,
          }),
      ]);

    if (!equipamentosResult.error) {
      setEquipamentos(
        (equipamentosResult.data ||
          []) as Equipamento[]
      );
    }

    if (!manutencoesResult.error) {
      setManutencoes(
        (manutencoesResult.data ||
          []) as Manutencao[]
      );
    }

    setCarregando(false);
  }

  const totalMaquinas =
    equipamentos.length;

  const maquinasOperando =
    equipamentos.filter(
      (item) =>
        item.status === "Operando"
    ).length;

  const maquinasManutencao =
    equipamentos.filter(
      (item) =>
        item.status ===
        "Em Manutenção"
    ).length;

  const maquinasParadas =
    equipamentos.filter(
      (item) =>
        item.status === "Parada"
    ).length;

  const manutencoesAbertas =
    manutencoes.filter(
      (item) =>
        item.status !== "Concluída"
    ).length;

  function statusClasse(status?: string) {
    if (status === "Operando") {
      return "dashboard-status verde";
    }

    if (status === "Em Manutenção") {
      return "dashboard-status amarelo";
    }

    return "dashboard-status vermelho";
  }

  return (
    <div className="dashboard-page">

      {/* CABEÇALHO */}
      <div className="dashboard-heading">

        <div>
          <div className="dashboard-overline">
            <Activity size={15} />
            SISTEMA DE GESTÃO
          </div>

          <h1>
            Controle de Manutenção
          </h1>

          <p>
            Acompanhe sua frota,
            manutenção e equipe em
            um único lugar.
          </p>
        </div>

        <Link
          href="/maquinas"
          className="dashboard-main-button"
        >
          <Truck size={18} />
          Equipamentos
          <ArrowRight size={17} />
        </Link>

      </div>

      {/* INDICADORES */}
      <div className="dashboard-cards">

        <div className="dashboard-card">

          <div className="dashboard-card-icon azul">
            <Truck size={22} />
          </div>

          <div>
            <span>Total de equipamentos</span>

            <strong>
              {carregando
                ? "—"
                : totalMaquinas}
            </strong>
          </div>

        </div>

        <div className="dashboard-card">

          <div className="dashboard-card-icon verde">
            <CheckCircle2 size={22} />
          </div>

          <div>
            <span>Operando</span>

            <strong>
              {carregando
                ? "—"
                : maquinasOperando}
            </strong>
          </div>

        </div>

        <div className="dashboard-card">

          <div className="dashboard-card-icon amarelo">
            <Wrench size={22} />
          </div>

          <div>
            <span>Em manutenção</span>

            <strong>
              {carregando
                ? "—"
                : maquinasManutencao}
            </strong>
          </div>

        </div>

        <div className="dashboard-card">

          <div className="dashboard-card-icon vermelho">
            <CircleAlert size={22} />
          </div>

          <div>
            <span>Manutenções abertas</span>

            <strong>
              {carregando
                ? "—"
                : manutencoesAbertas}
            </strong>
          </div>

        </div>

      </div>

      {/* ÁREA PRINCIPAL */}
      <div className="dashboard-layout">

        {/* MÁQUINAS */}
        <section className="dashboard-panel">

          <div className="dashboard-panel-header">

            <div>
              <h2>
                Equipamentos
              </h2>

              <p>
                Situação atual da frota
              </p>
            </div>

            <Link
              href="/maquinas"
              className="dashboard-link"
            >
              Ver todos
              <ArrowRight size={15} />
            </Link>

          </div>

          {carregando ? (
            <div className="dashboard-empty">
              Carregando equipamentos...
            </div>
          ) : equipamentos.length === 0 ? (
            <div className="dashboard-empty">

              <Truck size={34} />

              <strong>
                Nenhum equipamento
              </strong>

              <span>
                Cadastre sua primeira
                máquina para começar.
              </span>

              <Link
                href="/maquinas"
                className="dashboard-empty-button"
              >
                Cadastrar equipamento
              </Link>

            </div>
          ) : (
            <div className="dashboard-machine-list">

              {equipamentos
                .slice(0, 6)
                .map((maquina) => (

                  <Link
                    href={`/maquinas?id=${maquina.id}`}
                    key={maquina.id}
                    className="dashboard-machine"
                  >

                    <div className="dashboard-machine-icon">
                      <Truck size={20} />
                    </div>

                    <div className="dashboard-machine-info">

                      <strong>
                        {maquina.nome}
                      </strong>

                      <span>
                        {maquina.fabricante || ""}
                        {" "}
                        {maquina.modelo || ""}
                      </span>

                    </div>

                    <div className="dashboard-machine-right">

                      <span
                        className={statusClasse(
                          maquina.status
                        )}
                      >
                        {maquina.status ||
                          "Sem status"}
                      </span>

                      <ArrowRight
                        size={17}
                      />

                    </div>

                  </Link>

                ))}

            </div>
          )}

        </section>

        {/* RESUMO */}
        <section className="dashboard-panel dashboard-summary">

          <div className="dashboard-panel-header">

            <div>
              <h2>
                Resumo da frota
              </h2>

              <p>
                Status dos equipamentos
              </p>
            </div>

          </div>

          <div className="summary-item">

            <div className="summary-left">
              <span className="summary-dot verde" />
              <span>Operando</span>
            </div>

            <strong>
              {maquinasOperando}
            </strong>

          </div>

          <div className="summary-item">

            <div className="summary-left">
              <span className="summary-dot amarelo" />
              <span>Em manutenção</span>
            </div>

            <strong>
              {maquinasManutencao}
            </strong>

          </div>

          <div className="summary-item">

            <div className="summary-left">
              <span className="summary-dot vermelho" />
              <span>Paradas</span>
            </div>

            <strong>
              {maquinasParadas}
            </strong>

          </div>

          <div className="summary-total">

            <div>
              <span>Total</span>

              <strong>
                {totalMaquinas}
              </strong>
            </div>

            <Activity size={28} />

          </div>

        </section>

      </div>

      {/* ACESSO RÁPIDO */}
      <section className="dashboard-quick">

        <Link
          href="/maquinas"
          className="quick-card"
        >
          <div className="quick-icon">
            <Truck size={22} />
          </div>

          <div>
            <strong>
              Equipamentos
            </strong>

            <span>
              Cadastrar e consultar
              máquinas
            </span>
          </div>

          <ArrowRight size={18} />
        </Link>

        <Link
          href="/manutencao"
          className="quick-card"
        >
          <div className="quick-icon">
            <Wrench size={22} />
          </div>

          <div>
            <strong>
              Manutenção
            </strong>

            <span>
              Registrar serviços
              realizados
            </span>
          </div>

          <ArrowRight size={18} />
        </Link>

        <Link
          href="/mecanicos"
          className="quick-card"
        >
          <div className="quick-icon">
            <Users size={22} />
          </div>

          <div>
            <strong>
              Mecânicos
            </strong>

            <span>
              Gerenciar equipe
              técnica
            </span>
          </div>

          <ArrowRight size={18} />
        </Link>

      </section>

      {/* CSS DO DASHBOARD */}
      <style jsx>{`

        .dashboard-page {
          width: 100%;
        }

        .dashboard-heading {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          gap: 25px;
          margin-bottom: 28px;
        }

        .dashboard-overline {
          display: flex;
          align-items: center;
          gap: 7px;
          color: #e79a0b;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 1.5px;
          margin-bottom: 8px;
        }

        .dashboard-heading h1 {
          color: #172033;
          font-size: clamp(25px, 3vw, 34px);
          line-height: 1.2;
          letter-spacing: -1px;
        }

        .dashboard-heading p {
          color: #738094;
          font-size: 13px;
          margin-top: 7px;
          line-height: 1.6;
        }

        .dashboard-main-button {
          min-height: 45px;
          display: flex;
          align-items: center;
          gap: 9px;
          padding: 10px 16px;
          border-radius: 9px;
          text-decoration: none;
          background: #172033;
          color: white;
          font-size: 12px;
          font-weight: 700;
          white-space: nowrap;
        }

        .dashboard-cards {
          display: grid;
          grid-template-columns:
            repeat(4, minmax(0, 1fr));
          gap: 15px;
          margin-bottom: 18px;
        }

        .dashboard-card {
          min-width: 0;
          min-height: 108px;
          display: flex;
          align-items: center;
          gap: 13px;
          padding: 18px;
          background: white;
          border: 1px solid #e4e8ee;
          border-radius: 13px;
          box-shadow:
            0 4px 18px
            rgba(15, 23, 42, .04);
        }

        .dashboard-card-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 11px;
        }

        .dashboard-card-icon.azul {
          color: #3977c8;
          background: #edf5ff;
        }

        .dashboard-card-icon.verde {
          color: #22965a;
          background: #ecfaf2;
        }

        .dashboard-card-icon.amarelo {
          color: #bc7900;
          background: #fff7df;
        }

        .dashboard-card-icon.vermelho {
          color: #c54a4a;
          background: #fff0f0;
        }

        .dashboard-card span {
          display: block;
          color: #7b8798;
          font-size: 10px;
          line-height: 1.4;
        }

        .dashboard-card strong {
          display: block;
          color: #172033;
          font-size: 25px;
          margin-top: 4px;
        }

        .dashboard-layout {
          display: grid;
          grid-template-columns:
            minmax(0, 1.7fr)
            minmax(280px, .8fr);
          gap: 18px;
        }

        .dashboard-panel {
          min-width: 0;
          background: white;
          border: 1px solid #e4e8ee;
          border-radius: 14px;
          overflow: hidden;
          box-shadow:
            0 4px 18px
            rgba(15, 23, 42, .04);
        }

        .dashboard-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          padding: 20px;
          border-bottom: 1px solid #edf0f4;
        }

        .dashboard-panel-header h2 {
          color: #172033;
          font-size: 16px;
        }

        .dashboard-panel-header p {
          color: #8a95a5;
          font-size: 10px;
          margin-top: 4px;
        }

        .dashboard-link {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #c17a00;
          font-size: 10px;
          font-weight: 700;
          text-decoration: none;
          white-space: nowrap;
        }

        .dashboard-machine-list {
          display: flex;
          flex-direction: column;
        }

        .dashboard-machine {
          display: flex;
          align-items: center;
          gap: 12px;
          min-width: 0;
          padding: 13px 18px;
          text-decoration: none;
          border-bottom: 1px solid #f0f2f5;
          transition: background .15s;
        }

        .dashboard-machine:last-child {
          border-bottom: none;
        }

        .dashboard-machine:hover {
          background: #fafbfc;
        }

        .dashboard-machine-icon {
          width: 38px;
          height: 38px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #9b6500;
          background: #fff6df;
          border-radius: 9px;
        }

        .dashboard-machine-info {
          flex: 1;
          min-width: 0;
        }

        .dashboard-machine-info strong {
          display: block;
          color: #273246;
          font-size: 12px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dashboard-machine-info span {
          display: block;
          color: #8994a4;
          font-size: 9px;
          margin-top: 3px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }

        .dashboard-machine-right {
          display: flex;
          align-items: center;
          gap: 10px;
          color: #9aa4b3;
        }

        .dashboard-status {
          padding: 5px 8px;
          border-radius: 20px;
          font-size: 9px;
          font-weight: 700;
          white-space: nowrap;
        }

        .dashboard-status.verde {
          color: #18834d;
          background: #e9f8ef;
        }

        .dashboard-status.amarelo {
          color: #9a6500;
          background: #fff4d1;
        }

        .dashboard-status.vermelho {
          color: #b63d3d;
          background: #fdeaea;
        }

        .dashboard-empty {
          min-height: 230px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-direction: column;
          gap: 7px;
          color: #8994a4;
          text-align: center;
          padding: 25px;
        }

        .dashboard-empty strong {
          color: #344054;
          font-size: 13px;
          margin-top: 5px;
        }

        .dashboard-empty span {
          font-size: 10px;
        }

        .dashboard-empty-button {
          margin-top: 9px;
          padding: 9px 13px;
          border-radius: 8px;
          color: #172033;
          background: #ffb72b;
          text-decoration: none;
          font-size: 10px;
          font-weight: 700;
        }

        .summary-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid #f0f2f5;
        }

        .summary-left {
          display: flex;
          align-items: center;
          gap: 9px;
          color: #586579;
          font-size: 11px;
        }

        .summary-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
        }

        .summary-dot.verde {
          background: #35b878;
        }

        .summary-dot.amarelo {
          background: #e6a31a;
        }

        .summary-dot.vermelho {
          background: #d45b5b;
        }

        .summary-item strong {
          color: #172033;
          font-size: 14px;
        }

        .summary-total {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin: 18px;
          padding: 16px;
          border-radius: 11px;
          color: #172033;
          background: #f7f8fa;
        }

        .summary-total span {
          display: block;
          color: #8792a2;
          font-size: 9px;
        }

        .summary-total strong {
          display: block;
          font-size: 23px;
          margin-top: 2px;
        }

        .dashboard-quick {
          display: grid;
          grid-template-columns:
            repeat(3, minmax(0, 1fr));
          gap: 15px;
          margin-top: 18px;
        }

        .quick-card {
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 17px;
          border: 1px solid #e4e8ee;
          border-radius: 13px;
          background: white;
          text-decoration: none;
          box-shadow:
            0 4px 18px
            rgba(15, 23, 42, .035);
        }

        .quick-icon {
          width: 40px;
          height: 40px;
          flex-shrink: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #a66b00;
          background: #fff5dc;
          border-radius: 9px;
        }

        .quick-card > div:nth-child(2) {
          flex: 1;
          min-width: 0;
        }

        .quick-card strong {
          display: block;
          color: #263246;
          font-size: 11px;
        }

        .quick-card span {
          display: block;
          color: #8994a4;
          font-size: 9px;
          line-height: 1.5;
          margin-top: 3px;
        }

        .quick-card > svg:last-child {
          flex-shrink: 0;
          color: #aab2bd;
        }

        @media (max-width: 1100px) {

          .dashboard-cards {
            grid-template-columns:
              repeat(2, minmax(0, 1fr));
          }

          .dashboard-layout {
            grid-template-columns: 1fr;
          }

        }

        @media (max-width: 700px) {

          .dashboard-heading {
            align-items: stretch;
            flex-direction: column;
          }

          .dashboard-main-button {
            width: 100%;
            justify-content: center;
          }

          .dashboard-cards {
            grid-template-columns: 1fr;
          }

          .dashboard-quick {
            grid-template-columns: 1fr;
          }

          .dashboard-machine {
            padding: 13px;
          }

          .dashboard-machine-right > svg {
            display: none;
          }

          .dashboard-status {
            font-size: 8px;
          }

        }

        @media (max-width: 430px) {

          .dashboard-heading h1 {
            font-size: 24px;
          }

          .dashboard-heading p {
            font-size: 11px;
          }

          .dashboard-card {
            min-height: 92px;
            padding: 14px;
          }

          .dashboard-card strong {
            font-size: 22px;
          }

          .dashboard-machine-info strong {
            font-size: 11px;
          }

          .dashboard-machine-info span {
            font-size: 8px;
          }

        }

      `}</style>

    </div>
  );
}
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Construction,
  Settings,
  Wrench,
  XCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Equipamento = {
  id: number;
  categoria: string;
  descricao_bem: string;
  fabricante: string;
  modelo: string;
  ano: string;
  numero_serie_chassi: string;
  placa: string;
  horimetro: string;
  status: string;
  proxima_manutencao: string | null;
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
};

function normalizarStatus(
  status: string | null | undefined
) {
  return String(status || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function formatarData(
  data: string | null | undefined
) {
  if (!data) return "-";

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return data;
  }

  return dataObj.toLocaleDateString("pt-BR");
}

function formatarStatus(
  status: string | null | undefined
) {
  const normalizado = normalizarStatus(status);

  if (normalizado === "operando") {
    return "Operando";
  }

  if (normalizado === "em manutencao") {
    return "Em Manutenção";
  }

  if (normalizado === "parada") {
    return "Parada";
  }

  return status || "-";
}

function nomeEquipamento(
  equipamento: Equipamento
) {
  if (equipamento.descricao_bem) {
    return equipamento.descricao_bem;
  }

  return (
    `${equipamento.fabricante || ""} ${
      equipamento.modelo || ""
    }`.trim() ||
    `Equipamento ${equipamento.id}`
  );
}

export default function DashboardPage() {
  const [equipamentos, setEquipamentos] =
    useState<Equipamento[]>([]);

  const [manutencoes, setManutencoes] =
    useState<Manutencao[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    setCarregando(true);
    setErro("");

    try {
      const equipamentosResult =
        await supabase
          .from("equipamentos")
          .select(`
            id,
            categoria,
            descricao_bem,
            fabricante,
            modelo,
            ano,
            numero_serie_chassi,
            placa,
            horimetro,
            status,
            proxima_manutencao
          `)
          .order("id", {
            ascending: true,
          });

      if (equipamentosResult.error) {
        console.error(
          "Erro ao carregar equipamentos:",
          equipamentosResult.error
        );

        setErro(
          "Não foi possível carregar os equipamentos: " +
            equipamentosResult.error.message
        );

        setCarregando(false);
        return;
      }

      setEquipamentos(
        (equipamentosResult.data ||
          []) as Equipamento[]
      );

      const manutencoesResult =
        await supabase
          .from("manutencoes")
          .select(`
            id,
            equipamento_id,
            maquina,
            tipo,
            mecanico,
            data,
            horimetro,
            prioridade,
            status
          `)
          .order("id", {
            ascending: false,
          });

      if (manutencoesResult.error) {
        console.warn(
          "Não foi possível carregar as manutenções:",
          manutencoesResult.error
        );

        setManutencoes([]);
      } else {
        setManutencoes(
          (manutencoesResult.data ||
            []) as Manutencao[]
        );
      }
    } catch (error) {
      console.error(
        "Erro inesperado no Dashboard:",
        error
      );

      setErro(
        "Ocorreu um erro inesperado ao carregar o Dashboard."
      );
    } finally {
      setCarregando(false);
    }
  }

  // =====================================================
  // CONTADORES
  // =====================================================

  const totalEquipamentos =
    equipamentos.length;

  const operando = equipamentos.filter(
    (equipamento) =>
      normalizarStatus(
        equipamento.status
      ) === "operando"
  ).length;

  const emManutencao =
    equipamentos.filter(
      (equipamento) =>
        normalizarStatus(
          equipamento.status
        ) === "em manutencao"
    ).length;

  const paradas = equipamentos.filter(
    (equipamento) =>
      normalizarStatus(
        equipamento.status
      ) === "parada"
  ).length;

  const manutencoesAtivas =
    manutencoes.filter((manutencao) => {
      const status =
        normalizarStatus(
          manutencao.status
        );

      return (
        status === "em andamento" ||
        status === "aberta" ||
        status === "aberto" ||
        status === "pendente"
      );
    }).length;

  // =====================================================
  // PRÓXIMAS MANUTENÇÕES
  // =====================================================

  const proximasManutencoes =
    useMemo(() => {
      const hoje = new Date();

      return equipamentos
        .filter(
          (equipamento) =>
            equipamento.proxima_manutencao
        )
        .sort((a, b) => {
          const dataA = new Date(
            a.proxima_manutencao as string
          ).getTime();

          const dataB = new Date(
            b.proxima_manutencao as string
          ).getTime();

          return dataA - dataB;
        })
        .slice(0, 5)
        .map((equipamento) => {
          const data = new Date(
            equipamento.proxima_manutencao as string
          );

          const diferenca = Math.ceil(
            (data.getTime() -
              hoje.getTime()) /
              (1000 * 60 * 60 * 24)
          );

          return {
            ...equipamento,
            dias: diferenca,
          };
        });
    }, [equipamentos]);

  // =====================================================
  // EQUIPAMENTOS EM MANUTENÇÃO
  // =====================================================

  const equipamentosEmManutencao =
    useMemo(() => {
      return equipamentos
        .filter(
          (equipamento) =>
            normalizarStatus(
              equipamento.status
            ) === "em manutencao"
        )
        .slice(0, 5);
    }, [equipamentos]);

  // =====================================================
  // ÚLTIMAS MANUTENÇÕES
  // =====================================================

  const ultimasManutencoes =
    useMemo(() => {
      return manutencoes
        .slice(0, 5)
        .map((manutencao) => ({
          ...manutencao,
          dataFormatada:
            formatarData(
              manutencao.data
            ),
        }));
    }, [manutencoes]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="dashboard-page">
      <div className="dashboard-container">

        {/* CABEÇALHO */}

        <header className="dashboard-header">
          <div className="dashboard-title-area">
            <div className="dashboard-title-icon">
              <Activity size={28} />
            </div>

            <div>
              <h1>Dashboard</h1>

              <p>
                Visão geral da frota e das manutenções
              </p>
            </div>
          </div>

          <div className="dashboard-online">
            <span />
            Sistema Online
          </div>
        </header>

        {/* ERRO */}

        {erro && (
          <div className="dashboard-error">
            <AlertTriangle size={22} />

            <div>
              <strong>
                Erro ao carregar o Dashboard
              </strong>

              <p>{erro}</p>
            </div>
          </div>
        )}

        {/* CARREGANDO */}

        {carregando ? (
          <div className="dashboard-loading">
            <Clock3
              size={26}
              className="loading-icon"
            />

            <span>
              Carregando informações da frota...
            </span>
          </div>
        ) : (
          <>
            {/* ================================ */}
            {/* CARDS PRINCIPAIS                  */}
            {/* ================================ */}

            <section className="stats-grid">

              <div className="stat-card stat-blue">
                <div className="stat-card-top">
                  <div>
                    <span>
                      Total de Equipamentos
                    </span>

                    <strong>
                      {totalEquipamentos}
                    </strong>
                  </div>

                  <div className="stat-icon">
                    <Construction size={25} />
                  </div>
                </div>

                <p>
                  Equipamentos cadastrados
                </p>
              </div>

              <div className="stat-card stat-green">
                <div className="stat-card-top">
                  <div>
                    <span>
                      Operando
                    </span>

                    <strong>
                      {operando}
                    </strong>
                  </div>

                  <div className="stat-icon">
                    <CheckCircle2 size={25} />
                  </div>
                </div>

                <p>
                  Equipamentos em operação
                </p>
              </div>

              <div className="stat-card stat-orange">
                <div className="stat-card-top">
                  <div>
                    <span>
                      Em Manutenção
                    </span>

                    <strong>
                      {emManutencao}
                    </strong>
                  </div>

                  <div className="stat-icon">
                    <Wrench size={25} />
                  </div>
                </div>

                <p>
                  Equipamentos em manutenção
                </p>
              </div>

              <div className="stat-card stat-red">
                <div className="stat-card-top">
                  <div>
                    <span>
                      Paradas
                    </span>

                    <strong>
                      {paradas}
                    </strong>
                  </div>

                  <div className="stat-icon">
                    <XCircle size={25} />
                  </div>
                </div>

                <p>
                  Equipamentos parados
                </p>
              </div>
            </section>

            {/* ================================ */}
            {/* SEGUNDA LINHA                    */}
            {/* ================================ */}

            <section className="secondary-grid">

              <div className="mini-card">
                <div className="mini-icon">
                  <Settings size={23} />
                </div>

                <div>
                  <span>
                    Manutenções registradas
                  </span>

                  <strong>
                    {manutencoes.length}
                  </strong>
                </div>
              </div>

              <div className="mini-card">
                <div className="mini-icon orange">
                  <Wrench size={23} />
                </div>

                <div>
                  <span>
                    Manutenções ativas
                  </span>

                  <strong>
                    {manutencoesAtivas}
                  </strong>
                </div>
              </div>

              <div className="mini-card">
                <div className="mini-icon blue">
                  <CalendarDays size={23} />
                </div>

                <div>
                  <span>
                    Próximas programadas
                  </span>

                  <strong>
                    {proximasManutencoes.length}
                  </strong>
                </div>
              </div>
            </section>

            {/* ================================ */}
            {/* MANUTENÇÃO / PRÓXIMAS            */}
            {/* ================================ */}

            <section className="two-columns">

              {/* EQUIPAMENTOS EM MANUTENÇÃO */}

              <div className="dashboard-panel">

                <div className="panel-header">
                  <div className="panel-title">
                    <Wrench size={22} />

                    <div>
                      <h2>
                        Equipamentos em Manutenção
                      </h2>

                      <p>
                        Equipamentos atualmente em serviço
                      </p>
                    </div>
                  </div>
                </div>

                {equipamentosEmManutencao.length ===
                0 ? (
                  <div className="empty-state">
                    <CheckCircle2 size={30} />

                    <p>
                      Nenhum equipamento em manutenção.
                    </p>
                  </div>
                ) : (
                  <div className="equipment-list">
                    {equipamentosEmManutencao.map(
                      (equipamento) => (
                        <div
                          key={equipamento.id}
                          className="equipment-card"
                        >
                          <div className="equipment-icon">
                            <Wrench size={20} />
                          </div>

                          <div className="equipment-info">
                            <strong>
                              {nomeEquipamento(
                                equipamento
                              )}
                            </strong>

                            <span>
                              {equipamento.fabricante}{" "}
                              {equipamento.modelo}
                            </span>

                            {equipamento
                              .numero_serie_chassi && (
                              <small>
                                Série:{" "}
                                {
                                  equipamento.numero_serie_chassi
                                }
                              </small>
                            )}
                          </div>

                          <span className="status-badge maintenance">
                            Em manutenção
                          </span>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {/* PRÓXIMAS MANUTENÇÕES */}

              <div className="dashboard-panel">

                <div className="panel-header">
                  <div className="panel-title">
                    <CalendarDays size={22} />

                    <div>
                      <h2>
                        Próximas Manutenções
                      </h2>

                      <p>
                        Manutenções programadas
                      </p>
                    </div>
                  </div>
                </div>

                {proximasManutencoes.length ===
                0 ? (
                  <div className="empty-state">
                    <CalendarDays size={30} />

                    <p>
                      Nenhuma manutenção programada.
                    </p>
                  </div>
                ) : (
                  <div className="maintenance-list">
                    {proximasManutencoes.map(
                      (equipamento) => (
                        <div
                          key={equipamento.id}
                          className="scheduled-card"
                        >
                          <div>
                            <strong>
                              {nomeEquipamento(
                                equipamento
                              )}
                            </strong>

                            <span>
                              {formatarData(
                                equipamento.proxima_manutencao
                              )}
                            </span>
                          </div>

                          <div className="deadline">
                            <small>
                              Prazo
                            </small>

                            <strong>
                              {equipamento.dias < 0
                                ? `${Math.abs(
                                    equipamento.dias
                                  )} dias atrasada`
                                : equipamento.dias ===
                                  0
                                ? "Hoje"
                                : `${equipamento.dias} dias`}
                            </strong>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* ================================ */}
            {/* ÚLTIMAS MANUTENÇÕES              */}
            {/* ================================ */}

            <section className="dashboard-panel full-panel">

              <div className="panel-header">
                <div className="panel-title">
                  <Activity size={22} />

                  <div>
                    <h2>
                      Últimas Manutenções
                    </h2>

                    <p>
                      Histórico mais recente da frota
                    </p>
                  </div>
                </div>
              </div>

              {ultimasManutencoes.length ===
              0 ? (
                <div className="empty-state">
                  <p>
                    Nenhuma manutenção registrada.
                  </p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Máquina</th>
                        <th>Tipo</th>
                        <th>Mecânico</th>
                        <th>Data</th>
                        <th>Prioridade</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {ultimasManutencoes.map(
                        (manutencao) => (
                          <tr
                            key={manutencao.id}
                          >
                            <td>
                              <strong>
                                {manutencao.maquina ||
                                  "-"}
                              </strong>
                            </td>

                            <td>
                              {manutencao.tipo ||
                                "-"}
                            </td>

                            <td>
                              {manutencao.mecanico ||
                                "-"}
                            </td>

                            <td>
                              {
                                manutencao.dataFormatada
                              }
                            </td>

                            <td>
                              <span className="priority-badge">
                                {manutencao.prioridade ||
                                  "-"}
                              </span>
                            </td>

                            <td>
                              <span className="status-badge">
                                {manutencao.status ||
                                  "-"}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* ================================ */}
            {/* RESUMO DA FROTA                  */}
            {/* ================================ */}

            <section className="dashboard-panel full-panel">

              <div className="panel-header">
                <div className="panel-title">
                  <Construction size={22} />

                  <div>
                    <h2>
                      Resumo da Frota
                    </h2>

                    <p>
                      Equipamentos cadastrados no sistema
                    </p>
                  </div>
                </div>
              </div>

              {equipamentos.length === 0 ? (
                <div className="empty-state">
                  <Construction size={30} />

                  <p>
                    Nenhum equipamento cadastrado.
                  </p>
                </div>
              ) : (
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Equipamento</th>
                        <th>Categoria</th>
                        <th>Fabricante</th>
                        <th>Modelo</th>
                        <th>Horímetro</th>
                        <th>Status</th>
                      </tr>
                    </thead>

                    <tbody>
                      {equipamentos.map(
                        (equipamento) => (
                          <tr
                            key={equipamento.id}
                          >
                            <td>
                              <strong>
                                {nomeEquipamento(
                                  equipamento
                                )}
                              </strong>
                            </td>

                            <td>
                              {equipamento.categoria ||
                                "-"}
                            </td>

                            <td>
                              {equipamento.fabricante ||
                                "-"}
                            </td>

                            <td>
                              {equipamento.modelo ||
                                "-"}
                            </td>

                            <td>
                              {equipamento.horimetro ||
                                "-"}
                            </td>

                            <td>
                              <span
                                className={`status-badge ${normalizarStatus(
                                  equipamento.status
                                )}`}
                              >
                                {formatarStatus(
                                  equipamento.status
                                )}
                              </span>
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          </>
        )}
      </div>

      {/* ================================================= */}
      {/* ESTILO EXCLUSIVO DO DASHBOARD                     */}
      {/* Não altera globals.css nem a página Mecânicos.    */}
      {/* ================================================= */}

      <style jsx>{`
        .dashboard-page {
          width: 100%;
          min-height: 100vh;
          padding: 24px;
          color: #172033;
        }

        .dashboard-container {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        .dashboard-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 24px;
          padding: 22px 24px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(30, 41, 59, 0.08);
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.07);
        }

        .dashboard-title-area {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .dashboard-title-area h1 {
          margin: 0;
          font-size: 30px;
          line-height: 1.1;
          font-weight: 800;
        }

        .dashboard-title-area p {
          margin: 5px 0 0;
          font-size: 14px;
          color: #64748b;
        }

        .dashboard-title-icon {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: #eef4ff;
          color: #2563eb;
          flex-shrink: 0;
        }

        .dashboard-online {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 9px 14px;
          border-radius: 999px;
          background: #ecfdf5;
          color: #047857;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
        }

        .dashboard-online span {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #10b981;
        }

        .dashboard-error {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
          padding: 15px;
          border-radius: 14px;
          background: #fef2f2;
          border: 1px solid #fecaca;
          color: #b91c1c;
        }

        .dashboard-error p {
          margin: 4px 0 0;
          font-size: 13px;
        }

        .dashboard-loading {
          min-height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.94);
          border: 1px solid rgba(30, 41, 59, 0.08);
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.06);
          color: #475569;
        }

        .loading-icon {
          animation: dashboardSpin 1.5s linear infinite;
        }

        @keyframes dashboardSpin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(4, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 16px;
        }

        .stat-card {
          min-width: 0;
          padding: 20px;
          border-radius: 20px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(30, 41, 59, 0.08);
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.07);
        }

        .stat-card-top {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 12px;
        }

        .stat-card span {
          display: block;
          color: #64748b;
          font-size: 13px;
          font-weight: 600;
        }

        .stat-card strong {
          display: block;
          margin-top: 6px;
          font-size: 34px;
          line-height: 1;
          font-weight: 800;
        }

        .stat-card p {
          margin: 12px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        .stat-icon {
          width: 45px;
          height: 45px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 13px;
          flex-shrink: 0;
        }

        .stat-blue .stat-icon {
          background: #eff6ff;
          color: #2563eb;
        }

        .stat-green .stat-icon {
          background: #ecfdf5;
          color: #059669;
        }

        .stat-orange .stat-icon {
          background: #fff7ed;
          color: #ea580c;
        }

        .stat-red .stat-icon {
          background: #fef2f2;
          color: #dc2626;
        }

        .secondary-grid {
          display: grid;
          grid-template-columns: repeat(3, minmax(0, 1fr));
          gap: 16px;
          margin-bottom: 20px;
        }

        .mini-card {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(30, 41, 59, 0.08);
          border-radius: 18px;
          box-shadow: 0 7px 22px rgba(15, 23, 42, 0.06);
        }

        .mini-icon {
          width: 44px;
          height: 44px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 12px;
          background: #f1f5f9;
          color: #475569;
        }

        .mini-icon.orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .mini-icon.blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .mini-card span {
          display: block;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .mini-card strong {
          display: block;
          margin-top: 3px;
          font-size: 25px;
          font-weight: 800;
        }

        .two-columns {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .dashboard-panel {
          min-width: 0;
          padding: 20px;
          background: rgba(255, 255, 255, 0.96);
          border: 1px solid rgba(30, 41, 59, 0.08);
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(15, 23, 42, 0.07);
        }

        .full-panel {
          margin-bottom: 20px;
        }

        .panel-header {
          margin-bottom: 18px;
        }

        .panel-title {
          display: flex;
          align-items: flex-start;
          gap: 11px;
        }

        .panel-title svg {
          margin-top: 2px;
          flex-shrink: 0;
          color: #2563eb;
        }

        .panel-title h2 {
          margin: 0;
          font-size: 18px;
          line-height: 1.25;
          font-weight: 800;
        }

        .panel-title p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        .equipment-list,
        .maintenance-list {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .equipment-card {
          display: flex;
          align-items: center;
          gap: 11px;
          padding: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #fafcff;
        }

        .equipment-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 11px;
          background: #fff7ed;
          color: #ea580c;
        }

        .equipment-info {
          min-width: 0;
          flex: 1;
        }

        .equipment-info strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
        }

        .equipment-info span {
          display: block;
          margin-top: 2px;
          color: #64748b;
          font-size: 12px;
        }

        .equipment-info small {
          display: block;
          margin-top: 2px;
          color: #94a3b8;
          font-size: 10px;
        }

        .scheduled-card {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 12px;
          padding: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          background: #fafcff;
        }

        .scheduled-card > div:first-child {
          min-width: 0;
        }

        .scheduled-card strong {
          display: block;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          font-size: 14px;
        }

        .scheduled-card span {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 12px;
        }

        .deadline {
          flex-shrink: 0;
          text-align: right;
        }

        .deadline small {
          display: block;
          color: #94a3b8;
          font-size: 10px;
        }

        .deadline strong {
          margin-top: 2px;
          color: #2563eb;
          font-size: 12px;
        }

        .status-badge,
        .priority-badge {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 9px;
          border-radius: 999px;
          background: #f1f5f9;
          color: #475569;
          font-size: 10px;
          font-weight: 700;
          white-space: nowrap;
        }

        .status-badge.maintenance {
          background: #fff7ed;
          color: #c2410c;
        }

        .status-badge.operando {
          background: #ecfdf5;
          color: #047857;
        }

        .status-badge.em\\ manutencao {
          background: #fff7ed;
          color: #c2410c;
        }

        .status-badge.parada {
          background: #fef2f2;
          color: #b91c1c;
        }

        .empty-state {
          min-height: 130px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 20px;
          border: 1px dashed #cbd5e1;
          border-radius: 14px;
          color: #64748b;
          text-align: center;
        }

        .empty-state p {
          margin: 0;
          font-size: 13px;
        }

        .table-wrapper {
          width: 100%;
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
        }

        .table-wrapper table {
          width: 100%;
          min-width: 700px;
          border-collapse: collapse;
        }

        .table-wrapper th {
          padding: 12px 14px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          color: #475569;
          font-size: 11px;
          font-weight: 800;
          text-align: left;
          white-space: nowrap;
        }

        .table-wrapper td {
          padding: 13px 14px;
          border-bottom: 1px solid #edf2f7;
          color: #334155;
          font-size: 12px;
          white-space: nowrap;
        }

        .table-wrapper tbody tr:last-child td {
          border-bottom: none;
        }

        @media (max-width: 1100px) {
          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }

          .two-columns {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 700px) {
          .dashboard-page {
            padding: 10px;
          }

          .dashboard-header {
            padding: 15px;
            margin-bottom: 14px;
            border-radius: 16px;
          }

          .dashboard-title-area {
            gap: 10px;
          }

          .dashboard-title-icon {
            width: 43px;
            height: 43px;
            border-radius: 12px;
          }

          .dashboard-title-area h1 {
            font-size: 23px;
          }

          .dashboard-title-area p {
            font-size: 11px;
          }

          .dashboard-online {
            display: none;
          }

          .stats-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 9px;
            margin-bottom: 9px;
          }

          .stat-card {
            padding: 13px;
            border-radius: 15px;
          }

          .stat-card span {
            font-size: 10px;
            line-height: 1.3;
          }

          .stat-card strong {
            font-size: 27px;
            margin-top: 5px;
          }

          .stat-card p {
            margin-top: 7px;
            font-size: 9px;
            line-height: 1.3;
          }

          .stat-icon {
            width: 34px;
            height: 34px;
            border-radius: 9px;
          }

          .stat-icon svg {
            width: 18px;
            height: 18px;
          }

          .secondary-grid {
            grid-template-columns: 1fr;
            gap: 9px;
            margin-bottom: 12px;
          }

          .mini-card {
            padding: 13px;
            border-radius: 14px;
          }

          .mini-icon {
            width: 38px;
            height: 38px;
          }

          .mini-card span {
            font-size: 10px;
          }

          .mini-card strong {
            font-size: 22px;
          }

          .two-columns {
            gap: 12px;
            margin-bottom: 12px;
          }

          .dashboard-panel {
            padding: 14px;
            border-radius: 16px;
          }

          .panel-title h2 {
            font-size: 15px;
          }

          .panel-title p {
            font-size: 10px;
          }

          .equipment-card {
            padding: 10px;
          }

          .equipment-icon {
            width: 35px;
            height: 35px;
          }

          .equipment-info strong {
            font-size: 12px;
          }

          .equipment-info span {
            font-size: 10px;
          }

          .equipment-info small {
            font-size: 9px;
          }

          .status-badge {
            font-size: 8px;
            padding: 4px 6px;
          }

          .scheduled-card {
            padding: 10px;
          }

          .scheduled-card strong {
            font-size: 11px;
          }

          .scheduled-card span {
            font-size: 9px;
          }

          .deadline strong {
            font-size: 9px;
          }

          .table-wrapper th {
            padding: 10px;
            font-size: 9px;
          }

          .table-wrapper td {
            padding: 10px;
            font-size: 10px;
          }

          .full-panel {
            margin-bottom: 12px;
          }
        }

        @media (max-width: 400px) {
          .dashboard-page {
            padding: 7px;
          }

          .stats-grid {
            gap: 7px;
          }

          .stat-card {
            padding: 11px;
          }

          .stat-card strong {
            font-size: 24px;
          }

          .stat-icon {
            width: 30px;
            height: 30px;
          }

          .equipment-card {
            align-items: flex-start;
          }

          .equipment-card .status-badge {
            display: none;
          }
        }
      `}</style>
    </main>
  );
}
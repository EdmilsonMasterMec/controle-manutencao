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

function normalizarStatus(status: string | null | undefined) {
  return String(status || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function formatarData(data: string | null | undefined) {
  if (!data) return "-";

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) {
    return data;
  }

  return dataObj.toLocaleDateString("pt-BR");
}

function formatarStatus(status: string | null | undefined) {
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

export default function DashboardPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    carregarDashboard();
  }, []);

  async function carregarDashboard() {
    setCarregando(true);
    setErro("");

    try {
      const equipamentosResult = await supabase
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
        (equipamentosResult.data || []) as Equipamento[]
      );

      const manutencoesResult = await supabase
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
          (manutencoesResult.data || []) as Manutencao[]
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

  const totalEquipamentos = equipamentos.length;

  const operando = equipamentos.filter(
    (equipamento) =>
      normalizarStatus(equipamento.status) === "operando"
  ).length;

  const emManutencao = equipamentos.filter(
    (equipamento) =>
      normalizarStatus(equipamento.status) === "em manutencao"
  ).length;

  const paradas = equipamentos.filter(
    (equipamento) =>
      normalizarStatus(equipamento.status) === "parada"
  ).length;

  const manutencoesAtivas = manutencoes.filter((manutencao) => {
    const status = normalizarStatus(manutencao.status);

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

  const proximasManutencoes = useMemo(() => {
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
          (data.getTime() - hoje.getTime()) /
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

  const equipamentosEmManutencao = useMemo(() => {
    return equipamentos
      .filter(
        (equipamento) =>
          normalizarStatus(equipamento.status) ===
          "em manutencao"
      )
      .slice(0, 5);
  }, [equipamentos]);

  // =====================================================
  // ÚLTIMAS MANUTENÇÕES
  // =====================================================

  const ultimasManutencoes = useMemo(() => {
    return manutencoes
      .slice(0, 5)
      .map((manutencao) => ({
        ...manutencao,
        dataFormatada: formatarData(manutencao.data),
      }));
  }, [manutencoes]);

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <main className="mastermec-app">
      <div className="w-full p-4 md:p-6">
        {/* CABEÇALHO */}

        <div className="mb-6 flex flex-col gap-2">
          <div className="flex items-center gap-3">
            <Activity size={30} />

            <div>
              <h1 className="text-2xl font-bold">
                Dashboard
              </h1>

              <p className="text-sm opacity-70">
                Visão geral da frota e das manutenções
              </p>
            </div>
          </div>
        </div>

        {/* ERRO */}

        {erro && (
          <div className="mb-6 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            <AlertTriangle
              size={22}
              className="mt-0.5 shrink-0"
            />

            <div>
              <strong>Erro ao carregar o Dashboard</strong>

              <p className="mt-1 text-sm">
                {erro}
              </p>
            </div>
          </div>
        )}

        {/* CARREGANDO */}

        {carregando ? (
          <div className="rounded-2xl border p-8 text-center">
            <div className="flex items-center justify-center gap-3">
              <Clock3
                size={24}
                className="animate-pulse"
              />

              <span>
                Carregando informações da frota...
              </span>
            </div>
          </div>
        ) : (
          <>
            {/* CARDS PRINCIPAIS */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium opacity-70">
                    Total de Equipamentos
                  </span>

                  <Construction size={24} />
                </div>

                <div className="text-3xl font-bold">
                  {totalEquipamentos}
                </div>

                <p className="mt-1 text-xs opacity-60">
                  Equipamentos cadastrados
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium opacity-70">
                    Operando
                  </span>

                  <CheckCircle2 size={24} />
                </div>

                <div className="text-3xl font-bold">
                  {operando}
                </div>

                <p className="mt-1 text-xs opacity-60">
                  Equipamentos em operação
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium opacity-70">
                    Em Manutenção
                  </span>

                  <Wrench size={24} />
                </div>

                <div className="text-3xl font-bold">
                  {emManutencao}
                </div>

                <p className="mt-1 text-xs opacity-60">
                  Equipamentos em manutenção
                </p>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="mb-3 flex items-center justify-between">
                  <span className="text-sm font-medium opacity-70">
                    Paradas
                  </span>

                  <XCircle size={24} />
                </div>

                <div className="text-3xl font-bold">
                  {paradas}
                </div>

                <p className="mt-1 text-xs opacity-60">
                  Equipamentos parados
                </p>
              </div>
            </div>

            {/* SEGUNDA LINHA */}

            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <Settings size={25} />

                  <div>
                    <p className="text-sm opacity-70">
                      Manutenções registradas
                    </p>

                    <p className="text-2xl font-bold">
                      {manutencoes.length}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <Wrench size={25} />

                  <div>
                    <p className="text-sm opacity-70">
                      Manutenções ativas
                    </p>

                    <p className="text-2xl font-bold">
                      {manutencoesAtivas}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="flex items-center gap-3">
                  <CalendarDays size={25} />

                  <div>
                    <p className="text-sm opacity-70">
                      Próximas programadas
                    </p>

                    <p className="text-2xl font-bold">
                      {proximasManutencoes.length}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTEÚDO */}

            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {/* EQUIPAMENTOS EM MANUTENÇÃO */}

              <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Wrench size={22} />

                    <h2 className="text-lg font-bold">
                      Equipamentos em Manutenção
                    </h2>
                  </div>
                </div>

                {equipamentosEmManutencao.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm opacity-60">
                    Nenhum equipamento em manutenção.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {equipamentosEmManutencao.map(
                      (equipamento) => (
                        <div
                          key={equipamento.id}
                          className="rounded-xl border p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">
                                {equipamento.descricao_bem ||
                                  `${equipamento.fabricante} ${equipamento.modelo}`}
                              </p>

                              <p className="text-sm opacity-60">
                                {equipamento.fabricante}{" "}
                                {equipamento.modelo}
                              </p>

                              {equipamento.numero_serie_chassi && (
                                <p className="mt-1 text-xs opacity-60">
                                  Série:{" "}
                                  {
                                    equipamento.numero_serie_chassi
                                  }
                                </p>
                              )}
                            </div>

                            <span className="rounded-full border px-3 py-1 text-xs font-medium">
                              Em Manutenção
                            </span>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>

              {/* PRÓXIMAS MANUTENÇÕES */}

              <section className="rounded-2xl border bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2">
                  <CalendarDays size={22} />

                  <h2 className="text-lg font-bold">
                    Próximas Manutenções
                  </h2>
                </div>

                {proximasManutencoes.length === 0 ? (
                  <div className="rounded-xl border border-dashed p-6 text-center text-sm opacity-60">
                    Nenhuma manutenção programada.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {proximasManutencoes.map(
                      (equipamento) => (
                        <div
                          key={equipamento.id}
                          className="rounded-xl border p-4"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold">
                                {equipamento.descricao_bem ||
                                  `${equipamento.fabricante} ${equipamento.modelo}`}
                              </p>

                              <p className="mt-1 text-sm opacity-70">
                                {formatarData(
                                  equipamento.proxima_manutencao
                                )}
                              </p>
                            </div>

                            <div className="text-right">
                              <p className="text-xs opacity-60">
                                Prazo
                              </p>

                              <p className="font-semibold">
                                {equipamento.dias < 0
                                  ? `${Math.abs(
                                      equipamento.dias
                                    )} dias atrasada`
                                  : equipamento.dias === 0
                                  ? "Hoje"
                                  : `${equipamento.dias} dias`}
                              </p>
                            </div>
                          </div>
                        </div>
                      )
                    )}
                  </div>
                )}
              </section>
            </div>

            {/* ÚLTIMAS MANUTENÇÕES */}

            <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Activity size={22} />

                <h2 className="text-lg font-bold">
                  Últimas Manutenções
                </h2>
              </div>

              {ultimasManutencoes.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm opacity-60">
                  Nenhuma manutenção registrada.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse">
                    <thead>
                      <tr className="border-b text-left text-sm">
                        <th className="px-3 py-3">
                          Máquina
                        </th>

                        <th className="px-3 py-3">
                          Tipo
                        </th>

                        <th className="px-3 py-3">
                          Mecânico
                        </th>

                        <th className="px-3 py-3">
                          Data
                        </th>

                        <th className="px-3 py-3">
                          Prioridade
                        </th>

                        <th className="px-3 py-3">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {ultimasManutencoes.map(
                        (manutencao) => (
                          <tr
                            key={manutencao.id}
                            className="border-b text-sm"
                          >
                            <td className="px-3 py-3 font-medium">
                              {manutencao.maquina || "-"}
                            </td>

                            <td className="px-3 py-3">
                              {manutencao.tipo || "-"}
                            </td>

                            <td className="px-3 py-3">
                              {manutencao.mecanico || "-"}
                            </td>

                            <td className="px-3 py-3">
                              {manutencao.dataFormatada}
                            </td>

                            <td className="px-3 py-3">
                              {manutencao.prioridade || "-"}
                            </td>

                            <td className="px-3 py-3">
                              {manutencao.status || "-"}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* RESUMO DA FROTA */}

            <section className="mt-6 rounded-2xl border bg-white p-5 shadow-sm">
              <div className="mb-4 flex items-center gap-2">
                <Construction size={22} />

                <h2 className="text-lg font-bold">
                  Resumo da Frota
                </h2>
              </div>

              {equipamentos.length === 0 ? (
                <div className="rounded-xl border border-dashed p-6 text-center text-sm opacity-60">
                  Nenhum equipamento cadastrado.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[800px] border-collapse">
                    <thead>
                      <tr className="border-b text-left text-sm">
                        <th className="px-3 py-3">
                          Equipamento
                        </th>

                        <th className="px-3 py-3">
                          Categoria
                        </th>

                        <th className="px-3 py-3">
                          Fabricante
                        </th>

                        <th className="px-3 py-3">
                          Modelo
                        </th>

                        <th className="px-3 py-3">
                          Horímetro
                        </th>

                        <th className="px-3 py-3">
                          Status
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {equipamentos.map(
                        (equipamento) => (
                          <tr
                            key={equipamento.id}
                            className="border-b text-sm"
                          >
                            <td className="px-3 py-3 font-medium">
                              {equipamento.descricao_bem ||
                                `Equipamento ${equipamento.id}`}
                            </td>

                            <td className="px-3 py-3">
                              {equipamento.categoria || "-"}
                            </td>

                            <td className="px-3 py-3">
                              {equipamento.fabricante || "-"}
                            </td>

                            <td className="px-3 py-3">
                              {equipamento.modelo || "-"}
                            </td>

                            <td className="px-3 py-3">
                              {equipamento.horimetro || "-"}
                            </td>

                            <td className="px-3 py-3">
                              {formatarStatus(
                                equipamento.status
                              )}
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
    </main>
  );
}
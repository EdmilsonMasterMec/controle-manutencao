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

export default function DashboardPage() {
  const [equipamentos, setEquipamentos] = useState<
    Equipamento[]
  >([]);

  const [manutencoes, setManutencoes] = useState<
    Manutencao[]
  >([]);

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
      // =====================================================
      // EQUIPAMENTOS
      // =====================================================

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
        (equipamentosResult.data ||
          []) as Equipamento[]
      );

      // =====================================================
      // MANUTENÇÕES
      // =====================================================

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

        // Não interrompe o Dashboard.
        // Os dados dos equipamentos continuam aparecendo.
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

  // =======================================================
  // CONTADORES
  // =======================================================

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

  // =======================================================
  // PRÓXIMAS MANUTENÇÕES
  // =======================================================

  const proximasManutencoes =
    useMemo(() => {
      const hoje = new Date();

      return equipamentos
        .filter(
          (equipamento) =>
            equipamento.proxima_manutencao
        )
        .sort((a, b) => {
          const dataA =
            new Date(
              a.proxima_manutencao as string
            ).getTime();

          const dataB =
            new Date(
              b.proxima_manutencao as string
            ).getTime();

          return dataA - dataB;
        })
        .slice(0, 5)
        .map((equipamento) => {
          const data =
            new Date(
              equipamento.proxima_manutencao as string
            );

          const diferenca =
            Math.ceil(
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

  // =======================================================
  // EQUIPAMENTOS EM MANUTENÇÃO
  // =======================================================

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

  // =======================================================
  // ÚLTIMAS MANUTENÇÕES
  // =======================================================

  const ultimasManutencoes =
    useMemo(() => {
      return manutencoes.slice(0
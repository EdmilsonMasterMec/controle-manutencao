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
        (equip
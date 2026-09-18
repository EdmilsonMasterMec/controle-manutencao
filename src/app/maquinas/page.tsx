"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Printer,
  X,
  Save,
} from "lucide-react";

type Foto = {
  id?: number | string;
  imagem?: string;
  descricao?: string;
};

type Servico = {
  id?: number | string;
  descricao?: string;
  fotos?: Foto[];
};

type Manutencao = {
  id: number;
  equipamento_id?: number | null;
  maquina?: string;
  tipo?: string;
  mecanico?: string;
  data?: string;
  horimetro?: string;
  prioridade?: string;
  status?: string;
  servicos?: Servico[];
};

type Equipamento = {
  id: number;
  nome: string;
  modelo: string;
  fabricante: string;
  ano: string;
  horimetro: string;
  responsavel: string;
  localizacao: string;
  status: string;
  proxima_manutencao: string;
  historico?: unknown[];
};

export default function MaquinasPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<Equipamento | null>(null);

  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [form, setForm] = useState({
    nome: "",
    modelo: "",
    fabricante: "",
    ano: "",
    horimetro: "",
    responsavel: "",
    localizacao: "",
    status: "Operando",
    proxima_manutencao: "",
  });

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

    const [equipamentosResult, manutencoesResult] = await Promise.all([
      supabase
        .from("equipamentos")
        .select("*")
        .order("id", { ascending: true }),

      supabase
        .from("manutencoes")
        .select("*")
        .order("id", { ascending: false }),
    ]);

    if (equipamentosResult.error) {
      console.error(equipamentosResult.error);
      alert("Erro ao carregar os equipamentos.");
      setCarregando(false);
      return;
    }

    if (manutencoesResult.error) {
      console.error(manutencoesResult.error);
      alert("Erro ao carregar as manutenções.");
      setCarregando(false);
      return;
    }

    setEquipamentos((equipamentosResult.data || []) as Equipamento[]);
    setManutencoes((manutencoesResult.data || []) as Manutencao[]);

    setCarregando(false);
  }

  function abrirNovoCadastro() {
    setEditandoId(null);

    setForm({
      nome: "",
      modelo: "",
      fabricante: "",
      ano: "",
      horimetro: "",
      responsavel: "",
      localizacao: "",
      status: "Operando",
      proxima_manutencao: "",
    });

    setMostrarCadastro(true);
    setEquipamentoSelecionado(null);
  }

  function editarEquipamento(equipamento: Equipamento) {
    setEditandoId(equipamento.id);

    setForm({
      nome: equipamento.nome || "",
      modelo: equipamento.modelo || "",
      fabricante: equipamento.fabricante || "",
      ano: equipamento.ano || "",
      horimetro: equipamento.horimetro || "",
      responsavel: equipamento.responsavel || "",
      localizacao: equipamento.localizacao || "",
      status: equipamento.status || "Operando",
      proxima_manutencao: equipamento.proxima_manutencao || "",
    });

    setMostrarCadastro(true);
    setEquipamentoSelecionado(null);
  }

  async function salvar
"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  Filter,
  ArrowLeft,
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

  // NÃO ALTERAR:
  // "maquina" é o nome da coluna existente no Supabase.
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

type Filtro = "total" | "operando" | "manutencao" | "abertas";

export default function EquipamentosPage() {
  const searchParams = useSearchParams();

  const [equipamentos, setEquipamentos] =
    useState<Equipamento[]>([]);

  const [manutencoes, setManutencoes] =
    useState<Manutencao[]>([]);

  const [busca, setBusca] = useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<Equipamento | null>(null);

  const [mostrarCadastro, setMostrarCadastro] =
    useState(false);

  const [editandoId, setEditandoId] =
    useState<number | null>(null);

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

  /*
   * FILTRO RECEBIDO DO DASHBOARD
   *
   * total
   * operando
   * manutencao
   * abertas
   */
  const filtroParametro =
    searchParams.get("filtro");

  const filtroAtual: Filtro =
    filtroParametro === "operando" ||
    filtroParametro === "manutencao" ||
    filtroParametro === "abertas"
      ? filtroParametro
      : "total";

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

    const [
      equipamentosResult,
      manutencoesResult,
    ] = await Promise.all([
      supabase
        .from("equipamentos")
        .select("*")
        .order("id", {
          ascending: true,
        }),

      supabase
        .from("manutencoes")
        .select("*")
        .order("id", {
          ascending: false,
        }),
    ]);

    if (equipamentosResult.error) {
      console.error(
        equipamentosResult.error
      );

      alert(
        "Erro ao carregar os equipamentos."
      );

      setCarregando(false);
      return;
    }

    if (manutencoesResult.error) {
      console.error(
        manutencoesResult.error
      );

      alert(
        "Erro ao carregar as manutenções."
      );

      setCarregando(false);
      return;
    }

    setEquipamentos(
      (equipamentosResult.data ||
        []) as Equipamento[]
    );

    setManutencoes(
      (manutencoesResult.data ||
        []) as Manutencao[]
    );

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

  function editarEquipamento(
    equipamento: Equipamento
  ) {
    setEditandoId(equipamento.id);

    setForm({
      nome: equipamento.nome || "",
      modelo: equipamento.modelo || "",
      fabricante:
        equipamento.fabricante || "",
      ano: equipamento.ano || "",
      horimetro:
        equipamento.horimetro || "",
      responsavel:
        equipamento.responsavel || "",
      localizacao:
        equipamento.localizacao || "",
      status:
        equipamento.status || "Operando",
      proxima_manutencao:
        equipamento.proxima_manutencao || "",
    });

    setMostrarCadastro(true);
    setEquipamentoSelecionado(null);
  }

  async function salvarCadastro() {
    if (!form.nome.trim()) {
      alert(
        "Informe o nome do equipamento."
      );
      return;
    }

    if (editandoId) {
      const { error } =
        await supabase
          .from("equipamentos")
          .update({
            nome: form.nome.trim(),
            modelo: form.modelo.trim(),
            fabricante:
              form.fabricante.trim(),
            ano: form.ano.trim(),
            horimetro:
              form.horimetro.trim(),
            responsavel:
              form.responsavel.trim(),
            localizacao:
              form.localizacao.trim(),
            status: form.status,
            proxima_manutencao:
              form.proxima_manutencao,
          })
          .eq("id", editandoId);

      if (error) {
        console.error(error);

        alert(
          "Erro ao atualizar o equipamento."
        );

        return;
      }
    } else {
      const { error } =
        await supabase
          .from("equipamentos")
          .insert({
            nome: form.nome.trim(),
            modelo: form.modelo.trim(),
            fabricante:
              form.fabricante.trim(),
            ano: form.ano.trim(),
            horimetro:
              form.horimetro.trim(),
            responsavel:
              form.responsavel.trim(),
            localizacao:
              form.localizacao.trim(),
            status: form.status,
            proxima_manutencao:
              form.proxima_manutencao,
            historico: [],
          });

      if (error) {
        console.error(error);

        alert(
          "Erro ao cadastrar o equipamento."
        );

        return;
      }
    }

    setMostrarCadastro(false);
    setEditandoId(null);

    await carregarDados();
  }

  async function excluirEquipamento(
    id: number
  ) {
    const confirmar =
      window.confirm(
        "Deseja realmente excluir este equipamento?\n\nO histórico de manutenção vinculado também será excluído."
      );

    if (!confirmar) return;

    const { error } =
      await supabase
        .from("equipamentos")
        .delete()
        .eq("id", id);

    if (error) {
      console.error(error);

      alert(
        "Erro ao excluir o equipamento."
      );

      return;
    }

    setEquipamentoSelecionado(null);

    await carregarDados();
  }

  function historicoDoEquipamento(
    id: number
  ) {
    return manutencoes.filter(
      (manutencao) =>
        Number(
          manutencao.equipamento_id
        ) === Number(id)
    );
  }

  /*
   * Verifica se o equipamento possui
   * pelo menos uma manutenção aberta.
   */
  function possuiManutencaoAberta(
    id: number
  ) {
    return historicoDoEquipamento(id).some(
      (manutencao) =>
        manutencao.status !==
        "Concluída"
    );
  }

  function formatarData(
    data?: string
  ) {
    if (!data) return "-";

    const partes = data.split("-");

    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return data;
  }

  function escaparHtml(
    valor: unknown
  ) {
    return String(valor ?? "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function imprimirEquipamento(
    equipamento: Equipamento
  ) {
    const historico =
      historicoDoEquipamento(
        equipamento.id
      );

    const janela =
      window.open("", "_blank");

    if (!janela) {
      alert(
        "Permita pop-ups no navegador para imprimir."
      );
      return;
    }

    const dataEmissao =
      new Date().toLocaleString(
        "pt-BR"
      );

    const historicoHtml =
      historico.length > 0
        ? historico
            .map(
              (
                manutencao,
                index
              ) => {
                const servicos =
                  Array.isArray(
                    manutencao.servicos
                  )
                    ? manutencao.servicos
                    : [];

                const servicosHtml =
                  servicos.length > 0
                    ? servicos
                        .map(
                          (
                            servico
                          ) => {
                            const fotos =
                              Array.isArray(
                                servico.fotos
                              )
                                ? servico.fotos
                                : [];

                            const fotosHtml =
                              fotos.length >
                              0
                               
"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Printer,
  X,
  Save,
  QrCode,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
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

  nome?: string;
  responsavel?: string;
  localizacao?: string;
  historico?: unknown[];
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
  servicos?: unknown[];
};

type FotoServico = {
  imagem?: string;
  url?: string;
  foto?: string;
  src?: string;
  descricao?: string;
  legenda?: string;
  nome?: string;
};

type Servico = {
  descricao?: string;
  servico?: string;
  nome?: string;
  texto?: string;
  fotos?: unknown[];
  foto?: string;
  imagem?: string;
  url?: string;
};

type FormEquipamento = {
  categoria: string;
  descricao_bem: string;
  fabricante: string;
  modelo: string;
  ano: string;
  numero_serie_chassi: string;
  placa: string;
  horimetro: string;
  status: string;
  proxima_manutencao: string;
};

const formInicial: FormEquipamento = {
  categoria: "Máquina",
  descricao_bem: "",
  fabricante: "",
  modelo: "",
  ano: "",
  numero_serie_chassi: "",
  placa: "",
  horimetro: "",
  status: "Operando",
  proxima_manutencao: "",
};

/* =========================================================
   FUNÇÕES AUXILIARES
========================================================= */

function textoSeguro(valor: unknown): string {
  if (valor === null || valor === undefined) {
    return "";
  }

  return String(valor);
}

function escaparHtml(valor: unknown): string {
  return textoSeguro(valor)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function objeto(valor: unknown): Record<string, unknown> | null {
  if (
    typeof valor === "object" &&
    valor !== null &&
    !Array.isArray(valor)
  ) {
    return valor as Record<string, unknown>;
  }

  return null;
}

function extrairTextoServico(servico: unknown): string {
  if (typeof servico === "string") {
    return servico;
  }

  const item = objeto(servico);

  if (!item) {
    return "";
  }

  const possiveis = [
    item.descricao,
    item.servico,
    item.nome,
    item.texto,
    item.descricao_servico,
    item.descricaoServico,
  ];

  for (const valor of possiveis) {
    if (typeof valor === "string" && valor.trim()) {
      return valor.trim();
    }
  }

  return "";
}

function extrairFotosServico(servico: unknown): FotoServico[] {
  const resultado: FotoServico[] = [];

  const item = objeto(servico);

  if (!item) {
    return resultado;
  }

  const adicionarFoto = (foto: unknown) => {
    if (!foto) return;

    if (typeof foto === "string") {
      if (foto.trim()) {
        resultado.push({
          imagem: foto.trim(),
        });
      }

      return;
    }

    const obj = objeto(foto);

    if (!obj) return;

    const imagem =
      typeof obj.imagem === "string"
        ? obj.imagem
        : typeof obj.url === "string"
        ? obj.url
        : typeof obj.foto === "string"
        ? obj.foto
        : typeof obj.src === "string"
        ? obj.src
        : "";

    if (!imagem) return;

    resultado.push({
      imagem,
      descricao:
        typeof obj.descricao === "string"
          ? obj.descricao
          : typeof obj.legenda === "string"
          ? obj.legenda
          : typeof obj.nome === "string"
          ? obj.nome
          : "",
    });
  };

  if (Array.isArray(item.fotos)) {
    item.fotos.forEach(adicionarFoto);
  }

  adicionarFoto(item.foto);
  adicionarFoto(item.imagem);
  adicionarFoto(item.url);

  return resultado;
}

function obterServicos(manutencao: Manutencao): Servico[] {
  if (!Array.isArray(manutencao.servicos)) {
    return [];
  }

  return manutencao.servicos as Servico[];
}

function obterTodasFotos(manutencao: Manutencao): FotoServico[] {
  const fotos: FotoServico[] = [];

  for (const servico of obterServicos(manutencao)) {
    fotos.push(...extrairFotosServico(servico));
  }

  return fotos;
}

/* =========================================================
   PÁGINA
========================================================= */

export default function EquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);

  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);

  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  const [
    equipamentoSelecionado,
    setEquipamentoSelecionado,
  ] = useState<Equipamento | null>(null);

  const [editandoId, setEditandoId] =
    useState<number | null>(null);

  const [form, setForm] =
    useState<FormEquipamento>(formInicial);

  useEffect(() => {
    carregarDados();
  }, []);

  /* =======================================================
     CARREGAR DADOS
  ======================================================= */

  async function carregarDados() {
    setCarregando(true);

    const equipamentosPromise = supabase
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
        proxima_manutencao,
        nome,
        responsavel,
        localizacao,
        historico
      `)
      .order("id", { ascending: true });

    const manutencoesPromise = supabase
      .from("manutencoes")
      .select("*")
      .order("id", { ascending: false });

    const [
      equipamentosResult,
      manutencoesResult,
    ] = await Promise.all([
      equipamentosPromise,
      manutencoesPromise,
    ]);

    if (equipamentosResult.error) {
      console.error(equipamentosResult.error);

      alert(
        "Erro ao carregar os equipamentos:\n\n" +
          equipamentosResult.error.message
      );

      setCarregando(false);
      return;
    }

    if (manutencoesResult.error) {
      console.warn(
        "Não foi possível carregar as manutenções:",
        manutencoesResult.error
      );
    }

    const equipamentosCarregados =
      (equipamentosResult.data || []) as Equipamento[];

    const manutencoesCarregadas =
      (manutencoesResult.data || []) as Manutencao[];

    setEquipamentos(equipamentosCarregados);
    setManutencoes(manutencoesCarregadas);

    /*
      ======================================================
      QR CODE

      Se a página foi aberta por:

      /maquinas?id=123

      procuramos o equipamento 123 e abrimos
      automaticamente o resumo dele.
      ======================================================
    */

    if (typeof window !== "undefined") {
      const parametros =
        new URLSearchParams(window.location.search);

      const idParametro =
        parametros.get("id");

      if (idParametro) {
        const equipamentoEncontrado =
          equipamentosCarregados.find(
            (equipamento) =>
              String(equipamento.id) ===
              String(idParametro)
          );

        if (equipamentoEncontrado) {
          setEquipamentoSelecionado(
            equipamentoEncontrado
          );
        }
      }
    }

    setCarregando(false);
  }

  /* =======================================================
     URL DO QR CODE
  ======================================================= */

  function urlResumoEquipamento(
    equipamento: Equipamento
  ): string {
    if (typeof window === "undefined") {
      return `/maquinas?id=${equipamento.id}`;
    }

    return (
      `${window.location.origin}` +
      `/maquinas?id=${equipamento.id}`
    );
  }

  /* =======================================================
     ABRIR EQUIPAMENTO
  ======================================================= */

  function abrirEquipamento(
    equipamento: Equipamento
  ) {
    setEquipamentoSelecionado(equipamento);

    if (typeof window !== "undefined") {
      const url =
        `/maquinas?id=${equipamento.id}`;

      window.history.pushState(
        {},
        "",
        url
      );
    }
  }

  /* =======================================================
     VOLTAR PARA LISTA
  ======================================================= */

  function voltarParaLista() {
    setEquipamentoSelecionado(null);

    if (typeof window !== "undefined") {
      window.history.pushState(
        {},
        "",
        "/maquinas"
      );
    }
  }

  /* =======================================================
     NOVO CADASTRO
  ======================================================= */

  function abrirNovoCadastro() {
    setEditandoId(null);
    setForm(formInicial);
    setMostrarCadastro(true);
    setEquipamentoSelecionado(null);

    if (typeof window !== "undefined") {
      window.history.pushState(
        {},
        "",
        "/maquinas"
      );
    }
  }

  /* =======================================================
     EDITAR
  ======================================================= */

  function editarEquipamento(
    equipamento: Equipamento
  ) {
    setEditandoId(equipamento.id);

    setForm({
      categoria:
        equipamento.categoria || "Máquina",

      descricao_bem:
        equipamento.descricao_bem ||
        equipamento.nome ||
        "",

      fabricante:
        equipamento.fabricante || "",

      modelo:
        equipamento.modelo || "",

      ano:
        equipamento.ano || "",

      numero_serie_chassi:
        equipamento.numero_serie_chassi || "",

      placa:
        equipamento.placa || "",

      horimetro:
        equipamento.horimetro || "",

      status:
        equipamento.status || "Operando",

      proxima_manutencao:
        equipamento.proxima_manutencao || "",
    });

    setMostrarCadastro(true);
    setEquipamentoSelecionado(null);
  }

  /* =======================================================
     SALVAR EQUIPAMENTO
  ======================================================= */

  async function salvarEquipamento() {
    if (!form.descricao_bem.trim()) {
      alert("Informe a descrição do bem.");
      return;
    }

    const dados = {
      categoria: form.categoria.trim(),

      descricao_bem:
        form.descricao_bem.trim(),

      fabricante:
        form.fabricante.trim(),

      modelo:
        form.modelo.trim(),

      ano:
        form.ano.trim(),

      numero_serie_chassi:
        form.numero_serie_chassi.trim(),

      placa:
        form.placa.trim(),

      horimetro:
        form.horimetro.trim(),

      status:
        form.status,

      proxima_manutencao:
        form.proxima_manutencao || null,

      nome:
        form.descricao_bem.trim(),
    };

    if (editandoId !== null) {
      const { error } = await supabase
        .from("equipamentos")
        .update(dados)
        .eq("id", editandoId);

      if (error) {
        console.error(error);

        alert(
          "Erro ao atualizar equipamento:\n\n" +
            error.message
        );

        return;
      }

      alert(
        "Equipamento atualizado com sucesso."
      );
    } else {
      const { error } = await supabase
        .from("equipamentos")
        .insert({
          ...dados,
          historico: [],
       
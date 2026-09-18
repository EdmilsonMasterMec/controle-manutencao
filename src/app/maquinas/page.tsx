"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

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

function verificarAlertaManutencao(
  dataStr: string
) {
  if (!dataStr) return false;

  const hoje = new Date();

  hoje.setHours(
    0,
    0,
    0,
    0
  );

  const [
    ano,
    mes,
    dia,
  ] = dataStr
    .split("-")
    .map(Number);

  const dataManut =
    new Date(
      ano,
      mes - 1,
      dia
    );

  const diffTime =
    dataManut.getTime() -
    hoje.getTime();

  const diffDays =
    Math.ceil(
      diffTime /
        (1000 *
          60 *
          60 *
          24)
    );

  return diffDays <= 7;
}

function formatarData(
  data?: string
) {
  if (!data) return "-";

  if (
    /^\d{4}-\d{2}-\d{2}$/.test(
      data
    )
  ) {
    const [
      ano,
      mes,
      dia,
    ] = data.split("-");

    return `${dia}/${mes}/${ano}`;
  }

  return data;
}

export default function MaquinasPage() {
  const router = useRouter();

  const [
    equipamentos,
    setEquipamentos,
  ] = useState<Equipamento[]>([]);

  const [
    manutencoes,
    setManutencoes,
  ] = useState<Manutencao[]>([]);

  const [
    filtroBusca,
    setFiltroBusca,
  ] = useState("");

  const [
    mostrarCadastro,
    setMostrarCadastro,
  ] = useState(false);

  const [
    equipamentoSelecionado,
    setEquipamentoSelecionado,
  ] =
    useState<Equipamento | null>(
      null
    );

  const [
    editando,
    setEditando,
  ] = useState(false);

  const [
    idEdicao,
    setIdEdicao,
  ] = useState<number | null>(
    null
  );

  const [
    carregando,
    setCarregando,
  ] = useState(true);

  const [
    nome,
    setNome,
  ] = useState("");

  const [
    modelo,
    setModelo,
  ] = useState("");

  const [
    fabricante,
    setFabricante,
  ] = useState("");

  const [
    ano,
    setAno,
  ] = useState("");

  const [
    horimetro,
    setHorimetro,
  ] = useState("");

  const [
    responsavel,
    setResponsavel,
  ] = useState("");

  const [
    localizacao,
    setLocalizacao,
  ] = useState("");

  const [
    status,
    setStatus,
  ] = useState(
    "Operando"
  );

  const [
    proximaManutencao,
    setProximaManutencao,
  ] = useState("");

  async function carregarDados() {
    setCarregando(true);

    const [
      equipamentosResponse,
      manutencoesResponse,
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

    if (
      equipamentosResponse.error
    ) {
      console.error(
        "Erro ao buscar equipamentos:",
        equipamentosResponse.error
      );

      alert(
        "Erro ao carregar equipamentos: " +
          equipamentosResponse
            .error.message
      );

      setCarregando(false);

      return;
    }

    if (
      manutencoesResponse.error
    ) {
      console.error(
        "Erro ao buscar manutenções:",
        manutencoesResponse.error
      );

      alert(
        "Erro ao carregar manutenções: " +
          manutencoesResponse
            .error.message
      );

      setCarregando(false);

      return;
    }

    const listaEquipamentos =
      equipamentosResponse.data ||
      [];

    const listaManutencoes =
      manutencoesResponse.data ||
      [];

    setEquipamentos(
      listaEquipamentos
    );

    setManutencoes(
      listaManutencoes
    );

    /*
     * Se a página foi aberta através
     * de /maquinas?id=7, seleciona
     * automaticamente o equipamento.
     */

    const params =
      new URLSearchParams(
        window.location.search
      );

    const idParam =
      params.get("id");

    if (idParam) {
      const equipamento =
        listaEquipamentos.find(
          (item: Equipamento) =>
            item.id.toString() ===
            idParam
        );

      if (equipamento) {
        setEquipamentoSelecionado(
          equipamento
        );
      }
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function salvarCadastro() {
    if (
      !nome.trim() ||
      !modelo.trim() ||
      !fabricante.trim()
    ) {
      alert(
        "Preencha Nome, Modelo e Fabricante."
      );

      return;
    }

    if (idEdicao !== null) {
      const {
        error,
      } = await supabase
        .from("equipamentos")
        .update({
          nome: nome.trim(),
          modelo: modelo.trim(),
          fabricante:
            fabricante.trim(),
          ano: ano.trim(),
          horimetro:
            horimetro.trim(),
          responsavel:
            responsavel.trim(),
          localizacao:
            localizacao.trim(),
          status,
          proxima_manutencao:
            proximaManutencao ||
            null,
        })
        .eq(
          "id",
          idEdicao
        );

      if (error) {
        console.error(error);

        alert(
          "Erro do Banco: " +
            error.message
        );

        return;
      }

      alert(
        "Equipamento atualizado com sucesso!"
      );

      limparFormulario();

      await carregarDados();

      return;
    }

    const {
      error,
    } = await supabase
      .from("equipamentos")
      .insert([
        {
          nome: nome.trim(),
          modelo: modelo.trim(),
          fabricante:
            fabricante.trim(),
          ano: ano.trim(),
          horimetro:
            horimetro.trim(),
          responsavel:
            responsavel.trim(),
          localizacao:
            localizacao.trim(),
          status,
          proxima_manutencao:
            proximaManutencao ||
            null,
          historico: [],
        },
      ]);

    if (error) {
      console.error(error);

      alert(
        "Erro do Banco: " +
          error.message
      );

      return;
    }

    alert(
      "Equipamento cadastrado com sucesso!"
    );

    limparFormulario();

    await carregarDados();
  }

  function limparFormulario() {
    setNome("");
    setModelo("");
    setFabricante("");
    setAno("");
    setHorimetro("");
    setResponsavel("");
    setLocalizacao("");
    setStatus("Operando");
    setProximaManutencao("");

    setIdEdicao(null);

    setMostrarCadastro(false);

    setEditando(false);
  }

  function iniciarEdicao(
    equipamento: Equipamento
  ) {
    setIdEdicao(
      equipamento.id
    );

    setNome(
      equipamento.nome || ""
    );

    setModelo(
      equipamento.modelo || ""
    );

    setFabricante(
      equipamento.fabricante ||
        ""
    );

    setAno(
      equipamento.ano || ""
    );

    setHorimetro(
      equipamento.horimetro ||
        ""
    );

    setResponsavel(
      equipamento.responsavel ||
        ""
    );

    setLocalizacao(
      equipamento.localizacao ||
        ""
    );

    setStatus(
      equipamento.status ||
        "Operando"
    );

    setProximaManutencao(
      equipamento.proxima_manutencao ||
        ""
    );

    setMostrarCadastro(true);

    setEditando(true);

    setEquipamentoSelecionado(
      null
    );
  }

  async function excluirEquipamento(
    id: number
  ) {
    const
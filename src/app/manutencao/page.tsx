"use client";

import { ChangeEvent, useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type Equipamento = {
  id: number;
  nome: string;
  fabricante?: string;
  modelo?: string;
  horimetro?: string;
  status?: string;
};

type FotoServico = {
  id: number;
  imagem: string;
  descricao: string;
};

type ServicoFormulario = {
  id: number;
  descricao: string;
  fotos: FotoServico[];
};

type Manutencao = {
  id: number;
  equipamento_id: number;
  maquina: string;
  tipo: string;
  mecanico: string;
  data: string;
  horimetro: string;
  prioridade: string;
  status: string;
  servicos: ServicoFormulario[];
  created_at?: string;
};

function comprimirImagem(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => {
      const imagem = new Image();

      imagem.onload = () => {
        const MAX_LARGURA = 1200;
        const MAX_ALTURA = 1000;

        let largura = imagem.width;
        let altura = imagem.height;

        if (largura > MAX_LARGURA) {
          altura = altura * (MAX_LARGURA / largura);
          largura = MAX_LARGURA;
        }

        if (altura > MAX_ALTURA) {
          largura = largura * (MAX_ALTURA / altura);
          altura = MAX_ALTURA;
        }

        const canvas = document.createElement("canvas");

        canvas.width = largura;
        canvas.height = altura;

        const contexto = canvas.getContext("2d");

        if (!contexto) {
          reject(
            new Error("Não foi possível processar a imagem.")
          );
          return;
        }

        contexto.drawImage(
          imagem,
          0,
          0,
          largura,
          altura
        );

        resolve(
          canvas.toDataURL(
            "image/jpeg",
            0.65
          )
        );
      };

      imagem.onerror = () => {
        reject(
          new Error("Erro ao carregar imagem.")
        );
      };

      imagem.src = leitor.result as string;
    };

    leitor.onerror = () => {
      reject(
        new Error("Erro ao ler arquivo.")
      );
    };

    leitor.readAsDataURL(arquivo);
  });
}

function interpretarServicos(valor: unknown): ServicoFormulario[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.map((servico: any, index: number) => ({
    id:
      Number(servico?.id) ||
      Date.now() + index,

    descricao:
      typeof servico?.descricao === "string"
        ? servico.descricao
        : "",

    fotos: Array.isArray(servico?.fotos)
      ? servico.fotos.map(
          (foto: any, fotoIndex: number) => ({
            id:
              Number(foto?.id) ||
              Date.now() + fotoIndex,

            imagem:
              typeof foto?.imagem === "string"
                ? foto.imagem
                : "",

            descricao:
              typeof foto?.descricao === "string"
                ? foto.descricao
                : "",
          })
        )
      : [],
  }));
}

export default function Manutencao() {
  const [equipamentos, setEquipamentos] =
    useState<Equipamento[]>([]);

  const [manutencoes, setManutencoes] =
    useState<Manutencao[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [equipamentoId, setEquipamentoId] =
    useState("");

  const [tipo, setTipo] =
    useState("Preventiva");

  const [mecanico, setMecanico] =
    useState("");

  const [data, setData] =
    useState("");

  const [horimetro, setHorimetro] =
    useState("");

  const [prioridade, setPrioridade] =
    useState("Média");

  const [servicos, setServicos] =
    useState<ServicoFormulario[]>([
      {
        id: Date.now(),
        descricao: "",
        fotos: [],
      },
    ]);

  async function carregarDados() {
    try {
      setCarregando(true);

      const [
        resultadoEquipamentos,
        resultadoManutencoes,
      ] = await Promise.all([
        supabase
          .from("equipamentos")
          .select("*")
          .order("nome", {
            ascending: true,
          }),

        supabase
          .from("manutencoes")
          .select("*")
          .order("created_at", {
            ascending: false,
          }),
      ]);

      if (resultadoEquipamentos.error) {
        throw resultadoEquipamentos.error;
      }

      if (resultadoManutencoes.error) {
        throw resultadoManutencoes.error;
      }

      const equipamentosCarregados =
        (resultadoEquipamentos.data ||
          []) as Equipamento[];

      const manutencoesCarregadas =
        (resultadoManutencoes.data || []).map(
          (item: any) => ({
            ...item,

            equipamento_id:
              Number(item.equipamento_id),

            servicos:
              interpretarServicos(
                item.servicos
              ),
          })
        );

      setEquipamentos(
        equipamentosCarregados
      );

      setManutencoes(
        manutencoesCarregadas
      );
    } catch (erro) {
      console.error(
        "Erro ao carregar dados:",
        erro
      );

      alert(
        "Não foi possível carregar os dados."
      );
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  function adicionarServico() {
    setServicos((atual) => [
      ...atual,
      {
        id:
          Date.now() +
          Math.floor(Math.random() * 100000),

        descricao: "",

        fotos: [],
      },
    ]);
  }

  function removerServico(id: number) {
    if (servicos.length === 1) {
      alert(
        "É necessário manter pelo menos um serviço."
      );

      return;
    }

    setServicos((atual) =>
      atual.filter(
        (servico) =>
          servico.id !== id
      )
    );
  }

  function atualizarDescricaoServico(
    id: number,
    descricao: string
  ) {
    setServicos((atual) =>
      atual.map((servico) =>
        servico.id === id
          ? {
              ...servico,
              descricao,
            }
          : servico
      )
    );
  }

  async function adicionarFoto(
    servicoId: number,
    evento: ChangeEvent<HTMLInputElement>
  ) {
    const arquivos = evento.target.files;

    if (!arquivos || arquivos.length === 0) {
      return;
    }

    try {
      const novasFotos: FotoServico[] = [];

      for (const arquivo of Array.from(
        arquivos
      )) {
        if (
          !arquivo.type.startsWith("image/")
        ) {
          alert(
            "Selecione somente arquivos de imagem."
          );

          continue;
        }

        const imagem =
          await comprimirImagem(arquivo);

        novasFotos.push({
          id:
            Date.now() +
            Math.floor(
              Math.random() * 100000
            ),

          imagem,

          descricao: "",
        });
      }

      if (novasFotos.length === 0) {
        return;
      }

      setServicos((atual) =>
        atual.map((servico) =>
          servico.id === servicoId
            ? {
                ...servico,

                fotos: [
                  ...servico.fotos,
                  ...novasFotos,
                ],
              }
            : servico
        )
      );
    } catch (erro) {
      console.error(
        "Erro ao adicionar foto:",
        erro
      );

      alert(
        "Não foi possível carregar a foto."
      );
    }

    evento.target.value = "";
  }

  function atualizarDescricaoFoto(
    servicoId: number,
    fotoId: number,
    descricao: string
  ) {
    setServicos((atual) =>
      atual.map((servico) => {
        if (
          servico.id !== servicoId
        ) {
          return servico;
        }

        return {
          ...servico,

          fotos: servico.fotos.map(
            (foto) =>
              foto.id === fotoId
                ? {
                    ...foto,
                    descricao,
                  }
                : foto
          ),
        };
      })
    );
  }

  function removerFoto(
    servicoId: number,
    fotoId: number
  ) {
    setServicos((atual) =>
      atual.map((servico) =>
        servico.id === servicoId
          ? {
              ...servico,

              fotos:
                servico.fotos.filter(
                  (foto) =>
                    foto.id !== fotoId
                ),
            }
          : servico
      )
    );
  }

  function limparFormulario() {
    setEquipamentoId("");
    setTipo("Preventiva");
    setMecanico("");
    setData("");
    setHorimetro("");
    setPrioridade("Média");

    setServicos([
      {
        id:
          Date.now() +
          Math.floor(Math.random() * 100000),

        descricao: "",

        fotos: [],
      },
    ]);
  }

  async function salvarManutencao() {
    if (salvando) {
      return;
    }

    if (!equipamentoId) {
      alert(
        "Sele
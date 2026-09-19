"use client";

import { ChangeEvent, useEffect, useState } from "react";
import {
  Truck,
  Tractor,
  Wrench,
  Camera,
  UserRound,
  CalendarDays,
  Gauge,
  CheckCircle2,
  Trash2,
  Clock3,
  AlertTriangle,
  ClipboardList,
  Plus,
  X,
  Save,
} from "lucide-react";

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
          reject(new Error("Não foi possível processar a imagem."));
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
        reject(new Error("Erro ao carregar imagem."));
      };

      imagem.src = leitor.result as string;
    };

    leitor.onerror = () => {
      reject(new Error("Erro ao ler arquivo."));
    };

    leitor.readAsDataURL(arquivo);
  });
}

function interpretarServicos(
  valor: unknown
): ServicoFormulario[] {
  if (!Array.isArray(valor)) {
    return [];
  }

  return valor.map(
    (servico: any, index: number) => ({
      id:
        Number(servico?.id) ||
        Date.now() + index,

      descricao:
        typeof servico?.descricao === "string"
          ? servico.descricao
          : "",

      fotos: Array.isArray(servico?.fotos)
        ? servico.fotos.map(
            (
              foto: any,
              fotoIndex: number
            ) => ({
              id:
                Number(foto?.id) ||
                Date.now() +
                  fotoIndex,

              imagem:
                typeof foto?.imagem === "string"
                  ? foto.imagem
                  : "",

              descricao:
                typeof foto?.descricao ===
                "string"
                  ? foto.descricao
                  : "",
            })
          )
        : [],
    })
  );
}

function equipamentoEhCaminhao(
  nome: string
) {
  const texto = nome
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return (
    texto.includes("scania") ||
    texto.includes("caminhao") ||
    texto.includes("truck") ||
    texto.includes("volvo fh") ||
    texto.includes("iveco") ||
    texto.includes("mercedes") ||
    texto.includes("daf") ||
    texto.includes("man ")
  );
}

function obterClasseTipo(tipo: string) {
  const texto = tipo
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (texto.includes("emergencial")) {
    return "historico-tipo-emergencial";
  }

  if (texto.includes("corretiva")) {
    return "historico-tipo-corretiva";
  }

  return "historico-tipo-preventiva";
}

function obterClassePrioridade(
  prioridade: string
) {
  const texto = prioridade.toLowerCase();

  if (texto.includes("urgente")) {
    return "historico-prioridade-urgente";
  }

  if (texto.includes("alta")) {
    return "historico-prioridade-alta";
  }

  if (texto.includes("baixa")) {
    return "historico-prioridade-baixa";
  }

  return "historico-prioridade-media";
}

export default function Manutencao() {
  const [equipamentos, setEquipamentos] =
    useState<Equipamento[]>([]);

  const [manutencoes, setManutencoes] =
    useState<Manutencao[]>([]);

  const [carregando, setCarregando]
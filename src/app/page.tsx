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
        });

      if (error) {
        console.error(error);

        alert(
          "Erro ao cadastrar equipamento:\n\n" +
            error.message
        );

        return;
      }

      alert(
        "Equipamento cadastrado com sucesso."
      );
    }

    setMostrarCadastro(false);
    setEditandoId(null);
    setForm(formInicial);

    await carregarDados();
  }

  /* =======================================================
     EXCLUIR
  ======================================================= */

  async function excluirEquipamento(
    id: number
  ) {
    const equipamento =
      equipamentos.find(
        (item) => item.id === id
      );

    if (!equipamento) return;

    const confirmar = window.confirm(
      `Deseja realmente excluir este equipamento?\n\n` +
        `${equipamento.fabricante} ${equipamento.modelo}\n` +
        `${equipamento.numero_serie_chassi || ""}\n\n` +
        `Esta operação não poderá ser desfeita.`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("equipamentos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);

      alert(
        "Não foi possível excluir o equipamento.\n\n" +
          error.message
      );

      return;
    }

    setEquipamentoSelecionado(null);

    await carregarDados();
  }

  /* =======================================================
     FILTRO
  ======================================================= */

  const equipamentosFiltrados = useMemo(() => {
    const texto =
      busca.trim().toLowerCase();

    if (!texto) {
      return equipamentos;
    }

    return equipamentos.filter(
      (equipamento) => {
        const dados = [
          equipamento.categoria,
          equipamento.descricao_bem,
          equipamento.fabricante,
          equipamento.modelo,
          equipamento.ano,
          equipamento.numero_serie_chassi,
          equipamento.placa,
          equipamento.horimetro,
          equipamento.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return dados.includes(texto);
      }
    );
  }, [equipamentos, busca]);

  /* =======================================================
     FORMATAR DATA
  ======================================================= */

  function formatarData(
    data?: string | null
  ) {
    if (!data) return "-";

    const partes = data.split("-");

    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return data;
  }

  /* =======================================================
     MANUTENÇÕES DO EQUIPAMENTO
  ======================================================= */

  function manutencoesDoEquipamento(
    equipamento: Equipamento
  ) {
    return manutencoes.filter(
      (manutencao) =>
        Number(manutencao.equipamento_id) ===
        Number(equipamento.id)
    );
  }

  /* =======================================================
     IMPRESSÃO DO QR CODE
  ======================================================= */

  function imprimirQrCode(
    equipamento: Equipamento
  ) {
    const qrElement =
      document.getElementById(
        `qr-code-${equipamento.id}`
      );

    if (!qrElement) {
      alert(
        "Não foi possível localizar o QR Code para impressão."
      );

      return;
    }

    const qrHtml =
      qrElement.outerHTML;

    const janela = window.open(
      "",
      "_blank",
      "width=700,height=800"
    );

    if (!janela) {
      alert(
        "Permita pop-ups no navegador para imprimir o QR Code."
      );

      return;
    }

    janela.document.write(`
      <!DOCTYPE html>

      <html lang="pt-BR">

      <head>

        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
          QR Code - ${escaparHtml(
            equipamento.descricao_bem
          )}
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            padding: 30px;

            font-family:
              Arial,
              Helvetica,
              sans-serif;

            background: #fff;

            color: #111;

            text-align: center;
          }

          .folha {
            width: 100%;
            max-width: 600px;

            margin: 0 auto;

            border:
              2px solid #111;

            border-radius: 16px;

            padding: 35px;
          }

          .empresa {
            font-size: 26px;

            font-weight: 700;

            margin-bottom: 5px;
          }

          .titulo {
            font-size: 20px;

            font-weight: 700;

            margin:
              20px 0;
          }

          .qr {
            display: flex;

            justify-content: center;

            align-items: center;

            margin:
              20px 0 25px;
          }

          .identificacao {
            border-top:
              1px solid #ddd;

            padding-top: 20px;

            text-align: left;
          }

          .linha {
            margin-bottom: 10px;
          }

          .rotulo {
            font-size: 11px;

            color: #666;

            text-transform:
              uppercase;

            font-weight: 700;
          }

          .valor {
            font-size: 16px;

            margin-top: 3px;
          }

          .instrucao {
            margin-top: 25px;

            padding-top: 15px;

            border-top:
              1px solid #ddd;

            font-size: 13px;

            color: #555;

            line-height: 1.5;
          }

          @media print {

            body {
              padding: 0;
            }

            .folha {
              border: 2px solid #111;
            }

          }

        </style>

      </head>

      <body>

        <div class="folha">

          <div class="empresa">
            MasterMec
          </div>

          <div>
            Gestão de Manutenção de Equipamentos
          </div>

          <div class="titulo">
            IDENTIFICAÇÃO DO EQUIPAMENTO
          </div>

          <div class="qr">
            ${qrHtml}
          </div>

          <div class="identificacao">

            <div class="linha">

              <div class="rotulo">
                Equipamento
              </div>

              <div class="valor">
                ${escaparHtml(
                  equipamento.descricao_bem ||
                    "-"
                )}
              </div>

            </div>

            <div class="linha">

              <div class="rotulo">
                Fabricante
              </div>

              <div class="valor">
                ${escaparHtml(
                  equipamento.fabricante ||
                    "-"
                )}
              </div>

            </div>

            <div class="linha">

              <div class="rotulo">
                Modelo
              </div>

              <div class="valor">
                ${escaparHtml(
                  equipamento.modelo ||
                    "-"
                )}
              </div>

            </div>

            <div class="linha">

              <div class="rotulo">
                Nº Série / Chassi
              </div>

              <div class="valor">
                ${escaparHtml(
                  equipamento.numero_serie_chassi ||
                    "-"
                )}
              </div>

            </div>

          </div>

          <div class="instrucao">

            Aponte a câmera do celular para o
            QR Code para abrir o resumo deste
            equipamento no sistema de
            manutenção.

          </div>

        </div>

        <script>

          window.onload = function() {

            setTimeout(
              function() {

                window.print();

              },
              500
            );

          };

        </script>

      </body>

      </html>
    `);

    janela.document.close();
  }

  /* =======================================================
     IMPRESSÃO DO RELATÓRIO
  ======================================================= */

  function imprimirEquipamento(
    equipamento: Equipamento
  ) {
    const historico =
      manutencoesDoEquipamento(
        equipamento
      );

    const janela = window.open(
      "",
      "_blank"
    );

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
                  obterServicos(
                    manutencao
                  );

                const quantidadeFotos =
                  obterTodasFotos(
                    manutencao
                  ).length;

                const servicosHtml =
                  servicos.length > 0
                    ? `
                      <div class="servicos">

                        <h4>
                          Serviços executados
                        </h4>

                        ${servicos
                          .map(
                            (
                              servico,
                              servicoIndex
                            ) => {
                              const descricao =
                                extrairTextoServico(
                                  servico
                                );

                              const fotos =
                                extrairFotosServico(
                                  servico
                                );

                              return `
                                <div class="servico">

                                  <div class="servico-titulo">
                                    Serviço ${
                                      servicoIndex +
                                      1
                                    }
                                  </div>

                                  <div class="servico-descricao">
                                    ${
                                      escaparHtml(
                                        descricao
                                      ) ||
                                      "Serviço registrado."
                                    }
                                  </div>

                                  ${
                                    fotos.length >
                                    0
                                      ? `
                                        <div class="fotos-titulo">
                                          Fotos do serviço
                                        </div>

                                        <div class="fotos-grid">
                                          ${fotos
                                            .map(
                                              (
                                                foto,
                                                fotoIndex
                                              ) => `
                                                <div class="foto-item">

                                                  <img
                                                    src="${escaparHtml(
                                                      foto.imagem
                                                    )}"
                                                    alt="Foto ${
                                                      fotoIndex +
                                                      1
                                                    } do serviço"
                                                  />

                                                  ${
                                                    foto.descricao
                                                      ? `
                                                        <div class="foto-descricao">
                                                          ${escaparHtml(
                                                            foto.descricao
                                                          )}
                                                        </div>
                                                      `
                                                      : ""
                                                  }

                                                </div>
                                              `
                                            )
                                            .join(
                                              ""
                                            )}
                                        </div>
                                      `
                                      : ""
                                  }

                                </div>
                              `;
                            }
                          )
                          .join("")}

                      </div>
                    `
                    : `
                      <div class="sem-servicos">
                        Nenhum serviço detalhado
                        registrado nesta manutenção.
                      </div>
                    `;

                return `
                  <div class="manutencao">

                    <h3>
                      Manutenção ${
                        index + 1
                      }
                    </h3>

                    <div class="grid">

                      <div>
                        <strong>Data</strong>
                        <span>
                          ${escaparHtml(
                            formatarData(
                              manutencao.data
                            )
                          )}
                        </span>
                      </div>

                      <div>
                        <strong>Tipo</strong>
                        <span>
                          ${escaparHtml(
                            manutencao.tipo ||
                              "-"
                          )}
                        </span>
                      </div>

                      <div>
                        <strong>Mecânico</strong>
                        <span>
                          ${escaparHtml(
                            manutencao.mecanico ||
                              "-"
                          )}
                        </span>
                      </div>

                      <div>
                        <strong>Horímetro</strong>
                        <span>
                          ${escaparHtml(
                            manutencao.horimetro ||
                              "-"
                          )}
                        </span>
                      </div>

                      <div>
                        <strong>Prioridade</strong>
                        <span>
                          ${escaparHtml(
                            manutencao.prioridade ||
                              "-"
                          )}
                        </span>
                      </div>

                      <div>
                        <strong>Status</strong>
                        <span>
                          ${escaparHtml(
                            manutencao.status ||
                              "-"
                          )}
                        </span>
                      </div>

                    </div>

                    ${servicosHtml}

                    ${
                      quantidadeFotos > 0
                        ? `
                          <div class="contador-fotos">
                            ${quantidadeFotos}
                            ${
                              quantidadeFotos ===
                              1
                                ? "foto"
                                : "fotos"
                            } anexada${
                              quantidadeFotos ===
                              1
                                ? ""
                                : "s"
                            }
                          </div>
                        `
                        : ""
                    }

                  </div>
                `;
              }
            )
            .join("")
        : `
            <div class="sem-historico">
              Nenhuma manutenção registrada
              para este equipamento.
            </div>
          `;

    janela.document.write(`
      <!DOCTYPE html>

      <html lang="pt-BR">

      <head>

        <meta charset="UTF-8" />

        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0"
        />

        <title>
          Relatório -
          ${escaparHtml(
            equipamento.fabricante
          )}
          ${escaparHtml(
            equipamento.modelo
          )}
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            font-family:
              Arial,
              Helvetica,
              sans-serif;

            margin: 0;
            padding: 30px;

            color: #111;
            background: white;

            font-size: 13px;
          }

          .cabecalho {
            border-bottom:
              3px solid #222;

            padding-bottom: 15px;
            margin-bottom: 25px;
          }

          .cabecalho h1 {
            margin: 0;
            font-size: 26px;
          }

          .cabecalho p {
            margin: 6px 0 0;
            color: #555;
          }

          .dados {
            display: grid;

            grid-template-columns:
              repeat(3, 1fr);

            gap: 12px;

            margin-bottom: 30px;
          }

          .campo {
            border:
              1px solid #ccc;

            padding: 10px;

            border-radius: 5px;
          }

          .campo strong {
            display: block;

            font-size: 10px;
            color: #555;

            text-transform:
              uppercase;

            margin-bottom: 5px;
          }

          .campo span {
            font-size: 14px;
          }

          .resumo {
            border:
              1px solid #ccc;

            padding: 15px;

            margin-bottom: 25px;
          }

          .manutencao {
            border:
              1px solid #bbb;

            padding: 18px;

            margin-bottom: 25px;

            page-break-inside:
              avoid;
          }

          .manutencao h3 {
            margin-top: 0;

            border-bottom:
              1px solid #ddd;

            padding-bottom: 8px;
          }

          .grid {
            display: grid;

            grid-template-columns:
              repeat(3, 1fr);

            gap: 10px;
          }

          .grid div {
            border:
              1px solid #ddd;

            padding: 9px;
          }

          .grid strong {
            display: block;

            font-size: 10px;
            color: #666;

            margin-bottom: 4px;
          }

          .grid span {
            font-size: 13px;
          }

          .servicos {
            margin-top: 20px;

            border-top:
              2px solid #ddd;

            padding-top: 15px;
          }

          .servicos h4 {
            margin:
              0 0 12px 0;

            font-size: 16px;
          }

          .servico {
            border:
              1px solid #ddd;

            border-radius: 7px;

            padding: 12px;

            margin-bottom: 15px;

            page-break-inside:
              avoid;
          }

          .servico-titulo {
            font-weight: bold;

            font-size: 13px;

            margin-bottom: 8px;
          }

          .servico-descricao {
            white-space:
              pre-wrap;

            line-height: 1.5;

            margin-bottom: 12px;
          }

          .fotos-titulo {
            font-weight: bold;

            font-size: 12px;

            margin:
              10px 0;
          }

          .fotos-grid {
            display: grid;

            grid-template-columns:
              repeat(2, 1fr);

            gap: 12px;
          }

          .foto-item {
            border:
              1px solid #ccc;

            border-radius: 6px;

            padding: 7px;

            page-break-inside:
              avoid;

            background: #fff;
          }

          .foto-item img {
            display: block;

            width: 100%;

            max-width: 100%;

            height: auto;

            max-height: 420px;

            object-fit: contain;

            border-radius: 4px;

            background: #f4f4f4;
          }

          .foto-descricao {
            font-size: 11px;

            color: #444;

            margin-top: 7px;

            line-height: 1.4;
          }

          .contador-fotos {
            margin-top: 12px;

            font-size: 11px;

            color: #666;
          }

          .sem-servicos {
            border:
              1px dashed #ccc;

            padding: 15px;

            margin-top: 15px;

            color: #666;
          }

          .sem-historico {
            border:
              1px solid #ccc;

            padding: 20px;

            text-align: center;
          }

          .rodape {
            margin-top: 35px;

            border-top:
              1px solid #ccc;

            padding-top: 10px;

            font-size: 11px;

            color: #666;
          }

          @media print {

            body {
              padding: 15px;
            }

            .manutencao {
              page-break-inside:
                auto;
            }

            .servico,
            .foto-item {
              page-break-inside:
                avoid;
            }

            img {
              print-color-adjust:
                exact;

              -webkit-print-color-adjust:
                exact;
            }

          }

          @media (max-width: 700px) {

            .dados,
            .grid,
            .fotos-grid {
              grid-template-columns:
                1fr;
            }

          }

        </style>

      </head>

      <body>

        <div class="cabecalho">

          <h1>
            MasterMec
          </h1>

          <p>
            Gestão de Manutenção de Equipamentos
          </p>

        </div>

        <h2>
          Relatório do Equipamento
        </h2>

        <div class="dados">

          <div class="campo">
            <strong>Categoria</strong>
            <span>
              ${escaparHtml(
                equipamento.categoria ||
                  "-"
              )}
            </span>
          </div>

          <div class="campo">
            <strong>Descrição do Bem</strong>
            <span>
              ${escaparHtml(
                equipamento.descricao_bem ||
                  "-"
              )}
            </span>
          </div>

          <div class="campo">
            <strong>Fabricante</strong>
            <span>
              ${escaparHtml(
                equipamento.fabricante ||
                  "-"
              )}
            </span>
          </div>

          <div class="campo">
            <strong>Modelo</strong>
            <span>
              ${escaparHtml(
                equipamento.modelo ||
                  "-"
              )}
            </span>
          </div>

          <div class="campo">
            <strong>Ano Modelo</strong>
            <span>
              ${escaparHtml(
                equipamento.ano ||
                  "-"
              )}
            </span>
          </div>

          <div class="campo">
            <strong>Nº Série / Chassi</strong>
            <span>
              ${escaparHtml(
                equipamento.numero_serie_chassi ||
                  "-"
              )}
            </span>
          </div>

          <div class="campo">
            <strong>Placa</strong>
            <span>
              ${escaparHtml(
                equipamento.placa ||
                  "-"
              )}
            </span>
          </div>

          <div class="campo">
            <strong>Horímetro</strong>
            <span>
              ${escaparHtml(
                equipamento.horimetro ||
                  "-"
              )}
            </span>
          </div>

          <div class="campo">
            <strong>Status</strong>
            <span>
              ${escaparHtml(
                equipamento.status ||
                  "-"
              )}
            </span>
          </div>

          <div class="campo">
            <strong>Próxima Manutenção</strong>
            <span>
              ${escaparHtml(
                formatarData(
                  equipamento.proxima_manutencao
                )
              )}
            </span>
          </div>

        </div>

        <div class="resumo">

          <strong>
            Total de manutenções:
            ${historico.length}
          </strong>

        </div>

        <h2>
          Histórico de Manutenção
        </h2>

        ${historicoHtml}

        <div class="rodape">

          Relatório emitido em
          ${escaparHtml(dataEmissao)}

          <br />

          MasterMec -
          Gestão de Manutenção de Equipamentos

        </div>

        <script>

          window.onload = function() {

            setTimeout(
              function() {

                window.print();

              },
              800
            );

          };

        </script>

      </body>

      </html>
    `);

    janela.document.close();
  }

  /* =======================================================
     DETALHE DO EQUIPAMENTO
  ======================================================= */

  if (equipamentoSelecionado) {
    const historico =
      manutencoesDoEquipamento(
        equipamentoSelecionado
      );

    return (
      <main className="mastermec-app">

        <div style={containerStyle}>

          <button
            onClick={voltarParaLista}
            style={voltarStyle}
          >
            ← Voltar para equipamentos
          </button>

          {/* =================================================
              CABEÇALHO DO EQUIPAMENTO
          ================================================= */}

          <div className="equipamentoCabecalho">

            <div className="equipamentoTitulo">

              <h1>
                {equipamentoSelecionado.fabricante}{" "}
                {equipamentoSelecionado.modelo}
              </h1>

              <p>
                {equipamentoSelecionado.descricao_bem}
              </p>

            </div>

            <div className="botoesCabecalho">

              <button
                onClick={() =>
                  imprimirQrCode(
                    equipamentoSelecionado
                  )
                }
                style={botaoQr}
              >
                <QrCode size={19} />
                Imprimir QR Code
              </button>

              <button
                onClick={() =>
                  imprimirEquipamento(
                    equipamentoSelecionado
                  )
                }
                style={botaoPreto}
              >
                <Printer size={19} />
                Imprimir relatório
              </button>

            </div>

          </div>

          {/* =================================================
              QR CODE — VERSÃO LIMPA
          ================================================= */}

          <div className="qrBoxLimpo">

            <div className="qrTitulo">

              <QrCode size={21} />

              <h2>
                Identificação por QR Code
              </h2>

            </div>

            <button
              type="button"
              onClick={() => {
                const qrUrl =
                  urlResumoEquipamento(
                    equipamentoSelecionado
                  );

                window.location.href =
                  qrUrl;
              }}
              title="Abrir equipamento"
              className="qrVisualLimpo"
            >

              <QRCodeSVG
                id={`qr-code-${equipamentoSelecionado.id}`}
                value={urlResumoEquipamento(
                  equipamentoSelecionado
                )}
                size={140}
                level="H"
                marginSize={3}
                bgColor="#FFFFFF"
                fgColor="#111111"
                title="QR Code do equipamento"
              />

            </button>

          </div>

          {/* =================================================
              DADOS DO EQUIPAMENTO
          ================================================= */}

          <div style={cardsStyle}>

            <InfoCard
              titulo="Categoria"
              valor={
                equipamentoSelecionado.categoria
              }
            />

            <InfoCard
              titulo="Descrição do Bem"
              valor={
                equipamentoSelecionado.descricao_bem
              }
            />

            <InfoCard
              titulo="Fabricante"
              valor={
                equipamentoSelecionado.fabricante
              }
            />

            <InfoCard
              titulo="Modelo"
              valor={
                equipamentoSelecionado.modelo
              }
            />

            <InfoCard
              titulo="Ano"
              valor={
                equipamentoSelecionado.ano
              }
            />

            <InfoCard
              titulo="Nº Série / Chassi"
              valor={
                equipamentoSelecionado.numero_serie_chassi
              }
            />

            <InfoCard
              titulo="Placa"
              valor={
                equipamentoSelecionado.placa
              }
            />

            <InfoCard
              titulo="Horímetro"
              valor={
                equipamentoSelecionado.horimetro
              }
            />

            <InfoCard
              titulo="Status"
              valor={
                equipamentoSelecionado.status
              }
            />

            <InfoCard
              titulo="Próxima Manutenção"
              valor={formatarData(
                equipamentoSelecionado.proxima_manutencao
              )}
            />

          </div>

          {/* =================================================
              HISTÓRICO
          ================================================= */}

          <div style={historicoBoxStyle}>

            <h2>
              Histórico de manutenção
            </h2>

            {historico.length === 0 ? (

              <p>
                Nenhuma manutenção registrada
                para este equipamento.
              </p>

            ) : (

              historico.map(
                (manutencao) => {

                  const servicos =
                    obterServicos(
                      manutencao
                    );

                  const fotos =
                    obterTodasFotos(
                      manutencao
                    );

                  return (
                    <div
                      key={manutencao.id}
                      style={manutencaoStyle}
                    >

                      <div
                        style={gridStyle}
                      >

                        <InfoCard
                          titulo="Data"
                          valor={formatarData(
                            manutencao.data
                          )}
                        />

                        <InfoCard
                          titulo="Tipo"
                          valor={
                            manutencao.tipo
                          }
                        />

                        <InfoCard
                          titulo="Mecânico"
                          valor={
                            manutencao.mecanico
                          }
                        />

                        <InfoCard
                          titulo="Horímetro"
                          valor={
                            manutencao.horimetro
                          }
                        />

                        <InfoCard
                          titulo="Prioridade"
                          valor={
                            manutencao.prioridade
                          }
                        />

                        <InfoCard
                          titulo="Status"
                          valor={
                            manutencao.status
                          }
                        />

                      </div>

                      {servicos.length >
                        0 && (

                        <div
                          style={{
                            marginTop:
                              "20px",
                            borderTop:
                              "1px solid #ddd",
                            paddingTop:
                              "15px",
                          }}
                        >

                          <h3>
                            Serviços executados
                          </h3>

                          {servicos.map(
                            (
                              servico,
                              index
                            ) => {

                              const descricao =
                                extrairTextoServico(
                                  servico
                                );

                              const fotosServico =
                                extrairFotosServico(
                                  servico
                                );

                              return (
                                <div
                                  key={
                                    index
                                  }
                                  style={{
                                    border:
                                      "1px solid #eee",
                                    borderRadius:
                                      "8px",
                                    padding:
                                      "12px",
                                    marginTop:
                                      "10px",
                                  }}
                                >

                                  <strong>
                                    Serviço{" "}
                                    {index +
                                      1}
                                  </strong>

                                  <p
                                    style={{
                                      whiteSpace:
                                        "pre-wrap",
                                      lineHeight:
                                        1.5,
                                    }}
                                  >
                                    {descricao ||
                                      "Serviço registrado."}
                                  </p>

                                  {fotosServico.length >
                                    0 && (

                                    <div>

                                      <strong>
                                        Fotos do serviço
                                      </strong>

                                      <div
                                        style={{
                                          display:
                                            "grid",
                                          gridTemplateColumns:
                                            "repeat(auto-fit,minmax(180px,1fr))",
                                          gap:
                                            "12px",
                                          marginTop:
                                            "10px",
                                        }}
                                      >

                                        {fotosServico.map(
                                          (
                                            foto,
                                            fotoIndex
                                          ) => (

                                            <div
                                              key={
                                                fotoIndex
                                              }
                                              style={{
                                                border:
                                                  "1px solid #ddd",
                                                borderRadius:
                                                  "8px",
                                                padding:
                                                  "8px",
                                              }}
                                            >

                                              <img
                                                src={
                                                  foto.imagem
                                                }
                                                alt={`Foto ${
                                                  fotoIndex +
                                                  1
                                                }`}
                                                style={{
                                                  width:
                                                    "100%",
                                                  maxHeight:
                                                    "300px",
                                                  objectFit:
                                                    "contain",
                                                  borderRadius:
                                                    "6px",
                                                  background:
                                                    "#f5f5f5",
                                                }}
                                              />

                                              {foto.descricao && (
                                                <p
                                                  style={{
                                                    fontSize:
                                                      "12px",
                                                    color:
                                                      "#555",
                                                  }}
                                                >
                                                  {
                                                    foto.descricao
                                                  }
                                                </p>
                                              )}

                                            </div>

                                          )
                                        )}

                                      </div>

                                    </div>

                                  )}

                                </div>
                              );
                            }
                          )}

                        </div>

                      )}

                      {fotos.length >
                        0 && (

                        <p
                          style={{
                            fontSize:
                              "12px",
                            color:
                              "#666",
                            marginTop:
                              "12px",
                          }}
                        >
                          📷{" "}
                          {fotos.length}{" "}
                          {fotos.length ===
                          1
                            ? "foto"
                            : "fotos"}{" "}
                          anexada
                          {fotos.length ===
                          1
                            ? ""
                            : "s"}
                        </p>

                      )}

                    </div>
                  );
                }
              )

            )}

          </div>

        </div>

        {/* =================================================
            RESPONSIVIDADE
        ================================================= */}

        <style jsx>{`

          .equipamentoCabecalho {
            background: rgba(255, 255, 255, 0.96);
            border-radius: 14px;
            padding: 22px;
            margin-top: 10px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            gap: 20px;
            flex-wrap: wrap;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
          }

          .equipamentoTitulo {
            min-width: 0;
          }

          .equipamentoTitulo h1 {
            margin: 0;
            color: #172033;
            font-size: 32px;
            line-height: 1.15;
          }

          .equipamentoTitulo p {
            margin: 8px 0 0;
            color: #666;
            font-size: 16px;
          }

          .botoesCabecalho {
            display: flex;
            align-items: center;
            gap: 10px;
            flex-wrap: wrap;
          }

          .qrBoxLimpo {
            background: rgba(255, 255, 255, 0.98);
            border-radius: 14px;
            padding: 18px 22px;
            margin-top: 20px;
            border: 1px solid #e5e5e5;
            box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);

            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 20px;
          }

          .qrTitulo {
            display: flex;
            align-items: center;
            gap: 10px;
            min-width: 0;
          }

          .qrTitulo h2 {
            margin: 0;
            color: #172033;
            font-size: 20px;
          }

          .qrVisualLimpo {
            border: 1px solid #ddd;
            background: #fff;
            border-radius: 10px;
            padding: 10px;
            cursor: pointer;

            display: flex;
            align-items: center;
            justify-content: center;

            flex-shrink: 0;
          }

          .qrVisualLimpo:hover {
            background: #f7f7f7;
          }

          @media (max-width: 700px) {

            .equipamentoCabecalho {
              padding: 18px;
              align-items: flex-start;
            }

            .equipamentoTitulo h1 {
              font-size: 25px;
            }

            .equipamentoTitulo p {
              font-size: 14px;
            }

            .botoesCabecalho {
              width: 100%;
              display: grid;
              grid-template-columns: 1fr;
            }

            .botoesCabecalho button {
              width: 100%;
              justify-content: center;
            }

            .qrBoxLimpo {
              padding: 16px;
              min-height: 95px;
            }

            .qrTitulo h2 {
              font-size: 17px;
            }

            .qrVisualLimpo {
              padding: 7px;
            }

            .qrVisualLimpo :global(svg) {
              width: 105px;
              height: 105px;
            }

          }

        `}</style>

      </main>
    );
  }

  /* =======================================================
     LISTA DE EQUIPAMENTOS
  ======================================================= */

  return (
    <main className="mastermec-app">

      <div style={containerStyle}>

        <div style={topoStyle}>

          <div>

            <h1 style={{ margin: 0 }}>
              Equipamentos
            </h1>

            <p
              style={{
                color: "#666",
              }}
            >
              {equipamentos.length}{" "}
              equipamentos cadastrados
              no sistema
            </p>

          </div>

          <button
            onClick={abrirNovoCadastro}
            style={botaoPreto}
          >
            <Plus size={19} />
            Novo equipamento
          </button>

        </div>

        <div style={pesquisaStyle}>

          <Search
            size={20}
            color="#777"
          />

          <input
            type="text"
            placeholder="Pesquisar equipamento, modelo, chassi, placa..."
            value={busca}
            onChange={(e) =>
              setBusca(e.target.value)
            }
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: "15px",
            }}
          />

        </div>

        {carregando ? (

          <div style={mensagemStyle}>
            Carregando equipamentos...
          </div>

        ) : equipamentosFiltrados.length ===
          0 ? (

          <div style={mensagemStyle}>
            Nenhum equipamento encontrado.
          </div>

        ) : (

          <div
            style={tabelaBoxStyle}
          >

            <table
              style={tabelaStyle}
            >

              <thead>

                <tr
                  style={
                    cabecalhoTabelaStyle
                  }
                >

                  {/* =================================================
                      NÃO EXISTE MAIS A COLUNA AÇÕES
                  ================================================= */}

                  <th style={thStyle}>
                    Fabricante
                  </th>

                  <th style={thStyle}>
                    Modelo
                  </th>

                  <th style={thStyle}>
                    Nº Série / Chassi
                  </th>

                  <th style={thStyle}>
                    Placa
                  </th>

                  <th style={thStyle}>
                    Horímetro
                  </th>

                  <th style={thStyle}>
                    Status
                  </th>

                </tr>

              </thead>

              <tbody>

                {equipamentosFiltrados.map(
                  (equipamento) => {

                    const totalManutencoes =
                      manutencoesDoEquipamento(
                        equipamento
                      ).length;

                    return (

                      <tr
                        key={
                          equipamento.id
                        }
                        style={{
                          borderTop:
                            "1px solid #eee",
                        }}
                      >

                        {/* =================================================
                            PRIMEIRA COLUNA

                            ÍCONES ACIMA
                            FABRICANTE ABAIXO
                        ================================================= */}

                        <td
                          style={{
                            ...tdStyle,
                            minWidth: "190px",
                            verticalAlign:
                              "top",
                          }}
                        >

                          {/* ÍCONES */}

                          <div
                            style={{
                              display:
                                "flex",
                              gap: "6px",
                              alignItems:
                                "center",
                              flexWrap:
                                "nowrap",
                              marginBottom:
                                "9px",
                            }}
                          >

                            {/* VISUALIZAR */}

                            <button
                              title="Visualizar"
                              onClick={() =>
                                abrirEquipamento(
                                  equipamento
                                )
                              }
                              style={
                                acaoStyle
                              }
                            >
                              <Eye
                                size={17}
                              />
                            </button>

                            {/* IMPRIMIR */}

                            <button
                              title="Imprimir relatório"
                              onClick={() =>
                                imprimirEquipamento(
                                  equipamento
                                )
                              }
                              style={{
                                ...acaoStyle,
                                background:
                                  "#222",
                                color:
                                  "#fff",
                              }}
                            >
                              <Printer
                                size={17}
                              />
                            </button>

                            {/* EDITAR */}

                            <button
                              title="Editar"
                              onClick={() =>
                                editarEquipamento(
                                  equipamento
                                )
                              }
                              style={
                                acaoStyle
                              }
                            >
                              <Pencil
                                size={17}
                              />
                            </button>

                            {/* EXCLUIR */}

                            <button
                              title="Excluir"
                              onClick={() =>
                                excluirEquipamento(
                                  equipamento.id
                                )
                              }
                              style={{
                                ...acaoStyle,
                                background:
                                  "#f8dddd",
                                color:
                                  "#b00000",
                              }}
                            >
                              <Trash2
                                size={17}
                              />
                            </button>

                          </div>

                          {/* FABRICANTE */}

                          <div
                            style={{
                              fontSize:
                                "15px",
                              fontWeight:
                                500,
                              color:
                                "#222",
                              whiteSpace:
                                "nowrap",
                            }}
                          >
                            {
                              equipamento.fabricante ||
                              "-"
                            }
                          </div>

                          {/* QUANTIDADE DE MANUTENÇÕES */}

                          {totalManutencoes >
                            0 && (

                            <small
                              style={{
                                display:
                                  "block",
                                marginTop:
                                  "5px",
                                color:
                                  "#666",
                                whiteSpace:
                                  "nowrap",
                              }}
                            >
                              {
                                totalManutencoes
                              }{" "}
                              manutenção
                              {totalManutencoes !==
                              1
                                ? "s"
                                : ""}
                            </small>

                          )}

                        </td>

                        {/* MODELO */}

                        <td
                          style={tdStyle}
                        >
                          {
                            equipamento.modelo ||
                            "-"
                          }
                        </td>

                        {/* Nº SÉRIE / CHASSI */}

                        <td
                          style={tdStyle}
                        >
                          {
                            equipamento.numero_serie_chassi ||
                            "-"
                          }
                        </td>

                        {/* PLACA */}

                        <td
                          style={tdStyle}
                        >
                          {
                            equipamento.placa ||
                            "-"
                          }
                        </td>

                        {/* HORÍMETRO */}

                        <td
                          style={tdStyle}
                        >
                          {
                            equipamento.horimetro ||
                            "-"
                          }
                        </td>

                        {/* STATUS */}

                        <td
                          style={tdStyle}
                        >

                          <span
                            style={statusStyle(
                              equipamento.status
                            )}
                          >
                            {
                              equipamento.status
                            }
                          </span>

                        </td>

                      </tr>

                    );
                  }
                )}

              </tbody>

            </table>

          </div>

        )}

        {/* =================================================
            MODAL
        ================================================= */}

        {mostrarCadastro && (

          <div
            style={
              modalFundoStyle
            }
          >

            <div
              style={
                modalStyle
              }
            >

              <div
                style={
                  modalTopoStyle
                }
              >

                <h2
                  style={{
                    margin: 0,
                  }}
                >
                  {editandoId !==
                  null
                    ? "Editar equipamento"
                    : "Novo equipamento"}
                </h2>

                <button
                  onClick={() =>
                    setMostrarCadastro(
                      false
                    )
                  }
                  style={
                    fecharStyle
                  }
                >
                  <X size={19} />
                </button>

              </div>

              <div
                style={
                  formGridStyle
                }
              >

                <Campo
                  label="Categoria"
                  value={
                    form.categoria
                  }
                  onChange={(
                    valor
                  ) =>
                    setForm({
                      ...form,
                      categoria:
                        valor,
                    })
                  }
                />

                <Campo
                  label="Descrição do Bem"
                  value={
                    form.descricao_bem
                  }
                  onChange={(
                    valor
                  ) =>
                    setForm({
                      ...form,
                      descricao_bem:
                        valor,
                    })
                  }
                />

                <Campo
                  label="Marca / Fabricante"
                  value={
                    form.fabricante
                  }
                  onChange={(
                    valor
                  ) =>
                    setForm({
                      ...form,
                      fabricante:
                        valor,
                    })
                  }
                />

                <Campo
                  label="Modelo"
                  value={
                    form.modelo
                  }
                  onChange={(
                    valor
                  ) =>
                    setForm({
                      ...form,
                      modelo:
                        valor,
                    })
                  }
                />

                <Campo
                  label="Ano Modelo"
                  value={
                    form.ano
                  }
                  onChange={(
                    valor
                  ) =>
                    setForm({
                      ...form,
                      ano: valor,
                    })
                  }
                />

                <Campo
                  label="Nº Série / Chassi"
                  value={
                    form.numero_serie_chassi
                  }
                  onChange={(
                    valor
                  ) =>
                    setForm({
                      ...form,
                      numero_serie_chassi:
                        valor,
                    })
                  }
                />

                <Campo
                  label="Placa"
                  value={
                    form.placa
                  }
                  onChange={(
                    valor
                  ) =>
                    setForm({
                      ...form,
                      placa: valor,
                    })
                  }
                />

                <Campo
                  label="Horímetro"
                  value={
                    form.horimetro
                  }
                  onChange={(
                    valor
                  ) =>
                    setForm({
                      ...form,
                      horimetro:
                        valor,
                    })
                  }
                />

                <div>

                  <label
                    style={
                      labelStyle
                    }
                  >
                    Status
                  </label>

                  <select
                    value={
                      form.status
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        status:
                          e.target
                            .value,
                      })
                    }
                    style={
                      inputStyle
                    }
                  >

                    <option value="Operando">
                      Operando
                    </option>

                    <option value="Em Manutenção">
                      Em Manutenção
                    </option>

                    <option value="Parada">
                      Parada
                    </option>

                  </select>

                </div>

                <div>

                  <label
                    style={
                      labelStyle
                    }
                  >
                    Próxima manutenção
                  </label>

                  <input
                    type="date"
                    value={
                      form.proxima_manutencao
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        proxima_manutencao:
                          e.target
                            .value,
                      })
                    }
                    style={
                      inputStyle
                    }
                  />

                </div>

              </div>

              <button
                onClick={
                  salvarEquipamento
                }
                style={{
                  ...botaoPreto,
                  width: "100%",
                  justifyContent:
                    "center",
                  marginTop:
                    "25px",
                }}
              >
                <Save size={19} />
                Salvar equipamento
              </button>

            </div>

          </div>

        )}

      </div>

    </main>
  );
}

/* =========================================================
   COMPONENTE CAMPO
========================================================= */

function Campo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (
    valor: string
  ) => void;
}) {
  return (
    <div>

      <label
        style={labelStyle}
      >
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(
            e.target.value
          )
        }
        style={inputStyle}
      />

    </div>
  );
}

/* =========================================================
   COMPONENTE INFO CARD
========================================================= */

function InfoCard({
  titulo,
  valor,
}: {
  titulo: string;
  valor?: string | null;
}) {
  return (
    <div
      style={infoCardStyle}
    >

      <strong
        style={{
          fontSize: "12px",
          color: "#666",
        }}
      >
        {titulo}
      </strong>

      <div
        style={{
          marginTop: "6px",
          fontSize: "16px",
        }}
      >
        {valor || "-"}
      </div>

    </div>
  );
}

/* =========================================================
   ESTILOS
========================================================= */

const containerStyle: React.CSSProperties = {
  padding: "25px",
  maxWidth: "1600px",
  margin: "0 auto",
};

const topoStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap",
  marginBottom: "25px",
};

const botaoPreto: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "#222",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
};

const botaoQr: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  background: "#f0f0f0",
  color: "#222",
  border: "1px solid #ccc",
  padding: "12px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
};

const voltarStyle: React.CSSProperties = {
  border: "none",
  background: "#eee",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "20px",
};

const pesquisaStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "10px 14px",
  marginBottom: "20px",
};

const mensagemStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "10px",
  padding: "40px",
  textAlign: "center",
};

const tabelaBoxStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  overflowX: "auto",
  boxShadow:
    "0 2px 10px rgba(0,0,0,.06)",
};

const tabelaStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "950px",
};

const cabecalhoTabelaStyle: React.CSSProperties = {
  background: "#f4f4f4",
  textAlign: "left",
};

const thStyle: React.CSSProperties = {
  padding: "14px",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px",
  verticalAlign: "middle",
};

const acaoStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  border: "none",
  borderRadius: "7px",
  background: "#eee",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const modalFundoStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 9999,
};

const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  padding: "25px",
  width: "100%",
  maxWidth: "800px",
  maxHeight: "90vh",
  overflowY: "auto",
};

const modalTopoStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const fecharStyle: React.CSSProperties = {
  border: "none",
  background: "#eee",
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  cursor: "pointer",
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "15px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "6px",
  padding: "11px",
  border: "1px solid #ccc",
  borderRadius: "7px",
  outline: "none",
  fontSize: "14px",
  background: "#fff",
};

const cardsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: "15px",
  marginTop: "25px",
};

const infoCardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "10px",
  padding: "15px",
  border: "1px solid #eee",
};

const historicoBoxStyle: React.CSSProperties = {
  marginTop: "30px",
  background: "#fff",
  borderRadius: "12px",
  padding: "20px",
  boxShadow:
    "0 2px 10px rgba(0,0,0,.08)",
};

const manutencaoStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "15px",
  marginTop: "15px",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(150px,1fr))",
  gap: "12px",
};

function statusStyle(
  status?: string
): React.CSSProperties {
  let background = "#f5dada";

  if (status === "Operando") {
    background = "#dff5e3";
  }

  if (status === "Em Manutenção") {
    background = "#fff0c2";
  }

  return {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    background,
    fontWeight: 600,
    fontSize: "13px",
    whiteSpace: "nowrap",
  };
}
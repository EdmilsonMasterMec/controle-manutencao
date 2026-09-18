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
    const confirmar =
      confirm(
        "Deseja realmente excluir este equipamento?\n\nAs manutenções vinculadas a ele também serão excluídas."
      );

    if (!confirmar) {
      return;
    }

    const {
      error,
    } = await supabase
      .from("equipamentos")
      .delete()
      .eq(
        "id",
        id
      );

    if (error) {
      console.error(error);

      alert(
        "Erro ao excluir: " +
          error.message
      );

      return;
    }

    if (
      equipamentoSelecionado?.id ===
      id
    ) {
      setEquipamentoSelecionado(
        null
      );
    }

    await carregarDados();
  }

  function abrirEquipamento(
    equipamento: Equipamento
  ) {
    setEquipamentoSelecionado(
      equipamento
    );

    setMostrarCadastro(false);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  function abrirRelatorio(
    equipamento: Equipamento
  ) {
    router.push(
      `/relatorios?id=${equipamento.id}`
    );
  }

  const filtrados =
    equipamentos.filter(
      (eq) => {
        const busca =
          filtroBusca
            .toLowerCase()
            .trim();

        return (
          eq.nome
            .toLowerCase()
            .includes(busca) ||

          eq.modelo
            .toLowerCase()
            .includes(busca) ||

          eq.fabricante
            .toLowerCase()
            .includes(busca) ||

          (
            eq.localizacao ||
            ""
          )
            .toLowerCase()
            .includes(busca)
        );
      }
    );

  function historicoDaMaquina(
    equipamentoId: number
  ) {
    return manutencoes.filter(
      (manutencao) =>
        Number(
          manutencao.equipamento_id
        ) ===
        Number(
          equipamentoId
        )
    );
  }

  /*
   * =====================================================
   * DETALHES DO EQUIPAMENTO
   * =====================================================
   */

  if (
    equipamentoSelecionado
  ) {
    const historico =
      historicoDaMaquina(
        equipamentoSelecionado.id
      );

    const emAlerta =
      verificarAlertaManutencao(
        equipamentoSelecionado.proxima_manutencao
      );

    const urlQr =
      `${window.location.origin}/maquinas?id=${equipamentoSelecionado.id}`;

    const qrCodeApi =
      `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(
        urlQr
      )}`;

    return (
      <main className="Robert-app">

        <div className="page-container">

          <button
            onClick={() =>
              setEquipamentoSelecionado(
                null
              )
            }
            className="voltar"
          >
            ← Voltar para Lista de Equipamentos
          </button>

          <header className="page-header">

            <div>

              <h1>
                🚜{" "}
                {
                  equipamentoSelecionado.nome
                }
              </h1>

              <p>
                {
                  equipamentoSelecionado.fabricante
                }{" "}
                -{" "}
                {
                  equipamentoSelecionado.modelo
                }{" "}
                (
                {
                  equipamentoSelecionado.ano ||
                  "-"
                }
                )
              </p>

            </div>

            <div
              style={{
                display:
                  "flex",
                gap: "10px",
                alignItems:
                  "center",
                flexWrap:
                  "wrap",
              }}
            >

              {emAlerta && (
                <span
                  style={{
                    background:
                      "rgba(255, 70, 70, 0.25)",
                    color:
                      "#ff7777",
                    padding:
                      "8px 14px",
                    borderRadius:
                      "20px",
                    fontWeight:
                      "bold",
                    fontSize:
                      "12px",
                    border:
                      "1px solid #ff7777",
                  }}
                >
                  ⚠️ ALERTA DE REVISÃO
                </span>
              )}

              <span
                className={
                  equipamentoSelecionado.status ===
                  "Operando"
                    ? "status-operando"
                    : equipamentoSelecionado.status ===
                      "Em Manutenção"
                    ? "status-manutencao"
                    : "status-parada"
                }
              >
                {
                  equipamentoSelecionado.status
                }
              </span>

            </div>

          </header>

          {/* =================================================
              QR CODE
          ================================================= */}

          <div
            className="formulario-maquina"
            style={{
              display:
                "flex",
              alignItems:
                "center",
              gap: "30px",
              flexWrap:
                "wrap",
            }}
          >

            <div>

              <img
                src={qrCodeApi}
                alt="QR Code do Equipamento"
                style={{
                  background:
                    "white",
                  padding:
                    "8px",
                  borderRadius:
                    "10px",
                  width:
                    "160px",
                  height:
                    "160px",
                }}
              />

            </div>

            <div
              style={{
                flex: 1,
              }}
            >

              <h2
                style={{
                  color:
                    "#ffb000",
                  marginBottom:
                    "8px",
                }}
              >
                QR Code de Identificação
              </h2>

              <p
                style={{
                  color:
                    "#aeb8c6",
                  fontSize:
                    "14px",
                  marginBottom:
                    "15px",
                  lineHeight:
                    "1.5",
                }}
              >
                Cole este QR Code
                diretamente no
                equipamento.
              </p>

              <div
                style={{
                  display:
                    "flex",
                  gap: "10px",
                  flexWrap:
                    "wrap",
                }}
              >

                <button
                  onClick={() =>
                    window.print()
                  }
                  className="btn-salvar"
                >
                  🖨️ Imprimir QR Code
                </button>

                <button
                  onClick={() =>
                    iniciarEdicao(
                      equipamentoSelecionado
                    )
                  }
                  className="btn-novo"
                >
                  ✏️ Modificar Dados
                </button>

                <button
                  onClick={() =>
                    abrirRelatorio(
                      equipamentoSelecionado
                    )
                  }
                  className="btn-novo"
                >
                  📊 Abrir Relatório
                </button>

              </div>

            </div>

          </div>

          {/* =================================================
              INFORMAÇÕES
          ================================================= */}

          <div
            className="cards-grid"
            style={{
              marginBottom:
                "25px",
            }}
          >

            <div className="card-premium">

              <h3>
                Localização Atual
              </h3>

              <p
                style={{
                  fontSize:
                    "20px",
                  color:
                    "white",
                  fontWeight:
                    "bold",
                }}
              >
                {
                  equipamentoSelecionado.localizacao ||
                  "Não informada"
                }
              </p>

            </div>

            <div className="card-premium">

              <h3>
                Horímetro / KM
              </h3>

              <p
                style={{
                  fontSize:
                    "22px",
                  color:
                    "white",
                  fontWeight:
                    "bold",
                }}
              >
                {
                  equipamentoSelecionado.horimetro ||
                  "-"
                }
              </p>

            </div>

            <div className="card-premium">

              <h3>
                Próxima Revisão
              </h3>

              <p
                style={{
                  fontSize:
                    "20px",
                  color:
                    emAlerta
                      ? "#ff7777"
                      : "white",
                  fontWeight:
                    "bold",
                }}
              >
                {
                  formatarData(
                    equipamentoSelecionado.proxima_manutencao
                  )
                }

                {emAlerta &&
                  " ⚠️"}

              </p>

            </div>

            <div className="card-premium">

              <h3>
                Total de Manutenções
              </h3>

              <p
                style={{
                  fontSize:
                    "22px",
                  color:
                    "white",
                  fontWeight:
                    "bold",
                }}
              >
                {
                  historico.length
                }
              </p>

            </div>

          </div>

          {/* =================================================
              HISTÓRICO REAL DO SUPABASE
          ================================================= */}

          <div className="formulario-maquina">

            <div
              style={{
                display:
                  "flex",
                justifyContent:
                  "space-between",
                alignItems:
                  "center",
                gap:
                  "15px",
                flexWrap:
                  "wrap",
                marginBottom:
                  "15px",
              }}
            >

              <div>

                <h2>
                  📋 Histórico de Manutenções e Ocorrências
                </h2>

                <p
                  style={{
                    color:
                      "#8e9bab",
                    marginTop:
                      "5px",
                  }}
                >
                  Histórico vinculado
                  diretamente pelo ID
                  do equipamento.
                </p>

              </div>

              <button
                className="btn-salvar"
                onClick={() =>
                  abrirRelatorio(
                    equipamentoSelecionado
                  )
                }
              >
                📊 Ver Relatório Completo
              </button>

            </div>

            <div className="tabela-container">

              <table>

                <thead>

                  <tr>

                    <th>
                      Data
                    </th>

                    <th>
                      Tipo
                    </th>

                    <th>
                      Serviços
                    </th>

                    <th>
                      Mecânico
                    </th>

                    <th>
                      Horímetro
                    </th>

                    <th>
                      Prioridade
                    </th>

                    <th>
                      Status
                    </th>

                  </tr>

                </thead>

                <tbody>

                  {historico.length >
                  0 ? (

                    historico.map(
                      (
                        manutencao
                      ) => (

                        <tr
                          key={
                            manutencao.id
                          }
                        >

                          <td>
                            {
                              formatarData(
                                manutencao.data
                              )
                            }
                          </td>

                          <td>
                            {
                              manutencao.tipo ||
                              "-"
                            }
                          </td>

                          <td>

                            {Array.isArray(
                              manutencao.servicos
                            )
                              ? manutencao.servicos
                                  .length
                              : 0}{" "}
                            serviço(s)

                          </td>

                          <td>
                            {
                              manutencao.mecanico ||
                              "-"
                            }
                          </td>

                          <td>
                            {
                              manutencao.horimetro ||
                              "-"
                            }
                          </td>

                          <td>
                            {
                              manutencao.prioridade ||
                              "-"
                            }
                          </td>

                          <td>
                            {
                              manutencao.status ||
                              "-"
                            }
                          </td>

                        </tr>

                      )
                    )

                  ) : (

                    <tr>

                      <td
                        colSpan={
                          7
                        }
                        style={{
                          textAlign:
                            "center",
                          color:
                            "#8e9bab",
                          padding:
                            "40px",
                        }}
                      >

                        <h3>
                          Nenhuma manutenção registrada
                        </h3>

                        <p
                          style={{
                            marginTop:
                              "8px",
                          }}
                        >
                          Este equipamento
                          ainda não possui
                          manutenção vinculada
                          ao ID{" "}
                          <strong>
                            {
                              equipamentoSelecionado.id
                            }
                          </strong>
                          .

                        </p>

                      </td>

                    </tr>

                  )}

                </tbody>

              </table>

            </div>

          </div>

          {/* =================================================
              DETALHAMENTO DOS SERVIÇOS
          ================================================= */}

          {historico.length >
            0 && (

            <div
              className="formulario-maquina"
              style={{
                marginTop:
                  "25px",
              }}
            >

              <h2>
                🔧 Detalhamento dos Serviços
              </h2>

              {historico.map(
                (
                  manutencao
                ) => (

                  <div
                    className="manutencao"
                    key={
                      `detalhe-${manutencao.id}`
                    }
                    style={{
                      marginTop:
                        "20px",
                    }}
                  >

                    <div className="manutencao-topo">

                      <div>

                        <h3>
                          🔧{" "}
                          {
                            manutencao.tipo ||
                            "Manutenção"
                          }
                        </h3>

                        <p>
                          Data:{" "}
                          {
                            formatarData(
                              manutencao.data
                            )
                          }
                        </p>

                      </div>

                      <strong>
                        {
                          manutencao.horimetro ||
                          "-"
                        }
                      </strong>

                    </div>

                    {Array.isArray(
                      manutencao.servicos
                    ) &&
                      manutencao.servicos.map(
                        (
                          servico,
                          index
                        ) => (

                          <div
                            key={
                              servico.id ??
                              index
                            }
                            style={{
                              marginTop:
                                "15px",
                              padding:
                                "15px",
                              border:
                                "1px solid rgba(255,255,255,.1)",
                              borderRadius:
                                "10px",
                            }}
                          >

                            <h4>
                              Serviço{" "}
                              {index +
                                1}
                            </h4>

                            <p
                              style={{
                                marginTop:
                                  "8px",
                                whiteSpace:
                                  "pre-wrap",
                              }}
                            >
                              {
                                servico.descricao ||
                                "Sem descrição"
                              }
                            </p>

                            {Array.isArray(
                              servico.fotos
                            ) &&
                              servico.fotos
                                .length >
                                0 && (

                                <div
                                  className="fotos-grid"
                                  style={{
                                    marginTop:
                                      "15px",
                                  }}
                                >

                                  {servico.fotos.map(
                                    (
                                      foto,
                                      fotoIndex
                                    ) => (

                                      <div
                                        className="foto-card"
                                        key={
                                          foto.id ??
                                          fotoIndex
                                        }
                                      >

                                        {foto.imagem && (
                                          <img
                                            src={
                                              foto.imagem
                                            }
                                            alt={
                                              foto.descricao ||
                                              "Foto do serviço"
                                            }
                                          />
                                        )}

                                        <p>
                                          {
                                            foto.descricao ||
                                            "Sem descrição"
                                          }
                                        </p>

                                      </div>

                                    )
                                  )}

                                </div>

                              )}

                          </div>

                        )
                      )}

                  </div>

                )
              )}

            </div>

          )}

        </div>

      </main>
    );
  }

  /*
   * =====================================================
   * LISTA DE EQUIPAMENTOS
   * =====================================================
   */

  return (
    <main className="Robert-app">

      <div className="page-container">

        <Link
          href="/"
          className="voltar"
        >
          ← Voltar à Visão Geral do Sistema
        </Link>

        <header className="page-header">

          <div>

            <h1>
              🚜 Equipamentos
            </h1>

            <p>
              Gerenciamento completo da
              frota sincronizado na nuvem.
            </p>

          </div>

          <button
            className="btn-novo"
            onClick={() => {

              if (
                mostrarCadastro
              ) {
                limparFormulario();
              } else {
                setMostrarCadastro(
                  true
                );
              }

            }}
          >
            {mostrarCadastro
              ? "Cancelar"
              : "+ Novo Equipamento"}
          </button>

        </header>

        {/* =================================================
            FORMULÁRIO
        ================================================= */}

        {mostrarCadastro && (

          <div className="formulario-maquina">

            <h2>
              {editando
                ? "Editar Equipamento"
                : "Cadastro de Novo Equipamento"}
            </h2>

            <div className="form-grid">

              <input
                value={nome}
                onChange={(e) =>
                  setNome(
                    e.target.value
                  )
                }
                placeholder="Nome/Identificação (Ex: Escavadeira 01)"
              />

              <input
                value={modelo}
                onChange={(e) =>
                  setModelo(
                    e.target.value
                  )
                }
                placeholder="Modelo (Ex: R160LC-9S)"
              />

              <input
                value={
                  fabricante
                }
                onChange={(e) =>
                  setFabricante(
                    e.target.value
                  )
                }
                placeholder="Fabricante (Ex: Hyundai)"
              />

              <input
                value={ano}
                onChange={(e) =>
                  setAno(
                    e.target.value
                  )
                }
                placeholder="Ano (Ex: 2020)"
              />

              <input
                value={
                  horimetro
                }
                onChange={(e) =>
                  setHorimetro(
                    e.target.value
                  )
                }
                placeholder="Horímetro ou KM (Ex: 8500 h)"
              />

              <input
                value={
                  responsavel
                }
                onChange={(e) =>
                  setResponsavel(
                    e.target.value
                  )
                }
                placeholder="Responsável"
              />

              <input
                value={
                  localizacao
                }
                onChange={(e) =>
                  setLocalizacao(
                    e.target.value
                  )
                }
                placeholder="Localização (Ex: Obra Indaiatuba)"
              />

              <div
                style={{
                  display:
                    "flex",
                  flexDirection:
                    "column",
                  gap:
                    "4px",
                }}
              >

                <label
                  style={{
                    fontSize:
                      "12px",
                    color:
                      "#aeb8c6",
                  }}
                >
                  Próxima Revisão / Manutenção
                </label>

                <input
                  type="date"
                  value={
                    proximaManutencao
                  }
                  onChange={(e) =>
                    setProximaManutencao(
                      e.target.value
                    )
                  }
                />

              </div>

              <select
                value={
                  status
                }
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
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

            <div className="form-botoes">

              <button
                className="btn-cancelar"
                onClick={
                  limparFormulario
                }
              >
                Cancelar
              </button>

              <button
                className="btn-salvar"
                onClick={
                  salvarCadastro
                }
              >
                {editando
                  ? "Salvar Alterações"
                  : "Salvar Equipamento"}
              </button>

            </div>

          </div>

        )}

        {/* =================================================
            BUSCA
        ================================================= */}

        <input
          className="busca-container"
          placeholder="Buscar equipamento por nome, modelo, fabricante ou localização..."
          value={
            filtroBusca
          }
          onChange={(e) =>
            setFiltroBusca(
              e.target.value
            )
          }
        />

        {/* =================================================
            TABELA
        ================================================= */}

        <div className="tabela-container">

          {carregando ? (

            <p
              style={{
                padding:
                  "40px",
                textAlign:
                  "center",
              }}
            >
              Carregando equipamentos...
            </p>

          ) : (

            <table>

              <thead>

                <tr>

                  <th>
                    Equipamento
                  </th>

                  <th>
                    Modelo
                  </th>

                  <th>
                    Localização
                  </th>

                  <th>
                    Próxima Revisão
                  </th>

                  <th>
                    Horímetro / KM
                  </th>

                  <th>
                    Manutenções
                  </th>

                  <th>
                    Status
                  </th>

                  <th>
                    Ações
                  </th>

                </tr>

              </thead>

              <tbody>

                {filtrados.map(
                  (eq) => {

                    const emAlerta =
                      verificarAlertaManutencao(
                        eq.proxima_manutencao
                      );

                    const totalManutencoes =
                      historicoDaMaquina(
                        eq.id
                      ).length;

                    return (

                      <tr
                        key={
                          eq.id
                        }
                        style={
                          emAlerta
                            ? {
                                background:
                                  "rgba(255, 70, 70, 0.08)",
                              }
                            : {}
                        }
                      >

                        <td>
                          🚜{" "}
                          {eq.nome}
                        </td>

                        <td>
                          {
                            eq.modelo
                          }
                        </td>

                        <td>
                          📍{" "}
                          {
                            eq.localizacao ||
                            "Não informada"
                          }
                        </td>

                        <td>

                          <span
                            style={
                              emAlerta
                                ? {
                                    color:
                                      "#ff7777",
                                    fontWeight:
                                      "bold",
                                  }
                                : {}
                            }
                          >

                            {
                              formatarData(
                                eq.proxima_manutencao
                              )
                            }

                            {emAlerta &&
                              " ⚠️"}

                          </span>

                        </td>

                        <td>
                          {
                            eq.horimetro ||
                            "-"
                          }
                        </td>

                        <td>

                          <strong>
                            {
                              totalManutencoes
                            }
                          </strong>

                          {" "}
                          registro(s)

                        </td>

                        <td>

                          <span
                            className={
                              eq.status ===
                              "Operando"
                                ? "status-operando"
                                : eq.status ===
                                  "Em Manutenção"
                                ? "status-manutencao"
                                : "status-parada"
                            }
                          >
                            {
                              eq.status
                            }
                          </span>

                        </td>

                        <td>

                          <div
                            style={{
                              display:
                                "flex",
                              gap:
                                "6px",
                              flexWrap:
                                "wrap",
                            }}
                          >

                            <button
                              className="btn-editar"
                              onClick={() =>
                                abrirEquipamento(
                                  eq
                                )
                              }
                              title="Visualizar"
                            >
                              👁
                            </button>

                            <button
                              className="btn-editar"
                              onClick={() =>
                                iniciarEdicao(
                                  eq
                                )
                              }
                              title="Editar"
                            >
                              ✏️
                            </button>

                            <button
                              className="btn-editar"
                              onClick={() =>
                                abrirRelatorio(
                                  eq
                                )
                              }
                              title="Relatório"
                            >
                              📊
                            </button>

                            <button
                              className="btn-excluir"
                              onClick={() =>
                                excluirEquipamento(
                                  eq.id
                                )
                              }
                              title="Excluir"
                            >
                              🗑
                            </button>

                          </div>

                        </td>

                      </tr>

                    );
                  }
                )}

                {filtrados.length ===
                  0 && (

                  <tr>

                    <td
                      colSpan={
                        8
                      }
                      style={{
                        textAlign:
                          "center",
                        padding:
                          "30px",
                        color:
                          "#8e9bab",
                      }}
                    >
                      Nenhum equipamento
                      encontrado na nuvem.
                    </td>

                  </tr>

                )}

              </tbody>

            </table>

          )}

        </div>

      </div>

    </main>
  );
}
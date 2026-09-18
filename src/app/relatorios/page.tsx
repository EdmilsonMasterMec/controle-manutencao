"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
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
  modelo?: string;
  fabricante?: string;
  ano?: string;
  horimetro?: string;
  responsavel?: string;
  localizacao?: string;
  status?: string;
  proxima_manutencao?: string;
};

export default function RelatoriosPage() {
  const searchParams = useSearchParams();

  const [equipamentos, setEquipamentos] =
    useState<Equipamento[]>([]);

  const [manutencoes, setManutencoes] =
    useState<Manutencao[]>([]);

  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<Equipamento | null>(null);

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  async function carregarDados() {
    setCarregando(true);
    setErro("");

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

    if (equipamentosResponse.error) {
      console.error(
        equipamentosResponse.error
      );

      setErro(
        "Erro ao carregar equipamentos: " +
          equipamentosResponse.error.message
      );

      setCarregando(false);
      return;
    }

    if (manutencoesResponse.error) {
      console.error(
        manutencoesResponse.error
      );

      setErro(
        "Erro ao carregar manutenções: " +
          manutencoesResponse.error.message
      );

      setCarregando(false);
      return;
    }

    const listaEquipamentos =
      equipamentosResponse.data || [];

    const listaManutencoes =
      manutencoesResponse.data || [];

    setEquipamentos(
      listaEquipamentos
    );

    setManutencoes(
      listaManutencoes
    );

    const idParam =
      searchParams.get("id");

    if (idParam) {
      const equipamento =
        listaEquipamentos.find(
          (item) =>
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
  }, [searchParams]);

  function manutencoesDoEquipamento(
    equipamentoId: number
  ) {
    return manutencoes.filter(
      (manutencao) =>
        Number(
          manutencao.equipamento_id
        ) === equipamentoId
    );
  }

  function imprimirRelatorio() {
    window.print();
  }

  function formatarData(
    data?: string
  ) {
    if (!data) return "-";

    if (
      /^\d{4}-\d{2}-\d{2}$/.test(data)
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

  if (carregando) {
    return (
      <main className="mastermec-app">
        <section className="page-container">
          <p>
            Carregando relatório...
          </p>
        </section>
      </main>
    );
  }

  return (
    <>
      <main className="mastermec-app relatorio-page">

        <section className="page-container">

          <div className="no-print">

            <Link
              href="/"
              className="voltar"
            >
              ← Voltar ao Dashboard
            </Link>

            <div className="page-header">

              <div>
                <h1>
                  📊 Relatórios
                </h1>

                <p>
                  Relatórios completos
                  das máquinas e histórico
                  de manutenção.
                </p>
              </div>

              {equipamentoSelecionado && (
                <button
                  className="btn-salvar"
                  onClick={
                    imprimirRelatorio
                  }
                >
                  🖨️ Imprimir Relatório
                </button>
              )}

            </div>

            {erro && (
              <div
                style={{
                  padding: "15px",
                  marginBottom: "20px",
                  borderRadius: "10px",
                  background:
                    "rgba(255,70,70,.12)",
                  border:
                    "1px solid #ff7777",
                  color: "#ff7777",
                }}
              >
                {erro}
              </div>
            )}

            <div className="relatorio-introducao">

              <h2>
                Selecione uma máquina
              </h2>

              <p>
                O histórico agora é
                relacionado pelo ID do
                equipamento.
              </p>

            </div>

            <div className="relatorio-maquinas-grid">

              {equipamentos.map(
                (equipamento) => {

                  const total =
                    manutencoesDoEquipamento(
                      equipamento.id
                    ).length;

                  return (
                    <button
                      key={
                        equipamento.id
                      }
                      className={
                        equipamentoSelecionado?.id ===
                        equipamento.id
                          ? "relatorio-maquina-card ativo"
                          : "relatorio-maquina-card"
                      }
                      onClick={() =>
                        setEquipamentoSelecionado(
                          equipamento
                        )
                      }
                    >

                      <div className="relatorio-card-icon">
                        🚜
                      </div>

                      <div>

                        <h3>
                          {
                            equipamento.nome
                          }
                        </h3>

                        <p>
                          {
                            equipamento.fabricante ||
                            ""
                          }{" "}
                          {
                            equipamento.modelo ||
                            ""
                          }
                        </p>

                        <span>
                          {total}{" "}
                          manutenção(ões)
                        </span>

                      </div>

                    </button>
                  );
                }
              )}

            </div>

          </div>

          {equipamentoSelecionado && (

            <div className="relatorio-documento">

              <div className="relatorio-cabecalho">

                <div>
                  <h1>
                    MasterMec
                  </h1>

                  <p>
                    Sistema Inteligente
                    de Gestão e Manutenção
                    de Máquinas
                  </p>
                </div>

                <div className="relatorio-titulo">

                  <h2>
                    RELATÓRIO TÉCNICO
                  </h2>

                  <p>
                    Emissão:{" "}
                    {new Date().toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>

                </div>

              </div>

              <div className="relatorio-linha" />

              <div className="relatorio-nome-maquina">

                <div>

                  <span>
                    RELATÓRIO DA MÁQUINA
                  </span>

                  <h2>
                    🚜{" "}
                    {
                      equipamentoSelecionado.nome
                    }
                  </h2>

                </div>

                <div className="relatorio-status">

                  <strong>
                    Status
                  </strong>

                  <span>
                    {
                      equipamentoSelecionado.status ||
                      "Sem status"
                    }
                  </span>

                </div>

              </div>

              <div className="cards-grid">

                <div className="card-premium">

                  <h3>
                    Fabricante
                  </h3>

                  <p>
                    {
                      equipamentoSelecionado.fabricante ||
                      "-"
                    }
                  </p>

                </div>

                <div className="card-premium">

                  <h3>
                    Modelo
                  </h3>

                  <p>
                    {
                      equipamentoSelecionado.modelo ||
                      "-"
                    }
                  </p>

                </div>

                <div className="card-premium">

                  <h3>
                    Ano
                  </h3>

                  <p>
                    {
                      equipamentoSelecionado.ano ||
                      "-"
                    }
                  </p>

                </div>

                <div className="card-premium">

                  <h3>
                    Horímetro
                  </h3>

                  <p>
                    {
                      equipamentoSelecionado.horimetro ||
                      "-"
                    }
                  </p>

                </div>

                <div className="card-premium">

                  <h3>
                    Localização
                  </h3>

                  <p>
                    {
                      equipamentoSelecionado.localizacao ||
                      "-"
                    }
                  </p>

                </div>

                <div className="card-premium">

                  <h3>
                    Próxima Manutenção
                  </h3>

                  <p>
                    {formatarData(
                      equipamentoSelecionado.proxima_manutencao
                    )}
                  </p>

                </div>

              </div>

              <div className="formulario-maquina">

                <h2>
                  📋 Histórico de Manutenções
                </h2>

                {(() => {

                  const historico =
                    manutencoesDoEquipamento(
                      equipamentoSelecionado.id
                    );

                  if (
                    historico.length ===
                    0
                  ) {
                    return (
                      <div
                        style={{
                          padding: "30px",
                          textAlign:
                            "center",
                        }}
                      >
                        <h3>
                          Nenhuma manutenção
                          registrada.
                        </h3>

                        <p>
                          Este equipamento
                          ainda não possui
                          manutenção vinculada
                          ao ID{" "}
                          {
                            equipamentoSelecionado.id
                          }.
                        </p>
                      </div>
                    );
                  }

                  return (
                    <div>

                      <div
                        style={{
                          marginBottom:
                            "20px",
                          fontWeight:
                            "bold",
                        }}
                      >
                        {
                          historico.length
                        }{" "}
                        registro(s)
                        encontrado(s)
                      </div>

                      {historico.map(
                        (manutencao) => (

                          <div
                            className="manutencao"
                            key={
                              manutencao.id
                            }
                            style={{
                              marginBottom:
                                "25px",
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

                            <div className="manutencao-info">

                              <p>
                                <b>
                                  Mecânico:
                                </b>
                                <br />
                                {
                                  manutencao.mecanico ||
                                  "-"
                                }
                              </p>

                              <p>
                                <b>
                                  Prioridade:
                                </b>
                                <br />
                                {
                                  manutencao.prioridade ||
                                  "-"
                                }
                              </p>

                              <p>
                                <b>
                                  Status:
                                </b>
                                <br />
                                {
                                  manutencao.status ||
                                  "-"
                                }
                              </p>

                            </div>

                            {Array.isArray(
                              manutencao.servicos
                            ) &&
                              manutencao.servicos
                                .length >
                                0 && (

                                <div
                                  style={{
                                    marginTop:
                                      "20px",
                                  }}
                                >

                                  <h3>
                                    Serviços Executados
                                  </h3>

                                  {manutencao.servicos.map(
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

                                        <strong>
                                          Serviço{" "}
                                          {index +
                                            1}
                                        </strong>

                                        <p
                                          style={{
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

                                            <div className="fotos-grid">

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

                              )}

                          </div>

                        )
                      )}

                    </div>
                  );

                })()}

              </div>

            </div>
          )}

        </section>

      </main>
    </>
  );
}
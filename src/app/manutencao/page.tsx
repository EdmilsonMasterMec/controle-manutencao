"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FotoServico = {
  id: string;
  imagem: string;
  descricao: string;
};

type HistoricoManutencao = {
  id: string | number;
  data: string;
  tipo: string;
  descricao: string;
  mecanico: string;
  status: string;
  horimetro: string;
  horasGastas?: string;
  pecas?: string;
  defeito?: string;
  fotos: FotoServico[];
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
  historico: HistoricoManutencao[];
};

export default function ManutencaoPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<Equipamento | null>(null);

  const [tipo, setTipo] = useState("Preventiva");
  const [data, setData] = useState("");
  const [horimetro, setHorimetro] = useState("");
  const [defeito, setDefeito] = useState("");
  const [descricao, setDescricao] = useState("");
  const [pecas, setPecas] = useState("");
  const [horasGastas, setHorasGastas] = useState("");
  const [mecanico, setMecanico] = useState("");
  const [status, setStatus] = useState("Concluída");

  const [fotos, setFotos] = useState<FotoServico[]>([]);
  const [salvando, setSalvando] = useState(false);

  useEffect(() => {
    carregarEquipamentos();
  }, []);

  async function carregarEquipamentos() {
    const { data, error } = await supabase
      .from("equipamentos")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error(error);
      alert("Erro ao carregar equipamentos: " + error.message);
      return;
    }

    setEquipamentos(
      (data || []).map((item: any) => ({
        ...item,
        historico: Array.isArray(item.historico)
          ? item.historico
          : [],
      }))
    );
  }

  function selecionarEquipamento(id: number) {
    const equipamento = equipamentos.find(
      (item) => item.id === id
    );

    if (!equipamento) return;

    setEquipamentoSelecionado(equipamento);

    setTipo("Preventiva");
    setData(new Date().toISOString().split("T")[0]);
    setHorimetro(equipamento.horimetro || "");
    setDefeito("");
    setDescricao("");
    setPecas("");
    setHorasGastas("");
    setMecanico("");
    setStatus("Concluída");
    setFotos([]);
  }

  async function adicionarFotos(
    event: React.ChangeEvent<HTMLInputElement>
  ) {
    const arquivos = event.target.files;

    if (!arquivos || arquivos.length === 0) {
      return;
    }

    const novasFotos: FotoServico[] = [];

    for (const arquivo of Array.from(arquivos)) {
      try {
        const extensao =
          arquivo.name.split(".").pop() || "jpg";

        const nomeArquivo =
          `${crypto.randomUUID()}.${extensao}`;

        const caminho =
          `${equipamentoSelecionado?.id || "geral"}/${nomeArquivo}`;

        const { error } = await supabase.storage
          .from("fotos-manutencao")
          .upload(caminho, arquivo, {
            cacheControl: "3600",
            upsert: false,
            contentType: arquivo.type,
          });

        if (error) {
          console.error(error);
          alert(
            "Erro ao enviar a foto: " +
              error.message
          );
          continue;
        }

        const { data } = supabase.storage
          .from("fotos-manutencao")
          .getPublicUrl(caminho);

        novasFotos.push({
          id: crypto.randomUUID(),
          imagem: data.publicUrl,
          descricao: "",
        });
      } catch (error) {
        console.error(error);
        alert("Erro ao processar uma das fotos.");
      }
    }

    setFotos((atual) => [
      ...atual,
      ...novasFotos,
    ]);

    event.target.value = "";
  }

  function atualizarDescricaoFoto(
    id: string,
    descricaoNova: string
  ) {
    setFotos((atual) =>
      atual.map((foto) =>
        foto.id === id
          ? {
              ...foto,
              descricao: descricaoNova,
            }
          : foto
      )
    );
  }

  async function removerFoto(foto: FotoServico) {
    try {
      const url = new URL(foto.imagem);

      const partes =
        url.pathname.split(
          "/fotos-manutencao/"
        );

      if (partes[1]) {
        await supabase.storage
          .from("fotos-manutencao")
          .remove([decodeURIComponent(partes[1])]);
      }
    } catch (error) {
      console.error(
        "Erro ao remover arquivo:",
        error
      );
    }

    setFotos((atual) =>
      atual.filter(
        (item) => item.id !== foto.id
      )
    );
  }

  async function salvarManutencao() {
    if (!equipamentoSelecionado) {
      alert("Selecione um equipamento.");
      return;
    }

    if (!data) {
      alert("Informe a data da manutenção.");
      return;
    }

    if (!descricao.trim()) {
      alert("Informe os serviços executados.");
      return;
    }

    if (!mecanico.trim()) {
      alert("Informe o mecânico responsável.");
      return;
    }

    setSalvando(true);

    try {
      const novaManutencao: HistoricoManutencao = {
        id: crypto.randomUUID(),
        data,
        tipo,
        descricao,
        mecanico,
        status,
        horimetro:
          horimetro ||
          equipamentoSelecionado.horimetro ||
          "",
        horasGastas,
        pecas,
        defeito,
        fotos,
      };

      const historicoAtual =
        Array.isArray(
          equipamentoSelecionado.historico
        )
          ? equipamentoSelecionado.historico
          : [];

      const novoHistorico = [
        ...historicoAtual,
        novaManutencao,
      ];

      const novoHorimetro =
        horimetro ||
        equipamentoSelecionado.horimetro;

      const { data: equipamentoAtualizado, error } =
        await supabase
          .from("equipamentos")
          .update({
            horimetro: novoHorimetro,
            historico: novoHistorico,
          })
          .eq(
            "id",
            equipamentoSelecionado.id
          )
          .select()
          .single();

      if (error) {
        console.error(error);

        alert(
          "Erro ao salvar a manutenção no banco:\n" +
            error.message
        );

        return;
      }

      const equipamentoFinal =
        equipamentoAtualizado as Equipamento;

      setEquipamentos((atual) =>
        atual.map((item) =>
          item.id === equipamentoFinal.id
            ? equipamentoFinal
            : item
        )
      );

      setEquipamentoSelecionado(
        equipamentoFinal
      );

      setTipo("Preventiva");
      setData(
        new Date()
          .toISOString()
          .split("T")[0]
      );
      setHorimetro(
        equipamentoFinal.horimetro || ""
      );
      setDefeito("");
      setDescricao("");
      setPecas("");
      setHorasGastas("");
      setMecanico("");
      setStatus("Concluída");
      setFotos([]);

      alert(
        "Manutenção e fotos salvas com sucesso!"
      );
    } finally {
      setSalvando(false);
    }
  }

  return (
    <main className="Robert-app">
      <div
        className="page-container"
        style={{
          maxWidth: "1400px",
          margin: "0 auto",
          padding: "30px",
        }}
      >
        <Link
          href="/"
          className="voltar"
        >
          ← Voltar ao Dashboard
        </Link>

        <header className="page-header">
          <div>
            <h1>🔧 Manutenção</h1>
            <p>
              Registro de manutenção,
              serviços executados e fotos.
            </p>
          </div>
        </header>

        {!equipamentoSelecionado ? (
          <section
            className="painel"
            style={{
              padding: "25px",
            }}
          >
            <h2>
              Selecione o equipamento
            </h2>

            <p
              style={{
                marginBottom: "25px",
                opacity: 0.8,
              }}
            >
              Os equipamentos abaixo são
              carregados diretamente do
              Supabase.
            </p>

            {equipamentos.length === 0 ? (
              <p>
                Nenhum equipamento cadastrado.
              </p>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "18px",
                }}
              >
                {equipamentos.map(
                  (equipamento) => (
                    <button
                      key={equipamento.id}
                      type="button"
                      onClick={() =>
                        selecionarEquipamento(
                          equipamento.id
                        )
                      }
                      style={{
                        textAlign: "left",
                        padding: "22px",
                        borderRadius: "14px",
                        border:
                          "1px solid rgba(255,255,255,.15)",
                        background:
                          "rgba(255,255,255,.05)",
                        color: "inherit",
                        cursor: "pointer",
                      }}
                    >
                      <div
                        style={{
                          fontSize: "32px",
                          marginBottom: "10px",
                        }}
                      >
                        🚜
                      </div>

                      <strong
                        style={{
                          display: "block",
                          fontSize: "18px",
                          marginBottom: "6px",
                        }}
                      >
                        {equipamento.nome}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          opacity: 0.8,
                        }}
                      >
                        {equipamento.fabricante}{" "}
                        {equipamento.modelo}
                      </span>

                      <span
                        style={{
                          display: "block",
                          marginTop: "8px",
                          fontSize: "13px",
                        }}
                      >
                        Horímetro:{" "}
                        {equipamento.horimetro ||
                          "-"}{" "}
                        h
                      </span>

                      <span
                        style={{
                          display: "block",
                          marginTop: "5px",
                          fontSize: "13px",
                        }}
                      >
                        Histórico:{" "}
                        {Array.isArray(
                          equipamento.historico
                        )
                          ? equipamento.historico
                              .length
                          : 0}{" "}
                        registro(s)
                      </span>
                    </button>
                  )
                )}
              </div>
            )}
          </section>
        ) : (
          <>
            <button
              type="button"
              onClick={() =>
                setEquipamentoSelecionado(
                  null
                )
              }
              className="voltar"
              style={{
                marginBottom: "20px",
              }}
            >
              ← Escolher outro equipamento
            </button>

            <section
              className="painel"
              style={{
                padding: "25px",
              }}
            >
              <h2>
                🚜{" "}
                {equipamentoSelecionado.nome}
              </h2>

              <p>
                {equipamentoSelecionado.fabricante}{" "}
                {equipamentoSelecionado.modelo}
              </p>

              <p>
                Horímetro atual:{" "}
                <strong>
                  {
                    equipamentoSelecionado.horimetro
                  }{" "}
                  h
                </strong>
              </p>
            </section>

            <section
              className="painel"
              style={{
                marginTop: "20px",
                padding: "25px",
              }}
            >
              <h2>
                Registrar manutenção
              </h2>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(220px, 1fr))",
                  gap: "18px",
                  marginTop: "20px",
                }}
              >
                <label>
                  Tipo de manutenção
                  <select
                    value={tipo}
                    onChange={(e) =>
                      setTipo(e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "6px",
                    }}
                  >
                    <option>
                      Preventiva
                    </option>
                    <option>
                      Corretiva
                    </option>
                  </select>
                </label>

                <label>
                  Data
                  <input
                    type="date"
                    value={data}
                    onChange={(e) =>
                      setData(e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "6px",
                    }}
                  />
                </label>

                <label>
                  Horímetro
                  <input
                    type="number"
                    value={horimetro}
                    onChange={(e) =>
                      setHorimetro(
                        e.target.value
                      )
                    }
                    placeholder="Ex: 6250"
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "6px",
                    }}
                  />
                </label>

                <label>
                  Mecânico responsável
                  <input
                    value={mecanico}
                    onChange={(e) =>
                      setMecanico(
                        e.target.value
                      )
                    }
                    placeholder="Nome do mecânico"
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "6px",
                    }}
                  />
                </label>

                <label>
                  Status
                  <select
                    value={status}
                    onChange={(e) =>
                      setStatus(e.target.value)
                    }
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "6px",
                    }}
                  >
                    <option>
                      Concluída
                    </option>
                    <option>
                      Em Andamento
                    </option>
                    <option>
                      Aguardando peças
                    </option>
                  </select>
                </label>

                <label>
                  Horas trabalhadas
                  <input
                    type="number"
                    step="0.5"
                    value={horasGastas}
                    onChange={(e) =>
                      setHorasGastas(
                        e.target.value
                      )
                    }
                    placeholder="Ex: 4.5"
                    style={{
                      width: "100%",
                      padding: "12px",
                      marginTop: "6px",
                    }}
                  />
                </label>
              </div>

              <label
                style={{
                  display: "block",
                  marginTop: "20px",
                }}
              >
                Defeito relatado
                <textarea
                  value={defeito}
                  onChange={(e) =>
                    setDefeito(
                      e.target.value
                    )
                  }
                  placeholder="Descreva o defeito informado..."
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "12px",
                    marginTop: "6px",
                  }}
                />
              </label>

              <label
                style={{
                  display: "block",
                  marginTop: "20px",
                }}
              >
                Serviços executados
                <textarea
                  value={descricao}
                  onChange={(e) =>
                    setDescricao(
                      e.target.value
                    )
                  }
                  placeholder="Descreva detalhadamente tudo que foi realizado..."
                  style={{
                    width: "100%",
                    minHeight: "140px",
                    padding: "12px",
                    marginTop: "6px",
                  }}
                />
              </label>

              <label
                style={{
                  display: "block",
                  marginTop: "20px",
                }}
              >
                Peças utilizadas
                <textarea
                  value={pecas}
                  onChange={(e) =>
                    setPecas(
                      e.target.value
                    )
                  }
                  placeholder="Liste peças, filtros, componentes e materiais..."
                  style={{
                    width: "100%",
                    minHeight: "100px",
                    padding: "12px",
                    marginTop: "6px",
                  }}
                />
              </label>

              <div
                style={{
                  marginTop: "25px",
                  padding: "20px",
                  border:
                    "1px solid rgba(255,255,255,.15)",
                  borderRadius: "14px",
                }}
              >
                <h3>
                  📷 Fotos do serviço
                </h3>

                <p
                  style={{
                    opacity: 0.75,
                    marginBottom: "15px",
                  }}
                >
                  As fotos serão enviadas
                  diretamente para o
                  Supabase.
                </p>

                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={
                    adicionarFotos
                  }
                />

                {fotos.length > 0 && (
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns:
                        "repeat(auto-fit, minmax(230px, 1fr))",
                      gap: "20px",
                      marginTop: "20px",
                    }}
                  >
                    {fotos.map((foto) => (
                      <div
                        key={foto.id}
                        style={{
                          padding: "12px",
                          border:
                            "1px solid rgba(255,255,255,.15)",
                          borderRadius: "12px",
                        }}
                      >
                        <img
                          src={foto.imagem}
                          alt="Foto da manutenção"
                          style={{
                            width: "100%",
                            height: "180px",
                            objectFit:
                              "cover",
                            borderRadius: "8px",
                            display: "block",
                          }}
                        />

                        <textarea
                          value={
                            foto.descricao
                          }
                          onChange={(e) =>
                            atualizarDescricaoFoto(
                              foto.id,
                              e.target.value
                            )
                          }
                          placeholder="Descrição desta foto..."
                          style={{
                            width: "100%",
                            minHeight: "80px",
                            marginTop: "10px",
                            padding: "10px",
                          }}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removerFoto(
                              foto
                            )
                          }
                          style={{
                            marginTop: "8px",
                            padding:
                              "8px 12px",
                          }}
                        >
                          🗑️ Remover foto
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={
                  salvarManutencao
                }
                disabled={salvando}
                className="botao-principal"
                style={{
                  marginTop: "25px",
                  padding: "15px 25px",
                }}
              >
                {salvando
                  ? "Salvando..."
                  : "💾 Salvar Manutenção"}
              </button>
            </section>

            <section
              className="painel"
              style={{
                marginTop: "20px",
                padding: "25px",
              }}
            >
              <h2>
                📋 Histórico da máquina
              </h2>

              {(
                equipamentoSelecionado.historico ||
                []
              ).length === 0 ? (
                <p>
                  Nenhuma manutenção
                  registrada.
                </p>
              ) : (
                [
                  ...equipamentoSelecionado.historico,
                ]
                  .reverse()
                  .map((manutencao) => (
                    <div
                      key={manutencao.id}
                      style={{
                        marginTop: "20px",
                        padding: "20px",
                        border:
                          "1px solid rgba(255,255,255,.15)",
                        borderRadius: "12px",
                      }}
                    >
                      <h3>
                        {manutencao.tipo}
                      </h3>

                      <p>
                        <strong>
                          Data:
                        </strong>{" "}
                        {manutencao.data}
                      </p>

                      <p>
                        <strong>
                          Mecânico:
                        </strong>{" "}
                        {
                          manutencao.mecanico
                        }
                      </p>

                      <p>
                        <strong>
                          Serviço:
                        </strong>{" "}
                        {
                          manutencao.descricao
                        }
                      </p>

                      {manutencao.fotos?.length >
                        0 && (
                        <div
                          style={{
                            display:
                              "grid",
                            gridTemplateColumns:
                              "repeat(auto-fit, minmax(180px, 1fr))",
                            gap: "15px",
                            marginTop:
                              "15px",
                          }}
                        >
                          {manutencao.fotos.map(
                            (foto) => (
                              <div
                                key={
                                  foto.id
                                }
                              >
                                <img
                                  src={
                                    foto.imagem
                                  }
                                  alt={
                                    foto.descricao
                                  }
                                  style={{
                                    width:
                                      "100%",
                                    height:
                                      "150px",
                                    objectFit:
                                      "cover",
                                    borderRadius:
                                      "8px",
                                  }}
                                />

                                {foto.descricao && (
                                  <p
                                    style={{
                                      fontSize:
                                        "13px",
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
                      )}
                    </div>
                  ))
              )}
            </section>
          </>
        )}
      </div>
    </main>
  );
}
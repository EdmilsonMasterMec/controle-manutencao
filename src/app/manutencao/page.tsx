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
        "Selecione o equipamento."
      );

      return;
    }

    if (!mecanico.trim()) {
      alert(
        "Informe o mecânico responsável."
      );

      return;
    }

    if (!data) {
      alert(
        "Informe a data da manutenção."
      );

      return;
    }

    const servicosValidos =
      servicos
        .map((servico) => ({
          ...servico,

          descricao:
            servico.descricao.trim(),

          fotos: servico.fotos.map(
            (foto) => ({
              ...foto,

              descricao:
                foto.descricao.trim(),
            })
          ),
        }))
        .filter(
          (servico) =>
            servico.descricao.length > 0
        );

    if (
      servicosValidos.length === 0
    ) {
      alert(
        "Adicione pelo menos um serviço executado."
      );

      return;
    }

    const equipamentoSelecionado =
      equipamentos.find(
        (equipamento) =>
          equipamento.id ===
          Number(equipamentoId)
      );

    if (!equipamentoSelecionado) {
      alert(
        "Equipamento não encontrado."
      );

      return;
    }

    try {
      setSalvando(true);

      /*
       * ESTE É O PONTO PRINCIPAL DA CORREÇÃO.
       *
       * A manutenção é salva diretamente
       * no Supabase.
       *
       * As fotos e suas descrições ficam
       * dentro do JSON de servicos.
       */

      const novaManutencao = {
        equipamento_id:
          equipamentoSelecionado.id,

        maquina:
          equipamentoSelecionado.nome,

        tipo,

        mecanico:
          mecanico.trim(),

        data,

        horimetro:
          horimetro.trim()
            ? `${horimetro.trim()} h`
            : "-",

        prioridade,

        status: "Em Andamento",

        servicos:
          servicosValidos,
      };

      const {
        data: manutencaoSalva,
        error: erroManutencao,
      } = await supabase
        .from("manutencoes")
        .insert(novaManutencao)
        .select("*")
        .single();

      if (erroManutencao) {
        console.error(
          "Erro ao salvar manutenção:",
          erroManutencao
        );

        throw erroManutencao;
      }

      /*
       * Atualiza o horímetro do equipamento,
       * mas NÃO mexe no status automaticamente.
       *
       * Assim, se você colocou Parada,
       * Em Manutenção ou Operando,
       * essa escolha permanece.
       */

      if (horimetro.trim()) {
        const {
          error: erroEquipamento,
        } = await supabase
          .from("equipamentos")
          .update({
            horimetro:
              `${horimetro.trim()} h`,
          })
          .eq(
            "id",
            equipamentoSelecionado.id
          );

        if (erroEquipamento) {
          console.error(
            "Manutenção salva, mas houve erro ao atualizar o horímetro:",
            erroEquipamento
          );
        }
      }

      /*
       * Coloca a manutenção recém-salva
       * imediatamente na tela.
       */

      const manutencaoFormatada: Manutencao =
        {
          ...(manutencaoSalva as any),

          equipamento_id:
            Number(
              manutencaoSalva.equipamento_id
            ),

          servicos:
            interpretarServicos(
              manutencaoSalva.servicos
            ),
        };

      setManutencoes((atual) => [
        manutencaoFormatada,
        ...atual,
      ]);

      limparFormulario();

      setMostrarFormulario(false);

      alert(
        "Manutenção salva com sucesso, incluindo fotos e descrições."
      );
    } catch (erro: any) {
      console.error(
        "Erro completo:",
        erro
      );

      alert(
        erro?.message ||
          "Não foi possível salvar a manutenção."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function concluirManutencao(
    id: number
  ) {
    try {
      const { error } =
        await supabase
          .from("manutencoes")
          .update({
            status: "Concluída",
          })
          .eq("id", id);

      if (error) {
        throw error;
      }

      setManutencoes((atual) =>
        atual.map((manutencao) =>
          manutencao.id === id
            ? {
                ...manutencao,
                status:
                  "Concluída",
              }
            : manutencao
        )
      );
    } catch (erro) {
      console.error(
        "Erro ao concluir manutenção:",
        erro
      );

      alert(
        "Não foi possível concluir a manutenção."
      );
    }
  }

  async function excluirManutencao(
    id: number
  ) {
    const confirmar = confirm(
      "Deseja realmente excluir esta manutenção?"
    );

    if (!confirmar) {
      return;
    }

    try {
      const { error } =
        await supabase
          .from("manutencoes")
          .delete()
          .eq("id", id);

      if (error) {
        throw error;
      }

      setManutencoes((atual) =>
        atual.filter(
          (manutencao) =>
            manutencao.id !== id
        )
      );
    } catch (erro) {
      console.error(
        "Erro ao excluir manutenção:",
        erro
      );

      alert(
        "Não foi possível excluir a manutenção."
      );
    }
  }

  function formatarQuantidadeFotos(
    servicos: ServicoFormulario[]
  ) {
    return servicos.reduce(
      (total, servico) =>
        total + servico.fotos.length,
      0
    );
  }

  return (
    <main className="mastermec-app">
      <section className="page-container">

        <div className="page-header">
          <div>
            <h1>🔧 Manutenção</h1>

            <p>
              Registro e histórico de manutenção
              dos equipamentos
            </p>
          </div>

          <button
            className="btn-novo"
            onClick={() =>
              setMostrarFormulario(
                (valor) => !valor
              )
            }
          >
            {mostrarFormulario
              ? "Fechar"
              : "+ Registrar Manutenção"}
          </button>
        </div>

        {mostrarFormulario && (
          <div
            className="formulario-maquina"
            style={{
              marginBottom: "30px",
            }}
          >
            <h2>
              Registrar Manutenção
            </h2>

            <div className="form-grid">

              <select
                value={equipamentoId}
                onChange={(e) =>
                  setEquipamentoId(
                    e.target.value
                  )
                }
              >
                <option value="">
                  Selecione o equipamento *
                </option>

                {equipamentos.map(
                  (equipamento) => (
                    <option
                      key={equipamento.id}
                      value={equipamento.id}
                    >
                      {equipamento.nome}
                      {" — "}
                      {equipamento.fabricante ||
                        ""}
                      {" "}
                      {equipamento.modelo ||
                        ""}
                    </option>
                  )
                )}
              </select>

              <select
                value={tipo}
                onChange={(e) =>
                  setTipo(e.target.value)
                }
              >
                <option value="Preventiva">
                  Preventiva
                </option>

                <option value="Corretiva">
                  Corretiva
                </option>
              </select>

              <input
                type="text"
                placeholder="Mecânico responsável *"
                value={mecanico}
                onChange={(e) =>
                  setMecanico(
                    e.target.value
                  )
                }
              />

              <input
                type="date"
                value={data}
                onChange={(e) =>
                  setData(e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Horímetro"
                value={horimetro}
                onChange={(e) =>
                  setHorimetro(
                    e.target.value
                  )
                }
              />

              <select
                value={prioridade}
                onChange={(e) =>
                  setPrioridade(
                    e.target.value
                  )
                }
              >
                <option value="Baixa">
                  Baixa
                </option>

                <option value="Média">
                  Média
                </option>

                <option value="Alta">
                  Alta
                </option>

                <option value="Urgente">
                  Urgente
                </option>
              </select>

            </div>

            <div
              className="servicos-container"
            >
              <div
                className="servicos-cabecalho"
              >
                <div>
                  <h3>
                    Serviços executados
                  </h3>

                  <p>
                    Adicione o serviço e as
                    fotos correspondentes.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-novo"
                  onClick={
                    adicionarServico
                  }
                >
                  + Adicionar serviço
                </button>
              </div>

              {servicos.map(
                (servico, index) => (
                  <div
                    key={servico.id}
                    style={{
                      marginBottom:
                        "25px",
                      padding: "20px",
                      border:
                        "1px solid #dbe2ea",
                      borderRadius:
                        "12px",
                      background:
                        "#ffffff",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent:
                          "space-between",
                        alignItems:
                          "center",
                        gap: "10px",
                        marginBottom:
                          "15px",
                      }}
                    >
                      <strong>
                        Serviço{" "}
                        {index + 1}
                      </strong>

                      {servicos.length >
                        1 && (
                        <button
                          type="button"
                          className="btn-excluir"
                          onClick={() =>
                            removerServico(
                              servico.id
                            )
                          }
                        >
                          🗑️
                        </button>
                      )}
                    </div>

                    <textarea
                      placeholder="Descreva o serviço executado..."
                      value={
                        servico.descricao
                      }
                      onChange={(e) =>
                        atualizarDescricaoServico(
                          servico.id,
                          e.target.value
                        )
                      }
                      style={{
                        width: "100%",
                        minHeight:
                          "100px",
                        marginBottom:
                          "15px",
                      }}
                    />

                    <div
                      style={{
                        marginBottom:
                          "15px",
                      }}
                    >
                      <label
                        style={{
                          display:
                            "inline-block",
                          padding:
                            "10px 15px",
                          borderRadius:
                            "8px",
                          background:
                            "#e8eef5",
                          cursor:
                            "pointer",
                          fontWeight: 600,
                        }}
                      >
                        📷 Adicionar fotos

                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          capture="environment"
                          onChange={(e) =>
                            adicionarFoto(
                              servico.id,
                              e
                            )
                          }
                          style={{
                            display:
                              "none",
                          }}
                        />
                      </label>
                    </div>

                    {servico.fotos.length >
                      0 && (
                      <div
                        style={{
                          display:
                            "grid",
                          gridTemplateColumns:
                            "repeat(auto-fit, minmax(220px, 1fr))",
                          gap: "15px",
                        }}
                      >
                        {servico.fotos.map(
                          (
                            foto,
                            fotoIndex
                          ) => (
                            <div
                              key={
                                foto.id
                              }
                              style={{
                                border:
                                  "1px solid #dbe2ea",
                                borderRadius:
                                  "10px",
                                padding:
                                  "10px",
                                background:
                                  "#f8fafc",
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
                                  height:
                                    "180px",
                                  objectFit:
                                    "cover",
                                  borderRadius:
                                    "8px",
                                  display:
                                    "block",
                                  marginBottom:
                                    "10px",
                                }}
                              />

                              <input
                                type="text"
                                placeholder="Descrição da foto..."
                                value={
                                  foto.descricao
                                }
                                onChange={(
                                  e
                                ) =>
                                  atualizarDescricaoFoto(
                                    servico.id,
                                    foto.id,
                                    e.target
                                      .value
                                  )
                                }
                                style={{
                                  width:
                                    "100%",
                                  marginBottom:
                                    "8px",
                                }}
                              />

                              <button
                                type="button"
                                className="btn-excluir"
                                onClick={() =>
                                  removerFoto(
                                    servico.id,
                                    foto.id
                                  )
                                }
                              >
                                🗑️ Remover foto
                              </button>
                            </div>
                          )
                        )}
                      </div>
                    )}
                  </div>
                )
              )}
            </div>

            <div
              style={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                marginTop: "20px",
              }}
            >
              <button
                type="button"
                className="btn-novo"
                onClick={
                  salvarManutencao
                }
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : "💾 Salvar manutenção"}
              </button>

              <button
                type="button"
                className="btn-secundario"
                onClick={() => {
                  limparFormulario();
                  setMostrarFormulario(
                    false
                  );
                }}
                disabled={salvando}
              >
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div className="page-header">
          <div>
            <h2>
              Histórico de Manutenções
            </h2>

            <p>
              Registros armazenados no
              Supabase
            </p>
          </div>
        </div>

        {carregando ? (
          <div className="painel">
            Carregando manutenções...
          </div>
        ) : manutencoes.length ===
          0 ? (
          <div className="painel">
            <h3>
              Nenhuma manutenção registrada.
            </h3>

            <p>
              Registre a primeira manutenção
              usando o botão acima.
            </p>
          </div>
        ) : (
          <div
            className="tabela-container"
          >
            <table>
              <thead>
                <tr>
                  <th>
                    Equipamento
                  </th>

                  <th>
                    Tipo
                  </th>

                  <th>
                    Serviços
                  </th>

                  <th>
                    Fotos
                  </th>

                  <th>
                    Mecânico
                  </th>

                  <th>
                    Data
                  </th>

                  <th>
                    Prioridade
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
                {manutencoes.map(
                  (manutencao) => (
                    <tr
                      key={
                        manutencao.id
                      }
                    >
                      <td>
                        🚜{" "}
                        {
                          manutencao.maquina
                        }
                      </td>

                      <td>
                        {manutencao.tipo}
                      </td>

                      <td>
                        <strong>
                          {
                            manutencao.servicos
                              .length
                          }{" "}
                          serviço(s)
                        </strong>

                        <div
                          style={{
                            marginTop:
                              "5px",
                          }}
                        >
                          {manutencao.servicos
                            .map(
                              (
                                servico
                              ) =>
                                servico.descricao
                            )
                            .filter(
                              Boolean
                            )
                            .join(
                              " • "
                            )}
                        </div>
                      </td>

                      <td>
                        📷{" "}
                        {formatarQuantidadeFotos(
                          manutencao.servicos
                        )}
                      </td>

                      <td>
                        👨‍🔧{" "}
                        {
                          manutencao.mecanico
                        }
                      </td>

                      <td>
                        {manutencao.data}
                      </td>

                      <td>
                        {manutencao.prioridade}
                      </td>

                      <td>
                        <span
                          className={
                            manutencao.status ===
                            "Concluída"
                              ? "status-operando"
                              : "status-manutencao"
                          }
                        >
                          {
                            manutencao.status
                          }
                        </span>
                      </td>

                      <td>
                        {manutencao.status !==
                          "Concluída" && (
                          <button
                            className="btn-concluir"
                            onClick={() =>
                              concluirManutencao(
                                manutencao.id
                              )
                            }
                            title="Concluir manutenção"
                          >
                            ✓
                          </button>
                        )}

                        <button
                          className="btn-excluir"
                          onClick={() =>
                            excluirManutencao(
                              manutencao.id
                            )
                          }
                          title="Excluir manutenção"
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}
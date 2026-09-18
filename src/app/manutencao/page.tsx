"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type Equipamento = {
  id: number;
  nome: string;
  modelo?: string;
  fabricante?: string;
  horimetro?: string;
};

type Foto = {
  id: number;
  imagem: string;
  descricao: string;
};

type Servico = {
  id: number;
  descricao: string;
  fotos: Foto[];
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
  servicos: Servico[];
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
          altura *= MAX_LARGURA / largura;
          largura = MAX_LARGURA;
        }

        if (altura > MAX_ALTURA) {
          largura *= MAX_ALTURA / altura;
          altura = MAX_ALTURA;
        }

        const canvas = document.createElement("canvas");

        canvas.width = largura;
        canvas.height = altura;

        const contexto = canvas.getContext("2d");

        if (!contexto) {
          reject(new Error("Erro ao processar imagem."));
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
      reject(new Error("Erro ao ler imagem."));
    };

    leitor.readAsDataURL(arquivo);
  });
}

export default function ManutencaoPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);

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

  const [status, setStatus] =
    useState("Em Andamento");

  const [servicos, setServicos] =
    useState<Servico[]>([
      {
        id: Date.now(),
        descricao: "",
        fotos: [],
      },
    ]);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

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

    if (equipamentosResponse.error) {
      console.error(
        "Erro equipamentos:",
        equipamentosResponse.error
      );
      alert(
        "Erro ao carregar equipamentos: " +
          equipamentosResponse.error.message
      );
    } else {
      setEquipamentos(
        equipamentosResponse.data || []
      );
    }

    if (manutencoesResponse.error) {
      console.error(
        "Erro manutenções:",
        manutencoesResponse.error
      );

      alert(
        "Erro ao carregar manutenções: " +
          manutencoesResponse.error.message
      );
    } else {
      setManutencoes(
        manutencoesResponse.data || []
      );
    }

    setCarregando(false);
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
        "A manutenção precisa ter pelo menos um serviço."
      );
      return;
    }

    setServicos((atual) =>
      atual.filter(
        (servico) => servico.id !== id
      )
    );
  }

  function atualizarServico(
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
    evento: React.ChangeEvent<HTMLInputElement>
  ) {
    const arquivos = evento.target.files;

    if (!arquivos) return;

    try {
      const novasFotos: Foto[] = [];

      for (const arquivo of Array.from(arquivos)) {
        if (!arquivo.type.startsWith("image/")) {
          alert(
            "Selecione somente imagens."
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
      console.error(erro);

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
        if (servico.id !== servicoId) {
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
    setStatus("Em Andamento");

    setServicos([
      {
        id: Date.now(),
        descricao: "",
        fotos: [],
      },
    ]);
  }

  async function salvarManutencao() {
    const servicosValidos =
      servicos.filter(
        (servico) =>
          servico.descricao.trim().length > 0
      );

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

    if (servicosValidos.length === 0) {
      alert(
        "Adicione pelo menos um serviço executado."
      );
      return;
    }

    const equipamento =
      equipamentos.find(
        (item) =>
          item.id.toString() ===
          equipamentoId
      );

    if (!equipamento) {
      alert(
        "Equipamento não encontrado."
      );
      return;
    }

    setSalvando(true);

    const nomeMaquina =
      equipamento.nome;

    const horimetroFinal =
      horimetro.trim()
        ? `${horimetro.trim()} h`
        : equipamento.horimetro || "-";

    const { error } =
      await supabase
        .from("manutencoes")
        .insert([
          {
            equipamento_id:
              equipamento.id,

            maquina:
              nomeMaquina,

            tipo,

            mecanico:
              mecanico.trim(),

            data,

            horimetro:
              horimetroFinal,

            prioridade,

            status,

            servicos:
              servicosValidos,
          },
        ]);

    if (error) {
      console.error(
        "Erro ao salvar:",
        error
      );

      alert(
        "Erro ao salvar manutenção:\n" +
          error.message
      );

      setSalvando(false);
      return;
    }

    // Atualiza o horímetro do equipamento
    if (horimetro.trim()) {
      const { error: erroHorimetro } =
        await supabase
          .from("equipamentos")
          .update({
            horimetro:
              horimetroFinal,
          })
          .eq(
            "id",
            equipamento.id
          );

      if (erroHorimetro) {
        console.error(
          "Erro ao atualizar horímetro:",
          erroHorimetro
        );
      }
    }

    limparFormulario();

    setMostrarFormulario(false);

    await carregarDados();

    setSalvando(false);

    alert(
      "Manutenção registrada com sucesso!"
    );
  }

  async function concluirManutencao(
    id: number
  ) {
    const { error } =
      await supabase
        .from("manutencoes")
        .update({
          status: "Concluída",
        })
        .eq("id", id);

    if (error) {
      alert(
        "Erro ao concluir: " +
          error.message
      );
      return;
    }

    carregarDados();
  }

  async function excluirManutencao(
    id: number
  ) {
    if (
      !confirm(
        "Deseja realmente excluir esta manutenção?"
      )
    ) {
      return;
    }

    const { error } =
      await supabase
        .from("manutencoes")
        .delete()
        .eq("id", id);

    if (error) {
      alert(
        "Erro ao excluir: " +
          error.message
      );
      return;
    }

    carregarDados();
  }

  function nomeEquipamento(
    id: number
  ) {
    const equipamento =
      equipamentos.find(
        (item) =>
          item.id === id
      );

    return (
      equipamento?.nome ||
      "Equipamento"
    );
  }

  return (
    <main className="mastermec-app">
      <section className="page-container">

        <Link
          href="/"
          className="voltar"
        >
          ← Voltar ao Dashboard
        </Link>

        <div className="page-header">
          <div>
            <h1>
              🔧 Manutenção
            </h1>

            <p>
              Controle completo das
              manutenções da frota
            </p>
          </div>

          <button
            className="btn-novo"
            onClick={() =>
              setMostrarFormulario(
                !mostrarFormulario
              )
            }
          >
            {mostrarFormulario
              ? "Fechar"
              : "+ Nova Manutenção"}
          </button>
        </div>

        {mostrarFormulario && (
          <div className="formulario-maquina">

            <h2>
              Nova Manutenção
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
                  Selecione o equipamento
                </option>

                {equipamentos.map(
                  (equipamento) => (
                    <option
                      key={
                        equipamento.id
                      }
                      value={
                        equipamento.id
                      }
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
                  setTipo(
                    e.target.value
                  )
                }
              >
                <option>
                  Preventiva
                </option>

                <option>
                  Corretiva
                </option>

                <option>
                  Emergencial
                </option>

                <option>
                  Inspeção
                </option>
              </select>

              <input
                type="text"
                placeholder="Mecânico responsável"
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
                  setData(
                    e.target.value
                  )
                }
              />

              <input
                type="number"
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
                <option>
                  Baixa
                </option>

                <option>
                  Média
                </option>

                <option>
                  Alta
                </option>

                <option>
                  Urgente
                </option>
              </select>

              <select
                value={status}
                onChange={(e) =>
                  setStatus(
                    e.target.value
                  )
                }
              >
                <option>
                  Em Andamento
                </option>

                <option>
                  Concluída
                </option>

                <option>
                  Cancelada
                </option>
              </select>

            </div>

            <div className="servicos-container">

              <div className="servicos-cabecalho">

                <div>
                  <h3>
                    🔧 Serviços Executados
                  </h3>

                  <p>
                    Registre cada serviço
                    separadamente.
                  </p>
                </div>

                <button
                  type="button"
                  className="btn-adicionar-servico"
                  onClick={
                    adicionarServico
                  }
                >
                  ＋ Adicionar Serviço
                </button>

              </div>

              {servicos.map(
                (
                  servico,
                  index
                ) => (

                  <div
                    className="servico-card"
                    key={
                      servico.id
                    }
                  >

                    <div className="servico-topo">

                      <h4>
                        Serviço{" "}
                        {index + 1}
                      </h4>

                      {servicos.length >
                        1 && (
                        <button
                          type="button"
                          className="btn-remover-servico"
                          onClick={() =>
                            removerServico(
                              servico.id
                            )
                          }
                        >
                          🗑️ Remover
                        </button>
                      )}

                    </div>

                    <label>
                      Descrição do serviço
                    </label>

                    <textarea
                      className="textarea-servico"
                      value={
                        servico.descricao
                      }
                      onChange={(e) =>
                        atualizarServico(
                          servico.id,
                          e.target.value
                        )
                      }
                      placeholder="Descreva detalhadamente o serviço executado..."
                    />

                    <div className="fotos-servico">

                      <div className="fotos-titulo">

                        <div>
                          <strong>
                            📷 Fotos
                          </strong>

                          <small>
                            Adicione as fotos
                            deste serviço.
                          </small>
                        </div>

                        <label className="btn-adicionar-foto">

                          📷 Adicionar Foto

                          <input
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) =>
                              adicionarFoto(
                                servico.id,
                                e
                              )
                            }
                          />

                        </label>

                      </div>

                      {servico.fotos.length >
                        0 && (

                        <div className="fotos-grid">

                          {servico.fotos.map(
                            (foto) => (

                              <div
                                className="foto-edicao"
                                key={
                                  foto.id
                                }
                              >

                                <img
                                  src={
                                    foto.imagem
                                  }
                                  alt="Foto do serviço"
                                />

                                <textarea
                                  value={
                                    foto.descricao
                                  }
                                  onChange={(e) =>
                                    atualizarDescricaoFoto(
                                      servico.id,
                                      foto.id,
                                      e.target.value
                                    )
                                  }
                                  placeholder="Descrição da foto..."
                                />

                                <button
                                  type="button"
                                  className="btn-remover-foto"
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

                  </div>
                )
              )}

            </div>

            <div className="form-botoes">

              <button
                className="btn-cancelar"
                onClick={() => {
                  limparFormulario();
                  setMostrarFormulario(
                    false
                  );
                }}
              >
                Cancelar
              </button>

              <button
                className="btn-salvar"
                onClick={
                  salvarManutencao
                }
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : "Registrar Manutenção"}
              </button>

            </div>

          </div>
        )}

        <div className="tabela-container">

          {carregando ? (
            <p
              style={{
                padding: "30px",
                textAlign: "center",
              }}
            >
              Carregando manutenções...
            </p>
          ) : (
            <table>

              <thead>
                <tr>
                  <th>
                    Máquina
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

                {manutencoes.length ===
                0 ? (
                  <tr>
                    <td
                      colSpan={8}
                      style={{
                        textAlign:
                          "center",
                        padding:
                          "40px",
                      }}
                    >
                      Nenhuma manutenção
                      registrada.
                    </td>
                  </tr>
                ) : (
                  manutencoes.map(
                    (manutencao) => (

                      <tr
                        key={
                          manutencao.id
                        }
                      >

                        <td>
                          🚜{" "}
                          {nomeEquipamento(
                            manutencao.equipamento_id
                          )}
                        </td>

                        <td>
                          {manutencao.tipo}
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
                            manutencao.mecanico
                          }
                        </td>

                        <td>
                          {manutencao.data}
                        </td>

                        <td>
                          {
                            manutencao.prioridade
                          }
                        </td>

                        <td>
                          {
                            manutencao.status
                          }
                        </td>

                        <td
                          style={{
                            display:
                              "flex",
                            gap: "6px",
                          }}
                        >

                          {manutencao.status !==
                            "Concluída" && (
                            <button
                              className="btn-editar"
                              onClick={() =>
                                concluirManutencao(
                                  manutencao.id
                                )
                              }
                              title="Concluir"
                            >
                              ✅
                            </button>
                          )}

                          <button
                            className="btn-excluir"
                            onClick={() =>
                              excluirManutencao(
                                manutencao.id
                              )
                            }
                            title="Excluir"
                          >
                            🗑
                          </button>

                        </td>

                      </tr>
                    )
                  )
                )}

              </tbody>

            </table>
          )}

        </div>

      </section>
    </main>
  );
}
"use client";

import Link from "next/link";
import { ChangeEvent, useState } from "react";
import {
  carregarMaquinas,
  salvarMaquinas,
  Maquina,
  HistoricoManutencao,
  FotoServico,
} from "../../lib/store";

interface ServicoFormulario {
  id: number;
  descricao: string;
  fotos: FotoServico[];
}

interface Manutencao {
  id: number;
  maquina: string;
  tipo: string;
  mecanico: string;
  data: string;
  horimetro: string;
  prioridade: string;
  status: string;
  servicos: ServicoFormulario[];
}

function gerarId() {
  return Date.now() + Math.floor(Math.random() * 100000);
}

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
            0.7
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

export default function Manutencao() {
  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [manutencoes, setManutencoes] =
    useState<Manutencao[]>([
      {
        id: 1,
        maquina: "Retroescavadeira",
        tipo: "Corretiva",
        mecanico: "João Silva",
        data: "07/09/2026",
        horimetro: "6.200 h",
        prioridade: "Alta",
        status: "Em Andamento",
        servicos: [
          {
            id: 1,
            descricao:
              "Reparo no sistema hidráulico",
            fotos: [],
          },
        ],
      },
      {
        id: 2,
        maquina: "Escavadeira Principal",
        tipo: "Preventiva",
        mecanico: "Carlos Souza",
        data: "05/09/2026",
        horimetro: "8.500 h",
        prioridade: "Média",
        status: "Concluída",
        servicos: [
          {
            id: 2,
            descricao:
              "Troca de óleo e filtros",
            fotos: [],
          },
        ],
      },
    ]);

  const [maquina, setMaquina] = useState("");
  const [tipo, setTipo] = useState("Preventiva");
  const [mecanico, setMecanico] = useState("");
  const [data, setData] = useState("");
  const [horimetro, setHorimetro] = useState("");
  const [prioridade, setPrioridade] =
    useState("Média");

  const [servicos, setServicos] =
    useState<ServicoFormulario[]>([
      {
        id: gerarId(),
        descricao: "",
        fotos: [],
      },
    ]);

  function adicionarServico() {
    setServicos((atual) => [
      ...atual,
      {
        id: gerarId(),
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
        (servico) =>
          servico.id !== id
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
    evento: ChangeEvent<HTMLInputElement>
  ) {
    const arquivos = evento.target.files;

    if (!arquivos) return;

    try {
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

        const novaFoto: FotoServico = {
          id: gerarId(),
          imagem,
          descricao: "",
        };

        setServicos((atual) =>
          atual.map((servico) =>
            servico.id === servicoId
              ? {
                  ...servico,
                  fotos: [
                    ...servico.fotos,
                    novaFoto,
                  ],
                }
              : servico
          )
        );
      }
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
          fotos: servico.fotos.map((foto) =>
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
              fotos: servico.fotos.filter(
                (foto) =>
                  foto.id !== fotoId
              ),
            }
          : servico
      )
    );
  }

  function limparFormulario() {
    setMaquina("");
    setTipo("Preventiva");
    setMecanico("");
    setData("");
    setHorimetro("");
    setPrioridade("Média");

    setServicos([
      {
        id: gerarId(),
        descricao: "",
        fotos: [],
      },
    ]);
  }

  function adicionarManutencao() {
    const servicosValidos =
      servicos.filter(
        (servico) =>
          servico.descricao.trim().length > 0
      );

    if (!maquina || !mecanico || !data) {
      alert(
        "Preencha máquina, mecânico e data."
      );
      return;
    }

    if (servicosValidos.length === 0) {
      alert(
        "Adicione pelo menos um serviço executado."
      );
      return;
    }

    const novaManutencao: Manutencao = {
      id: gerarId(),
      maquina,
      tipo,
      mecanico,
      data,
      horimetro: horimetro
        ? `${horimetro} h`
        : "-",
      prioridade,
      status: "Em Andamento",
      servicos: servicosValidos,
    };

    setManutencoes((atual) => [
      ...atual,
      novaManutencao,
    ]);

    const maquinasSalvas =
      carregarMaquinas();

    const maquinaEncontrada =
      maquinasSalvas.find(
        (item) =>
          item.nome === maquina
      );

    if (maquinaEncontrada) {
      const novosHistoricos:
        HistoricoManutencao[] =
        servicosValidos.map(
          (servico) => ({
            id: gerarId(),
            data,
            descricao:
              servico.descricao,

            foto:
              servico.fotos[0]?.imagem ||
              "",

            fotos:
              servico.fotos,

            tipo,
            mecanico,

            horimetro: horimetro
              ? `${horimetro} h`
              : maquinaEncontrada.horimetro,

            prioridade,

            status:
              "Em Andamento",
          })
        );

      const maquinasAtualizadas =
        maquinasSalvas.map(
          (item: Maquina) =>
            item.id ===
            maquinaEncontrada.id
              ? {
                  ...item,

                  horimetro:
                    horimetro
                      ? `${horimetro} h`
                      : item.horimetro,

                  historico: [
                    ...(item.historico || []),
                    ...novosHistoricos,
                  ],
                }
              : item
        );

      salvarMaquinas(
        maquinasAtualizadas
      );
    }

    limparFormulario();
    setMostrarFormulario(false);

    alert(
      "Manutenção registrada com sucesso!"
    );
  }

  function concluirManutencao(
    id: number
  ) {
    setManutencoes((atual) =>
      atual.map((manutencao) =>
        manutencao.id === id
          ? {
              ...manutencao,
              status: "Concluída",
            }
          : manutencao
      )
    );
  }

  function excluirManutencao(
    id: number
  ) {
    const confirmar = confirm(
      "Deseja realmente excluir esta manutenção?"
    );

    if (!confirmar) return;

    setManutencoes((atual) =>
      atual.filter(
        (manutencao) =>
          manutencao.id !== id
      )
    );
  }

  return (
    <main className="Robert-app">
      <section className="page-container">

        <Link
          href="/"
          className="voltar"
        >
          ← Voltar ao Dashboard
        </Link>

        <div className="page-header">
          <div>
            <h1>🔧 Manutenção</h1>

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
            + Nova Manutenção
          </button>
        </div>

        {mostrarFormulario && (
          <div className="formulario-maquina">

            <h2>Nova Manutenção</h2>

            <div className="form-grid">

              <input
                type="text"
                placeholder="Nome da máquina"
                value={maquina}
                onChange={(e) =>
                  setMaquina(
                    e.target.value
                  )
                }
              />

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

            </div>

            {/* SERVIÇOS */}

            <div className="servicos-container">

              <div className="servicos-cabecalho">

                <div>
                  <h3>
                    🔧 Serviços Executados
                  </h3>

                  <p>
                    Adicione cada serviço
                    realizado separadamente.
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
                (servico, index) => (
                  <div
                    className="servico-card"
                    key={servico.id}
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

                    {/* FOTOS */}

                    <div className="fotos-servico">

                      <div className="fotos-titulo">

                        <div>
                          <strong>
                            📷 Fotos deste serviço
                          </strong>

                          <small>
                            Adicione uma ou
                            várias fotos.
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
                                key={foto.id}
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
                                  placeholder="Descreva o que foi realizado ou o que aparece nesta foto..."
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
                  adicionarManutencao
                }
              >
                Registrar Manutenção
              </button>

            </div>

          </div>
        )}

        {/* TABELA */}

        <div className="tabela-container">

          <table>

            <thead>
              <tr>
                <th>Máquina</th>
                <th>Tipo</th>
                <th>Serviços</th>
                <th>Mecânico</th>
                <th>Data</th>
                <th>Prioridade</th>
                <th>Status</th>
                <th>Ações</th>
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
                      {manutencao.maquina}
                    </td>

                    <td>
                      {manutencao.tipo}
                    </td>

                    <td>
                      <div>
                        <strong>
                          {
                            manutencao
                              .servicos
                              .length
                          }{" "}
                          serviço(s)
                        </strong>

                        <small
                          style={{
                            display:
                              "block",
                            marginTop:
                              "4px",
                            opacity:
                              0.75,
                          }}
                        >
                          {manutencao.servicos
                            .map(
                              (servico) =>
                                servico.descricao
                            )
                            .filter(Boolean)
                            .join(
                              " • "
                            )}
                        </small>
                      </div>
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
                      <span
                        className={
                          manutencao.prioridade ===
                          "Urgente"
                            ? "prioridade-urgente"
                            : manutencao.prioridade ===
                              "Alta"
                            ? "prioridade-alta"
                            : manutencao.prioridade ===
                              "Média"
                            ? "prioridade-media"
                            : "prioridade-baixa"
                        }
                      >
                        {
                          manutencao.prioridade
                        }
                      </span>
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

      </section>
    </main>
  );
}
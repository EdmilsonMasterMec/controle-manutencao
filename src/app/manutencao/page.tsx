
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";

interface FotoServico {
  id: number;
  imagem: string;
  descricao: string;
  caminho?: string;
}

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

function dataAtual() {
  const hoje = new Date();
  const ano = hoje.getFullYear();
  const mes = String(hoje.getMonth() + 1).padStart(2, "0");
  const dia = String(hoje.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function lerImagem(arquivo: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => {
      resolve(leitor.result as string);
    };

    leitor.onerror = () => {
      reject(new Error("Erro ao ler a imagem."));
    };

    leitor.readAsDataURL(arquivo);
  });
}

function comprimirImagem(arquivo: File): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => {
      const imagem = new Image();

      imagem.onload = () => {
        const maxLargura = 1200;
        const maxAltura = 1000;

        let largura = imagem.width;
        let altura = imagem.height;

        const proporcao = Math.min(
          maxLargura / largura,
          maxAltura / altura,
          1
        );

        largura = Math.round(largura * proporcao);
        altura = Math.round(altura * proporcao);

        const canvas = document.createElement("canvas");

        canvas.width = largura;
        canvas.height = altura;

        const contexto = canvas.getContext("2d");

        if (!contexto) {
          reject(new Error("Erro ao processar a imagem."));
          return;
        }

        contexto.drawImage(imagem, 0, 0, largura, altura);

        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error("Erro ao comprimir a imagem."));
              return;
            }

            resolve(blob);
          },
          "image/jpeg",
          0.7
        );
      };

      imagem.onerror = () => {
        reject(new Error("Não foi possível abrir a imagem."));
      };

      imagem.src = leitor.result as string;
    };

    leitor.onerror = () => {
      reject(new Error("Erro ao ler o arquivo."));
    };

    leitor.readAsDataURL(arquivo);
  });
}

function nomeArquivo() {
  return `${Date.now()}-${Math.random()
    .toString(36)
    .slice(2)}.jpg`;
}

export default function Manutencao() {
  const [manutencoes, setManutencoes] =
    useState<Manutencao[]>([]);

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");

  const [maquina, setMaquina] = useState("");
  const [tipo, setTipo] = useState("Preventiva");
  const [mecanico, setMecanico] = useState("");
  const [data, setData] = useState(dataAtual());
  const [horimetro, setHorimetro] = useState("");
  const [prioridade, setPrioridade] = useState("Média");

  const [servicos, setServicos] =
    useState<ServicoFormulario[]>([
      {
        id: gerarId(),
        descricao: "",
        fotos: [],
      },
    ]);

  // BUSCAR MANUTENÇÕES NO SUPABASE

  async function carregarManutencoes() {
    setCarregando(true);
    setErro("");

    const { data, error } = await supabase
      .from("manutencoes")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error(error);
      setErro("Erro ao carregar as manutenções: " + error.message);
      setCarregando(false);
      return;
    }

    setManutencoes(
      (data || []).map((item: any) => ({
        ...item,
        servicos: item.servicos || [],
        horimetro: item.horimetro || "",
      }))
    );

    setCarregando(false);
  }

  useEffect(() => {
    carregarManutencoes();
  }, []);

  // ADICIONAR SERVIÇO

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
      alert("A manutenção precisa ter pelo menos um serviço.");
      return;
    }

    setServicos((atual) =>
      atual.filter((servico) => servico.id !== id)
    );
  }

  function atualizarServico(
    id: number,
    descricao: string
  ) {
    setServicos((atual) =>
      atual.map((servico) =>
        servico.id === id
          ? { ...servico, descricao }
          : servico
      )
    );
  }

  // ADICIONAR FOTO

  async function adicionarFoto(
    servicoId: number,
    evento: React.ChangeEvent<HTMLInputElement>
  ) {
    const arquivos = Array.from(evento.target.files || []);

    evento.target.value = "";

    if (!arquivos.length) return;

    try {
      for (const arquivo of arquivos) {
        if (!arquivo.type.startsWith("image/")) {
          alert("Selecione somente arquivos de imagem.");
          continue;
        }

        const imagem = await lerImagem(arquivo);

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
                  fotos: [...servico.fotos, novaFoto],
                }
              : servico
          )
        );
      }
    } catch (error) {
      console.error(error);
      alert("Não foi possível carregar a foto.");
    }
  }

  function atualizarDescricaoFoto(
    servicoId: number,
    fotoId: number,
    descricao: string
  ) {
    setServicos((atual) =>
      atual.map((servico) =>
        servico.id === servicoId
          ? {
              ...servico,
              fotos: servico.fotos.map((foto) =>
                foto.id === fotoId
                  ? { ...foto, descricao }
                  : foto
              ),
            }
          : servico
      )
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
                (foto) => foto.id !== fotoId
              ),
            }
          : servico
      )
    );
  }

  // LIMPAR FORMULÁRIO

  function limparFormulario() {
    setMaquina("");
    setTipo("Preventiva");
    setMecanico("");
    setData(dataAtual());
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

  // ENVIAR FOTOS AO STORAGE

  async function enviarFotosStorage(
    listaServicos: ServicoFormulario[]
  ) {
    const servicosAtualizados: ServicoFormulario[] = [];

    for (const servico of listaServicos) {
      const fotosAtualizadas: FotoServico[] = [];

      for (const foto of servico.fotos) {
        const resposta = await fetch(foto.imagem);

        const arquivoOriginal = await resposta.blob();

        const arquivoComprimido = await comprimirImagem(
          new File([arquivoOriginal], "foto.jpg", {
            type: arquivoOriginal.type,
          })
        );

        const caminho = `${data}/${nomeArquivo()}`;

        const { error } = await supabase.storage
          .from("fotos-manutencao")
          .upload(caminho, arquivoComprimido, {
            contentType: "image/jpeg",
            upsert: false,
          });

        if (error) {
          throw new Error(
            "Erro ao enviar foto: " + error.message
          );
        }

        const { data: urlPublica } = supabase.storage
          .from("fotos-manutencao")
          .getPublicUrl(caminho);

        fotosAtualizadas.push({
          ...foto,
          imagem: urlPublica.publicUrl,
          caminho,
        });
      }

      servicosAtualizados.push({
        ...servico,
        fotos: fotosAtualizadas,
      });
    }

    return servicosAtualizados;
  }

  // REGISTRAR MANUTENÇÃO

  async function adicionarManutencao() {
    if (salvando) return;

    if (!maquina.trim() || !mecanico.trim() || !data) {
      alert("Preencha máquina, mecânico e data.");
      return;
    }

    const servicosValidos = servicos.filter(
      (servico) => servico.descricao.trim().length > 0
    );

    if (!servicosValidos.length) {
      alert("Adicione pelo menos um serviço executado.");
      return;
    }

    setSalvando(true);
    setErro("");

    try {
      const servicosComFotos = await enviarFotosStorage(
        servicosValidos
      );

      const novoRegistro = {
        maquina: maquina.trim(),
        tipo,
        mecanico: mecanico.trim(),
        data,
        horimetro: horimetro ? `${horimetro} h` : null,
        prioridade,
        status: "Em Andamento",
        servicos: servicosComFotos,
      };

      const { error } = await supabase
        .from("manutencoes")
        .insert([novoRegistro]);

      if (error) {
        throw new Error(error.message);
      }

      await carregarManutencoes();

      limparFormulario();
      setMostrarFormulario(false);

      alert("Manutenção registrada com sucesso!");
    } catch (error) {
      console.error(error);

      const mensagem =
        error instanceof Error
          ? error.message
          : "Erro desconhecido ao salvar.";

      setErro(mensagem);
      alert("Não foi possível salvar a manutenção: " + mensagem);
    } finally {
      setSalvando(false);
    }
  }

  // CONCLUIR MANUTENÇÃO

  async function concluirManutencao(id: number) {
    const { error } = await supabase
      .from("manutencoes")
      .update({ status: "Concluída" })
      .eq("id", id);

    if (error) {
      alert("Erro ao concluir: " + error.message);
      return;
    }

    await carregarManutencoes();
  }

  // EXCLUIR MANUTENÇÃO

  async function excluirManutencao(id: number) {
    const confirmar = confirm(
      "Deseja realmente excluir esta manutenção?"
    );

    if (!confirmar) return;

    const manutencao = manutencoes.find(
      (item) => item.id === id
    );

    if (!manutencao) return;

    const caminhos = manutencao.servicos.flatMap(
      (servico) =>
        servico.fotos
          .map((foto) => foto.caminho)
          .filter((caminho): caminho is string => !!caminho)
    );

    if (caminhos.length) {
      const { error: erroStorage } = await supabase.storage
        .from("fotos-manutencao")
        .remove(caminhos);

      if (erroStorage) {
        alert("Erro ao excluir fotos: " + erroStorage.message);
        return;
      }
    }

    const { error } = await supabase
      .from("manutencoes")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erro ao excluir manutenção: " + error.message);
      return;
    }

    await carregarManutencoes();
  }

  return (
    <main className="Robert-app">
      <section className="page-container">

        <Link href="/" className="voltar">
          ← Voltar ao Dashboard
        </Link>

        <div className="page-header">
          <div>
            <h1>🔧 Manutenção</h1>
            <p>Controle completo das manutenções da frota</p>
          </div>

          <button
            className="btn-novo"
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
          >
            + Nova Manutenção
          </button>
        </div>

        {erro && (
          <div className="mensagem-erro">
            {erro}
          </div>
        )}

        {mostrarFormulario && (
          <div className="formulario-maquina">
            <h2>Nova Manutenção</h2>

            <div className="form-grid">
              <input
                type="text"
                placeholder="Nome da máquina"
                value={maquina}
                onChange={(e) => setMaquina(e.target.value)}
              />

              <select
                value={tipo}
                onChange={(e) => setTipo(e.target.value)}
              >
                <option>Preventiva</option>
                <option>Corretiva</option>
                <option>Emergencial</option>
                <option>Inspeção</option>
              </select>

              <input
                type="text"
                placeholder="Mecânico responsável"
                value={mecanico}
                onChange={(e) => setMecanico(e.target.value)}
              />

              <input
                type="date"
                value={data}
                onChange={(e) => setData(e.target.value)}
              />

              <input
                type="number"
                placeholder="Horímetro"
                value={horimetro}
                onChange={(e) => setHorimetro(e.target.value)}
              />

              <select
                value={prioridade}
                onChange={(e) => setPrioridade(e.target.value)}
              >
                <option>Baixa</option>
                <option>Média</option>
                <option>Alta</option>
                <option>Urgente</option>
              </select>
            </div>

            <div className="servicos-container">
              <div className="servicos-cabecalho">
                <div>
                  <h3>🔧 Serviços Executados</h3>
                  <p>Adicione cada serviço realizado separadamente.</p>
                </div>

                <button
                  type="button"
                  className="btn-adicionar-servico"
                  onClick={adicionarServico}
                >
                  ＋ Adicionar Serviço
                </button>
              </div>

              {servicos.map((servico, index) => (
                <div className="servico-card" key={servico.id}>
                  <div className="servico-topo">
                    <h4>Serviço {index + 1}</h4>

                    {servicos.length > 1 && (
                      <button
                        type="button"
                        className="btn-remover-servico"
                        onClick={() => removerServico(servico.id)}
                      >
                        🗑️ Remover
                      </button>
                    )}
                  </div>

                  <label>Descrição do serviço</label>

                  <textarea
                    className="textarea-servico"
                    value={servico.descricao}
                    onChange={(e) =>
                      atualizarServico(servico.id, e.target.value)
                    }
                    placeholder="Descreva detalhadamente o serviço executado..."
                  />

                  <div className="fotos-servico">
                    <div className="fotos-titulo">
                      <div>
                        <strong>📷 Fotos deste serviço</strong>
                        <small>Adicione uma ou várias fotos.</small>
                      </div>

                      <label className="btn-adicionar-foto">
                        📷 Adicionar Foto

                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) =>
                            adicionarFoto(servico.id, e)
                          }
                        />
                      </label>
                    </div>

                    {servico.fotos.length > 0 && (
                      <div className="fotos-grid">
                        {servico.fotos.map((foto) => (
                          <div className="foto-edicao" key={foto.id}>
                            <img
                              src={foto.imagem}
                              alt="Foto do serviço"
                            />

                            <textarea
                              value={foto.descricao}
                              onChange={(e) =>
                                atualizarDescricaoFoto(
                                  servico.id,
                                  foto.id,
                                  e.target.value
                                )
                              }
                              placeholder="Descreva o que aparece nesta foto..."
                            />

                            <button
                              type="button"
                              className="btn-remover-foto"
                              onClick={() =>
                                removerFoto(servico.id, foto.id)
                              }
                            >
                              🗑️ Remover foto
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="form-botoes">
              <button
                className="btn-cancelar"
                disabled={salvando}
                onClick={() => {
                  limparFormulario();
                  setMostrarFormulario(false);
                }}
              >
                Cancelar
              </button>

              <button
                className="btn-salvar"
                disabled={salvando}
                onClick={adicionarManutencao}
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
            <p>Carregando manutenções...</p>
          ) : manutencoes.length === 0 ? (
            <p>Nenhuma manutenção registrada.</p>
          ) : (
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
                {manutencoes.map((manutencao) => (
                  <tr key={manutencao.id}>
                    <td>🚜 {manutencao.maquina}</td>
                    <td>{manutencao.tipo}</td>

                    <td>
                      <strong>
                        {manutencao.servicos.length} serviço(s)
                      </strong>

                      <small
                        style={{
                          display: "block",
                          marginTop: "4px",
                          opacity: 0.75,
                        }}
                      >
                        {manutencao.servicos
                          .map((servico) => servico.descricao)
                          .filter(Boolean)
                          .join(" • ")}
                      </small>
                    </td>

                    <td>👨‍🔧 {manutencao.mecanico}</td>
                    <td>{manutencao.data}</td>

                    <td>
                      <span
                        className={
                          manutencao.prioridade === "Urgente"
                            ? "prioridade-urgente"
                            : manutencao.prioridade === "Alta"
                            ? "prioridade-alta"
                            : manutencao.prioridade === "Média"
                            ? "prioridade-media"
                            : "prioridade-baixa"
                        }
                      >
                        {manutencao.prioridade}
                      </span>
                    </td>

                    <td>
                      <span
                        className={
                          manutencao.status === "Concluída"
                            ? "status-operando"
                            : "status-manutencao"
                        }
                      >
                        {manutencao.status}
                      </span>
                    </td>

                    <td>
                      {manutencao.status !== "Concluída" && (
                        <button
                          className="btn-concluir"
                          onClick={() =>
                            concluirManutencao(manutencao.id)
                          }
                          title="Concluir manutenção"
                        >
                          ✓
                        </button>
                      )}

                      <button
                        className="btn-excluir"
                        onClick={() =>
                          excluirManutencao(manutencao.id)
                        }
                        title="Excluir manutenção"
                      >
                        🗑️
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </section>
    </main>
  );
}

"use client";

import {
  ChangeEvent,
  FormEvent,
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Clock3,
  Eye,
  ImagePlus,
  Loader2,
  Pencil,
  Plus,
  Save,
  Search,
  Settings,
  Trash2,
  Wrench,
  X,
  XCircle,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Equipamento = {
  id: number;
  categoria?: string | null;
  descricao_bem?: string | null;
  fabricante?: string | null;
  modelo?: string | null;
  ano?: string | null;
  numero_serie_chassi?: string | null;
  placa?: string | null;
  horimetro?: string | null;
  status?: string | null;
};

type FotoServico = {
  id: string;
  nome: string;
  imagem: string;
};

type ServicoFormulario = {
  descricao: string;
  observacao: string;
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
  created_at?: string;
};

const tiposManutencao = [
  "Preventiva",
  "Corretiva",
  "Preditiva",
  "Inspeção",
];

const prioridades = [
  "Baixa",
  "Média",
  "Alta",
  "Urgente",
];

function normalizarStatus(
  valor: string | null | undefined
) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function formatarData(
  valor: string | null | undefined
) {
  if (!valor) return "-";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return data.toLocaleDateString("pt-BR");
}

function nomeEquipamento(
  equipamento: Equipamento
) {
  return (
    equipamento.descricao_bem ||
    `${equipamento.fabricante || ""} ${
      equipamento.modelo || ""
    }`.trim() ||
    `Equipamento ${equipamento.id}`
  );
}

async function comprimirImagem(
  arquivo: File
): Promise<string> {
  return new Promise((resolve, reject) => {
    const leitor = new FileReader();

    leitor.onload = () => {
      const imagem = new Image();

      imagem.onload = () => {
        const maximo = 1400;

        let largura = imagem.width;
        let altura = imagem.height;

        if (
          largura > maximo ||
          altura > maximo
        ) {
          const proporcao = Math.min(
            maximo / largura,
            maximo / altura
          );

          largura = Math.round(
            largura * proporcao
          );

          altura = Math.round(
            altura * proporcao
          );
        }

        const canvas =
          document.createElement("canvas");

        canvas.width = largura;
        canvas.height = altura;

        const contexto =
          canvas.getContext("2d");

        if (!contexto) {
          reject(
            new Error(
              "Não foi possível processar a imagem."
            )
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
            0.75
          )
        );
      };

      imagem.onerror = () => {
        reject(
          new Error(
            "Não foi possível carregar a imagem."
          )
        );
      };

      imagem.src = String(
        leitor.result
      );
    };

    leitor.onerror = () => {
      reject(
        new Error(
          "Não foi possível ler o arquivo."
        )
      );
    };

    leitor.readAsDataURL(arquivo);
  });
}

export default function ManutencaoPage() {
  const [equipamentos, setEquipamentos] =
    useState<Equipamento[]>([]);

  const [manutencoes, setManutencoes] =
    useState<Manutencao[]>([]);

  const [carregando, setCarregando] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  const [erro, setErro] =
    useState("");

  const [mensagem, setMensagem] =
    useState("");

  const [busca, setBusca] =
    useState("");

  const [
    mostrarFormulario,
    setMostrarFormulario,
  ] = useState(false);

  const [
    mostrarHistorico,
    setMostrarHistorico,
  ] = useState(true);

  const [editandoId, setEditandoId] =
    useState<number | null>(null);

  const [
    equipamentoSelecionado,
    setEquipamentoSelecionado,
  ] = useState("");

  const [tipo, setTipo] =
    useState("Corretiva");

  const [mecanico, setMecanico] =
    useState("");

  const [data, setData] =
    useState(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

  const [horimetro, setHorimetro] =
    useState("");

  const [prioridade, setPrioridade] =
    useState("Média");

  const [status, setStatus] =
    useState("Em Andamento");

  const [servicos, setServicos] =
    useState<ServicoFormulario[]>([
      {
        descricao: "",
        observacao: "",
      },
    ]);

  const [fotos, setFotos] =
    useState<FotoServico[]>([]);

  const [visualizando, setVisualizando] =
    useState<Manutencao | null>(null);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);
    setErro("");

    try {
      const equipamentosResult =
        await supabase
          .from("equipamentos")
          .select("*")
          .order("id", {
            ascending: true,
          });

      if (equipamentosResult.error) {
        throw equipamentosResult.error;
      }

      setEquipamentos(
        (equipamentosResult.data ||
          []) as Equipamento[]
      );

      const manutencoesResult =
        await supabase
          .from("manutencoes")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

      if (manutencoesResult.error) {
        throw manutencoesResult.error;
      }

      setManutencoes(
        (manutencoesResult.data ||
          []) as Manutencao[]
      );
    } catch (error) {
      console.error(
        "Erro ao carregar manutenção:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível carregar os dados."
      );
    } finally {
      setCarregando(false);
    }
  }

  function limparFormulario() {
    setEquipamentoSelecionado("");

    setTipo("Corretiva");

    setMecanico("");

    setData(
      new Date()
        .toISOString()
        .slice(0, 10)
    );

    setHorimetro("");

    setPrioridade("Média");

    setStatus("Em Andamento");

    setServicos([
      {
        descricao: "",
        observacao: "",
      },
    ]);

    setFotos([]);

    setEditandoId(null);
  }

  function abrirNovo() {
    limparFormulario();

    setErro("");
    setMensagem("");

    setMostrarFormulario(true);
  }

  function fecharFormulario() {
    limparFormulario();

    setMostrarFormulario(false);
  }

  function adicionarServico() {
    setServicos((atual) => [
      ...atual,
      {
        descricao: "",
        observacao: "",
      },
    ]);
  }

  function removerServico(
    indice: number
  ) {
    setServicos((atual) => {
      if (atual.length === 1) {
        return atual;
      }

      return atual.filter(
        (_, index) =>
          index !== indice
      );
    });
  }

  function alterarServico(
    indice: number,
    campo: keyof ServicoFormulario,
    valor: string
  ) {
    setServicos((atual) =>
      atual.map(
        (servico, index) =>
          index === indice
            ? {
                ...servico,
                [campo]: valor,
              }
            : servico
      )
    );
  }

  async function adicionarFotos(
    evento: ChangeEvent<HTMLInputElement>
  ) {
    const arquivos = Array.from(
      evento.target.files || []
    );

    if (!arquivos.length) {
      return;
    }

    try {
      const novasFotos: FotoServico[] =
        [];

      for (const arquivo of arquivos) {
        const imagem =
          await comprimirImagem(
            arquivo
          );

        novasFotos.push({
          id:
            Date.now().toString() +
            Math.random()
              .toString(36)
              .slice(2),
          nome: arquivo.name,
          imagem,
        });
      }

      setFotos((atual) => [
        ...atual,
        ...novasFotos,
      ]);
    } catch (error) {
      console.error(
        "Erro ao processar fotos:",
        error
      );

      setErro(
        "Não foi possível processar uma ou mais fotos."
      );
    } finally {
      evento.target.value = "";
    }
  }

  function removerFoto(id: string) {
    setFotos((atual) =>
      atual.filter(
        (foto) => foto.id !== id
      )
    );
  }

  function equipamentoAtual() {
    return equipamentos.find(
      (equipamento) =>
        String(equipamento.id) ===
        equipamentoSelecionado
    );
  }

  async function salvarManutencao(
    evento: FormEvent<HTMLFormElement>
  ) {
    evento.preventDefault();

    setErro("");
    setMensagem("");
    setSalvando(true);

    try {
      if (!equipamentoSelecionado) {
        throw new Error(
          "Selecione um equipamento."
        );
      }

      const equipamento =
        equipamentoAtual();

      if (!equipamento) {
        throw new Error(
          "O equipamento selecionado não foi encontrado."
        );
      }

      const maquina =
        nomeEquipamento(equipamento);

      const servicosValidos =
        servicos.filter(
          (servico) =>
            servico.descricao.trim() !==
            ""
        );

      const dados = {
        equipamento_id:
          equipamento.id,

        maquina,

        tipo,

        mecanico:
          mecanico.trim(),

        data,

        horimetro:
          horimetro.trim(),

        prioridade,

        status,
      };

      if (editandoId !== null) {
        const resultado =
          await supabase
            .from("manutencoes")
            .update(dados)
            .eq("id", editandoId)
            .select();

        if (resultado.error) {
          throw resultado.error;
        }

        setMensagem(
          "Manutenção atualizada com sucesso."
        );
      } else {
        const resultado =
          await supabase
            .from("manutencoes")
            .insert(dados)
            .select();

        if (resultado.error) {
          throw resultado.error;
        }

        if (!resultado.data?.length) {
          throw new Error(
            "A manutenção foi salva, mas o registro não foi retornado pelo banco."
          );
        }

        setMensagem(
          "Manutenção registrada com sucesso."
        );
      }

      console.log(
        "Serviços registrados no formulário:",
        servicosValidos
      );

      console.log(
        "Fotos selecionadas:",
        fotos.length
      );

      await carregarDados();

      limparFormulario();

      setMostrarFormulario(false);
    } catch (error) {
      console.error(
        "Erro ao salvar manutenção:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível salvar a manutenção."
      );
    } finally {
      setSalvando(false);
    }
  }

  function editarManutencao(
    manutencao: Manutencao
  ) {
    setEditandoId(manutencao.id);

    setEquipamentoSelecionado(
      manutencao.equipamento_id
        ? String(
            manutencao.equipamento_id
          )
        : ""
    );

    setTipo(
      manutencao.tipo ||
        "Corretiva"
    );

    setMecanico(
      manutencao.mecanico || ""
    );

    setData(
      manutencao.data
        ? manutencao.data.slice(
            0,
            10
          )
        : new Date()
            .toISOString()
            .slice(0, 10)
    );

    setHorimetro(
      manutencao.horimetro || ""
    );

    setPrioridade(
      manutencao.prioridade ||
        "Média"
    );

    setStatus(
      manutencao.status ||
        "Em Andamento"
    );

    setMensagem("");
    setErro("");

    setMostrarFormulario(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  async function excluirManutencao(
    id: number
  ) {
    const confirmar =
      window.confirm(
        "Deseja realmente excluir esta manutenção?"
      );

    if (!confirmar) {
      return;
    }

    setErro("");
    setMensagem("");

    try {
      const resultado =
        await supabase
          .from("manutencoes")
          .delete()
          .eq("id", id);

      if (resultado.error) {
        throw resultado.error;
      }

      setMensagem(
        "Manutenção excluída com sucesso."
      );

      await carregarDados();
    } catch (error) {
      console.error(
        "Erro ao excluir manutenção:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível excluir a manutenção."
      );
    }
  }

  async function concluirManutencao(
    id: number
  ) {
    setErro("");
    setMensagem("");

    try {
      const resultado =
        await supabase
          .from("manutencoes")
          .update({
            status: "Concluída",
          })
          .eq("id", id);

      if (resultado.error) {
        throw resultado.error;
      }

      setMensagem(
        "Manutenção concluída com sucesso."
      );

      await carregarDados();
    } catch (error) {
      console.error(
        "Erro ao concluir manutenção:",
        error
      );

      setErro(
        error instanceof Error
          ? error.message
          : "Não foi possível concluir a manutenção."
      );
    }
  }

  const manutencoesFiltradas =
    useMemo(() => {
      const termo =
        normalizarStatus(busca);

      if (!termo) {
        return manutencoes;
      }

      return manutencoes.filter(
        (manutencao) => {
          const texto = [
            manutencao.maquina,
            manutencao.tipo,
            manutencao.mecanico,
            manutencao.status,
            manutencao.prioridade,
          ]
            .join(" ")
            .toLowerCase();

          return texto.includes(termo);
        }
      );
    }, [manutencoes, busca]);

  const emAndamento =
    manutencoes.filter(
      (manutencao) => {
        const status =
          normalizarStatus(
            manutencao.status
          );

        return (
          status === "em andamento" ||
          status === "aberta" ||
          status === "aberto" ||
          status === "pendente"
        );
      }
    ).length;

  const concluidas =
    manutencoes.filter(
      (manutencao) =>
        normalizarStatus(
          manutencao.status
        ) === "concluida"
    ).length;

  return (
    <main className="manutencao-page">
      <div className="manutencao-container">

        {/* CABEÇALHO */}

        <header className="manutencao-header">
          <div className="manutencao-title">

            <div className="manutencao-title-icon">
              <Wrench size={28} />
            </div>

            <div>
              <h1>Manutenção</h1>

              <p>
                Controle de manutenções da frota
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={abrirNovo}
            className="btn-nova-manutencao"
          >
            <Plus size={20} />
            Nova Manutenção
          </button>
        </header>

        {/* MENSAGENS */}

        {erro && (
          <div className="manutencao-alert erro">

            <XCircle size={22} />

            <div>
              <strong>
                Não foi possível concluir a operação
              </strong>

              <p>{erro}</p>
            </div>

          </div>
        )}

        {mensagem && (
          <div className="manutencao-alert sucesso">

            <CheckCircle2 size={22} />

            <div>
              <strong>
                Operação realizada
              </strong>

              <p>{mensagem}</p>
            </div>

          </div>
        )}

        {/* CARDS */}

        <section className="manutencao-stats">

          <div className="manutencao-stat">

            <div className="stat-icon blue">
              <Wrench size={23} />
            </div>

            <div>
              <span>Total</span>

              <strong>
                {manutencoes.length}
              </strong>

              <small>
                Manutenções registradas
              </small>
            </div>

          </div>

          <div className="manutencao-stat">

            <div className="stat-icon orange">
              <Clock3 size={23} />
            </div>

            <div>
              <span>
                Em andamento
              </span>

              <strong>
                {emAndamento}
              </strong>

              <small>
                Serviços ativos
              </small>
            </div>

          </div>

          <div className="manutencao-stat">

            <div className="stat-icon green">
              <CheckCircle2 size={23} />
            </div>

            <div>
              <span>
                Concluídas
              </span>

              <strong>
                {concluidas}
              </strong>

              <small>
                Serviços finalizados
              </small>
            </div>

          </div>

        </section>

        {/* FORMULÁRIO */}

        {mostrarFormulario && (
          <section className="manutencao-form-card">

            <div className="form-card-header">

              <div>
                <h2>
                  {editandoId !== null
                    ? "Editar Manutenção"
                    : "Nova Manutenção"}
                </h2>

                <p>
                  Informe os dados do serviço realizado.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharFormulario}
                className="icon-button"
              >
                <X size={21} />
              </button>

            </div>

            <form
              onSubmit={salvarManutencao}
              className="manutencao-form"
            >

              {/* DADOS */}

              <div className="form-section">

                <div className="form-section-title">

                  <Wrench size={19} />

                  <div>
                    <strong>
                      Dados da manutenção
                    </strong>

                    <span>
                      Informações principais do serviço
                    </span>
                  </div>

                </div>

                <div className="form-grid">

                  <div className="form-field campo-equipamento">

                    <label>
                      Equipamento *
                    </label>

                    <select
                      value={
                        equipamentoSelecionado
                      }
                      onChange={(evento) => {

                        setEquipamentoSelecionado(
                          evento.target.value
                        );

                        const equipamento =
                          equipamentos.find(
                            (item) =>
                              String(
                                item.id
                              ) ===
                              evento.target.value
                          );

                        if (
                          equipamento?.horimetro &&
                          !horimetro
                        ) {
                          setHorimetro(
                            equipamento.horimetro
                          );
                        }

                      }}
                      required
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
                            {nomeEquipamento(
                              equipamento
                            )}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div className="form-field">

                    <label>
                      Tipo *
                    </label>

                    <select
                      value={tipo}
                      onChange={(evento) =>
                        setTipo(
                          evento.target.value
                        )
                      }
                      required
                    >

                      {tiposManutencao.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div className="form-field">

                    <label>
                      Mecânico
                    </label>

                    <input
                      value={mecanico}
                      onChange={(evento) =>
                        setMecanico(
                          evento.target.value
                        )
                      }
                      placeholder="Nome do mecânico"
                    />

                  </div>

                  <div className="form-field">

                    <label>
                      Data *
                    </label>

                    <input
                      type="date"
                      value={data}
                      onChange={(evento) =>
                        setData(
                          evento.target.value
                        )
                      }
                      required
                    />

                  </div>

                  <div className="form-field">

                    <label>
                      Horímetro
                    </label>

                    <input
                      value={horimetro}
                      onChange={(evento) =>
                        setHorimetro(
                          evento.target.value
                        )
                      }
                      placeholder="Ex.: 4.520 h"
                    />

                  </div>

                  <div className="form-field">

                    <label>
                      Prioridade
                    </label>

                    <select
                      value={prioridade}
                      onChange={(evento) =>
                        setPrioridade(
                          evento.target.value
                        )
                      }
                    >

                      {prioridades.map(
                        (item) => (
                          <option
                            key={item}
                            value={item}
                          >
                            {item}
                          </option>
                        )
                      )}

                    </select>

                  </div>

                  <div className="form-field">

                    <label>
                      Status
                    </label>

                    <select
                      value={status}
                      onChange={(evento) =>
                        setStatus(
                          evento.target.value
                        )
                      }
                    >

                      <option value="Em Andamento">
                        Em Andamento
                      </option>

                      <option value="Concluída">
                        Concluída
                      </option>

                      <option value="Cancelada">
                        Cancelada
                      </option>

                    </select>

                  </div>

                </div>
              </div>

              {/* SERVIÇOS */}

              <div className="form-section">

                <div className="section-header-mobile">

                  <div className="form-section-title">

                    <Settings size={19} />

                    <div>
                      <strong>
                        Serviços Executados
                      </strong>

                      <span>
                        Descreva os serviços realizados
                      </span>
                    </div>

                  </div>

                  <button
                    type="button"
                    onClick={
                      adicionarServico
                    }
                    className="btn-secundario"
                  >
                    <Plus size={17} />
                    Adicionar
                  </button>

                </div>

                <div className="servicos-lista">

                  {servicos.map(
                    (
                      servico,
                      indice
                    ) => (

                      <div
                        key={indice}
                        className="servico-card"
                      >

                        <div className="servico-header">

                          <strong>
                            Serviço{" "}
                            {indice + 1}
                          </strong>

                          {servicos.length >
                            1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removerServico(
                                  indice
                                )
                              }
                              className="btn-remover"
                            >
                              <Trash2
                                size={17}
                              />
                            </button>
                          )}

                        </div>

                        <div className="servico-grid">

                          <div className="form-field">

                            <label>
                              Descrição
                            </label>

                            <input
                              value={
                                servico.descricao
                              }
                              onChange={(
                                evento
                              ) =>
                                alterarServico(
                                  indice,
                                  "descricao",
                                  evento
                                    .target
                                    .value
                                )
                              }
                              placeholder="Descrição do serviço"
                            />

                          </div>

                          <div className="form-field">

                            <label>
                              Observação
                            </label>

                            <input
                              value={
                                servico.observacao
                              }
                              onChange={(
                                evento
                              ) =>
                                alterarServico(
                                  indice,
                                  "observacao",
                                  evento
                                    .target
                                    .value
                                )
                              }
                              placeholder="Observação"
                            />

                          </div>

                        </div>

                      </div>

                    )
                  )}

                </div>

              </div>

              {/* FOTOS */}

              <div className="form-section">

                <div className="form-section-title">

                  <ImagePlus size={19} />

                  <div>
                    <strong>
                      Fotos do Serviço
                    </strong>

                    <span>
                      Adicione fotos para registrar o serviço
                    </span>
                  </div>

                </div>

                <label className="upload-area">

                  <ImagePlus size={30} />

                  <strong>
                    Adicionar fotos
                  </strong>

                  <span>
                    Toque aqui para selecionar imagens
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={
                      adicionarFotos
                    }
                  />

                </label>

                {fotos.length > 0 && (
                  <div className="fotos-grid">

                    {fotos.map(
                      (foto) => (
                        <div
                          key={foto.id}
                          className="foto-card"
                        >

                          <img
                            src={foto.imagem}
                            alt={foto.nome}
                          />

                          <button
                            type="button"
                            onClick={() =>
                              removerFoto(
                                foto.id
                              )
                            }
                            className="foto-remover"
                          >
                            <X size={16} />
                          </button>

                        </div>
                      )
                    )}

                  </div>
                )}

              </div>

              {/* BOTÕES */}

              <div className="form-actions">

                <button
                  type="button"
                  onClick={
                    fecharFormulario
                  }
                  className="btn-cancelar"
                >
                  <X size={18} />
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="btn-salvar"
                >

                  {salvando ? (
                    <>
                      <Loader2
                        size={18}
                        className="spin"
                      />

                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save size={18} />

                      Salvar Manutenção
                    </>
                  )}

                </button>

              </div>

            </form>

          </section>
        )}

        {/* HISTÓRICO */}

        <section className="historico-card">

          <div className="historico-header">

            <button
              type="button"
              onClick={() =>
                setMostrarHistorico(
                  (valor) => !valor
                )
              }
              className="historico-titulo"
            >

              <div className="historico-icon">
                <CalendarDays size={21} />
              </div>

              <div>
                <h2>
                  Histórico de Manutenções
                </h2>

                <p>
                  Consulte os serviços registrados.
                </p>
              </div>

              <ChevronDown
                size={22}
                className={
                  mostrarHistorico
                    ? "chevron-aberto"
                    : "chevron-fechado"
                }
              />

            </button>

            {mostrarHistorico && (
              <div className="busca-container">

                <Search size={18} />

                <input
                  value={busca}
                  onChange={(evento) =>
                    setBusca(
                      evento.target.value
                    )
                  }
                  placeholder="Buscar manutenção..."
                />

              </div>
            )}

          </div>

          {mostrarHistorico && (
            <>
              {carregando ? (
                <div className="estado-vazio">

                  <Loader2
                    size={28}
                    className="spin"
                  />

                  <p>
                    Carregando manutenções...
                  </p>

                </div>
              ) : manutencoesFiltradas.length ===
                0 ? (
                <div className="estado-vazio">

                  <Clock3 size={30} />

                  <strong>
                    Nenhuma manutenção encontrada.
                  </strong>

                  <p>
                    Registre uma nova manutenção para
                    começar o histórico.
                  </p>

                </div>
              ) : (
                <>
                  {/* CELULAR */}

                  <div className="historico-mobile">

                    {manutencoesFiltradas.map(
                      (manutencao) => {

                        const statusNormalizado =
                          normalizarStatus(
                            manutencao.status
                          );

                        const ativa =
                          statusNormalizado ===
                            "em andamento" ||
                          statusNormalizado ===
                            "aberta" ||
                          statusNormalizado ===
                            "aberto" ||
                          statusNormalizado ===
                            "pendente";

                        return (
                          <div
                            key={
                              manutencao.id
                            }
                            className="manutencao-mobile-card"
                          >

                            <div className="mobile-card-top">

                              <div>

                                <span className="mobile-label">
                                  Máquina
                                </span>

                                <strong>
                                  {manutencao.maquina ||
                                    "-"}
                                </strong>

                              </div>

                              <span className="status-pill">
                                {manutencao.status ||
                                  "-"}
                              </span>

                            </div>

                            <div className="mobile-info-grid">

                              <div>
                                <span>
                                  Tipo
                                </span>

                                <strong>
                                  {manutencao.tipo ||
                                    "-"}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Mecânico
                                </span>

                                <strong>
                                  {manutencao.mecanico ||
                                    "-"}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Data
                                </span>

                                <strong>
                                  {formatarData(
                                    manutencao.data
                                  )}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Horímetro
                                </span>

                                <strong>
                                  {manutencao.horimetro ||
                                    "-"}
                                </strong>
                              </div>

                              <div>
                                <span>
                                  Prioridade
                                </span>

                                <strong>
                                  {manutencao.prioridade ||
                                    "-"}
                                </strong>
                              </div>

                            </div>

                            <div className="mobile-actions">

                              <button
                                type="button"
                                onClick={() =>
                                  setVisualizando(
                                    manutencao
                                  )
                                }
                              >
                                <Eye size={17} />
                                Ver
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  editarManutencao(
                                    manutencao
                                  )
                                }
                              >
                                <Pencil size={17} />
                                Editar
                              </button>

                              {ativa && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    concluirManutencao(
                                      manutencao.id
                                    )
                                  }
                                >
                                  <CheckCircle2
                                    size={17}
                                  />
                                  Concluir
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() =>
                                  excluirManutencao(
                                    manutencao.id
                                  )
                                }
                              >
                                <Trash2 size={17} />
                                Excluir
                              </button>

                            </div>

                          </div>
                        );
                      }
                    )}

                  </div>

                  {/* DESKTOP */}

                  <div className="historico-desktop">

                    <div className="table-scroll">

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
                              Mecânico
                            </th>

                            <th>
                              Data
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

                            <th>
                              Ações
                            </th>

                          </tr>

                        </thead>

                        <tbody>

                          {manutencoesFiltradas.map(
                            (manutencao) => {

                              const statusNormalizado =
                                normalizarStatus(
                                  manutencao.status
                                );

                              const ativa =
                                statusNormalizado ===
                                  "em andamento" ||
                                statusNormalizado ===
                                  "aberta" ||
                                statusNormalizado ===
                                  "aberto" ||
                                statusNormalizado ===
                                  "pendente";

                              return (
                                <tr
                                  key={
                                    manutencao.id
                                  }
                                >

                                  <td>
                                    <strong>
                                      {manutencao.maquina ||
                                        "-"}
                                    </strong>
                                  </td>

                                  <td>
                                    {manutencao.tipo ||
                                      "-"}
                                  </td>

                                  <td>
                                    {manutencao.mecanico ||
                                      "-"}
                                  </td>

                                  <td>
                                    {formatarData(
                                      manutencao.data
                                    )}
                                  </td>

                                  <td>
                                    {manutencao.horimetro ||
                                      "-"}
                                  </td>

                                  <td>
                                    {manutencao.prioridade ||
                                      "-"}
                                  </td>

                                  <td>
                                    <span className="status-pill">
                                      {manutencao.status ||
                                        "-"}
                                    </span>
                                  </td>

                                  <td>

                                    <div className="desktop-actions">

                                      <button
                                        type="button"
                                        onClick={() =>
                                          setVisualizando(
                                            manutencao
                                          )
                                        }
                                        title="Visualizar"
                                      >
                                        <Eye size={16} />
                                      </button>

                                      <button
                                        type="button"
                                        onClick={() =>
                                          editarManutencao(
                                            manutencao
                                          )
                                        }
                                        title="Editar"
                                      >
                                        <Pencil size={16} />
                                      </button>

                                      {ativa && (
                                        <button
                                          type="button"
                                          onClick={() =>
                                            concluirManutencao(
                                              manutencao.id
                                            )
                                          }
                                          title="Concluir"
                                        >
                                          <CheckCircle2
                                            size={16}
                                          />
                                        </button>
                                      )}

                                      <button
                                        type="button"
                                        onClick={() =>
                                          excluirManutencao(
                                            manutencao.id
                                          )
                                        }
                                        title="Excluir"
                                      >
                                        <Trash2 size={16} />
                                      </button>

                                    </div>

                                  </td>

                                </tr>
                              );
                            }
                          )}

                        </tbody>

                      </table>

                    </div>

                  </div>
                </>
              )}
            </>
          )}

        </section>

      </div>

      {/* MODAL */}

      {visualizando && (
        <div className="modal-overlay">

          <div className="modal-card">

            <div className="modal-header">

              <div>

                <h2>
                  Detalhes da Manutenção
                </h2>

                <p>
                  Registro #{visualizando.id}
                </p>

              </div>

              <button
                type="button"
                onClick={() =>
                  setVisualizando(null)
                }
              >
                <X size={21} />
              </button>

            </div>

            <div className="modal-grid">

              <div>
                <span>
                  Máquina
                </span>

                <strong>
                  {visualizando.maquina ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Tipo
                </span>

                <strong>
                  {visualizando.tipo ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Mecânico
                </span>

                <strong>
                  {visualizando.mecanico ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Data
                </span>

                <strong>
                  {formatarData(
                    visualizando.data
                  )}
                </strong>
              </div>

              <div>
                <span>
                  Horímetro
                </span>

                <strong>
                  {visualizando.horimetro ||
                    "-"}
                </strong>
              </div>

              <div>
                <span>
                  Prioridade
                </span>

                <strong>
                  {visualizando.prioridade ||
                    "-"}
                </strong>
              </div>

              <div className="modal-full">

                <span>
                  Status
                </span>

                <strong>
                  {visualizando.status ||
                    "-"}
                </strong>

              </div>

            </div>

            <div className="modal-footer">

              <button
                type="button"
                onClick={() =>
                  setVisualizando(null)
                }
              >
                Fechar
              </button>

            </div>

          </div>

        </div>
      )}

      {/* ESTILO EXCLUSIVO DA PÁGINA */}

      <style jsx>{`

        .manutencao-page {
          width: 100%;
          min-height: 100vh;
          padding: 24px;
          color: #172033;
        }

        .manutencao-container {
          width: 100%;
          max-width: 1500px;
          margin: 0 auto;
        }

        .manutencao-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
          padding: 20px 22px;
          background: rgba(255,255,255,.95);
          border: 1px solid rgba(30,41,59,.08);
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(15,23,42,.07);
        }

        .manutencao-title {
          display: flex;
          align-items: center;
          gap: 14px;
        }

        .manutencao-title-icon {
          width: 52px;
          height: 52px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 15px;
          background: #fff7ed;
          color: #ea580c;
        }

        .manutencao-title h1 {
          margin: 0;
          font-size: 30px;
          font-weight: 800;
          line-height: 1.1;
        }

        .manutencao-title p {
          margin: 5px 0 0;
          color: #64748b;
          font-size: 14px;
        }

        .btn-nova-manutencao {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 18px;
          border: none;
          border-radius: 12px;
          background: #172033;
          color: white;
          font-weight: 700;
          cursor: pointer;
          box-shadow: 0 5px 15px rgba(15,23,42,.15);
        }

        .manutencao-alert {
          display: flex;
          gap: 12px;
          margin-bottom: 16px;
          padding: 14px 16px;
          border-radius: 14px;
        }

        .manutencao-alert p {
          margin: 3px 0 0;
          font-size: 13px;
        }

        .manutencao-alert.erro {
          color: #b91c1c;
          background: #fef2f2;
          border: 1px solid #fecaca;
        }

        .manutencao-alert.sucesso {
          color: #047857;
          background: #ecfdf5;
          border: 1px solid #a7f3d0;
        }

        .manutencao-stats {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 15px;
          margin-bottom: 20px;
        }

        .manutencao-stat {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 18px;
          background: rgba(255,255,255,.96);
          border: 1px solid rgba(30,41,59,.08);
          border-radius: 18px;
          box-shadow: 0 7px 22px rgba(15,23,42,.06);
        }

        .stat-icon {
          width: 46px;
          height: 46px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 13px;
        }

        .stat-icon.blue {
          background: #eff6ff;
          color: #2563eb;
        }

        .stat-icon.orange {
          background: #fff7ed;
          color: #ea580c;
        }

        .stat-icon.green {
          background: #ecfdf5;
          color: #059669;
        }

        .manutencao-stat span {
          display: block;
          color: #64748b;
          font-size: 12px;
          font-weight: 600;
        }

        .manutencao-stat strong {
          display: block;
          margin-top: 3px;
          font-size: 28px;
          line-height: 1;
          font-weight: 800;
        }

        .manutencao-stat small {
          display: block;
          margin-top: 5px;
          color: #94a3b8;
          font-size: 10px;
        }

        .manutencao-form-card,
        .historico-card {
          margin-bottom: 20px;
          padding: 20px;
          background: rgba(255,255,255,.96);
          border: 1px solid rgba(30,41,59,.08);
          border-radius: 20px;
          box-shadow: 0 8px 25px rgba(15,23,42,.07);
        }

        .form-card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 22px;
        }

        .form-card-header h2,
        .historico-header h2 {
          margin: 0;
          font-size: 19px;
          font-weight: 800;
        }

        .form-card-header p,
        .historico-header p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 12px;
        }

        .icon-button {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          background: white;
          cursor: pointer;
        }

        .manutencao-form {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .form-section {
          padding: 17px;
          border: 1px solid #e2e8f0;
          border-radius: 16px;
          background: #fbfdff;
        }

        .form-section-title {
          display: flex;
          align-items: flex-start;
          gap: 9px;
          margin-bottom: 15px;
        }

        .form-section-title svg {
          margin-top: 2px;
          color: #2563eb;
          flex-shrink: 0;
        }

        .form-section-title strong {
          display: block;
          font-size: 14px;
        }

        .form-section-title span {
          display: block;
          margin-top: 3px;
          color: #64748b;
          font-size: 11px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(3,minmax(0,1fr));
          gap: 14px;
        }

        .campo-equipamento {
          grid-column: span 2;
        }

        .form-field label {
          display: block;
          margin-bottom: 6px;
          color: #334155;
          font-size: 11px;
          font-weight: 700;
        }

        .form-field input,
        .form-field select {
          width: 100%;
          min-height: 44px;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: white;
          color: #172033;
          outline: none;
          font-size: 13px;
        }

        .form-field input:focus,
        .form-field select:focus {
          border-color: #2563eb;
          box-shadow: 0 0 0 3px rgba(37,99,235,.1);
        }

        .section-header-mobile {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 15px;
        }

        .section-header-mobile .form-section-title {
          margin-bottom: 0;
        }

        .btn-secundario {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 9px 13px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: white;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
          cursor: pointer;
        }

        .servicos-lista {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .servico-card {
          padding: 14px;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
          background: white;
        }

        .servico-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .servico-header strong {
          font-size: 12px;
        }

        .btn-remover {
          width: 34px;
          height: 34px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #fecaca;
          border-radius: 9px;
          background: #fef2f2;
          color: #dc2626;
          cursor: pointer;
        }

        .servico-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 12px;
        }

        .upload-area {
          min-height: 120px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 5px;
          border: 2px dashed #cbd5e1;
          border-radius: 14px;
          color: #64748b;
          cursor: pointer;
          text-align: center;
        }

        .upload-area strong {
          color: #334155;
          font-size: 13px;
        }

        .upload-area span {
          font-size: 10px;
        }

        .upload-area input {
          display: none;
        }

        .fotos-grid {
          display: grid;
          grid-template-columns: repeat(5,minmax(0,1fr));
          gap: 10px;
          margin-top: 12px;
        }

        .foto-card {
          position: relative;
          overflow: hidden;
          border-radius: 11px;
          border: 1px solid #e2e8f0;
        }

        .foto-card img {
          display: block;
          width: 100%;
          height: 120px;
          object-fit: cover;
        }

        .foto-remover {
          position: absolute;
          top: 6px;
          right: 6px;
          width: 28px;
          height: 28px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          border-radius: 50%;
          background: white;
          cursor: pointer;
        }

        .form-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .btn-cancelar,
        .btn-salvar {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 7px;
          padding: 11px 18px;
          border-radius: 11px;
          font-weight: 700;
          cursor: pointer;
        }

        .btn-cancelar {
          border: 1px solid #cbd5e1;
          background: white;
        }

        .btn-salvar {
          border: none;
          background: #172033;
          color: white;
        }

        .btn-salvar:disabled {
          opacity: .5;
          cursor: not-allowed;
        }

        .historico-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .historico-titulo {
          display: flex;
          align-items: center;
          gap: 10px;
          border: none;
          background: transparent;
          text-align: left;
          cursor: pointer;
        }

        .historico-icon {
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          border-radius: 11px;
          background: #eff6ff;
          color: #2563eb;
        }

        .chevron-aberto {
          transform: rotate(0deg);
        }

        .chevron-fechado {
          transform: rotate(-90deg);
        }

        .busca-container {
          width: 300px;
          position: relative;
        }

        .busca-container svg {
          position: absolute;
          left: 12px;
          top: 50%;
          transform: translateY(-50%);
          color: #64748b;
        }

        .busca-container input {
          width: 100%;
          height: 42px;
          padding: 8px 12px 8px 38px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          outline: none;
        }

        .table-scroll {
          width: 100%;
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 13px;
        }

        .table-scroll table {
          width: 100%;
          min-width: 950px;
          border-collapse: collapse;
        }

        .table-scroll th {
          padding: 12px;
          background: #f8fafc;
          border-bottom: 1px solid #e2e8f0;
          color: #475569;
          font-size: 10px;
          font-weight: 800;
          text-align: left;
          white-space: nowrap;
        }

        .table-scroll td {
          padding: 13px 12px;
          border-bottom: 1px solid #edf2f7;
          color: #334155;
          font-size: 11px;
          white-space: nowrap;
        }

        .table-scroll tbody tr:last-child td {
          border-bottom: none;
        }

        .status-pill {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 5px 9px;
          border-radius: 999px;
          background: #fff7ed;
          color: #c2410c;
          font-size: 9px;
          font-weight: 800;
          white-space: nowrap;
        }

        .desktop-actions {
          display: flex;
          justify-content: flex-end;
          gap: 5px;
        }

        .desktop-actions button {
          width: 31px;
          height: 31px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          border-radius: 8px;
          background: white;
          cursor: pointer;
        }

        .historico-mobile {
          display: none;
        }

        .estado-vazio {
          min-height: 160px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: #64748b;
          text-align: center;
          border: 1px dashed #cbd5e1;
          border-radius: 14px;
          padding: 20px;
        }

        .estado-vazio p {
          margin: 0;
          font-size: 12px;
        }

        .modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 100;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
          background: rgba(15,23,42,.55);
        }

        .modal-card {
          width: 100%;
          max-width: 650px;
          max-height: 90vh;
          overflow-y: auto;
          padding: 22px;
          border-radius: 20px;
          background: white;
          box-shadow: 0 25px 70px rgba(0,0,0,.25);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 15px;
          margin-bottom: 18px;
        }

        .modal-header h2 {
          margin: 0;
          font-size: 20px;
          font-weight: 800;
        }

        .modal-header p {
          margin: 4px 0 0;
          color: #64748b;
          font-size: 11px;
        }

        .modal-header button {
          width: 38px;
          height: 38px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid #e2e8f0;
          border-radius: 9px;
          background: white;
          cursor: pointer;
        }

        .modal-grid {
          display: grid;
          grid-template-columns: repeat(2,minmax(0,1fr));
          gap: 10px;
        }

        .modal-grid > div {
          padding: 13px;
          border: 1px solid #e2e8f0;
          border-radius: 11px;
          background: #f8fafc;
        }

        .modal-grid span {
          display: block;
          color: #64748b;
          font-size: 10px;
        }

        .modal-grid strong {
          display: block;
          margin-top: 4px;
          font-size: 13px;
        }

        .modal-full {
          grid-column: span 2;
        }

        .modal-footer {
          display: flex;
          justify-content: flex-end;
          margin-top: 18px;
        }

        .modal-footer button {
          padding: 10px 18px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          background: white;
          font-weight: 700;
          cursor: pointer;
        }

        .spin {
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          from {
            transform: rotate(0deg);
          }

          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 1000px) {

          .form-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .campo-equipamento {
            grid-column: span 2;
          }

          .fotos-grid {
            grid-template-columns:
              repeat(4,minmax(0,1fr));
          }
        }

        @media (max-width: 700px) {

          .manutencao-page {
            padding: 10px;
          }

          .manutencao-header {
            padding: 14px;
            border-radius: 16px;
            align-items: stretch;
            flex-direction: column;
            gap: 12px;
          }

          .manutencao-title {
            gap: 10px;
          }

          .manutencao-title-icon {
            width: 43px;
            height: 43px;
            border-radius: 12px;
          }

          .manutencao-title h1 {
            font-size: 24px;
          }

          .manutencao-title p {
            font-size: 11px;
          }

          .btn-nova-manutencao {
            width: 100%;
            min-height: 45px;
          }

          .manutencao-stats {
            grid-template-columns:
              repeat(3,minmax(0,1fr));
            gap: 7px;
            margin-bottom: 12px;
          }

          .manutencao-stat {
            display: block;
            padding: 11px 8px;
            border-radius: 14px;
            text-align: center;
          }

          .stat-icon {
            width: 34px;
            height: 34px;
            margin: 0 auto 7px;
            border-radius: 9px;
          }

          .manutencao-stat span {
            font-size: 9px;
          }

          .manutencao-stat strong {
            margin-top: 4px;
            font-size: 22px;
          }

          .manutencao-stat small {
            display: none;
          }

          .manutencao-form-card,
          .historico-card {
            padding: 13px;
            margin-bottom: 12px;
            border-radius: 16px;
          }

          .form-card-header {
            margin-bottom: 15px;
          }

          .form-card-header h2,
          .historico-header h2 {
            font-size: 16px;
          }

          .form-card-header p,
          .historico-header p {
            font-size: 10px;
          }

          .form-grid {
            grid-template-columns: 1fr;
            gap: 11px;
          }

          .campo-equipamento {
            grid-column: span 1;
          }

          .form-section {
            padding: 12px;
          }

          .section-header-mobile {
            align-items: flex-start;
            flex-direction: column;
          }

          .btn-secundario {
            width: 100%;
            justify-content: center;
          }

          .servico-grid {
            grid-template-columns: 1fr;
            gap: 10px;
          }

          .fotos-grid {
            grid-template-columns:
              repeat(2,minmax(0,1fr));
          }

          .foto-card img {
            height: 110px;
          }

          .form-actions {
            flex-direction: column-reverse;
          }

          .btn-cancelar,
          .btn-salvar {
            width: 100%;
            min-height: 45px;
          }

          .historico-header {
            align-items: stretch;
            flex-direction: column;
            gap: 12px;
          }

          .historico-titulo {
            width: 100%;
          }

          .busca-container {
            width: 100%;
          }

          .historico-desktop {
            display: none;
          }

          .historico-mobile {
            display: flex;
            flex-direction: column;
            gap: 10px;
          }

          .manutencao-mobile-card {
            padding: 13px;
            border: 1px solid #e2e8f0;
            border-radius: 14px;
            background: #fbfdff;
          }

          .mobile-card-top {
            display: flex;
            align-items: flex-start;
            justify-content: space-between;
            gap: 10px;
            padding-bottom: 11px;
            border-bottom: 1px solid #e2e8f0;
          }

          .mobile-label {
            display: block;
            margin-bottom: 3px;
            color: #94a3b8;
            font-size: 9px;
            font-weight: 700;
            text-transform: uppercase;
          }

          .mobile-card-top strong {
            display: block;
            font-size: 14px;
            line-height: 1.25;
          }

          .mobile-info-grid {
            display: grid;
            grid-template-columns:
              repeat(2,minmax(0,1fr));
            gap: 10px;
            padding: 12px 0;
          }

          .mobile-info-grid > div {
            min-width: 0;
          }

          .mobile-info-grid span {
            display: block;
            margin-bottom: 3px;
            color: #94a3b8;
            font-size: 9px;
          }

          .mobile-info-grid strong {
            display: block;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            font-size: 11px;
          }

          .mobile-actions {
            display: grid;
            grid-template-columns:
              repeat(2,minmax(0,1fr));
            gap: 7px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
          }

          .mobile-actions button {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 5px;
            min-height: 36px;
            border: 1px solid #dbe3ec;
            border-radius: 9px;
            background: white;
            font-size: 10px;
            font-weight: 700;
            cursor: pointer;
          }

          .modal-overlay {
            align-items: flex-end;
            padding: 0;
          }

          .modal-card {
            max-height: 92vh;
            padding: 17px;
            border-radius: 20px 20px 0 0;
          }

          .modal-grid {
            grid-template-columns: 1fr;
          }

          .modal-full {
            grid-column: span 1;
          }

          .modal-footer button {
            width: 100%;
          }
        }

        @media (max-width: 380px) {

          .manutencao-page {
            padding: 7px;
          }

          .manutencao-stats {
            gap: 5px;
          }

          .manutencao-stat {
            padding: 9px 5px;
          }

          .manutencao-stat strong {
            font-size: 20px;
          }

          .mobile-actions button {
            font-size: 9px;
          }
        }

      `}</style>
    </main>
  );
}
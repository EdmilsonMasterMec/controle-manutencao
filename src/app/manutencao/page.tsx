"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
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

const statusEquipamento = [
  "Operando",
  "Em Manutenção",
  "Parada",
];

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

function normalizarStatus(valor: string | null | undefined) {
  return String(valor || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ");
}

function formatarData(valor: string | null | undefined) {
  if (!valor) return "-";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) {
    return valor;
  }

  return data.toLocaleDateString("pt-BR");
}

function nomeEquipamento(equipamento: Equipamento) {
  return (
    equipamento.descricao_bem ||
    `${equipamento.fabricante || ""} ${equipamento.modelo || ""}`.trim() ||
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

        if (largura > maximo || altura > maximo) {
          const proporcao = Math.min(
            maximo / largura,
            maximo / altura
          );

          largura = Math.round(largura * proporcao);
          altura = Math.round(altura * proporcao);
        }

        const canvas = document.createElement("canvas");

        canvas.width = largura;
        canvas.height = altura;

        const contexto = canvas.getContext("2d");

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
          canvas.toDataURL("image/jpeg", 0.75)
        );
      };

      imagem.onerror = () => {
        reject(
          new Error(
            "Não foi possível carregar a imagem."
          )
        );
      };

      imagem.src = String(leitor.result);
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

  const [erro, setErro] = useState("");

  const [mensagem, setMensagem] =
    useState("");

  const [busca, setBusca] =
    useState("");

  const [mostrarFormulario, setMostrarFormulario] =
    useState(false);

  const [mostrarHistorico, setMostrarHistorico] =
    useState(true);

  const [editandoId, setEditandoId] =
    useState<number | null>(null);

  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState("");

  const [tipo, setTipo] =
    useState("Corretiva");

  const [mecanico, setMecanico] =
    useState("");

  const [data, setData] =
    useState(
      new Date().toISOString().slice(0, 10)
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
      new Date().toISOString().slice(0, 10)
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

  function removerServico(indice: number) {
    setServicos((atual) => {
      if (atual.length === 1) {
        return atual;
      }

      return atual.filter(
        (_, index) => index !== indice
      );
    });
  }

  function alterarServico(
    indice: number,
    campo: keyof ServicoFormulario,
    valor: string
  ) {
    setServicos((atual) =>
      atual.map((servico, index) =>
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
    const arquivos =
      Array.from(
        evento.target.files || []
      );

    if (!arquivos.length) {
      return;
    }

    try {
      const novasFotos: FotoServico[] = [];

      for (const arquivo of arquivos) {
        const imagem =
          await comprimirImagem(arquivo);

        novasFotos.push({
          id:
            Date.now().toString() +
            Math.random().toString(36).slice(2),
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
      atual.filter((foto) => foto.id !== id)
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
            servico.descricao.trim() !== ""
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

      /*
       * Os serviços e fotos ficam preparados no formulário
       * para uso futuro em tabelas específicas.
       * O registro principal é salvo na tabela manutencoes
       * usando somente os campos existentes no cadastro principal.
       */
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
        ? String(manutencao.equipamento_id)
        : ""
    );

    setTipo(
      manutencao.tipo || "Corretiva"
    );

    setMecanico(
      manutencao.mecanico || ""
    );

    setData(
      manutencao.data
        ? manutencao.data.slice(0, 10)
        : new Date()
            .toISOString()
            .slice(0, 10)
    );

    setHorimetro(
      manutencao.horimetro || ""
    );

    setPrioridade(
      manutencao.prioridade || "Média"
    );

    setStatus(
      manutencao.status || "Em Andamento"
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
    <main className="mastermec-app">
      <div className="w-full p-4 md:p-6">
        {/* CABEÇALHO */}

        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <Wrench size={30} />

              <div>
                <h1 className="text-2xl font-bold">
                  Manutenção
                </h1>

                <p className="text-sm opacity-70">
                  Controle de manutenções da frota
                </p>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={abrirNovo}
            className="flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-semibold shadow-sm"
          >
            <Plus size={20} />

            Nova Manutenção
          </button>
        </div>

        {/* MENSAGENS */}

        {erro && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
            <XCircle
              size={22}
              className="mt-0.5 shrink-0"
            />

            <div>
              <strong>
                Não foi possível concluir a operação
              </strong>

              <p className="mt-1 text-sm">
                {erro}
              </p>
            </div>
          </div>
        )}

        {mensagem && (
          <div className="mb-5 flex items-start gap-3 rounded-xl border border-green-300 bg-green-50 p-4 text-green-700">
            <CheckCircle2
              size={22}
              className="mt-0.5 shrink-0"
            />

            <p>{mensagem}</p>
          </div>
        )}

        {/* CARDS */}

        <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm opacity-70">
              Total
            </p>

            <p className="mt-2 text-3xl font-bold">
              {manutencoes.length}
            </p>

            <p className="mt-1 text-xs opacity-60">
              Manutenções registradas
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm opacity-70">
              Em andamento
            </p>

            <p className="mt-2 text-3xl font-bold">
              {emAndamento}
            </p>

            <p className="mt-1 text-xs opacity-60">
              Serviços ativos
            </p>
          </div>

          <div className="rounded-2xl border bg-white p-5 shadow-sm">
            <p className="text-sm opacity-70">
              Concluídas
            </p>

            <p className="mt-2 text-3xl font-bold">
              {concluidas}
            </p>

            <p className="mt-1 text-xs opacity-60">
              Serviços finalizados
            </p>
          </div>
        </div>

        {/* FORMULÁRIO */}

        {mostrarFormulario && (
          <section className="mb-6 rounded-2xl border bg-white p-5 shadow-sm">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-bold">
                  {editandoId !== null
                    ? "Editar Manutenção"
                    : "Nova Manutenção"}
                </h2>

                <p className="text-sm opacity-60">
                  Informe os dados do serviço realizado.
                </p>
              </div>

              <button
                type="button"
                onClick={fecharFormulario}
                className="rounded-lg p-2"
              >
                <X size={22} />
              </button>
            </div>

            <form
              onSubmit={salvarManutencao}
              className="space-y-6"
            >
              {/* DADOS PRINCIPAIS */}

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <label className="mb-2 block text-sm font-semibold">
                    Equipamento *
                  </label>

                  <select
                    value={equipamentoSelecionado}
                    onChange={(evento) => {
                      setEquipamentoSelecionado(
                        evento.target.value
                      );

                      const equipamento =
                        equipamentos.find(
                          (item) =>
                            String(item.id) ===
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
                    className="w-full rounded-xl border px-4 py-3"
                    required
                  >
                    <option value="">
                      Selecione o equipamento
                    </option>

                    {equipamentos.map(
                      (equipamento) => (
                        <option
                          key={equipamento.id}
                          value={equipamento.id}
                        >
                          {nomeEquipamento(
                            equipamento
                          )}
                        </option>
                      )
                    )}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Tipo *
                  </label>

                  <select
                    value={tipo}
                    onChange={(evento) =>
                      setTipo(
                        evento.target.value
                      )
                    }
                    className="w-full rounded-xl border px-4 py-3"
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

                <div>
                  <label className="mb-2 block text-sm font-semibold">
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
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
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
                    className="w-full rounded-xl border px-4 py-3"
                    required
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
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
                    className="w-full rounded-xl border px-4 py-3"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Prioridade
                  </label>

                  <select
                    value={prioridade}
                    onChange={(evento) =>
                      setPrioridade(
                        evento.target.value
                      )
                    }
                    className="w-full rounded-xl border px-4 py-3"
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

                <div>
                  <label className="mb-2 block text-sm font-semibold">
                    Status
                  </label>

                  <select
                    value={status}
                    onChange={(evento) =>
                      setStatus(
                        evento.target.value
                      )
                    }
                    className="w-full rounded-xl border px-4 py-3"
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

              {/* SERVIÇOS */}

              <div className="rounded-2xl border p-4">
                <div className="mb-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="font-bold">
                      Serviços Executados
                    </h3>

                    <p className="text-sm opacity-60">
                      Descreva os serviços realizados.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={adicionarServico}
                    className="flex items-center justify-center gap-2 rounded-lg border px-4 py-2 text-sm font-semibold"
                  >
                    <Plus size={18} />

                    Adicionar serviço
                  </button>
                </div>

                <div className="space-y-4">
                  {servicos.map(
                    (servico, indice) => (
                      <div
                        key={indice}
                        className="rounded-xl border p-4"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <strong>
                            Serviço {indice + 1}
                          </strong>

                          {servicos.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                removerServico(
                                  indice
                                )
                              }
                              className="rounded-lg p-2"
                            >
                              <Trash2
                                size={18}
                              />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                          <input
                            value={
                              servico.descricao
                            }
                            onChange={(evento) =>
                              alterarServico(
                                indice,
                                "descricao",
                                evento.target.value
                              )
                            }
                            placeholder="Descrição do serviço"
                            className="w-full rounded-xl border px-4 py-3"
                          />

                          <input
                            value={
                              servico.observacao
                            }
                            onChange={(evento) =>
                              alterarServico(
                                indice,
                                "observacao",
                                evento.target.value
                              )
                            }
                            placeholder="Observação"
                            className="w-full rounded-xl border px-4 py-3"
                          />
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>

              {/* FOTOS */}

              <div className="rounded-2xl border p-4">
                <div className="mb-4">
                  <h3 className="font-bold">
                    Fotos do Serviço
                  </h3>

                  <p className="text-sm opacity-60">
                    Adicione fotos para registrar o serviço.
                  </p>
                </div>

                <label className="flex cursor-pointer items-center justify-center gap-2 rounded-xl border border-dashed p-6">
                  <ImagePlus size={24} />

                  <span className="font-semibold">
                    Adicionar fotos
                  </span>

                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={adicionarFotos}
                    className="hidden"
                  />
                </label>

                {fotos.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                    {fotos.map((foto) => (
                      <div
                        key={foto.id}
                        className="relative overflow-hidden rounded-xl border"
                      >
                        <img
                          src={foto.imagem}
                          alt={foto.nome}
                          className="h-32 w-full object-cover"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            removerFoto(
                              foto.id
                            )
                          }
                          className="absolute right-2 top-2 rounded-full border bg-white p-1"
                        >
                          <X size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* BOTÕES */}

              <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={fecharFormulario}
                  className="flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-semibold"
                >
                  <X size={18} />

                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="flex items-center justify-center gap-2 rounded-xl border px-5 py-3 font-semibold disabled:opacity-50"
                >
                  {salvando ? (
                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
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

        <section className="rounded-2xl border bg-white p-5 shadow-sm">
          <div className="mb-5 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <button
              type="button"
              onClick={() =>
                setMostrarHistorico(
                  (valor) => !valor
                )
              }
              className="flex items-center gap-2 text-left"
            >
              <ChevronDown
                size={22}
                className={
                  mostrarHistorico
                    ? ""
                    : "-rotate-90"
                }
              />

              <div>
                <h2 className="text-xl font-bold">
                  Histórico de Manutenções
                </h2>

                <p className="text-sm opacity-60">
                  Consulte os serviços registrados.
                </p>
              </div>
            </button>

            <div className="relative w-full md:w-80">
              <Search
                size={19}
                className="absolute left-3 top-1/2 -translate-y-1/2 opacity-50"
              />

              <input
                value={busca}
                onChange={(evento) =>
                  setBusca(
                    evento.target.value
                  )
                }
                placeholder="Buscar manutenção..."
                className="w-full rounded-xl border py-3 pl-10 pr-4"
              />
            </div>
          </div>

          {mostrarHistorico && (
            <>
              {carregando ? (
                <div className="flex items-center justify-center gap-3 p-10">
                  <Loader2
                    size={24}
                    className="animate-spin"
                  />

                  <span>
                    Carregando manutenções...
                  </span>
                </div>
              ) : manutencoesFiltradas.length ===
                0 ? (
                <div className="rounded-xl border border-dashed p-10 text-center">
                  <Clock3
                    size={32}
                    className="mx-auto mb-3 opacity-50"
                  />

                  <p className="font-semibold">
                    Nenhuma manutenção encontrada.
                  </p>

                  <p className="mt-1 text-sm opacity-60">
                    Registre uma nova manutenção para
                    começar o histórico.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1000px] border-collapse">
                    <thead>
                      <tr className="border-b text-left text-sm">
                        <th className="px-3 py-3">
                          Máquina
                        </th>

                        <th className="px-3 py-3">
                          Tipo
                        </th>

                        <th className="px-3 py-3">
                          Mecânico
                        </th>

                        <th className="px-3 py-3">
                          Data
                        </th>

                        <th className="px-3 py-3">
                          Horímetro
                        </th>

                        <th className="px-3 py-3">
                          Prioridade
                        </th>

                        <th className="px-3 py-3">
                          Status
                        </th>

                        <th className="px-3 py-3 text-right">
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
                              key={manutencao.id}
                              className="border-b text-sm"
                            >
                              <td className="px-3 py-4 font-semibold">
                                {manutencao.maquina ||
                                  "-"}
                              </td>

                              <td className="px-3 py-4">
                                {manutencao.tipo ||
                                  "-"}
                              </td>

                              <td className="px-3 py-4">
                                {manutencao.mecanico ||
                                  "-"}
                              </td>

                              <td className="px-3 py-4">
                                {formatarData(
                                  manutencao.data
                                )}
                              </td>

                              <td className="px-3 py-4">
                                {manutencao.horimetro ||
                                  "-"}
                              </td>

                              <td className="px-3 py-4">
                                {manutencao.prioridade ||
                                  "-"}
                              </td>

                              <td className="px-3 py-4">
                                <span className="inline-flex rounded-full border px-3 py-1 text-xs font-semibold">
                                  {manutencao.status ||
                                    "-"}
                                </span>
                              </td>

                              <td className="px-3 py-4">
                                <div className="flex justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() =>
                                      setVisualizando(
                                        manutencao
                                      )
                                    }
                                    className="rounded-lg border p-2"
                                    title="Visualizar"
                                  >
                                    <Eye
                                      size={17}
                                    />
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() =>
                                      editarManutencao(
                                        manutencao
                                      )
                                    }
                                    className="rounded-lg border p-2"
                                    title="Editar"
                                  >
                                    <Pencil
                                      size={17}
                                    />
                                  </button>

                                  {ativa && (
                                    <button
                                      type="button"
                                      onClick={() =>
                                        concluirManutencao(
                                          manutencao.id
                                        )
                                      }
                                      className="rounded-lg border p-2"
                                      title="Concluir"
                                    >
                                      <CheckCircle2
                                        size={17}
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
                                    className="rounded-lg border p-2"
                                    title="Excluir"
                                  >
                                    <Trash2
                                      size={17}
                                    />
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
              )}
            </>
          )}
        </section>

        {/* MODAL DE VISUALIZAÇÃO */}

        {visualizando && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border bg-white p-6 shadow-xl">
              <div className="mb-6 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    Detalhes da Manutenção
                  </h2>

                  <p className="text-sm opacity-60">
                    Registro #{visualizando.id}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setVisualizando(null)
                  }
                  className="rounded-lg p-2"
                >
                  <X size={22} />
                </button>
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-xl border p-4">
                  <p className="text-xs opacity-60">
                    Máquina
                  </p>

                  <p className="mt-1 font-semibold">
                    {visualizando.maquina ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs opacity-60">
                    Tipo
                  </p>

                  <p className="mt-1 font-semibold">
                    {visualizando.tipo || "-"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs opacity-60">
                    Mecânico
                  </p>

                  <p className="mt-1 font-semibold">
                    {visualizando.mecanico ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs opacity-60">
                    Data
                  </p>

                  <p className="mt-1 font-semibold">
                    {formatarData(
                      visualizando.data
                    )}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs opacity-60">
                    Horímetro
                  </p>

                  <p className="mt-1 font-semibold">
                    {visualizando.horimetro ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-xl border p-4">
                  <p className="text-xs opacity-60">
                    Prioridade
                  </p>

                  <p className="mt-1 font-semibold">
                    {visualizando.prioridade ||
                      "-"}
                  </p>
                </div>

                <div className="rounded-xl border p-4 sm:col-span-2">
                  <p className="text-xs opacity-60">
                    Status
                  </p>

                  <p className="mt-1 font-semibold">
                    {visualizando.status ||
                      "-"}
                  </p>
                </div>
              </div>

              <div className="mt-6 flex justify-end">
                <button
                  type="button"
                  onClick={() =>
                    setVisualizando(null)
                  }
                  className="rounded-xl border px-5 py-3 font-semibold"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
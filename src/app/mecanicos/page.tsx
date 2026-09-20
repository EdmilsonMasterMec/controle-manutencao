"use client";

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Save,
  UserRound,
  Phone,
  Wrench,
  CheckCircle2,
  CircleOff,
} from "lucide-react";

type Mecanico = {
  id: string;
  nome: string;
  especialidade: string;
  telefone: string;
  status: "Ativo" | "Inativo";
};

type FormMecanico = {
  nome: string;
  especialidade: string;
  telefone: string;
  status: "Ativo" | "Inativo";
};

const CHAVE_STORAGE = "mastermec_mecanicos";

const mecanicosIniciais: Mecanico[] = [
  {
    id: "mecanico-joao-silva",
    nome: "João Silva",
    especialidade: "Mecânica Pesada",
    telefone: "",
    status: "Ativo",
  },
  {
    id: "mecanico-carlos-souza",
    nome: "Carlos Souza",
    especialidade: "Elétrica / Eletrônica",
    telefone: "",
    status: "Ativo",
  },
];

const formInicial: FormMecanico = {
  nome: "",
  especialidade: "",
  telefone: "",
  status: "Ativo",
};

export default function MecanicosPage() {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [mostrarCadastro, setMostrarCadastro] =
    useState(false);

  const [editandoId, setEditandoId] =
    useState<string | null>(null);

  const [form, setForm] =
    useState<FormMecanico>(formInicial);

  /*
   * CARREGA OS MECÂNICOS SALVOS NO CELULAR/NAVEGADOR
   */
  useEffect(() => {
    try {
      const dadosSalvos =
        localStorage.getItem(CHAVE_STORAGE);

      if (dadosSalvos) {
        const lista = JSON.parse(
          dadosSalvos
        ) as Mecanico[];

        if (Array.isArray(lista)) {
          setMecanicos(lista);
        } else {
          setMecanicos(mecanicosIniciais);
          localStorage.setItem(
            CHAVE_STORAGE,
            JSON.stringify(mecanicosIniciais)
          );
        }
      } else {
        /*
         * Primeira utilização:
         * cria os dois mecânicos iniciais.
         */
        setMecanicos(mecanicosIniciais);

        localStorage.setItem(
          CHAVE_STORAGE,
          JSON.stringify(mecanicosIniciais)
        );
      }
    } catch (error) {
      console.error(
        "Erro ao carregar mecânicos:",
        error
      );

      setMecanicos(mecanicosIniciais);
    }

    setCarregando(false);
  }, []);

  /*
   * SALVA A LISTA COMPLETA NO NAVEGADOR
   */
  function salvarLista(
    novaLista: Mecanico[]
  ) {
    try {
      localStorage.setItem(
        CHAVE_STORAGE,
        JSON.stringify(novaLista)
      );

      setMecanicos(novaLista);
    } catch (error) {
      console.error(
        "Erro ao salvar mecânicos:",
        error
      );

      alert(
        "Não foi possível salvar os mecânicos no navegador."
      );
    }
  }

  function abrirNovoCadastro() {
    setEditandoId(null);
    setForm(formInicial);
    setMostrarCadastro(true);
  }

  function editarMecanico(
    mecanico: Mecanico
  ) {
    setEditandoId(mecanico.id);

    setForm({
      nome: mecanico.nome || "",
      especialidade:
        mecanico.especialidade || "",
      telefone: mecanico.telefone || "",
      status:
        mecanico.status || "Ativo",
    });

    setMostrarCadastro(true);
  }

  function salvarMecanico() {
    if (!form.nome.trim()) {
      alert("Informe o nome do mecânico.");
      return;
    }

    if (!form.especialidade.trim()) {
      alert(
        "Informe a especialidade do mecânico."
      );
      return;
    }

    /*
     * EDITAR MECÂNICO
     */
    if (editandoId !== null) {
      const novaLista = mecanicos.map(
        (mecanico) =>
          mecanico.id === editandoId
            ? {
                ...mecanico,
                nome: form.nome.trim(),
                especialidade:
                  form.especialidade.trim(),
                telefone:
                  form.telefone.trim(),
                status: form.status,
              }
            : mecanico
      );

      salvarLista(novaLista);

      alert(
        "Mecânico atualizado com sucesso."
      );
    } else {
      /*
       * NOVO MECÂNICO
       */
      const novoMecanico: Mecanico = {
        id:
          "mecanico-" +
          Date.now().toString() +
          "-" +
          Math.random()
            .toString(36)
            .substring(2, 8),

        nome: form.nome.trim(),

        especialidade:
          form.especialidade.trim(),

        telefone:
          form.telefone.trim(),

        status: form.status,
      };

      const novaLista = [
        ...mecanicos,
        novoMecanico,
      ];

      salvarLista(novaLista);

      alert(
        "Mecânico cadastrado com sucesso."
      );
    }

    setForm(formInicial);
    setEditandoId(null);
    setMostrarCadastro(false);
  }

  function excluirMecanico(
    id: string
  ) {
    const mecanico = mecanicos.find(
      (item) => item.id === id
    );

    if (!mecanico) return;

    const confirmar = window.confirm(
      `Deseja realmente excluir este mecânico?\n\n${mecanico.nome}`
    );

    if (!confirmar) return;

    const novaLista = mecanicos.filter(
      (item) => item.id !== id
    );

    salvarLista(novaLista);
  }

  function alternarStatus(
    id: string
  ) {
    const novaLista = mecanicos.map(
      (mecanico) =>
        mecanico.id === id
          ? {
              ...mecanico,
              status:
                mecanico.status === "Ativo"
                  ? "Inativo"
                  : "Ativo",
            }
          : mecanico
    );

    salvarLista(novaLista);
  }

  const ativos = mecanicos.filter(
    (mecanico) =>
      mecanico.status === "Ativo"
  ).length;

  const inativos = mecanicos.filter(
    (mecanico) =>
      mecanico.status === "Inativo"
  ).length;

  return (
    <main className="mastermec-app">
      <div style={containerStyle}>

        {/* CABEÇALHO */}

        <div style={topoStyle}>
          <div>
            <h1
              style={{
                margin: 0,
                fontSize: "28px",
              }}
            >
              Mecânicos
            </h1>

            <p
              style={{
                marginTop: "6px",
                color: "#666",
              }}
            >
              Cadastro e controle da equipe
              técnica
            </p>
          </div>

          <button
            onClick={abrirNovoCadastro}
            style={botaoPreto}
          >
            <Plus size={19} />
            Novo mecânico
          </button>
        </div>

        {/* RESUMO */}

        <div style={resumoGridStyle}>

          <div style={resumoCardStyle}>
            <div
              style={{
                ...iconeResumoStyle,
                background: "#e8f1ff",
                color: "#2563a8",
              }}
            >
              <UserRound size={24} />
            </div>

            <div>
              <span style={resumoTituloStyle}>
                Total de mecânicos
              </span>

              <strong
                style={resumoNumeroStyle}
              >
                {mecanicos.length}
              </strong>
            </div>
          </div>

          <div style={resumoCardStyle}>
            <div
              style={{
                ...iconeResumoStyle,
                background: "#e4f7e9",
                color: "#23844a",
              }}
            >
              <CheckCircle2 size={24} />
            </div>

            <div>
              <span style={resumoTituloStyle}>
                Mecânicos ativos
              </span>

              <strong
                style={resumoNumeroStyle}
              >
                {ativos}
              </strong>
            </div>
          </div>

          <div style={resumoCardStyle}>
            <div
              style={{
                ...iconeResumoStyle,
                background: "#f8e6e6",
                color: "#b53b3b",
              }}
            >
              <CircleOff size={24} />
            </div>

            <div>
              <span style={resumoTituloStyle}>
                Inativos
              </span>

              <strong
                style={resumoNumeroStyle}
              >
                {inativos}
              </strong>
            </div>
          </div>

        </div>

        {/* TABELA */}

        {carregando ? (
          <div style={mensagemStyle}>
            Carregando mecânicos...
          </div>
        ) : mecanicos.length === 0 ? (
          <div style={mensagemStyle}>
            <UserRound
              size={40}
              color="#aaa"
            />

            <p>
              Nenhum mecânico cadastrado.
            </p>

            <button
              onClick={abrirNovoCadastro}
              style={botaoPreto}
            >
              <Plus size={18} />
              Cadastrar mecânico
            </button>
          </div>
        ) : (
          <div style={tabelaBoxStyle}>

            <table style={tabelaStyle}>

              <thead>
                <tr
                  style={cabecalhoTabelaStyle}
                >
                  <th style={thStyle}>
                    Mecânico
                  </th>

                  <th style={thStyle}>
                    Especialidade
                  </th>

                  <th style={thStyle}>
                    Telefone
                  </th>

                  <th style={thStyle}>
                    Status
                  </th>

                  <th style={thStyle}>
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {mecanicos.map(
                  (mecanico) => (
                    <tr
                      key={mecanico.id}
                      style={{
                        borderTop:
                          "1px solid #eee",
                      }}
                    >

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "10px",
                          }}
                        >
                          <div
                            style={
                              avatarStyle
                            }
                          >
                            <UserRound
                              size={18}
                            />
                          </div>

                          <strong>
                            {mecanico.nome}
                          </strong>
                        </div>
                      </td>

                      <td style={tdStyle}>
                        <div
                          style={{
                            display: "flex",
                            alignItems: "center",
                            gap: "7px",
                          }}
                        >
                          <Wrench
                            size={16}
                            color="#777"
                          />

                          {
                            mecanico.especialidade
                          }
                        </div>
                      </td>

                      <td style={tdStyle}>
                        {mecanico.telefone ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems:
                                "center",
                              gap: "7px",
                            }}
                          >
                            <Phone
                              size={16}
                              color="#777"
                            />

                            {
                              mecanico.telefone
                            }
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td style={tdStyle}>
                        <button
                          onClick={() =>
                            alternarStatus(
                              mecanico.id
                            )
                          }
                          style={statusStyle(
                            mecanico.status
                          )}
                          title="Clique para alterar o status"
                        >
                          {mecanico.status}
                        </button>
                      </td>

                      <td style={tdStyle}>

                        <div
                          style={{
                            display: "flex",
                            gap: "7px",
                          }}
                        >

                          <button
                            title="Editar mecânico"
                            onClick={() =>
                              editarMecanico(
                                mecanico
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

                          <button
                            title="Excluir mecânico"
                            onClick={() =>
                              excluirMecanico(
                                mecanico.id
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

                      </td>

                    </tr>
                  )
                )}
              </tbody>

            </table>

          </div>
        )}

        {/* MODAL */}

        {mostrarCadastro && (
          <div style={modalFundoStyle}>

            <div style={modalStyle}>

              <div
                style={modalTopoStyle}
              >
                <div>
                  <h2
                    style={{
                      margin: 0,
                    }}
                  >
                    {editandoId
                      ? "Editar mecânico"
                      : "Novo mecânico"}
                  </h2>

                  <p
                    style={{
                      margin:
                        "5px 0 0",
                      color: "#777",
                      fontSize:
                        "14px",
                    }}
                  >
                    Preencha os dados
                    da equipe técnica.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setMostrarCadastro(
                      false
                    );
                    setEditandoId(null);
                    setForm(
                      formInicial
                    );
                  }}
                  style={fecharStyle}
                >
                  <X size={19} />
                </button>
              </div>

              <div
                style={formGridStyle}
              >

                <Campo
                  label="Nome completo"
                  value={form.nome}
                  onChange={(valor) =>
                    setForm({
                      ...form,
                      nome: valor,
                    })
                  }
                />

                <Campo
                  label="Especialidade"
                  value={
                    form.especialidade
                  }
                  onChange={(valor) =>
                    setForm({
                      ...form,
                      especialidade:
                        valor,
                    })
                  }
                />

                <Campo
                  label="Telefone"
                  value={
                    form.telefone
                  }
                  onChange={(valor) =>
                    setForm({
                      ...form,
                      telefone:
                        valor,
                    })
                  }
                />

                <div>
                  <label
                    style={labelStyle}
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
                            .value as
                            | "Ativo"
                            | "Inativo",
                      })
                    }
                    style={
                      inputStyle
                    }
                  >
                    <option value="Ativo">
                      Ativo
                    </option>

                    <option value="Inativo">
                      Inativo
                    </option>
                  </select>
                </div>

              </div>

              <button
                onClick={
                  salvarMecanico
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

                {editandoId
                  ? "Salvar alterações"
                  : "Salvar mecânico"}
              </button>

            </div>

          </div>
        )}

      </div>
    </main>
  );
}

/* =====================================================
   COMPONENTE CAMPO
===================================================== */

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

/* =====================================================
   ESTILOS
===================================================== */

const containerStyle: React.CSSProperties =
  {
    padding: "25px",
    maxWidth: "1600px",
    margin: "0 auto",
  };

const topoStyle: React.CSSProperties =
  {
    display: "flex",
    justifyContent:
      "space-between",
    alignItems: "center",
    gap: "15px",
    flexWrap: "wrap",
    marginBottom: "25px",
  };

const botaoPreto: React.CSSProperties =
  {
    display: "flex",
    alignItems: "center",
    justifyContent:
      "center",
    gap: "8px",
    background: "#222",
    color: "#fff",
    border: "none",
    padding: "12px 18px",
    borderRadius: "8px",
    cursor: "pointer",
    fontWeight: 600,
  };

const resumoGridStyle: React.CSSProperties =
  {
    display: "grid",
    gridTemplateColumns:
      "repeat(auto-fit,minmax(220px,1fr))",
    gap: "15px",
    marginBottom: "25px",
  };

const resumoCardStyle: React.CSSProperties =
  {
    background: "#fff",
    borderRadius: "12px",
    padding: "18px",
    display: "flex",
    alignItems: "center",
    gap: "15px",
    border: "1px solid #eee",
    boxShadow:
      "0 2
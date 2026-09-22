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

import { supabase } from "@/lib/supabase";

type Mecanico = {
  id: number;
  nome: string;
  especialidade: string;
  telefone: string;
  status: "Ativo" | "Inativo";
  created_at?: string;
};

type FormMecanico = {
  nome: string;
  especialidade: string;
  telefone: string;
  status: "Ativo" | "Inativo";
};

const formInicial: FormMecanico = {
  nome: "",
  especialidade: "",
  telefone: "",
  status: "Ativo",
};

export default function MecanicosPage() {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);

  const [carregando, setCarregando] = useState(true);

  const [salvando, setSalvando] = useState(false);

  const [mostrarCadastro, setMostrarCadastro] = useState(false);

  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [form, setForm] = useState<FormMecanico>(formInicial);

  /*
  =====================================================
  CARREGAR MECÂNICOS DO SUPABASE
  =====================================================
  */

  useEffect(() => {
    carregarMecanicos();
  }, []);

  async function carregarMecanicos() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("mecanicos")
      .select(
        `
          id,
          nome,
          especialidade,
          telefone,
          status,
          created_at
        `
      )
      .order("id", {
        ascending: true,
      });

    if (error) {
      console.error(
        "Erro ao carregar mecânicos:",
        error
      );

      alert(
        "Erro ao carregar os mecânicos:\n\n" +
          error.message
      );

      setCarregando(false);
      return;
    }

    setMecanicos((data || []) as Mecanico[]);

    setCarregando(false);
  }

  /*
  =====================================================
  NOVO MECÂNICO
  =====================================================
  */

  function abrirNovoCadastro() {
    setEditandoId(null);
    setForm(formInicial);
    setMostrarCadastro(true);
  }

  /*
  =====================================================
  EDITAR MECÂNICO
  =====================================================
  */

  function editarMecanico(mecanico: Mecanico) {
    setEditandoId(mecanico.id);

    setForm({
      nome: mecanico.nome || "",
      especialidade: mecanico.especialidade || "",
      telefone: mecanico.telefone || "",
      status: mecanico.status || "Ativo",
    });

    setMostrarCadastro(true);
  }

  /*
  =====================================================
  SALVAR MECÂNICO
  =====================================================
  */

  async function salvarMecanico() {
    if (!form.nome.trim()) {
      alert("Informe o nome do mecânico.");
      return;
    }

    if (!form.especialidade.trim()) {
      alert("Informe a especialidade do mecânico.");
      return;
    }

    setSalvando(true);

    try {
      /*
      =================================================
      ATUALIZAÇÃO
      =================================================
      */

      if (editandoId !== null) {
        const { error } = await supabase
          .from("mecanicos")
          .update({
            nome: form.nome.trim(),
            especialidade: form.especialidade.trim(),
            telefone: form.telefone.trim(),
            status: form.status,
          })
          .eq("id", editandoId);

        if (error) {
          console.error(
            "Erro ao atualizar mecânico:",
            error
          );

          alert(
            "Erro ao atualizar mecânico:\n\n" +
              error.message
          );

          return;
        }

        alert("Mecânico atualizado com sucesso.");
      } else {
        /*
        ===============================================
        NOVO CADASTRO
        ===============================================
        */

        const { error } = await supabase
          .from("mecanicos")
          .insert({
            nome: form.nome.trim(),
            especialidade: form.especialidade.trim(),
            telefone: form.telefone.trim(),
            status: form.status,
          });

        if (error) {
          console.error(
            "Erro ao cadastrar mecânico:",
            error
          );

          alert(
            "Erro ao cadastrar mecânico:\n\n" +
              error.message
          );

          return;
        }

        alert("Mecânico cadastrado com sucesso.");
      }

      /*
      ===============================================
      LIMPA FORMULÁRIO
      ===============================================
      */

      setForm(formInicial);
      setEditandoId(null);
      setMostrarCadastro(false);

      /*
      ===============================================
      BUSCA NOVAMENTE NO SUPABASE
      ===============================================
      */

      await carregarMecanicos();
    } finally {
      setSalvando(false);
    }
  }

  /*
  =====================================================
  ALTERAR STATUS
  =====================================================
  */

  async function alternarStatus(mecanico: Mecanico) {
    const novoStatus =
      mecanico.status === "Ativo"
        ? "Inativo"
        : "Ativo";

    const { error } = await supabase
      .from("mecanicos")
      .update({
        status: novoStatus,
      })
      .eq("id", mecanico.id);

    if (error) {
      console.error(error);

      alert(
        "Erro ao alterar o status:\n\n" +
          error.message
      );

      return;
    }

    await carregarMecanicos();
  }

  /*
  =====================================================
  EXCLUIR
  =====================================================
  */

  async function excluirMecanico(mecanico: Mecanico) {
    const confirmar = window.confirm(
      `Deseja realmente excluir este mecânico?\n\n${mecanico.nome}\n\nEsta operação não poderá ser desfeita.`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("mecanicos")
      .delete()
      .eq("id", mecanico.id);

    if (error) {
      console.error(error);

      alert(
        "Erro ao excluir mecânico:\n\n" +
          error.message
      );

      return;
    }

    await carregarMecanicos();
  }

  /*
  =====================================================
  RESUMOS
  =====================================================
  */

  const ativos = mecanicos.filter(
    (mecanico) =>
      mecanico.status === "Ativo"
  ).length;

  const inativos = mecanicos.filter(
    (mecanico) =>
      mecanico.status === "Inativo"
  ).length;

  /*
  =====================================================
  INTERFACE
  =====================================================
  */

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

                /* ALTERAÇÃO:
                   TÍTULO BRANCO */
                color: "#ffffff",

                /* Ajuda na leitura sobre a imagem */
                textShadow:
                  "0 2px 6px rgba(0,0,0,0.65)",
              }}
            >
              Mecânicos
            </h1>

            <p
              style={{
                marginTop: "6px",

                /* ALTERAÇÃO:
                   SUBTÍTULO BRANCO */
                color: "#ffffff",

                /* Ajuda na leitura sobre a imagem */
                textShadow:
                  "0 2px 5px rgba(0,0,0,0.70)",
              }}
            >
              Cadastro e controle da equipe técnica
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

              <strong style={resumoNumeroStyle}>
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

              <strong style={resumoNumeroStyle}>
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

              <strong style={resumoNumeroStyle}>
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
                <tr style={cabecalhoTabelaStyle}>
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
                          <div style={avatarStyle}>
                            <UserRound size={18} />
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

                          {mecanico.especialidade}
                        </div>
                      </td>

                      <td style={tdStyle}>
                        {mecanico.telefone ? (
                          <div
                            style={{
                              display: "flex",
                              alignItems: "center",
                              gap: "7px",
                            }}
                          >
                            <Phone
                              size={16}
                              color="#777"
                            />

                            {mecanico.telefone}
                          </div>
                        ) : (
                          "-"
                        )}
                      </td>

                      <td style={tdStyle}>
                        <button
                          onClick={() =>
                            alternarStatus(
                              mecanico
                            )
                          }
                          style={statusStyle(
                            mecanico.status
                          )}
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
                            style={acaoStyle}
                          >
                            <Pencil size={17} />
                          </button>

                          <button
                            title="Excluir mecânico"
                            onClick={() =>
                              excluirMecanico(
                                mecanico
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
                            <Trash2 size={17} />
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
              <div style={modalTopoStyle}>
                <div>
                  <h2
                    style={{
                      margin: 0,
                    }}
                  >
                    {editandoId !== null
                      ? "Editar mecânico"
                      : "Novo mecânico"}
                  </h2>

                  <p
                    style={{
                      margin: "5px 0 0",
                      color: "#777",
                      fontSize: "14px",
                    }}
                  >
                    Preencha os dados da
                    equipe técnica.
                  </p>
                </div>

                <button
                  onClick={() => {
                    setMostrarCadastro(false);
                    setEditandoId(null);
                    setForm(formInicial);
                  }}
                  style={fecharStyle}
                >
                  <X size={19} />
                </button>
              </div>

              <div style={formGridStyle}>
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
                  value={form.especialidade}
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
                  value={form.telefone}
                  onChange={(valor) =>
                    setForm({
                      ...form,
                      telefone: valor,
                    })
                  }
                />

                <div>
                  <label style={labelStyle}>
                    Status
                  </label>

                  <select
                    value={form.status}
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
                    style={inputStyle}
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
                onClick={salvarMecanico}
                disabled={salvando}
                style={{
                  ...botaoPreto,
                  width: "100%",
                  justifyContent: "center",
                  marginTop: "25px",
                  opacity: salvando ? 0.7 : 1,
                }}
              >
                <Save size={19} />

                {salvando
                  ? "Salvando..."
                  : editandoId !== null
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
   CAMPO
===================================================== */

function Campo({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (valor: string) => void;
}) {
  return (
    <div>
      <label style={labelStyle}>
        {label}
      </label>

      <input
        value={value}
        onChange={(e) =>
          onChange(e.target.value)
        }
        style={inputStyle}
      />
    </div>
  );
}

/* =====================================================
   ESTILOS
===================================================== */

const containerStyle: React.CSSProperties = {
  padding: "25px",
  maxWidth: "1600px",
  margin: "0 auto",
};

const topoStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  gap: "15px",
  flexWrap: "wrap",
  marginBottom: "25px",
};

const botaoPreto: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "8px",
  background: "#222",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
};

const resumoGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "15px",
  marginBottom: "25px",
};

const resumoCardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  padding: "18px",
  display: "flex",
  alignItems: "center",
  gap: "15px",
  border: "1px solid #eee",
  boxShadow:
    "0 2px 10px rgba(0,0,0,.05)",
};

const iconeResumoStyle: React.CSSProperties = {
  width: "50px",
  height: "50px",
  borderRadius: "12px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const resumoTituloStyle: React.CSSProperties = {
  display: "block",
  color: "#777",
  fontSize: "13px",
  marginBottom: "3px",
};

const resumoNumeroStyle: React.CSSProperties = {
  display: "block",
  fontSize: "24px",
  color: "#172033",
};

const mensagemStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  padding: "50px 25px",
  textAlign: "center",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "12px",
};

const tabelaBoxStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  overflowX: "auto",
  boxShadow:
    "0 2px 10px rgba(0,0,0,.06)",
};

const tabelaStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "850px",
};

const cabecalhoTabelaStyle: React.CSSProperties = {
  background: "#f4f4f4",
  textAlign: "left",
};

const thStyle: React.CSSProperties = {
  padding: "14px",
  whiteSpace: "nowrap",
  fontSize: "13px",
};

const tdStyle: React.CSSProperties = {
  padding: "14px",
  verticalAlign: "middle",
  fontSize: "14px",
};

const avatarStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  borderRadius: "50%",
  background: "#edf3ff",
  color: "#2864a6",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const acaoStyle: React.CSSProperties = {
  width: "36px",
  height: "36px",
  border: "none",
  borderRadius: "7px",
  background: "#eee",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
};

const modalFundoStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,.55)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
  zIndex: 9999,
};

const modalStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  padding: "25px",
  width: "100%",
  maxWidth: "700px",
  maxHeight: "90vh",
  overflowY: "auto",
};

const modalTopoStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "25px",
  gap: "15px",
};

const fecharStyle: React.CSSProperties = {
  border: "none",
  background: "#eee",
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
};

const formGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(220px,1fr))",
  gap: "15px",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: "13px",
  fontWeight: 600,
  color: "#333",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  marginTop: "6px",
  padding: "11px",
  border: "1px solid #ccc",
  borderRadius: "7px",
  outline: "none",
  fontSize: "14px",
  background: "#fff",
};

function statusStyle(
  status: string
): React.CSSProperties {
  const ativo = status === "Ativo";

  return {
    border: "none",
    padding: "6px 11px",
    borderRadius: "20px",
    background: ativo
      ? "#dff5e3"
      : "#f5dada",
    color: ativo
      ? "#20733d"
      : "#a32e2e",
    fontWeight: 600,
    fontSize: "12px",
    cursor: "pointer",
  };
}
"use client";

import { useEffect, useState } from "react";
import {
  Users,
  UserPlus,
  Pencil,
  Trash2,
  Power,
  X,
  Save,
  Search,
} from "lucide-react";

import { supabase } from "@/lib/supabase";

type Mecanico = {
  id: number;
  nome: string;
  especialidade: string;
  telefone: string;
  status: string;
  created_at?: string;
};

type FormularioMecanico = {
  nome: string;
  especialidade: string;
  telefone: string;
  status: string;
};

const formularioInicial: FormularioMecanico = {
  nome: "",
  especialidade: "",
  telefone: "",
  status: "Ativo",
};

export default function MecanicosPage() {
  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);
  const [carregando, setCarregando] = useState(true);

  const [modalAberto, setModalAberto] = useState(false);
  const [editando, setEditando] = useState<Mecanico | null>(null);

  const [formulario, setFormulario] =
    useState<FormularioMecanico>(formularioInicial);

  const [busca, setBusca] = useState("");

  // =========================================================
  // CARREGAR MECÂNICOS DO SUPABASE
  // =========================================================

  async function carregarMecanicos() {
    try {
      setCarregando(true);

      const { data, error } = await supabase
        .from("mecanicos")
        .select("*")
        .order("id", { ascending: false });

      if (error) {
        console.error("Erro ao carregar mecânicos:", error);
        alert("Erro ao carregar mecânicos: " + error.message);
        return;
      }

      setMecanicos((data || []) as Mecanico[]);
    } catch (error) {
      console.error(error);
      alert("Erro inesperado ao carregar os mecânicos.");
    } finally {
      setCarregando(false);
    }
  }

  // =========================================================
  // CARREGA AO ABRIR A PÁGINA
  // =========================================================

  useEffect(() => {
    carregarMecanicos();
  }, []);

  // =========================================================
  // ABRIR NOVO
  // =========================================================

  function abrirNovoMecanico() {
    setEditando(null);
    setFormulario(formularioInicial);
    setModalAberto(true);
  }

  // =========================================================
  // ABRIR EDIÇÃO
  // =========================================================

  function abrirEdicao(mecanico: Mecanico) {
    setEditando(mecanico);

    setFormulario({
      nome: mecanico.nome || "",
      especialidade: mecanico.especialidade || "",
      telefone: mecanico.telefone || "",
      status: mecanico.status || "Ativo",
    });

    setModalAberto(true);
  }

  // =========================================================
  // FECHAR MODAL
  // =========================================================

  function fecharModal() {
    setModalAberto(false);
    setEditando(null);
    setFormulario(formularioInicial);
  }

  // =========================================================
  // SALVAR MECÂNICO
  // =========================================================

  async function salvarMecanico() {
    const nome = formulario.nome.trim();

    if (!nome) {
      alert("Informe o nome do mecânico.");
      return;
    }

    try {
      // -----------------------------------------------------
      // EDITANDO
      // -----------------------------------------------------

      if (editando) {
        const { error } = await supabase
          .from("mecanicos")
          .update({
            nome,
            especialidade: formulario.especialidade.trim(),
            telefone: formulario.telefone.trim(),
            status: formulario.status,
          })
          .eq("id", editando.id);

        if (error) {
          console.error("Erro ao atualizar:", error);
          alert("Erro ao atualizar mecânico: " + error.message);
          return;
        }

        alert("Mecânico atualizado com sucesso.");
      }

      // -----------------------------------------------------
      // NOVO MECÂNICO
      // -----------------------------------------------------

      else {
        const { data, error } = await supabase
          .from("mecanicos")
          .insert({
            nome,
            especialidade: formulario.especialidade.trim(),
            telefone: formulario.telefone.trim(),
            status: formulario.status,
          })
          .select()
          .single();

        if (error) {
          console.error("Erro ao cadastrar:", error);
          alert("Erro ao cadastrar mecânico: " + error.message);
          return;
        }

        console.log("Mecânico gravado no Supabase:", data);

        alert("Mecânico cadastrado com sucesso.");
      }

      fecharModal();

      // IMPORTANTE:
      // Depois de salvar, buscamos novamente no BANCO.
      // Não usamos localStorage.
      await carregarMecanicos();
    } catch (error) {
      console.error(error);
      alert("Erro inesperado ao salvar o mecânico.");
    }
  }

  // =========================================================
  // EXCLUIR
  // =========================================================

  async function excluirMecanico(id: number) {
    const confirmar = window.confirm(
      "Tem certeza que deseja excluir este mecânico?"
    );

    if (!confirmar) return;

    try {
      const { error } = await supabase
        .from("mecanicos")
        .delete()
        .eq("id", id);

      if (error) {
        console.error("Erro ao excluir:", error);
        alert("Erro ao excluir mecânico: " + error.message);
        return;
      }

      await carregarMecanicos();

      alert("Mecânico excluído com sucesso.");
    } catch (error) {
      console.error(error);
      alert("Erro inesperado ao excluir.");
    }
  }

  // =========================================================
  // ALTERAR STATUS
  // =========================================================

  async function alternarStatus(mecanico: Mecanico) {
    const novoStatus =
      mecanico.status === "Ativo" ? "Inativo" : "Ativo";

    try {
      const { error } = await supabase
        .from("mecanicos")
        .update({
          status: novoStatus,
        })
        .eq("id", mecanico.id);

      if (error) {
        console.error("Erro ao alterar status:", error);
        alert("Erro ao alterar status: " + error.message);
        return;
      }

      await carregarMecanicos();
    } catch (error) {
      console.error(error);
      alert("Erro inesperado ao alterar status.");
    }
  }

  // =========================================================
  // FILTRO
  // =========================================================

  const mecanicosFiltrados = mecanicos.filter((mecanico) => {
    const texto = busca.toLowerCase().trim();

    if (!texto) return true;

    return (
      mecanico.nome?.toLowerCase().includes(texto) ||
      mecanico.especialidade?.toLowerCase().includes(texto) ||
      mecanico.telefone?.toLowerCase().includes(texto)
    );
  });

  const total = mecanicos.length;

  const ativos = mecanicos.filter(
    (mecanico) => mecanico.status === "Ativo"
  ).length;

  const inativos = mecanicos.filter(
    (mecanico) => mecanico.status !== "Ativo"
  ).length;

  // =========================================================
  // TELA
  // =========================================================

  return (
    <div className="page-container">
      {/* CABEÇALHO */}

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 16,
          marginBottom: 24,
          flexWrap: "wrap",
        }}
      >
        <div>
          <h1
            style={{
              margin: 0,
              fontSize: 30,
              fontWeight: 800,
              color: "#172033",
            }}
          >
            Mecânicos
          </h1>

          <p
            style={{
              marginTop: 6,
              marginBottom: 0,
              color: "#667085",
            }}
          >
            Cadastro e controle da equipe técnica
          </p>
        </div>

        <button
          onClick={abrirNovoMecanico}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            border: 0,
            borderRadius: 10,
            padding: "12px 18px",
            background: "#172033",
            color: "#fff",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          <UserPlus size={18} />
          Novo mecânico
        </button>
      </div>

      {/* CARDS */}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
          gap: 16,
          marginBottom: 24,
        }}
      >
        <div className="card">
          <div style={{ color: "#667085", fontSize: 13 }}>
            Total
          </div>

          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              marginTop: 6,
            }}
          >
            {total}
          </div>
        </div>

        <div className="card">
          <div style={{ color: "#667085", fontSize: 13 }}>
            Ativos
          </div>

          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              marginTop: 6,
              color: "#16803c",
            }}
          >
            {ativos}
          </div>
        </div>

        <div className="card">
          <div style={{ color: "#667085", fontSize: 13 }}>
            Inativos
          </div>

          <div
            style={{
              fontSize: 30,
              fontWeight: 800,
              marginTop: 6,
              color: "#b42318",
            }}
          >
            {inativos}
          </div>
        </div>
      </div>

      {/* PESQUISA */}

      <div
        className="card"
        style={{
          marginBottom: 20,
          padding: 16,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            border: "1px solid #d0d5dd",
            borderRadius: 10,
            padding: "10px 12px",
            background: "#fff",
          }}
        >
          <Search size={18} color="#667085" />

          <input
            value={busca}
            onChange={(e) => setBusca(e.target.value)}
            placeholder="Pesquisar mecânico..."
            style={{
              border: 0,
              outline: 0,
              width: "100%",
              fontSize: 15,
            }}
          />
        </div>
      </div>

      {/* TABELA */}

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {carregando ? (
          <div
            style={{
              padding: 40,
              textAlign: "center",
              color: "#667085",
            }}
          >
            Carregando mecânicos...
          </div>
        ) : mecanicosFiltrados.length === 0 ? (
          <div
            style={{
              padding: 50,
              textAlign: "center",
              color: "#667085",
            }}
          >
            <Users
              size={42}
              strokeWidth={1.5}
              style={{ marginBottom: 10 }}
            />

            <div style={{ fontWeight: 700 }}>
              Nenhum mecânico cadastrado
            </div>

            <div
              style={{
                fontSize: 14,
                marginTop: 5,
              }}
            >
              Clique em "Novo mecânico" para cadastrar.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                minWidth: 750,
              }}
            >
              <thead>
                <tr
                  style={{
                    background: "#f8fafc",
                    borderBottom: "1px solid #eaecf0",
                  }}
                >
                  <th style={thStyle}>Nome</th>
                  <th style={thStyle}>Especialidade</th>
                  <th style={thStyle}>Telefone</th>
                  <th style={thStyle}>Status</th>
                  <th
                    style={{
                      ...thStyle,
                      textAlign: "right",
                    }}
                  >
                    Ações
                  </th>
                </tr>
              </thead>

              <tbody>
                {mecanicosFiltrados.map((mecanico) => (
                  <tr
                    key={mecanico.id}
                    style={{
                      borderBottom: "1px solid #eaecf0",
                    }}
                  >
                    <td style={tdStyle}>
                      <strong>{mecanico.nome}</strong>
                    </td>

                    <td style={tdStyle}>
                      {mecanico.especialidade || "-"}
                    </td>

                    <td style={tdStyle}>
                      {mecanico.telefone || "-"}
                    </td>

                    <td style={tdStyle}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          padding: "5px 10px",
                          borderRadius: 999,
                          fontSize: 12,
                          fontWeight: 700,
                          background:
                            mecanico.status === "Ativo"
                              ? "#dcfce7"
                              : "#fee2e2",
                          color:
                            mecanico.status === "Ativo"
                              ? "#166534"
                              : "#991b1b",
                        }}
                      >
                        {mecanico.status}
                      </span>
                    </td>

                    <td
                      style={{
                        ...tdStyle,
                        textAlign: "right",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "flex-end",
                          gap: 8,
                        }}
                      >
                        <button
                          onClick={() => abrirEdicao(mecanico)}
                          title="Editar"
                          style={actionButtonStyle}
                        >
                          <Pencil size={17} />
                        </button>

                        <button
                          onClick={() =>
                            alternarStatus(mecanico)
                          }
                          title="Alterar status"
                          style={actionButtonStyle}
                        >
                          <Power size={17} />
                        </button>

                        <button
                          onClick={() =>
                            excluirMecanico(mecanico.id)
                          }
                          title="Excluir"
                          style={{
                            ...actionButtonStyle,
                            color: "#b42318",
                          }}
                        >
                          <Trash2 size={17} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL */}

      {modalAberto && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15, 23, 42, 0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
            zIndex: 9999,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 520,
              background: "#fff",
              borderRadius: 16,
              boxShadow: "0 20px 60px rgba(0,0,0,.25)",
              overflow: "hidden",
            }}
          >
            {/* MODAL HEADER */}

            <div
              style={{
                padding: "18px 20px",
                borderBottom: "1px solid #eaecf0",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <h2
                  style={{
                    margin: 0,
                    fontSize: 20,
                  }}
                >
                  {editando
                    ? "Editar mecânico"
                    : "Novo mecânico"}
                </h2>

                <p
                  style={{
                    margin: "5px 0 0",
                    color: "#667085",
                    fontSize: 13,
                  }}
                >
                  Os dados serão salvos no Supabase.
                </p>
              </div>

              <button
                onClick={fecharModal}
                style={{
                  border: 0,
                  background: "transparent",
                  cursor: "pointer",
                }}
              >
                <X size={22} />
              </button>
            </div>

            {/* FORMULÁRIO */}

            <div style={{ padding: 20 }}>
              <label style={labelStyle}>
                Nome *
              </label>

              <input
                value={formulario.nome}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    nome: e.target.value,
                  })
                }
                placeholder="Nome completo"
                style={inputStyle}
              />

              <label style={labelStyle}>
                Especialidade
              </label>

              <input
                value={formulario.especialidade}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    especialidade: e.target.value,
                  })
                }
                placeholder="Ex.: Mecânica, Elétrica, Hidráulica"
                style={inputStyle}
              />

              <label style={labelStyle}>
                Telefone
              </label>

              <input
                value={formulario.telefone}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    telefone: e.target.value,
                  })
                }
                placeholder="(00) 00000-0000"
                style={inputStyle}
              />

              <label style={labelStyle}>
                Status
              </label>

              <select
                value={formulario.status}
                onChange={(e) =>
                  setFormulario({
                    ...formulario,
                    status: e.target.value,
                  })
                }
                style={inputStyle}
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>

              {/* BOTÕES */}

              <div
                style={{
                  display: "flex",
                  justifyContent: "flex-end",
                  gap: 10,
                  marginTop: 24,
                }}
              >
                <button
                  onClick={fecharModal}
                  style={{
                    border: "1px solid #d0d5dd",
                    background: "#fff",
                    borderRadius: 9,
                    padding: "11px 16px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  Cancelar
                </button>

                <button
                  onClick={salvarMecanico}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    border: 0,
                    background: "#172033",
                    color: "#fff",
                    borderRadius: 9,
                    padding: "11px 18px",
                    cursor: "pointer",
                    fontWeight: 700,
                  }}
                >
                  <Save size={17} />

                  {editando
                    ? "Salvar alterações"
                    : "Cadastrar mecânico"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "14px 16px",
  textAlign: "left",
  fontSize: 12,
  fontWeight: 800,
  color: "#475467",
  textTransform: "uppercase",
  letterSpacing: ".03em",
};

const tdStyle: React.CSSProperties = {
  padding: "15px 16px",
  fontSize: 14,
  color: "#344054",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 700,
  color: "#344054",
  marginBottom: 6,
  marginTop: 14,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #d0d5dd",
  borderRadius: 9,
  padding: "11px 12px",
  outline: "none",
  fontSize: 14,
  background: "#fff",
};

const actionButtonStyle: React.CSSProperties = {
  width: 36,
  height: 36,
  border: "1px solid #d0d5dd",
  background: "#fff",
  borderRadius: 8,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#344054",
};
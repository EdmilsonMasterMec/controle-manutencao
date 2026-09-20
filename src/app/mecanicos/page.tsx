"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

interface Mecanico {
  id: number;
  nome: string;
  especialidade: string;
  telefone: string;
  status: string;
}

export default function Mecanicos() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [mecanicos, setMecanicos] = useState<Mecanico[]>([]);

  const [nome, setNome] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState("Disponível");

  const [carregando, setCarregando] = useState(true);

  // =========================================================
  // CARREGAR MECÂNICOS DO SUPABASE
  // =========================================================
  async function carregarMecanicos() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("mecanicos")
      .select("*")
      .order("id", { ascending: false });

    if (error) {
      console.error("Erro ao carregar mecânicos:", error);
      alert("Erro ao carregar os mecânicos.");
      setCarregando(false);
      return;
    }

    setMecanicos(data || []);
    setCarregando(false);
  }

  // Carrega automaticamente quando a página abre
  useEffect(() => {
    carregarMecanicos();
  }, []);

  // =========================================================
  // ADICIONAR MECÂNICO
  // =========================================================
  async function adicionarMecanico() {
    if (!nome.trim() || !especialidade.trim() || !telefone.trim()) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const novoMecanico = {
      nome: nome.trim(),
      especialidade: especialidade.trim(),
      telefone: telefone.trim(),
      status,
    };

    const { data, error } = await supabase
      .from("mecanicos")
      .insert([novoMecanico])
      .select("*")
      .single();

    if (error) {
      console.error("Erro ao salvar mecânico:", error);
      alert("Erro ao salvar o mecânico.\n\n" + error.message);
      return;
    }

    // Adiciona imediatamente na tela
    if (data) {
      setMecanicos((listaAtual) => [data, ...listaAtual]);
    }

    // Limpa formulário
    setNome("");
    setEspecialidade("");
    setTelefone("");
    setStatus("Disponível");

    setMostrarFormulario(false);
  }

  // =========================================================
  // EXCLUIR MECÂNICO
  // =========================================================
  async function excluirMecanico(id: number) {
    const confirmar = confirm(
      "Deseja realmente excluir este mecânico?"
    );

    if (!confirmar) {
      return;
    }

    const { error } = await supabase
      .from("mecanicos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error("Erro ao excluir mecânico:", error);
      alert("Erro ao excluir o mecânico.\n\n" + error.message);
      return;
    }

    setMecanicos((listaAtual) =>
      listaAtual.filter((mecanico) => mecanico.id !== id)
    );
  }

  // =========================================================
  // ALTERAR STATUS
  // =========================================================
  async function alterarStatus(id: number) {
    const mecanico = mecanicos.find(
      (item) => item.id === id
    );

    if (!mecanico) {
      return;
    }

    const novoStatus =
      mecanico.status === "Disponível"
        ? "Em Serviço"
        : "Disponível";

    const { error } = await supabase
      .from("mecanicos")
      .update({
        status: novoStatus,
      })
      .eq("id", id);

    if (error) {
      console.error("Erro ao alterar status:", error);
      alert("Erro ao alterar o status.\n\n" + error.message);
      return;
    }

    setMecanicos((listaAtual) =>
      listaAtual.map((item) =>
        item.id === id
          ? {
              ...item,
              status: novoStatus,
            }
          : item
      )
    );
  }

  return (
    <main className="mastermec-app">
      <section className="page-container">

        <Link href="/" className="voltar">
          ← Voltar ao Dashboard
        </Link>

        <div className="page-header">
          <div>
            <h1>👨‍🔧 Mecânicos</h1>
            <p>Gerenciamento da equipe técnica</p>
          </div>

          <button
            className="btn-novo"
            onClick={() =>
              setMostrarFormulario(!mostrarFormulario)
            }
          >
            + Novo Mecânico
          </button>
        </div>

        {mostrarFormulario && (
          <div className="formulario-maquina">

            <h2>Cadastro de Mecânico</h2>

            <div className="form-grid">

              <input
                type="text"
                placeholder="Nome completo"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
              />

              <input
                type="text"
                placeholder="Especialidade"
                value={especialidade}
                onChange={(e) =>
                  setEspecialidade(e.target.value)
                }
              />

              <input
                type="text"
                placeholder="Telefone"
                value={telefone}
                onChange={(e) =>
                  setTelefone(e.target.value)
                }
              />

              <select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value)
                }
              >
                <option>Disponível</option>
                <option>Em Serviço</option>
                <option>Fora de Serviço</option>
              </select>

            </div>

            <div className="form-botoes">

              <button
                className="btn-cancelar"
                onClick={() =>
                  setMostrarFormulario(false)
                }
              >
                Cancelar
              </button>

              <button
                className="btn-salvar"
                onClick={adicionarMecanico}
              >
                Salvar Mecânico
              </button>

            </div>

          </div>
        )}

        <div className="cards-grid">

          {carregando ? (
            <p>Carregando mecânicos...</p>
          ) : (
            mecanicos.map((mecanico) => (

              <div
                className="card-premium"
                key={mecanico.id}
              >

                <div className="mecanico-topo">

                  <div className="mecanico-avatar">
                    👨‍🔧
                  </div>

                  <div>
                    <h3>{mecanico.nome}</h3>
                    <p>{mecanico.especialidade}</p>
                  </div>

                </div>

                <div className="mecanico-info">

                  <p>
                    📞 {mecanico.telefone}
                  </p>

                  <p>
                    Status:
                    <span
                      className={
                        mecanico.status === "Disponível"
                          ? "status-operando"
                          : mecanico.status === "Em Serviço"
                          ? "status-manutencao"
                          : "status-parada"
                      }
                    >
                      {mecanico.status}
                    </span>
                  </p>

                </div>

                <div className="mecanico-acoes">

                  <button
                    className="btn-status"
                    onClick={() =>
                      alterarStatus(mecanico.id)
                    }
                  >
                    🔄 Alterar Status
                  </button>

                  <button
                    className="btn-excluir"
                    onClick={() =>
                      excluirMecanico(mecanico.id)
                    }
                  >
                    🗑️
                  </button>

                </div>

              </div>

            ))
          )}

        </div>

      </section>
    </main>
  );
}
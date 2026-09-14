"use client";

import Link from "next/link";
import { useState } from "react";

interface Mecanico {
  id: number;
  nome: string;
  especialidade: string;
  telefone: string;
  status: string;
}

export default function Mecanicos() {
  const [mostrarFormulario, setMostrarFormulario] = useState(false);

  const [mecanicos, setMecanicos] = useState<Mecanico[]>([
    {
      id: 1,
      nome: "João Silva",
      especialidade: "Hidráulica",
      telefone: "(11) 99999-1111",
      status: "Disponível",
    },
    {
      id: 2,
      nome: "Carlos Souza",
      especialidade: "Motores Diesel",
      telefone: "(11) 99999-2222",
      status: "Em Serviço",
    },
  ]);

  const [nome, setNome] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [telefone, setTelefone] = useState("");
  const [status, setStatus] = useState("Disponível");

  function adicionarMecanico() {
    if (!nome || !especialidade || !telefone) {
      alert("Preencha todos os campos obrigatórios.");
      return;
    }

    const novoMecanico: Mecanico = {
      id: Date.now(),
      nome,
      especialidade,
      telefone,
      status,
    };

    setMecanicos([...mecanicos, novoMecanico]);

    setNome("");
    setEspecialidade("");
    setTelefone("");
    setStatus("Disponível");

    setMostrarFormulario(false);
  }

  function excluirMecanico(id: number) {
    const confirmar = confirm(
      "Deseja realmente excluir este mecânico?"
    );

    if (confirmar) {
      setMecanicos(
        mecanicos.filter((mecanico) => mecanico.id !== id)
      );
    }
  }

  function alterarStatus(id: number) {
    setMecanicos(
      mecanicos.map((mecanico) =>
        mecanico.id === id
          ? {
              ...mecanico,
              status:
                mecanico.status === "Disponível"
                  ? "Em Serviço"
                  : "Disponível",
            }
          : mecanico
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
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
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
                onChange={(e) => setEspecialidade(e.target.value)}
              />

              <input
                type="text"
                placeholder="Telefone"
                value={telefone}
                onChange={(e) => setTelefone(e.target.value)}
              />

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option>Disponível</option>
                <option>Em Serviço</option>
                <option>Fora de Serviço</option>
              </select>

            </div>

            <div className="form-botoes">

              <button
                className="btn-cancelar"
                onClick={() => setMostrarFormulario(false)}
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

          {mecanicos.map((mecanico) => (

            <div className="card-premium" key={mecanico.id}>

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
                  onClick={() => alterarStatus(mecanico.id)}
                >
                  🔄 Alterar Status
                </button>

                <button
                  className="btn-excluir"
                  onClick={() => excluirMecanico(mecanico.id)}
                >
                  🗑️
                </button>

              </div>

            </div>

          ))}

        </div>

      </section>
    </main>
  );
}
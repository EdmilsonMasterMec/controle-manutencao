"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

type ManutencaoItem = {
  id: number;
  data: string;
  tipo: string;
  descricao: string;
  mecanico: string;
  status: string;
};

type Equipamento = {
  id: number;
  nome: string;
  modelo: string;
  fabricante: string;
  ano: string;
  horimetro: string;
  responsavel: string;
  localizacao: string;
  status: string;
  proxima_manutencao: string;
  historico: ManutencaoItem[];
};

function verificarAlertaManutencao(dataStr: string) {
  if (!dataStr) return false;
  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);
  const [ano, mes, dia] = dataStr.split("-").map(Number);
  const dataManut = new Date(ano, mes - 1, dia);
  const diffTime = dataManut.getTime() - hoje.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays <= 7;
}

export default function MaquinasPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [filtroBusca, setFiltroBusca] = useState("");
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] = useState<Equipamento | null>(null);
  const [editando, setEditando] = useState(false);

  const [idEdicao, setIdEdicao] = useState<number | null>(null);
  const [nome, setNome] = useState("");
  const [modelo, setModelo] = useState("");
  const [fabricante, setFabricante] = useState("");
  const [ano, setAno] = useState("");
  const [horimetro, setHorimetro] = useState("");
  const [responsavel, setResponsavel] = useState("");
  const [localizacao, setLocalizacao] = useState("");
  const [status, setStatus] = useState("Operando");
  const [proximaManutencao, setProximaManutencao] = useState("");

  async function carregarDados() {
    const { data, error } = await supabase.from("equipamentos").select("*").order("id", { ascending: true });
    if (error) {
      console.error("Erro ao buscar equipamentos:", error);
    } else if (data) {
      setEquipamentos(data);

      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("id");
      if (idParam) {
        const eq = data.find((m: Equipamento) => m.id.toString() === idParam);
        if (eq) setEquipamentoSelecionado(eq);
      }
    }
  }

  useEffect(() => {
    carregarDados();
  }, []);

  async function salvarCadastro() {
    if (!nome || !modelo || !fabricante) {
      alert("Preencha Nome, Modelo e Fabricante.");
      return;
    }

    if (idEdicao) {
      const { error } = await supabase
        .from("equipamentos")
        .update({
          nome,
          modelo,
          fabricante,
          ano,
          horimetro,
          responsavel,
          localizacao,
          status,
          proxima_manutencao: proximaManutencao || null
        })
        .eq("id", idEdicao);

      if (error) {
        alert("Erro do Banco: " + error.message);
        console.error(error);
      } else {
        alert("Equipamento atualizado com sucesso!");
        limparFormulario();
        carregarDados();
      }
    } else {
      const { error } = await supabase.from("equipamentos").insert([
        {
          nome,
          modelo,
          fabricante,
          ano,
          horimetro,
          responsavel,
          localizacao,
          status,
          proxima_manutencao: proximaManutencao || null,
          historico: []
        }
      ]);

      if (error) {
        alert("Erro do Banco: " + error.message);
        console.error(error);
      } else {
        alert("Equipamento cadastrado com sucesso!");
        limparFormulario();
        carregarDados();
      }
    }
  }

  function limparFormulario() {
    setNome("");
    setModelo("");
    setFabricante("");
    setAno("");
    setHorimetro("");
    setResponsavel("");
    setLocalizacao("");
    setStatus("Operando");
    setProximaManutencao("");
    setIdEdicao(null);
    setMostrarCadastro(false);
    setEditando(false);
  }

  function iniciarEdicao(eq: Equipamento) {
    setIdEdicao(eq.id);
    setNome(eq.nome);
    setModelo(eq.modelo);
    setFabricante(eq.fabricante);
    setAno(eq.ano || "");
    setHorimetro(eq.horimetro || "");
    setResponsavel(eq.responsavel || "");
    setLocalizacao(eq.localizacao || "");
    setStatus(eq.status || "Operando");
    setProximaManutencao(eq.proxima_manutencao || "");
    setMostrarCadastro(true);
    setEditando(true);
    setEquipamentoSelecionado(null);
  }

  async function excluirEquipamento(id: number) {
    if (!confirm("Deseja realmente excluir este equipamento?")) return;
    
    const { error } = await supabase.from("equipamentos").delete().eq("id", id);
    if (error) {
      alert("Erro ao excluir: " + error.message);
    } else {
      if (equipamentoSelecionado?.id === id) setEquipamentoSelecionado(null);
      carregarDados();
    }
  }

  const filtrados = equipamentos.filter((eq) =>
    eq.nome.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    eq.modelo.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    eq.fabricante.toLowerCase().includes(filtroBusca.toLowerCase()) ||
    (eq.localizacao && eq.localizacao.toLowerCase().includes(filtroBusca.toLowerCase()))
  );

  if (equipamentoSelecionado) {
    const urlQr = `http://192.168.1.13:3000/maquinas?id=${equipamentoSelecionado.id}`;
    const qrCodeApi = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(urlQr)}`;
    const emAlerta = verificarAlertaManutencao(equipamentoSelecionado.proxima_manutencao);

    return (
      <main className="Robert-app">
        <div className="page-container">
          <button onClick={() => setEquipamentoSelecionado(null)} className="voltar">
            ← Voltar para Lista de Equipamentos
          </button>

          <header className="page-header">
            <div>
              <h1>🚜 {equipamentoSelecionado.nome}</h1>
              <p>{equipamentoSelecionado.fabricante} - {equipamentoSelecionado.modelo} ({equipamentoSelecionado.ano})</p>
            </div>
            <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
              {emAlerta && (
                <span style={{ background: "rgba(255, 70, 70, 0.25)", color: "#ff7777", padding: "8px 14px", borderRadius: "20px", fontWeight: "bold", fontSize: "12px", border: "1px solid #ff7777" }}>
                  ⚠️ ALERTA DE REVISÃO
                </span>
              )}
              <span className={
                equipamentoSelecionado.status === "Operando" ? "status-operando" :
                equipamentoSelecionado.status === "Em Manutenção" ? "status-manutencao" : "status-parada"
              }>
                {equipamentoSelecionado.status}
              </span>
            </div>
          </header>

          <div className="formulario-maquina" style={{ display: "flex", alignItems: "center", gap: "30px", flexWrap: "wrap" }}>
            <div>
              <img src={qrCodeApi} alt="QR Code do Equipamento" style={{ background: "white", padding: "8px", borderRadius: "10px", width: "160px", height: "160px" }} />
            </div>
            <div style={{ flex: 1 }}>
              <h2 style={{ color: "#ffb000", marginBottom: "8px" }}>QR Code de Identificação</h2>
              <p style={{ color: "#aeb8c6", fontSize: "14px", marginBottom: "15px", lineHeight: "1.5" }}>
                Cole este QR Code diretamente no equipamento. Ao escaneá-lo com a câmera do celular, o sistema abrirá instantaneamente este painel com todo o histórico e opções de modificação.
              </p>
              <div style={{ display: "flex", gap: "10px" }}>
                <button onClick={() => window.print()} className="btn-salvar">
                  🖨️ Imprimir QR Code
                </button>
                <button onClick={() => iniciarEdicao(equipamentoSelecionado)} className="btn-novo">
                  ✏️ Modificar Dados
                </button>
              </div>
            </div>
          </div>

          <div className="cards-grid" style={{ marginBottom: "25px" }}>
            <div className="card-premium">
              <h3>Localização Atual</h3>
              <p style={{ fontSize: "20px", color: "white", fontWeight: "bold" }}>{equipamentoSelecionado.localizacao || "Não informada"}</p>
            </div>
            <div className="card-premium">
              <h3>Horímetro / KM</h3>
              <p style={{ fontSize: "22px", color: "white", fontWeight: "bold" }}>{equipamentoSelecionado.horimetro}</p>
            </div>
            <div className="card-premium">
              <h3>Próxima Revisão</h3>
              <p style={{ fontSize: "20px", color: emAlerta ? "#ff7777" : "white", fontWeight: "bold" }}>
                {equipamentoSelecionado.proxima_manutencao ? equipamentoSelecionado.proxima_manutencao.split("-").reverse().join("/") : "Não definida"}
              </p>
            </div>
          </div>

          <div className="formulario-maquina">
            <h2 style={{ marginBottom: "15px" }}>📋 Histórico de Manutenções e Ocorrências</h2>
            <div className="tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Descrição / Diagnóstico de Falha</th>
                    <th>Mecânico</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {equipamentoSelecionado.historico && equipamentoSelecionado.historico.length > 0 ? (
                    equipamentoSelecionado.historico.map((h, index) => (
                      <tr key={index}>
                        <td>{h.data}</td>
                        <td>{h.tipo}</td>
                        <td>{h.descricao}</td>
                        <td>{h.mecanico}</td>
                        <td>{h.status}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5} style={{ textAlign: "center", color: "#8e9bab" }}>
                        Nenhum registro de manutenção para este equipamento.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="Robert-app">
      <div className="page-container">
        <Link href="/" className="voltar">
          ← Voltar à Visão Geral do Sistema
        </Link>

        <header className="page-header">
          <div>
            <h1>🚜 Equipamentos</h1>
            <p>Gerenciamento completo da frota (Sincronizado na Nuvem)</p>
          </div>

          <button
            className="btn-novo"
            onClick={() => {
              if (mostrarCadastro) limparFormulario();
              else setMostrarCadastro(true);
            }}
          >
            {mostrarCadastro ? "Cancelar" : "+ Novo Equipamento"}
          </button>
        </header>

        {mostrarCadastro && (
          <div className="formulario-maquina">
            <h2>{editando ? "Editar Equipamento" : "Cadastro de Novo Equipamento"}</h2>
            <div className="form-grid">
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome/Identificação (Ex: Escavadeira 01)"
              />
              <input
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Modelo (Ex: R160LC-9S)"
              />
              <input
                value={fabricante}
                onChange={(e) => setFabricante(e.target.value)}
                placeholder="Fabricante (Ex: Hyundai)"
              />
              <input
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                placeholder="Ano (Ex: 2020)"
              />
              <input
                value={horimetro}
                onChange={(e) => setHorimetro(e.target.value)}
                placeholder="Horímetro ou KM (Ex: 8500 h)"
              />
              <input
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Responsável"
              />
              <input
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                placeholder="Localização (Ex: Obra Indaiatuba)"
              />
              <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <label style={{ fontSize: "12px", color: "#aeb8c6" }}>Próxima Revisão / Manutenção</label>
                <input
                  type="date"
                  value={proximaManutencao}
                  onChange={(e) => setProximaManutencao(e.target.value)}
                />
              </div>
              <select value={status} onChange={(e) => setStatus(e.target.value)}>
                <option value="Operando">Operando</option>
                <option value="Em Manutenção">Em Manutenção</option>
                <option value="Parada">Parada</option>
              </select>
            </div>

            <div className="form-botoes">
              <button className="btn-cancelar" onClick={limparFormulario}>
                Cancelar
              </button>
              <button className="btn-salvar" onClick={salvarCadastro}>
                {editando ? "Salvar Alterações" : "Salvar Equipamento"}
              </button>
            </div>
          </div>
        )}

        <input
          className="busca-container"
          placeholder="Buscar equipamento por nome, modelo, fabricante ou localização..."
          value={filtroBusca}
          onChange={(e) => setFiltroBusca(e.target.value)}
        />

        <div className="tabela-container">
          <table>
            <thead>
              <tr>
                <th>Equipamento</th>
                <th>Modelo</th>
                <th>Localização</th>
                <th>Próxima Revisão</th>
                <th>Horímetro / KM</th>
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((eq) => {
                const emAlerta = verificarAlertaManutencao(eq.proxima_manutencao);
                return (
                  <tr key={eq.id} style={emAlerta ? { background: "rgba(255, 70, 70, 0.08)" } : {}}>
                    <td>🚜 {eq.nome}</td>
                    <td>{eq.modelo}</td>
                    <td>📍 {eq.localizacao || "Não informada"}</td>
                    <td>
                      <span style={emAlerta ? { color: "#ff7777", fontWeight: "bold" } : {}}>
                        {eq.proxima_manutencao ? eq.proxima_manutencao.split("-").reverse().join("/") : "Não definida"}
                        {emAlerta && " ⚠️"}
                      </span>
                    </td>
                    <td>{eq.horimetro}</td>
                    <td>
                      <span className={
                        eq.status === "Operando" ? "status-operando" :
                        eq.status === "Em Manutenção" ? "status-manutencao" : "status-parada"
                      }>
                        {eq.status}
                      </span>
                    </td>
                    <td>
                      <button
                        className="btn-editar"
                        onClick={() => setEquipamentoSelecionado(eq)}
                        title="Visualizar Detalhes e QR Code"
                      >
                        👁
                      </button>
                      <button
                        className="btn-editar"
                        onClick={() => iniciarEdicao(eq)}
                        title="Editar Equipamento"
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-excluir"
                        onClick={() => excluirEquipamento(eq.id)}
                        title="Excluir"
                      >
                        🗑
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filtrados.length === 0 && (
                <tr>
                  <td colSpan={7} style={{ textAlign: "center", padding: "30px", color: "#8e9bab" }}>
                    Nenhum equipamento encontrado na nuvem.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </main>
  );
}
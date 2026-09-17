"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

type ManutencaoItem = {
  id?: number | string;
  data?: string;
  tipo?: string;
  descricao?: string;
  defeito?: string;
  mecanico?: string;
  status?: string;
  horimetro?: string | number;
  prioridade?: string;
  observacao?: string;
  servicos?: unknown;
  fotos?: unknown;
};

type Equipamento = {
  id: number;
  nome: string;
  modelo: string;
  fabricante: string;
  ano: string | number;
  horimetro: string | number;
  responsavel: string;
  localizacao: string;
  status: string;
  proxima_manutencao: string;
  historico: ManutencaoItem[] | unknown;
};

function verificarAlertaManutencao(dataStr?: string) {
  if (!dataStr) return false;

  const [ano, mes, dia] = dataStr.split("-").map(Number);
  if (!ano || !mes || !dia) return false;

  const hoje = new Date();
  hoje.setHours(0, 0, 0, 0);

  const dataManut = new Date(ano, mes - 1, dia);
  const diffDias = Math.ceil(
    (dataManut.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24)
  );

  return diffDias <= 7;
}

function formatarData(data?: string) {
  if (!data) return "Não informada";

  const partes = data.split("-");
  if (partes.length === 3 && partes[0].length === 4) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return data;
}

export default function MaquinasPage() {
  const router = useRouter();

  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [filtroBusca, setFiltroBusca] = useState("");
  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<Equipamento | null>(null);
  const [editando, setEditando] = useState(false);
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);

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
    setCarregando(true);

    const { data, error } = await supabase
      .from("equipamentos")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Erro ao buscar equipamentos:", error);
      alert("Erro ao carregar equipamentos: " + error.message);
      setEquipamentos([]);
    } else {
      const lista = (data || []) as Equipamento[];
      setEquipamentos(lista);

      const params = new URLSearchParams(window.location.search);
      const idParam = params.get("id");

      if (idParam) {
        const equipamento = lista.find(
          (item) => String(item.id) === idParam
        );

        if (equipamento) setEquipamentoSelecionado(equipamento);
      }
    }

    setCarregando(false);
  }

  useEffect(() => {
    carregarDados();
  }, []);

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

  async function salvarCadastro() {
    if (!nome.trim() || !modelo.trim() || !fabricante.trim()) {
      alert("Preencha Nome, Modelo e Fabricante.");
      return;
    }

    setSalvando(true);

    const dados = {
      nome: nome.trim(),
      modelo: modelo.trim(),
      fabricante: fabricante.trim(),
      ano: ano || null,
      horimetro: horimetro || null,
      responsavel: responsavel || null,
      localizacao: localizacao || null,
      status,
      proxima_manutencao: proximaManutencao || null,
    };

    let error;

    if (idEdicao !== null) {
      const resposta = await supabase
        .from("equipamentos")
        .update(dados)
        .eq("id", idEdicao);

      error = resposta.error;
    } else {
      const resposta = await supabase
        .from("equipamentos")
        .insert([{ ...dados, historico: [] }]);

      error = resposta.error;
    }

    setSalvando(false);

    if (error) {
      alert("Erro do banco de dados: " + error.message);
      console.error(error);
      return;
    }

    alert(
      idEdicao !== null
        ? "Equipamento atualizado com sucesso!"
        : "Equipamento cadastrado com sucesso!"
    );

    limparFormulario();
    await carregarDados();
  }

  function iniciarEdicao(eq: Equipamento) {
    setIdEdicao(eq.id);
    setNome(eq.nome || "");
    setModelo(eq.modelo || "");
    setFabricante(eq.fabricante || "");
    setAno(String(eq.ano || ""));
    setHorimetro(String(eq.horimetro || ""));
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

    const { error } = await supabase
      .from("equipamentos")
      .delete()
      .eq("id", id);

    if (error) {
      alert("Erro ao excluir: " + error.message);
      return;
    }

    if (equipamentoSelecionado?.id === id) {
      setEquipamentoSelecionado(null);
    }

    await carregarDados();
  }

  function abrirRelatorio(id: number) {
    router.push(`/relatorios?id=${id}`);
  }

  const filtrados = equipamentos.filter((eq) => {
    const busca = filtroBusca.toLowerCase();

    return (
      (eq.nome || "").toLowerCase().includes(busca) ||
      (eq.modelo || "").toLowerCase().includes(busca) ||
      (eq.fabricante || "").toLowerCase().includes(busca) ||
      (eq.localizacao || "").toLowerCase().includes(busca)
    );
  });

  if (equipamentoSelecionado) {
    const urlQr = `${window.location.origin}/maquinas?id=${equipamentoSelecionado.id}`;
    const qrCodeApi =
      "https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=" +
      encodeURIComponent(urlQr);

    const emAlerta = verificarAlertaManutencao(
      equipamentoSelecionado.proxima_manutencao
    );

    const historico = Array.isArray(equipamentoSelecionado.historico)
      ? (equipamentoSelecionado.historico as ManutencaoItem[])
      : [];

    return (
      <main className="Robert-app">
        <div className="page-container">
          <button
            onClick={() => setEquipamentoSelecionado(null)}
            className="voltar"
          >
            ← Voltar para Lista de Equipamentos
          </button>

          <header className="page-header">
            <div>
              <h1>🚜 {equipamentoSelecionado.nome}</h1>
              <p>
                {equipamentoSelecionado.fabricante} -{" "}
                {equipamentoSelecionado.modelo} (
                {equipamentoSelecionado.ano})
              </p>
            </div>

            <div className="detalhe-status">
              {emAlerta && (
                <span className="alerta-revisao">
                  ⚠️ ALERTA DE REVISÃO
                </span>
              )}
              <span
                className={
                  equipamentoSelecionado.status === "Operando"
                    ? "status-operando"
                    : equipamentoSelecionado.status === "Em Manutenção"
                    ? "status-manutencao"
                    : "status-parada"
                }
              >
                {equipamentoSelecionado.status || "Sem status"}
              </span>
            </div>
          </header>

          <div className="formulario-maquina qr-area">
            <img
              src={qrCodeApi}
              alt="QR Code do equipamento"
              className="qr-imagem"
            />

            <div className="qr-texto">
              <h2>QR Code de Identificação</h2>
              <p>
                Ao escanear este código, o sistema abrirá a página deste
                equipamento.
              </p>
              <div className="acoes">
                <button
                  onClick={() => window.print()}
                  className="btn-salvar"
                >
                  🖨️ Imprimir QR Code
                </button>
                <button
                  onClick={() => iniciarEdicao(equipamentoSelecionado)}
                  className="btn-novo"
                >
                  ✏️ Modificar Dados
                </button>
                <button
                  onClick={() => abrirRelatorio(equipamentoSelecionado.id)}
                  className="btn-novo"
                >
                  📄 Abrir Relatório
                </button>
              </div>
            </div>
          </div>

          <div className="cards-grid">
            <div className="card-premium">
              <h3>Localização Atual</h3>
              <p>{equipamentoSelecionado.localizacao || "Não informada"}</p>
            </div>
            <div className="card-premium">
              <h3>Horímetro / KM</h3>
              <p>{equipamentoSelecionado.horimetro || "Não informado"}</p>
            </div>
            <div className="card-premium">
              <h3>Próxima Revisão</h3>
              <p>
                {formatarData(equipamentoSelecionado.proxima_manutencao)}
              </p>
            </div>
          </div>

          <div className="formulario-maquina">
            <h2>📋 Histórico de Manutenções e Ocorrências</h2>

            <div className="tabela-container">
              <table>
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Tipo</th>
                    <th>Descrição / Diagnóstico</th>
                    <th>Mecânico</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {historico.length > 0 ? (
                    historico.map((item, index) => (
                      <tr key={item.id ?? index}>
                        <td>{formatarData(item.data)}</td>
                        <td>{item.tipo || "-"}</td>
                        <td>
                          {item.descricao ||
                            item.defeito ||
                            item.observacao ||
                            "Serviço registrado"}
                        </td>
                        <td>{item.mecanico || "-"}</td>
                        <td>{item.status || "-"}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={5}>
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
            <p>Gerenciamento completo da frota</p>
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
            <h2>
              {editando
                ? "Editar Equipamento"
                : "Cadastro de Novo Equipamento"}
            </h2>

            <div className="form-grid">
              <input
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                placeholder="Nome/Identificação"
              />
              <input
                value={modelo}
                onChange={(e) => setModelo(e.target.value)}
                placeholder="Modelo"
              />
              <input
                value={fabricante}
                onChange={(e) => setFabricante(e.target.value)}
                placeholder="Fabricante"
              />
              <input
                value={ano}
                onChange={(e) => setAno(e.target.value)}
                placeholder="Ano"
              />
              <input
                value={horimetro}
                onChange={(e) => setHorimetro(e.target.value)}
                placeholder="Horímetro ou KM"
              />
              <input
                value={responsavel}
                onChange={(e) => setResponsavel(e.target.value)}
                placeholder="Responsável"
              />
              <input
                value={localizacao}
                onChange={(e) => setLocalizacao(e.target.value)}
                placeholder="Localização"
              />

              <div className="campo-data">
                <label>Próxima Revisão / Manutenção</label>
                <input
                  type="date"
                  value={proximaManutencao}
                  onChange={(e) => setProximaManutencao(e.target.value)}
                />
              </div>

              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
              >
                <option value="Operando">Operando</option>
                <option value="Em Manutenção">Em Manutenção</option>
                <option value="Parada">Parada</option>
              </select>
            </div>

            <div className="form-botoes">
              <button className="btn-cancelar" onClick={limparFormulario}>
                Cancelar
              </button>
              <button
                className="btn-salvar"
                onClick={salvarCadastro}
                disabled={salvando}
              >
                {salvando
                  ? "Salvando..."
                  : editando
                  ? "Salvar Alterações"
                  : "Salvar Equipamento"}
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

        {carregando ? (
          <p>Carregando equipamentos...</p>
        ) : (
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
                  const emAlerta = verificarAlertaManutencao(
                    eq.proxima_manutencao
                  );

                  return (
                    <tr key={eq.id}>
                      <td>🚜 {eq.nome}</td>
                      <td>{eq.modelo}</td>
                      <td>{eq.localizacao || "Não informada"}</td>
                      <td>
                        {formatarData(eq.proxima_manutencao)}
                        {emAlerta && " ⚠️"}
                      </td>
                      <td>{eq.horimetro || "-"}</td>
                      <td>
                        <span
                          className={
                            eq.status === "Operando"
                              ? "status-operando"
                              : eq.status === "Em Manutenção"
                              ? "status-manutencao"
                              : "status-parada"
                          }
                        >
                          {eq.status || "Sem status"}
                        </span>
                      </td>
                      <td className="acoes-tabela">
                        <button
                          className="btn-editar"
                          onClick={() => setEquipamentoSelecionado(eq)}
                          title="Visualizar detalhes"
                          aria-label={`Visualizar ${eq.nome}`}
                        >
                          👁️
                        </button>

                        <button
                          className="btn-editar"
                          onClick={() => abrirRelatorio(eq.id)}
                          title="Abrir e imprimir relatório desta máquina"
                          aria-label={`Imprimir relatório de ${eq.nome}`}
                        >
                          🖨️
                        </button>

                        <button
                          className="btn-editar"
                          onClick={() => iniciarEdicao(eq)}
                          title="Editar equipamento"
                          aria-label={`Editar ${eq.nome}`}
                        >
                          ✏️
                        </button>

                        <button
                          className="btn-excluir"
                          onClick={() => excluirEquipamento(eq.id)}
                          title="Excluir equipamento"
                          aria-label={`Excluir ${eq.nome}`}
                        >
                          🗑️
                        </button>
                      </td>
                    </tr>
                  );
                })}

                {filtrados.length === 0 && (
                  <tr>
                    <td colSpan={7}>
                      Nenhum equipamento encontrado.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <style jsx>{`
        .detalhe-status,
        .acoes,
        .acoes-tabela {
          display: flex;
          align-items: center;
          gap: 10px;
          flex-wrap: wrap;
        }

        .qr-area {
          display: flex;
          align-items: center;
          gap: 24px;
          flex-wrap: wrap;
        }

        .qr-imagem {
          width: 160px;
          height: 160px;
          padding: 8px;
          background: white;
          border-radius: 10px;
        }

        .qr-texto {
          flex: 1;
          min-width: 220px;
        }

        .qr-texto h2 {
          color: #ffb000;
          margin-bottom: 8px;
        }

        .qr-texto p {
          color: #aeb8c6;
          margin-bottom: 15px;
        }

        .campo-data {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .campo-data label {
          font-size: 12px;
          color: #aeb8c6;
        }

        .alerta-revisao {
          color: #ff7777;
          background: rgba(255, 70, 70, 0.15);
          padding: 8px 12px;
          border-radius: 20px;
          font-size: 12px;
          font-weight: bold;
        }

        .acoes-tabela button {
          min-width: 34px;
        }

        @media (max-width: 600px) {
          .qr-imagem {
            width: 140px;
            height: 140px;
          }
        }

        @media print {
          .voltar,
          .page-header,
          .qr-texto,
          .cards-grid,
          .formulario-maquina:not(.qr-area) {
            display: none !important;
          }
        }
      `}</style>
    </main>
  );
}
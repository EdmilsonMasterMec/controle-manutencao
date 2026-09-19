"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  Eye,
  Printer,
  X,
  Save,
} from "lucide-react";
import { supabase } from "@/lib/supabase";

type Equipamento = {
  id: number;
  categoria: string;
  descricao_bem: string;
  fabricante: string;
  modelo: string;
  ano: string;
  numero_serie_chassi: string;
  placa: string;
  horimetro: string;
  status: string;
  proxima_manutencao: string | null;

  // Campos antigos da tabela, caso ainda existam
  nome?: string;
  responsavel?: string;
  localizacao?: string;
  historico?: unknown[];
};

type Manutencao = {
  id: number;
  maquina: string;
  tipo: string;
  mecanico: string;
  data: string;
  horimetro: string;
  prioridade: string;
  status: string;
  servicos?: unknown[];
};

type FormEquipamento = {
  categoria: string;
  descricao_bem: string;
  fabricante: string;
  modelo: string;
  ano: string;
  numero_serie_chassi: string;
  placa: string;
  horimetro: string;
  status: string;
  proxima_manutencao: string;
};

const formInicial: FormEquipamento = {
  categoria: "Máquina",
  descricao_bem: "",
  fabricante: "",
  modelo: "",
  ano: "",
  numero_serie_chassi: "",
  placa: "",
  horimetro: "",
  status: "Operando",
  proxima_manutencao: "",
};

export default function EquipamentosPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);

  const [busca, setBusca] = useState("");
  const [carregando, setCarregando] = useState(true);

  const [mostrarCadastro, setMostrarCadastro] = useState(false);
  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<Equipamento | null>(null);

  const [editandoId, setEditandoId] = useState<number | null>(null);

  const [form, setForm] = useState<FormEquipamento>(formInicial);

  useEffect(() => {
    carregarDados();
  }, []);

  async function carregarDados() {
    setCarregando(true);

    const equipamentosPromise = supabase
      .from("equipamentos")
      .select(`
        id,
        categoria,
        descricao_bem,
        fabricante,
        modelo,
        ano,
        numero_serie_chassi,
        placa,
        horimetro,
        status,
        proxima_manutencao,
        nome,
        responsavel,
        localizacao,
        historico
      `)
      .order("id", { ascending: true });

    const manutencoesPromise = supabase
      .from("manutencoes")
      .select("*")
      .order("id", { ascending: false });

    const [equipamentosResult, manutencoesResult] = await Promise.all([
      equipamentosPromise,
      manutencoesPromise,
    ]);

    if (equipamentosResult.error) {
      console.error(equipamentosResult.error);
      alert(
        "Erro ao carregar os equipamentos:\n\n" +
          equipamentosResult.error.message
      );
      setCarregando(false);
      return;
    }

    if (manutencoesResult.error) {
      console.warn(
        "Não foi possível carregar as manutenções:",
        manutencoesResult.error
      );
    }

    setEquipamentos(
      (equipamentosResult.data || []) as Equipamento[]
    );

    setManutencoes(
      (manutencoesResult.data || []) as Manutencao[]
    );

    setCarregando(false);
  }

  function abrirNovoCadastro() {
    setEditandoId(null);
    setForm(formInicial);
    setMostrarCadastro(true);
    setEquipamentoSelecionado(null);
  }

  function editarEquipamento(equipamento: Equipamento) {
    setEditandoId(equipamento.id);

    setForm({
      categoria: equipamento.categoria || "Máquina",
      descricao_bem:
        equipamento.descricao_bem ||
        equipamento.nome ||
        "",
      fabricante: equipamento.fabricante || "",
      modelo: equipamento.modelo || "",
      ano: equipamento.ano || "",
      numero_serie_chassi:
        equipamento.numero_serie_chassi || "",
      placa: equipamento.placa || "",
      horimetro: equipamento.horimetro || "",
      status: equipamento.status || "Operando",
      proxima_manutencao:
        equipamento.proxima_manutencao || "",
    });

    setMostrarCadastro(true);
    setEquipamentoSelecionado(null);
  }

  async function salvarEquipamento() {
    if (!form.descricao_bem.trim()) {
      alert("Informe a descrição do bem.");
      return;
    }

    const dados = {
      categoria: form.categoria.trim(),
      descricao_bem: form.descricao_bem.trim(),
      fabricante: form.fabricante.trim(),
      modelo: form.modelo.trim(),
      ano: form.ano.trim(),
      numero_serie_chassi:
        form.numero_serie_chassi.trim(),
      placa: form.placa.trim(),
      horimetro: form.horimetro.trim(),
      status: form.status,
      proxima_manutencao:
        form.proxima_manutencao || null,

      // Mantém compatibilidade com o campo antigo
      nome: form.descricao_bem.trim(),
    };

    if (editandoId !== null) {
      const { error } = await supabase
        .from("equipamentos")
        .update(dados)
        .eq("id", editandoId);

      if (error) {
        console.error(error);
        alert(
          "Erro ao atualizar equipamento:\n\n" +
            error.message
        );
        return;
      }

      alert("Equipamento atualizado com sucesso.");
    } else {
      const { error } = await supabase
        .from("equipamentos")
        .insert({
          ...dados,
          historico: [],
        });

      if (error) {
        console.error(error);
        alert(
          "Erro ao cadastrar equipamento:\n\n" +
            error.message
        );
        return;
      }

      alert("Equipamento cadastrado com sucesso.");
    }

    setMostrarCadastro(false);
    setEditandoId(null);
    setForm(formInicial);

    await carregarDados();
  }

  async function excluirEquipamento(id: number) {
    const equipamento = equipamentos.find(
      (item) => item.id === id
    );

    if (!equipamento) return;

    const confirmar = window.confirm(
      `Deseja realmente excluir este equipamento?\n\n` +
        `${equipamento.fabricante} ${equipamento.modelo}\n` +
        `${equipamento.numero_serie_chassi || ""}\n\n` +
        `Esta operação não poderá ser desfeita.`
    );

    if (!confirmar) return;

    const { error } = await supabase
      .from("equipamentos")
      .delete()
      .eq("id", id);

    if (error) {
      console.error(error);

      alert(
        "Não foi possível excluir o equipamento.\n\n" +
          error.message
      );

      return;
    }

    setEquipamentoSelecionado(null);

    await carregarDados();
  }

  const equipamentosFiltrados = useMemo(() => {
    const texto = busca.trim().toLowerCase();

    if (!texto) return equipamentos;

    return equipamentos.filter((equipamento) => {
      const dados = [
        equipamento.categoria,
        equipamento.descricao_bem,
        equipamento.fabricante,
        equipamento.modelo,
        equipamento.ano,
        equipamento.numero_serie_chassi,
        equipamento.placa,
        equipamento.horimetro,
        equipamento.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return dados.includes(texto);
    });
  }, [equipamentos, busca]);

  function formatarData(data?: string | null) {
    if (!data) return "-";

    const partes = data.split("-");

    if (partes.length === 3) {
      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return data;
  }

  function manutencoesDoEquipamento(
    equipamento: Equipamento
  ) {
    const identificadores = [
      equipamento.descricao_bem,
      equipamento.nome,
      `${equipamento.fabricante} ${equipamento.modelo}`,
      equipamento.numero_serie_chassi,
      equipamento.placa,
    ]
      .filter(Boolean)
      .map((valor) =>
        String(valor).trim().toLowerCase()
      );

    return manutencoes.filter((manutencao) => {
      const maquina = String(
        manutencao.maquina || ""
      )
        .trim()
        .toLowerCase();

      return identificadores.includes(maquina);
    });
  }

  function imprimirEquipamento(
    equipamento: Equipamento
  ) {
    const historico =
      manutencoesDoEquipamento(equipamento);

    const janela = window.open(
      "",
      "_blank"
    );

    if (!janela) {
      alert(
        "Permita pop-ups no navegador para imprimir."
      );
      return;
    }

    const dataEmissao =
      new Date().toLocaleString("pt-BR");

    const historicoHtml =
      historico.length > 0
        ? historico
            .map(
              (manutencao, index) => `
                <div class="manutencao">
                  <h3>Manutenção ${index + 1}</h3>

                  <div class="grid">

                    <div>
                      <strong>Data</strong>
                      <span>
                        ${formatarData(
                          manutencao.data
                        )}
                      </span>
                    </div>

                    <div>
                      <strong>Tipo</strong>
                      <span>
                        ${manutencao.tipo || "-"}
                      </span>
                    </div>

                    <div>
                      <strong>Mecânico</strong>
                      <span>
                        ${manutencao.mecanico || "-"}
                      </span>
                    </div>

                    <div>
                      <strong>Horímetro</strong>
                      <span>
                        ${manutencao.horimetro || "-"}
                      </span>
                    </div>

                    <div>
                      <strong>Prioridade</strong>
                      <span>
                        ${manutencao.prioridade || "-"}
                      </span>
                    </div>

                    <div>
                      <strong>Status</strong>
                      <span>
                        ${manutencao.status || "-"}
                      </span>
                    </div>

                  </div>
                </div>
              `
            )
            .join("")
        : `
            <div class="sem-historico">
              Nenhuma manutenção registrada para este equipamento.
            </div>
          `;

    janela.document.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">

      <head>
        <meta charset="UTF-8" />

        <title>
          Relatório - ${equipamento.fabricante}
          ${equipamento.modelo}
        </title>

        <style>

          * {
            box-sizing: border-box;
          }

          body {
            font-family: Arial, Helvetica, sans-serif;
            margin: 0;
            padding: 30px;
            color: #111;
            background: white;
          }

          .cabecalho {
            border-bottom: 3px solid #222;
            padding-bottom: 15px;
            margin-bottom: 25px;
          }

          .cabecalho h1 {
            margin: 0;
            font-size: 26px;
          }

          .cabecalho p {
            margin: 6px 0 0;
          }

          .dados {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 12px;
            margin-bottom: 30px;
          }

          .campo {
            border: 1px solid #ccc;
            padding: 10px;
            border-radius: 5px;
          }

          .campo strong {
            display: block;
            font-size: 10px;
            color: #555;
            text-transform: uppercase;
            margin-bottom: 5px;
          }

          .campo span {
            font-size: 14px;
          }

          .resumo {
            border: 1px solid #ccc;
            padding: 15px;
            margin-bottom: 25px;
          }

          .manutencao {
            border: 1px solid #bbb;
            padding: 18px;
            margin-bottom: 20px;
            page-break-inside: avoid;
          }

          .manutencao h3 {
            margin-top: 0;
            border-bottom: 1px solid #ddd;
            padding-bottom: 8px;
          }

          .grid {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 10px;
          }

          .grid div {
            border: 1px solid #ddd;
            padding: 9px;
          }

          .grid strong {
            display: block;
            font-size: 10px;
            color: #666;
            margin-bottom: 4px;
          }

          .grid span {
            font-size: 13px;
          }

          .sem-historico {
            border: 1px solid #ccc;
            padding: 20px;
            text-align: center;
          }

          .rodape {
            margin-top: 35px;
            border-top: 1px solid #ccc;
            padding-top: 10px;
            font-size: 11px;
            color: #666;
          }

          @media print {
            body {
              padding: 15px;
            }
          }

        </style>
      </head>

      <body>

        <div class="cabecalho">
          <h1>MasterMec</h1>
          <p>Gestão de Manutenção de Equipamentos</p>
        </div>

        <h2>
          Relatório do Equipamento
        </h2>

        <div class="dados">

          <div class="campo">
            <strong>Categoria</strong>
            <span>${equipamento.categoria || "-"}</span>
          </div>

          <div class="campo">
            <strong>Descrição do Bem</strong>
            <span>${equipamento.descricao_bem || "-"}</span>
          </div>

          <div class="campo">
            <strong>Fabricante</strong>
            <span>${equipamento.fabricante || "-"}</span>
          </div>

          <div class="campo">
            <strong>Modelo</strong>
            <span>${equipamento.modelo || "-"}</span>
          </div>

          <div class="campo">
            <strong>Ano Modelo</strong>
            <span>${equipamento.ano || "-"}</span>
          </div>

          <div class="campo">
            <strong>Nº Série / Chassi</strong>
            <span>${equipamento.numero_serie_chassi || "-"}</span>
          </div>

          <div class="campo">
            <strong>Placa</strong>
            <span>${equipamento.placa || "-"}</span>
          </div>

          <div class="campo">
            <strong>Horímetro</strong>
            <span>${equipamento.horimetro || "-"}</span>
          </div>

          <div class="campo">
            <strong>Status</strong>
            <span>${equipamento.status || "-"}</span>
          </div>

          <div class="campo">
            <strong>Próxima Manutenção</strong>
            <span>
              ${formatarData(
                equipamento.proxima_manutencao
              )}
            </span>
          </div>

        </div>

        <div class="resumo">
          <strong>
            Total de manutenções:
            ${historico.length}
          </strong>
        </div>

        <h2>Histórico de Manutenção</h2>

        ${historicoHtml}

        <div class="rodape">
          Relatório emitido em ${dataEmissao}
          <br />
          MasterMec - Gestão de Manutenção de Equipamentos
        </div>

        <script>
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>

      </body>
      </html>
    `);

    janela.document.close();
  }

  if (equipamentoSelecionado) {
    const historico =
      manutencoesDoEquipamento(
        equipamentoSelecionado
      );

    return (
      <main className="mastermec-app">
        <div style={containerStyle}>

          <button
            onClick={() =>
              setEquipamentoSelecionado(null)
            }
            style={voltarStyle}
          >
            ← Voltar para equipamentos
          </button>

          <div style={topoStyle}>

            <div>
              <h1 style={{ margin: 0 }}>
                {equipamentoSelecionado.fabricante}{" "}
                {equipamentoSelecionado.modelo}
              </h1>

              <p style={{ color: "#666" }}>
                {equipamentoSelecionado.descricao_bem}
              </p>
            </div>

            <button
              onClick={() =>
                imprimirEquipamento(
                  equipamentoSelecionado
                )
              }
              style={botaoPreto}
            >
              <Printer size={19} />
              Imprimir
            </button>

          </div>

          <div style={cardsStyle}>

            <InfoCard
              titulo="Categoria"
              valor={
                equipamentoSelecionado.categoria
              }
            />

            <InfoCard
              titulo="Fabricante"
              valor={
                equipamentoSelecionado.fabricante
              }
            />

            <InfoCard
              titulo="Modelo"
              valor={
                equipamentoSelecionado.modelo
              }
            />

            <InfoCard
              titulo="Ano"
              valor={
                equipamentoSelecionado.ano
              }
            />

            <InfoCard
              titulo="Nº Série / Chassi"
              valor={
                equipamentoSelecionado.numero_serie_chassi
              }
            />

            <InfoCard
              titulo="Placa"
              valor={
                equipamentoSelecionado.placa
              }
            />

            <InfoCard
              titulo="Horímetro"
              valor={
                equipamentoSelecionado.horimetro
              }
            />

            <InfoCard
              titulo="Status"
              valor={
                equipamentoSelecionado.status
              }
            />

          </div>

          <div style={historicoBoxStyle}>

            <h2>
              Histórico de manutenção
            </h2>

            {historico.length === 0 ? (
              <p>
                Nenhuma manutenção registrada
                para este equipamento.
              </p>
            ) : (
              historico.map((manutencao) => (
                <div
                  key={manutencao.id}
                  style={manutencaoStyle}
                >
                  <div style={gridStyle}>

                    <InfoCard
                      titulo="Data"
                      valor={formatarData(
                        manutencao.data
                      )}
                    />

                    <InfoCard
                      titulo="Tipo"
                      valor={manutencao.tipo}
                    />

                    <InfoCard
                      titulo="Mecânico"
                      valor={
                        manutencao.mecanico
                      }
                    />

                    <InfoCard
                      titulo="Horímetro"
                      valor={
                        manutencao.horimetro
                      }
                    />

                    <InfoCard
                      titulo="Prioridade"
                      valor={
                        manutencao.prioridade
                      }
                    />

                    <InfoCard
                      titulo="Status"
                      valor={
                        manutencao.status
                      }
                    />

                  </div>
                </div>
              ))
            )}

          </div>

        </div>
      </main>
    );
  }

  return (
    <main className="mastermec-app">

      <div style={containerStyle}>

        <div style={topoStyle}>

          <div>
            <h1 style={{ margin: 0 }}>
              Equipamentos
            </h1>

            <p style={{ color: "#666" }}>
              {equipamentos.length} equipamentos
              cadastrados no sistema
            </p>
          </div>

          <button
            onClick={abrirNovoCadastro}
            style={botaoPreto}
          >
            <Plus size={19} />
            Novo equipamento
          </button>

        </div>

        <div style={pesquisaStyle}>

          <Search size={20} color="#777" />

          <input
            type="text"
            placeholder="Pesquisar equipamento, modelo, chassi, placa..."
            value={busca}
            onChange={(e) =>
              setBusca(e.target.value)
            }
            style={{
              border: "none",
              outline: "none",
              width: "100%",
              fontSize: "15px",
            }}
          />

        </div>

        {carregando ? (
          <div style={mensagemStyle}>
            Carregando equipamentos...
          </div>
        ) : equipamentosFiltrados.length === 0 ? (
          <div style={mensagemStyle}>
            Nenhum equipamento encontrado.
          </div>
        ) : (
          <div style={tabelaBoxStyle}>

            <table style={tabelaStyle}>

              <thead>
                <tr style={cabecalhoTabelaStyle}>

                  <th style={thStyle}>
                    Categoria
                  </th>

                  <th style={thStyle}>
                    Descrição do Bem
                  </th>

                  <th style={thStyle}>
                    Fabricante
                  </th>

                  <th style={thStyle}>
                    Modelo
                  </th>

                  <th style={thStyle}>
                    Ano
                  </th>

                  <th style={thStyle}>
                    Nº Série / Chassi
                  </th>

                  <th style={thStyle}>
                    Placa
                  </th>

                  <th style={thStyle}>
                    Horímetro
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

                {equipamentosFiltrados.map(
                  (equipamento) => {

                    const totalManutencoes =
                      manutencoesDoEquipamento(
                        equipamento
                      ).length;

                    return (
                      <tr
                        key={equipamento.id}
                        style={{
                          borderTop:
                            "1px solid #eee",
                        }}
                      >

                        <td style={tdStyle}>
                          {equipamento.categoria}
                        </td>

                        <td style={tdStyle}>
                          <strong>
                            {
                              equipamento.descricao_bem
                            }
                          </strong>
                        </td>

                        <td style={tdStyle}>
                          {equipamento.fabricante}
                        </td>

                        <td style={tdStyle}>
                          {equipamento.modelo}
                        </td>

                        <td style={tdStyle}>
                          {equipamento.ano}
                        </td>

                        <td style={tdStyle}>
                          {
                            equipamento.numero_serie_chassi
                          }
                        </td>

                        <td style={tdStyle}>
                          {equipamento.placa || "-"}
                        </td>

                        <td style={tdStyle}>
                          {equipamento.horimetro || "-"}
                        </td>

                        <td style={tdStyle}>

                          <span
                            style={statusStyle(
                              equipamento.status
                            )}
                          >
                            {equipamento.status}
                          </span>

                        </td>

                        <td style={tdStyle}>

                          <div
                            style={{
                              display: "flex",
                              gap: "6px",
                            }}
                          >

                            <button
                              title="Ver"
                              onClick={() =>
                                setEquipamentoSelecionado(
                                  equipamento
                                )
                              }
                              style={acaoStyle}
                            >
                              <Eye size={17} />
                            </button>

                            <button
                              title="Imprimir"
                              onClick={() =>
                                imprimirEquipamento(
                                  equipamento
                                )
                              }
                              style={{
                                ...acaoStyle,
                                background: "#222",
                                color: "#fff",
                              }}
                            >
                              <Printer size={17} />
                            </button>

                            <button
                              title="Editar"
                              onClick={() =>
                                editarEquipamento(
                                  equipamento
                                )
                              }
                              style={acaoStyle}
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              title="Excluir"
                              onClick={() =>
                                excluirEquipamento(
                                  equipamento.id
                                )
                              }
                              style={{
                                ...acaoStyle,
                                background: "#f8dddd",
                                color: "#b00000",
                              }}
                            >
                              <Trash2 size={17} />
                            </button>

                          </div>

                          {totalManutencoes > 0 && (
                            <small
                              style={{
                                display: "block",
                                marginTop: "5px",
                                color: "#666",
                              }}
                            >
                              {totalManutencoes} manutenção
                              {totalManutencoes !== 1
                                ? "s"
                                : ""}
                            </small>
                          )}

                        </td>

                      </tr>
                    );
                  }
                )}

              </tbody>

            </table>

          </div>
        )}

        {mostrarCadastro && (
          <div style={modalFundoStyle}>

            <div style={modalStyle}>

              <div style={modalTopoStyle}>

                <h2 style={{ margin: 0 }}>
                  {editandoId !== null
                    ? "Editar equipamento"
                    : "Novo equipamento"}
                </h2>

                <button
                  onClick={() =>
                    setMostrarCadastro(false)
                  }
                  style={fecharStyle}
                >
                  <X size={19} />
                </button>

              </div>

              <div style={formGridStyle}>

                <Campo
                  label="Categoria"
                  value={form.categoria}
                  onChange={(valor) =>
                    setForm({
                      ...form,
                      categoria: valor,
                    })
                  }
                />

                <Campo
                  label="Descrição do Bem"
                  value={form.descricao_bem}
                  onChange={(valor) =>
                    setForm({
                      ...form,
                      descricao_bem: valor,
                    })
                  }
                />

                <Campo
                  label="Marca / Fabricante"
                  value={form.fabricante}
                  onChange={(valor) =>
                    setForm({
                      ...form,
                      fabricante: valor,
                    })
                  }
                />

                <Campo
                  label="Modelo"
                  value={form.modelo}
                  onChange={(valor) =>
                    setForm({
                      ...form,
                      modelo: valor,
                    })
                  }
                />

                <Campo
                  label="Ano Modelo"
                  value={form.ano}
                  onChange={(valor) =>
                    setForm({
                      ...form,
                      ano: valor,
                    })
                  }
                />

                <Campo
                  label="Nº Série / Chassi"
                  value={
                    form.numero_serie_chassi
                  }
                  onChange={(valor) =>
                    setForm({
                      ...form,
                      numero_serie_chassi:
                        valor,
                    })
                  }
                />

                <Campo
                  label="Placa"
                  value={form.placa}
                  onChange={(valor) =>
                    setForm({
                      ...form,
                      placa: valor,
                    })
                  }
                />

                <Campo
                  label="Horímetro"
                  value={form.horimetro}
                  onChange={(valor) =>
                    setForm({
                      ...form,
                      horimetro: valor,
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
                          e.target.value,
                      })
                    }
                    style={inputStyle}
                  >
                    <option value="Operando">
                      Operando
                    </option>

                    <option value="Em Manutenção">
                      Em Manutenção
                    </option>

                    <option value="Parada">
                      Parada
                    </option>
                  </select>
                </div>

                <div>
                  <label style={labelStyle}>
                    Próxima manutenção
                  </label>

                  <input
                    type="date"
                    value={
                      form.proxima_manutencao
                    }
                    onChange={(e) =>
                      setForm({
                        ...form,
                        proxima_manutencao:
                          e.target.value,
                      })
                    }
                    style={inputStyle}
                  />
                </div>

              </div>

              <button
                onClick={salvarEquipamento}
                style={{
                  ...botaoPreto,
                  width: "100%",
                  justifyContent: "center",
                  marginTop: "25px",
                }}
              >
                <Save size={19} />
                Salvar equipamento
              </button>

            </div>

          </div>
        )}

      </div>

    </main>
  );
}

/* =========================
   COMPONENTES
========================= */

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

function InfoCard({
  titulo,
  valor,
}: {
  titulo: string;
  valor?: string | null;
}) {
  return (
    <div style={infoCardStyle}>
      <strong
        style={{
          fontSize: "12px",
          color: "#666",
        }}
      >
        {titulo}
      </strong>

      <div
        style={{
          marginTop: "6px",
          fontSize: "16px",
        }}
      >
        {valor || "-"}
      </div>
    </div>
  );
}

/* =========================
   ESTILOS
========================= */

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
  gap: "8px",
  background: "#222",
  color: "#fff",
  border: "none",
  padding: "12px 18px",
  borderRadius: "8px",
  cursor: "pointer",
  fontWeight: 600,
};

const voltarStyle: React.CSSProperties = {
  border: "none",
  background: "#eee",
  padding: "10px 16px",
  borderRadius: "8px",
  cursor: "pointer",
  marginBottom: "20px",
};

const pesquisaStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  background: "#fff",
  border: "1px solid #ddd",
  borderRadius: "8px",
  padding: "10px 14px",
  marginBottom: "20px",
};

const mensagemStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "10px",
  padding: "40px",
  textAlign: "center",
};

const tabelaBoxStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "12px",
  overflowX: "auto",
  boxShadow: "0 2px 10px rgba(0,0,0,.06)",
};

const tabelaStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  minWidth: "1400px",
};

const cabecalhoTabelaStyle: React.CSSProperties = {
  background: "#f4f4f4",
  textAlign: "left",
};

const thStyle: React.CSSProperties = {
  padding: "14px",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "14px",
  verticalAlign: "middle",
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
  maxWidth: "800px",
  maxHeight: "90vh",
  overflowY: "auto",
};

const modalTopoStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "20px",
};

const fecharStyle: React.CSSProperties = {
  border: "none",
  background: "#eee",
  width: "38px",
  height: "38px",
  borderRadius: "50%",
  cursor: "pointer",
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

const cardsStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: "15px",
  marginTop: "25px",
};

const infoCardStyle: React.CSSProperties = {
  background: "#fff",
  borderRadius: "10px",
  padding: "15px",
  border: "1px solid #eee",
};

const historicoBoxStyle: React.CSSProperties = {
  marginTop: "30px",
  background: "#fff",
  borderRadius: "12px",
  padding: "20px",
  boxShadow: "0 2px 10px rgba(0,0,0,.08)",
};

const manutencaoStyle: React.CSSProperties = {
  border: "1px solid #ddd",
  borderRadius: "10px",
  padding: "15px",
  marginTop: "15px",
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(150px,1fr))",
  gap: "12px",
};

function statusStyle(
  status?: string
): React.CSSProperties {
  let background = "#f5dada";

  if (status === "Operando") {
    background = "#dff5e3";
  }

  if (status === "Em Manutenção") {
    background = "#fff0c2";
  }

  return {
    display: "inline-block",
    padding: "6px 10px",
    borderRadius: "20px",
    background,
    fontWeight: 600,
    fontSize: "13px",
    whiteSpace: "nowrap",
  };
}
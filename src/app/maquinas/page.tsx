"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactElement } from "react";

import {
Eye,
Printer,
Pencil,
Trash2,
Search,
X,
Save,
QrCode,
} from "lucide-react";

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
proxima_manutencao: string | null;
historico: ManutencaoItem[] | null;

placa?: string | null;
chassi?: string | null;
numero_serie?: string | null;
numeroSerie?: string | null;
categoria?: string | null;
descricao_bem?: string | null;
};

function verificarAlertaManutencao(
dataStr: string | null | undefined
): boolean {
if (!dataStr) return false;

const hoje = new Date();

hoje.setHours(0, 0, 0, 0);

const partes = dataStr.split("-").map(Number);

if (partes.length !== 3) {
return false;
}

const [ano, mes, dia] = partes;

if (
!ano ||
!mes ||
!dia
) {
return false;
}

const dataManut = new Date(
ano,
mes - 1,
dia
);

const diffTime =
dataManut.getTime() -
hoje.getTime();

const diffDays = Math.ceil(
diffTime /
(1000 * 60 * 60 * 24)
);

return diffDays <= 7;
}

function formatarData(
data: string | null | undefined
): string {
if (!data) {
return "Não definida";
}

const partes = data.split("-");

if (partes.length !== 3) {
return data;
}

return partes
.reverse()
.join("/");
}

export default function MaquinasPage(): ReactElement {
const [
equipamentos,
setEquipamentos,
] = useState<Equipamento[]>([]);

const [
filtroBusca,
setFiltroBusca,
] = useState("");

const [
mostrarCadastro,
setMostrarCadastro,
] = useState(false);

const [
equipamentoSelecionado,
setEquipamentoSelecionado,
] = useState<Equipamento | null>(
null
);

const [
editando,
setEditando,
] = useState(false);

const [
idEdicao,
setIdEdicao,
] = useState<number | null>(null);

const [nome, setNome] =
useState("");

const [modelo, setModelo] =
useState("");

const [
fabricante,
setFabricante,
] = useState("");

const [ano, setAno] =
useState("");

const [
horimetro,
setHorimetro,
] = useState("");

const [
responsavel,
setResponsavel,
] = useState("");

const [
localizacao,
setLocalizacao,
] = useState("");

const [
status,
setStatus,
] = useState("Operando");

const [
proximaManutencao,
setProximaManutencao,
] = useState("");

/*

* ============================================================
* CARREGAR EQUIPAMENTOS
* ============================================================
  */

async function carregarDados(): Promise<void> {
const {
data,
error,
} = await supabase
.from("equipamentos")
.select("*")
.order("id", {
ascending: true,
});

if (error) {
  console.error(
    "Erro ao buscar equipamentos:",
    error
  );

  alert(
    "Erro ao carregar equipamentos: " +
      error.message
  );

  return;
}

if (!data) {
  setEquipamentos([]);
  return;
}

const equipamentosCarregados =
  data as Equipamento[];

setEquipamentos(
  equipamentosCarregados
);

/*
 * Se o equipamento foi aberto pelo QR Code:
 *
 * /maquinas?id=10
 *
 * abre automaticamente o equipamento.
 */

const params =
  new URLSearchParams(
    window.location.search
  );

const idParam =
  params.get("id");

if (idParam) {
  const equipamentoEncontrado =
    equipamentosCarregados.find(
      (
        item: Equipamento
      ) =>
        String(item.id) ===
        idParam
    );

  if (equipamentoEncontrado) {
    setEquipamentoSelecionado(
      equipamentoEncontrado
    );
  }
}

}

useEffect(() => {
void carregarDados();
}, []);

/*

* ============================================================
* LIMPAR FORMULÁRIO
* ============================================================
  */

function limparFormulario(): void {
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

/*

* ============================================================
* SALVAR / EDITAR
* ============================================================
  */

async function salvarCadastro(): Promise<void> {
if (
!nome.trim() ||
!modelo.trim() ||
!fabricante.trim()
) {
alert(
"Preencha Nome, Modelo e Fabricante."
);

  return;
}

if (idEdicao !== null) {
  const {
    error,
  } = await supabase
    .from("equipamentos")
    .update({
      nome: nome.trim(),
      modelo: modelo.trim(),
      fabricante:
        fabricante.trim(),
      ano: ano.trim(),
      horimetro:
        horimetro.trim(),
      responsavel:
        responsavel.trim(),
      localizacao:
        localizacao.trim(),
      status,
      proxima_manutencao:
        proximaManutencao ||
        null,
    })
    .eq("id", idEdicao);

  if (error) {
    console.error(
      "Erro ao atualizar equipamento:",
      error
    );

    alert(
      "Erro do Banco: " +
        error.message
    );

    return;
  }

  alert(
    "Equipamento atualizado com sucesso!"
  );

  limparFormulario();

  await carregarDados();

  return;
}

const {
  error,
} = await supabase
  .from("equipamentos")
  .insert([
    {
      nome: nome.trim(),
      modelo: modelo.trim(),
      fabricante:
        fabricante.trim(),
      ano: ano.trim(),
      horimetro:
        horimetro.trim(),
      responsavel:
        responsavel.trim(),
      localizacao:
        localizacao.trim(),
      status,
      proxima_manutencao:
        proximaManutencao ||
        null,
      historico: [],
    },
  ]);

if (error) {
  console.error(
    "Erro ao cadastrar equipamento:",
    error
  );

  alert(
    "Erro do Banco: " +
      error.message
  );

  return;
}

alert(
  "Equipamento cadastrado com sucesso!"
);

limparFormulario();

await carregarDados();

}

/*

* ============================================================
* EDITAR EQUIPAMENTO
* ============================================================
  */

function iniciarEdicao(
equipamento: Equipamento
): void {
setIdEdicao(
equipamento.id
);

setNome(
  equipamento.nome || ""
);

setModelo(
  equipamento.modelo || ""
);

setFabricante(
  equipamento.fabricante || ""
);

setAno(
  equipamento.ano || ""
);

setHorimetro(
  equipamento.horimetro || ""
);

setResponsavel(
  equipamento.responsavel || ""
);

setLocalizacao(
  equipamento.localizacao || ""
);

setStatus(
  equipamento.status ||
    "Operando"
);

setProximaManutencao(
  equipamento.proxima_manutencao ||
    ""
);

setMostrarCadastro(true);
setEditando(true);
setEquipamentoSelecionado(null);

}

/*

* ============================================================
* EXCLUIR EQUIPAMENTO
* ============================================================
  */

async function excluirEquipamento(
id: number
): Promise<void> {
const confirmar =
window.confirm(
"Deseja realmente excluir este equipamento?"
);

if (!confirmar) {
  return;
}

const {
  error,
} = await supabase
  .from("equipamentos")
  .delete()
  .eq("id", id);

if (error) {
  console.error(
    "Erro ao excluir equipamento:",
    error
  );

  alert(
    "Erro ao excluir: " +
      error.message
  );

  return;
}

if (
  equipamentoSelecionado?.id ===
  id
) {
  setEquipamentoSelecionado(
    null
  );
}

await carregarDados();

}

/*

* ============================================================
* URL DO QR CODE
* ============================================================
  */

function obterUrlQr(
equipamento: Equipamento
): string {
/*
* IMPORTANTE:
*
* Para o QR Code funcionar fora da rede local,
* coloque aqui o endereço público do sistema.
*
* Por enquanto mantemos o endereço local
* utilizado no seu sistema.
*/

return `http://192.168.1.13:3000/maquinas?id=${equipamento.id}`;

}

/*

* ============================================================
* IMPRIMIR QR CODE
* 
* A etiqueta impressa terá SOMENTE:
* 
* IDENTIFICAÇÃO DE MANUTENÇÃO
* 
* QR CODE
* 
* Nenhum dado do equipamento será impresso.
* ============================================================
  */

function imprimirQrCode(
equipamento: Equipamento
): void {
const urlQr =
obterUrlQr(equipamento);

const qrCodeApi =
  "https://api.qrserver.com/v1/create-qr-code/" +
  "?size=500x500&data=" +
  encodeURIComponent(urlQr);

const janela =
  window.open(
    "",
    "_blank",
    "width=700,height=800"
  );

if (!janela) {
  alert(
    "Não foi possível abrir a impressão. Verifique se o navegador bloqueou a janela."
  );

  return;
}

janela.document.write(`
  <!DOCTYPE html>

  <html lang="pt-BR">

    <head>

      <meta charset="UTF-8" />

      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0"
      />

      <title>
        Identificação de manutenção
      </title>

      <style>

        @page {
          size: A4;
          margin: 0;
        }

        * {
          box-sizing: border-box;
        }

        html,
        body {
          margin: 0;
          padding: 0;
          width: 100%;
          min-height: 100%;
          background: #ffffff;
          font-family:
            Arial,
            Helvetica,
            sans-serif;
        }

        .pagina {
          width: 100%;
          min-height: 100vh;

          display: flex;

          justify-content: center;

          align-items: flex-start;

          padding-top: 45px;
        }

        .etiqueta {
          width: 330px;

          min-height: 330px;

          border:
            2px solid #222222;

          border-radius: 18px;

          padding:
            30px 25px;

          background: #ffffff;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content:
            flex-start;
        }

        .titulo {
          width: 100%;

          text-align: center;

          color: #111111;

          font-size: 22px;

          font-weight: 700;

          margin-bottom: 30px;
        }

        .qr-container {
          width: 240px;

          height: 240px;

          display: flex;

          align-items: center;

          justify-content: center;

          background: #ffffff;
        }

        .qr-container img {
          width: 220px;

          height: 220px;

          display: block;
        }

        @media print {

          html,
          body {
            width: 100%;
            min-height: 100%;
            background: #ffffff;
          }

          .pagina {
            min-height: 100vh;
            padding-top: 45px;
          }

          .etiqueta {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }

        }

      </style>

    </head>

    <body>

      <div class="pagina">

        <div class="etiqueta">

          <div class="titulo">
            Identificação de manutenção
          </div>

          <div class="qr-container">

            <img
              src="${qrCodeApi}"
              alt="QR Code"
            />

          </div>

        </div>

      </div>

      <script>

        window.onload = function () {

          setTimeout(
            function () {

              window.print();

            },
            700
          );

        };

        window.onafterprint =
          function () {

            setTimeout(
              function () {

                window.close();

              },
              300
            );

          };

      </script>

    </body>

  </html>
`);

janela.document.close();

}

/*

* ============================================================
* FILTRO DE EQUIPAMENTOS
* ============================================================
  */

const termoBusca =
filtroBusca
.toLowerCase()
.trim();

const filtrados =
equipamentos.filter(
(eq: Equipamento) => {
if (!termoBusca) {
return true;
}

    return (
      eq.nome
        ?.toLowerCase()
        .includes(termoBusca) ||

      eq.modelo
        ?.toLowerCase()
        .includes(termoBusca) ||

      eq.fabricante
        ?.toLowerCase()
        .includes(termoBusca) ||

      eq.localizacao
        ?.toLowerCase()
        .includes(termoBusca) ||

      eq.placa
        ?.toLowerCase()
        .includes(termoBusca) ||

      eq.chassi
        ?.toLowerCase()
        .includes(termoBusca) ||

      eq.numero_serie
        ?.toLowerCase()
        .includes(termoBusca) ||

      eq.numeroSerie
        ?.toLowerCase()
        .includes(termoBusca)
    );
  }
);

/*

* ============================================================
* EQUIPAMENTO SELECIONADO
* ============================================================
  */

if (equipamentoSelecionado) {
const urlQr =
obterUrlQr(
equipamentoSelecionado
);

const qrCodeApi =
  "https://api.qrserver.com/v1/create-qr-code/" +
  "?size=250x250&data=" +
  encodeURIComponent(urlQr);

const emAlerta =
  verificarAlertaManutencao(
    equipamentoSelecionado.proxima_manutencao
  );

const historico =
  equipamentoSelecionado.historico ||
  [];

return (
  <main className="Robert-app">

    <div className="page-container">

      <button
        onClick={() => {
          setEquipamentoSelecionado(
            null
          );

          window.history.replaceState(
            {},
            "",
            "/maquinas"
          );
        }}
        className="voltar"
      >
        ← Voltar para Lista de Equipamentos
      </button>

      <header className="page-header">

        <div>

          <h1>
            🚜{" "}
            {
              equipamentoSelecionado.nome
            }
          </h1>

          <p>
            {
              equipamentoSelecionado.fabricante
            }{" "}
            -{" "}
            {
              equipamentoSelecionado.modelo
            }{" "}
            (
            {
              equipamentoSelecionado.ano ||
              "-"
            }
            )
          </p>

        </div>

        <div className="status-area">

          {emAlerta && (
            <span className="alerta-revisao">
              ⚠️ ALERTA DE REVISÃO
            </span>
          )}

          <span
            className={
              equipamentoSelecionado.status ===
              "Operando"
                ? "status-operando"
                : equipamentoSelecionado.status ===
                  "Em Manutenção"
                ? "status-manutencao"
                : "status-parada"
            }
          >
            {
              equipamentoSelecionado.status ||
              "Sem status"
            }
          </span>

        </div>

      </header>

      <section className="qr-detalhes">

        <div className="qr-box">

          <div className="qr-titulo">

            <QrCode size={20} />

            <h2>
              Identificação por QR Code
            </h2>

          </div>

          <img
            src={qrCodeApi}
            alt="QR Code do equipamento"
            className="qr-detalhes-imagem"
          />

          <div className="qr-botoes">

            <button
              onClick={() =>
                imprimirQrCode(
                  equipamentoSelecionado
                )
              }
              className="btn-salvar"
            >
              <Printer size={18} />

              Imprimir QR Code
            </button>

            <button
              onClick={() =>
                iniciarEdicao(
                  equipamentoSelecionado
                )
              }
              className="btn-novo"
            >
              <Pencil size={18} />

              Editar equipamento
            </button>

          </div>

        </div>

      </section>

      <div className="cards-grid">

        <div className="card-premium">

          <h3>
            Localização Atual
          </h3>

          <p>
            {
              equipamentoSelecionado.localizacao ||
              "Não informada"
            }
          </p>

        </div>

        <div className="card-premium">

          <h3>
            Horímetro / KM
          </h3>

          <p>
            {
              equipamentoSelecionado.horimetro ||
              "-"
            }
          </p>

        </div>

        <div className="card-premium">

          <h3>
            Próxima Revisão
          </h3>

          <p
            className={
              emAlerta
                ? "revisao-alerta"
                : ""
            }
          >
            {formatarData(
              equipamentoSelecionado.proxima_manutencao
            )}
          </p>

        </div>

      </div>

      <div className="formulario-maquina">

        <h2 className="historico-titulo">
          📋 Histórico de Manutenções e Ocorrências
        </h2>

        <div className="tabela-container">

          <table>

            <thead>

              <tr>

                <th>
                  Data
                </th>

                <th>
                  Tipo
                </th>

                <th>
                  Descrição / Diagnóstico de Falha
                </th>

                <th>
                  Mecânico
                </th>

                <th>
                  Status
                </th>

              </tr>

            </thead>

            <tbody>

              {historico.length > 0 ? (

                historico.map(
                  (
                    h: ManutencaoItem,
                    index: number
                  ) => (

                    <tr
                      key={
                        h.id ||
                        index
                      }
                    >

                      <td>
                        {h.data}
                      </td>

                      <td>
                        {h.tipo}
                      </td>

                      <td>
                        {h.descricao}
                      </td>

                      <td>
                        {h.mecanico}
                      </td>

                      <td>
                        {h.status}
                      </td>

                    </tr>

                  )
                )

              ) : (

                <tr>

                  <td
                    colSpan={5}
                    className="sem-historico"
                  >
                    Nenhum registro de manutenção para este equipamento.
                  </td>

                </tr>

              )}

            </tbody>

          </table>

        </div>

      </div>

    </div>

    <style jsx>{`

      .qr-detalhes {
        width: 100%;
        margin: 20px 0;
      }

      .qr-box {
        width: 100%;
        background: rgba(
          255,
          255,
          255,
          0.96
        );
        border-radius: 18px;
        padding: 22px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        box-shadow:
          0 10px 35px
          rgba(
            0,
            0,
            0,
            0.18
          );
      }

      .qr-titulo {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        margin-bottom: 14px;
      }

      .qr-titulo h2 {
        margin: 0;
        color: #111827;
        font-size: 20px;
      }

      .qr-titulo svg {
        color: #111827;
      }

      .qr-detalhes-imagem {
        width: 150px;
        height: 150px;
        object-fit: contain;
        background: white;
        padding: 8px;
        border-radius: 10px;
      }

      .qr-botoes {
        width: 100%;
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-top: 18px;
        flex-wrap: wrap;
      }

      .qr-botoes button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
      }

      .status-area {
        display: flex;
        align-items: center;
        gap: 10px;
        flex-wrap: wrap;
      }

      .alerta-revisao {
        background:
          rgba(
            255,
            70,
            70,
            0.18
          );
        color: #ff7777;
        padding: 8px 14px;
        border-radius: 20px;
        font-weight: bold;
        font-size: 12px;
        border:
          1px solid #ff7777;
      }

      .revisao-alerta {
        color: #ff7777 !important;
        font-weight: bold;
      }

      .historico-titulo {
        margin-bottom: 15px;
      }

      .sem-historico {
        text-align: center;
        padding: 30px !important;
        color: #8e9bab;
      }

      @media (max-width: 700px) {

        .qr-box {
          padding:
            18px 12px;
        }

        .qr-titulo h2 {
          font-size: 17px;
        }

        .qr-detalhes-imagem {
          width: 130px;
          height: 130px;
        }

        .qr-botoes {
          flex-direction: column;
          width: 100%;
        }

        .qr-botoes button {
          width: 100%;
        }

        .status-area {
          width: 100%;
          justify-content: flex-start;
        }

      }

    `}</style>

  </main>
);

}

/*

* ============================================================
* LISTA PRINCIPAL
* ============================================================
  */

return (
<main className="Robert-app">

  <div className="page-container">

    <Link
      href="/"
      className="voltar"
    >
      ← Voltar à Visão Geral do Sistema
    </Link>

    <header className="page-header">

      <div>

        <h1>
          🚜 Equipamentos
        </h1>

        <p>
          Gerenciamento completo da frota
        </p>

      </div>

      <button
        className="btn-novo"
        onClick={() => {

          if (mostrarCadastro) {
            limparFormulario();
          } else {
            setMostrarCadastro(
              true
            );
          }

        }}
      >
        {mostrarCadastro
          ? "Cancelar"
          : "+ Novo Equipamento"}
      </button>

    </header>

    {mostrarCadastro && (

      <div className="formulario-maquina">

        <h2>
          {
            editando
              ? "Editar Equipamento"
              : "Cadastro de Novo Equipamento"
          }
        </h2>

        <div className="form-grid">

          <input
            value={nome}
            onChange={(e) =>
              setNome(
                e.target.value
              )
            }
            placeholder="Nome/Identificação"
          />

          <input
            value={modelo}
            onChange={(e) =>
              setModelo(
                e.target.value
              )
            }
            placeholder="Modelo"
          />

          <input
            value={fabricante}
            onChange={(e) =>
              setFabricante(
                e.target.value
              )
            }
            placeholder="Fabricante"
          />

          <input
            value={ano}
            onChange={(e) =>
              setAno(
                e.target.value
              )
            }
            placeholder="Ano"
          />

          <input
            value={horimetro}
            onChange={(e) =>
              setHorimetro(
                e.target.value
              )
            }
            placeholder="Horímetro ou KM"
          />

          <input
            value={responsavel}
            onChange={(e) =>
              setResponsavel(
                e.target.value
              )
            }
            placeholder="Responsável"
          />

          <input
            value={localizacao}
            onChange={(e) =>
              setLocalizacao(
                e.target.value
              )
            }
            placeholder="Localização"
          />

          <div
            style={{
              display: "flex",
              flexDirection:
                "column",
              gap: "4px",
            }}
          >

            <label
              style={{
                fontSize: "12px",
                color:
                  "#aeb8c6",
              }}
            >
              Próxima Revisão /
              Manutenção
            </label>

            <input
              type="date"
              value={
                proximaManutencao
              }
              onChange={(e) =>
                setProximaManutencao(
                  e.target.value
                )
              }
            />

          </div>

          <select
            value={status}
            onChange={(e) =>
              setStatus(
                e.target.value
              )
            }
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

        <div className="form-botoes">

          <button
            className="btn-cancelar"
            onClick={
              limparFormulario
            }
          >
            <X size={17} />

            Cancelar
          </button>

          <button
            className="btn-salvar"
            onClick={
              salvarCadastro
            }
          >
            <Save size={17} />

            {
              editando
                ? "Salvar Alterações"
                : "Salvar Equipamento"
            }
          </button>

        </div>

      </div>

    )}

    <div className="busca-wrapper">

      <Search
        size={21}
        className="busca-icone"
      />

      <input
        className="busca-container"
        placeholder="Pesquisar equipamento, modelo, chassi ou placa..."
        value={filtroBusca}
        onChange={(e) =>
          setFiltroBusca(
            e.target.value
          )
        }
      />

    </div>

    <div className="tabela-container">

      <table className="tabela-equipamentos">

        <thead>

          <tr>

            <th>
              Fabricante
            </th>

            <th>
              Modelo
            </th>

            <th>
              Placa / Chassi
            </th>

            <th>
              Localização
            </th>

            <th>
              Próxima Revisão
            </th>

            <th>
              Horímetro / KM
            </th>

            <th>
              Status
            </th>

          </tr>

        </thead>

        <tbody>

          {filtrados.map(
            (eq: Equipamento) => {

              const emAlerta =
                verificarAlertaManutencao(
                  eq.proxima_manutencao
                );

              const placaChassi =
                eq.placa ||
                eq.chassi ||
                eq.numero_serie ||
                eq.numeroSerie ||
                "-";

              return (

                <tr
                  key={eq.id}
                  className={
                    emAlerta
                      ? "linha-alerta"
                      : ""
                  }
                >

                  <td className="primeira-coluna">

                    <div className="acoes-superiores">

                      <button
                        className="acao-visualizar"
                        onClick={() =>
                          setEquipamentoSelecionado(
                            eq
                          )
                        }
                        title="Visualizar equipamento"
                        type="button"
                      >
                        <Eye size={19} />
                      </button>

                      <button
                        className="acao-imprimir"
                        onClick={() =>
                          imprimirQrCode(
                            eq
                          )
                        }
                        title="Imprimir QR Code"
                        type="button"
                      >
                        <Printer size={19} />
                      </button>

                      <button
                        className="acao-editar"
                        onClick={() =>
                          iniciarEdicao(
                            eq
                          )
                        }
                        title="Editar equipamento"
                        type="button"
                      >
                        <Pencil size={19} />
                      </button>

                      <button
                        className="acao-excluir"
                        onClick={() =>
                          void excluirEquipamento(
                            eq.id
                          )
                        }
                        title="Excluir equipamento"
                        type="button"
                      >
                        <Trash2 size={19} />
                      </button>

                    </div>

                    <div className="descricao-primeira">

                      <span className="label-celular">
                        Fabricante
                      </span>

                      <strong>
                        {
                          eq.fabricante ||
                          "-"
                        }
                      </strong>

                    </div>

                  </td>

                  <td>

                    <span className="label-celular">
                      Modelo
                    </span>

                    {
                      eq.modelo ||
                      "-"
                    }

                  </td>

                  <td>

                    <span className="label-celular">
                      Placa / Chassi
                    </span>

                    {placaChassi}

                  </td>

                  <td>

                    <span className="label-celular">
                      Localização
                    </span>

                    {
                      eq.localizacao ||
                      "Não informada"
                    }

                  </td>

                  <td>

                    <span className="label-celular">
                      Próxima Revisão
                    </span>

                    <span
                      className={
                        emAlerta
                          ? "revisao-alerta"
                          : ""
                      }
                    >

                      {
                        formatarData(
                          eq.proxima_manutencao
                        )
                      }

                      {emAlerta &&
                        " ⚠️"}

                    </span>

                  </td>

                  <td>

                    <span className="label-celular">
                      Horímetro / KM
                    </span>

                    {
                      eq.horimetro ||
                      "-"
                    }

                  </td>

                  <td>

                    <span className="label-celular">
                      Status
                    </span>

                    <span
                      className={
                        eq.status ===
                        "Operando"
                          ? "status-operando"
                          : eq.status ===
                            "Em Manutenção"
                          ? "status-manutencao"
                          : "status-parada"
                      }
                    >
                      {
                        eq.status ||
                        "Sem status"
                      }
                    </span>

                  </td>

                </tr>

              );
            }
          )}

          {filtrados.length ===
            0 && (

            <tr>

              <td
                colSpan={7}
                style={{
                  textAlign:
                    "center",
                  padding:
                    "30px",
                  color:
                    "#8e9bab",
                }}
              >
                Nenhum equipamento encontrado.
              </td>

            </tr>

          )}

        </tbody>

      </table>

    </div>

    <style jsx>{`

      .busca-wrapper {
        position: relative;
        width: 100%;
        margin: 18px 0;
      }

      .busca-icone {
        position: absolute;
        left: 16px;
        top: 50%;
        transform:
          translateY(-50%);
        color: #777;
        pointer-events: none;
      }

      .busca-container {
        width: 100%;
        padding-left:
          48px !important;
      }

      .primeira-coluna {
        min-width: 190px;
      }

      .acoes-superiores {
        display: flex;
        align-items: center;
        gap: 7px;
        margin-bottom: 11px;
        flex-wrap: nowrap;
      }

      .acoes-superiores button {
        width: 38px;
        height: 38px;
        min-width: 38px;
        border: none;
        border-radius: 9px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition:
          transform 0.15s ease,
          opacity 0.15s ease;
      }

      .acoes-superiores button:hover {
        transform:
          translateY(-2px);
        opacity: 0.88;
      }

      .acao-visualizar {
        background: #eeeeee;
        color: #111827;
      }

      .acao-imprimir {
        background: #222222;
        color: white;
      }

      .acao-editar {
        background: #eeeeee;
        color: #111827;
      }

      .acao-excluir {
        background: #f9dddd;
        color: #b91c1c;
      }

      .descricao-primeira {
        display: flex;
        flex-direction: column;
        gap: 3px;
      }

      .descricao-primeira strong {
        font-size: 16px;
        font-weight: 500;
      }

      .label-celular {
        display: none;
      }

      .linha-alerta {
        background:
          rgba(
            255,
            70,
            70,
            0.08
          );
      }

      @media (max-width: 768px) {

        .tabela-container {
          width: 100%;
          overflow-x: hidden;
        }

        .tabela-equipamentos,
        .tabela-equipamentos thead,
        .tabela-equipamentos tbody,
        .tabela-equipamentos tr,
        .tabela-equipamentos td {
          display: block;
          width: 100%;
        }

        .tabela-equipamentos thead {
          display: none;
        }

        .tabela-equipamentos tr {
          margin-bottom: 15px;
          border-radius: 14px;
          overflow: hidden;
          background:
            rgba(
              255,
              255,
              255,
              0.96
            );
          color: #111827;
          box-shadow:
            0 5px 18px
            rgba(
              0,
              0,
              0,
              0.12
            );
        }

        .tabela-equipamentos td {
          border: none !important;
          border-bottom:
            1px solid
            #e5e7eb !important;
          padding:
            13px 15px !important;
          min-height: 50px;
          display: flex;
          flex-direction: column;
          align-items: flex-start;
          justify-content: center;
          gap: 3px;
          font-size: 15px;
        }

        .tabela-equipamentos
          td:last-child {
          border-bottom:
            none !important;
        }

        .tabela-equipamentos
          .primeira-coluna {
          padding-top:
            15px !important;
        }

        .acoes-superiores {
          width: 100%;
          margin-bottom: 13px;
          justify-content:
            flex-start;
        }

        .acoes-superiores button {
          width: 40px;
          height: 40px;
          min-width: 40px;
        }

        .label-celular {
          display: block;
          font-size: 11px;
          font-weight: 700;
          color: #6b7280;
          text-transform:
            uppercase;
          letter-spacing:
            0.3px;
        }

        .descricao-primeira {
          width: 100%;
        }

        .descricao-primeira strong {
          font-size: 17px;
          color: #111827;
        }

        .status-operando,
        .status-manutencao,
        .status-parada {
          display: inline-flex;
          align-items: center;
          width: fit-content;
          margin-top: 2px;
        }

      }

    `}</style>

  </div>

</main>

);
}
Perfeito onde eu colo esse código
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
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

type Foto = {
id?: number | string;
imagem?: string;
descricao?: string;
};

type Servico = {
id?: number | string;
descricao?: string;
fotos?: Foto[];
};

type Manutencao = {
id: number;
equipamento_id?: number | null;

// NÃO ALTERAR:
// "maquina" é o nome da coluna existente no Supabase.
maquina?: string;

tipo?: string;
mecanico?: string;
data?: string;
horimetro?: string;
prioridade?: string;
status?: string;
servicos?: Servico[];
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
historico?: unknown[];
};

export default function EquipamentosPage() {
const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
const [manutencoes, setManutencoes] = useState<Manutencao[]>([]);
const [busca, setBusca] = useState("");
const [carregando, setCarregando] = useState(true);

const [equipamentoSelecionado, setEquipamentoSelecionado] =
useState<Equipamento | null>(null);

const [mostrarCadastro, setMostrarCadastro] = useState(false);
const [editandoId, setEditandoId] = useState<number | null>(null);

const [form, setForm] = useState({
nome: "",
modelo: "",
fabricante: "",
ano: "",
horimetro: "",
responsavel: "",
localizacao: "",
status: "Operando",
proxima_manutencao: "",
});

useEffect(() => {
carregarDados();
}, []);

async function carregarDados() {
setCarregando(true);

const [equipamentosResult, manutencoesResult] = await Promise.all([  
  supabase  
    .from("equipamentos")  
    .select("*")  
    .order("id", { ascending: true }),  

  supabase  
    .from("manutencoes")  
    .select("*")  
    .order("id", { ascending: false }),  
]);  

if (equipamentosResult.error) {  
  console.error(equipamentosResult.error);  
  alert("Erro ao carregar os equipamentos.");  
  setCarregando(false);  
  return;  
}  

if (manutencoesResult.error) {  
  console.error(manutencoesResult.error);  
  alert("Erro ao carregar as manutenções.");  
  setCarregando(false);  
  return;  
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

setForm({  
  nome: "",  
  modelo: "",  
  fabricante: "",  
  ano: "",  
  horimetro: "",  
  responsavel: "",  
  localizacao: "",  
  status: "Operando",  
  proxima_manutencao: "",  
});  

setMostrarCadastro(true);  
setEquipamentoSelecionado(null);

}

function editarEquipamento(equipamento: Equipamento) {
setEditandoId(equipamento.id);

setForm({  
  nome: equipamento.nome || "",  
  modelo: equipamento.modelo || "",  
  fabricante: equipamento.fabricante || "",  
  ano: equipamento.ano || "",  
  horimetro: equipamento.horimetro || "",  
  responsavel: equipamento.responsavel || "",  
  localizacao: equipamento.localizacao || "",  
  status: equipamento.status || "Operando",  
  proxima_manutencao:  
    equipamento.proxima_manutencao || "",  
});  

setMostrarCadastro(true);  
setEquipamentoSelecionado(null);

}

async function salvarCadastro() {
if (!form.nome.trim()) {
alert("Informe o nome do equipamento.");
return;
}

if (editandoId) {  
  const { error } = await supabase  
    .from("equipamentos")  
    .update({  
      nome: form.nome.trim(),  
      modelo: form.modelo.trim(),  
      fabricante: form.fabricante.trim(),  
      ano: form.ano.trim(),  
      horimetro: form.horimetro.trim(),  
      responsavel: form.responsavel.trim(),  
      localizacao: form.localizacao.trim(),  
      status: form.status,  
      proxima_manutencao: form.proxima_manutencao,  
    })  
    .eq("id", editandoId);  

  if (error) {  
    console.error(error);  
    alert("Erro ao atualizar o equipamento.");  
    return;  
  }  
} else {  
  const { error } = await supabase  
    .from("equipamentos")  
    .insert({  
      nome: form.nome.trim(),  
      modelo: form.modelo.trim(),  
      fabricante: form.fabricante.trim(),  
      ano: form.ano.trim(),  
      horimetro: form.horimetro.trim(),  
      responsavel: form.responsavel.trim(),  
      localizacao: form.localizacao.trim(),  
      status: form.status,  
      proxima_manutencao:  
        form.proxima_manutencao,  
      historico: [],  
    });  

  if (error) {  
    console.error(error);  
    alert("Erro ao cadastrar o equipamento.");  
    return;  
  }  
}  

setMostrarCadastro(false);  
setEditandoId(null);  

await carregarDados();

}

async function excluirEquipamento(id: number) {
const confirmar = window.confirm(
"Deseja realmente excluir este equipamento?\n\nO histórico de manutenção vinculado também será excluído."
);

if (!confirmar) return;  

const { error } = await supabase  
  .from("equipamentos")  
  .delete()  
  .eq("id", id);  

if (error) {  
  console.error(error);  
  alert("Erro ao excluir o equipamento.");  
  return;  
}  

setEquipamentoSelecionado(null);  

await carregarDados();

}

function historicoDoEquipamento(id: number) {
return manutencoes.filter(
(manutencao) =>
Number(manutencao.equipamento_id) === Number(id)
);
}

function formatarData(data?: string) {
if (!data) return "-";

const partes = data.split("-");  

if (partes.length === 3) {  
  return `${partes[2]}/${partes[1]}/${partes[0]}`;  
}  

return data;

}

function escaparHtml(valor: unknown) {
return String(valor ?? "")
.replace(/&/g, "&")
.replace(/</g, "<")
.replace(/>/g, ">")
.replace(/"/g, """)
.replace(/'/g, "'");
}

function imprimirEquipamento(
equipamento: Equipamento
) {
const historico = historicoDoEquipamento(
equipamento.id
);

const janela = window.open("", "_blank");  

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
        .map((manutencao, index) => {  
          const servicos = Array.isArray(  
            manutencao.servicos  
          )  
            ? manutencao.servicos  
            : [];  

          const servicosHtml =  
            servicos.length > 0  
              ? servicos  
                  .map((servico) => {  
                    const fotos = Array.isArray(  
                      servico.fotos  
                    )  
                      ? servico.fotos  
                      : [];  

                    const fotosHtml =  
                      fotos.length > 0  
                        ? `  
                          <div class="fotos">  
                            ${fotos  
                              .map(  
                                (foto) => `  
                                  <div class="foto">  
                                    ${  
                                      foto.imagem  
                                        ? `<img src="${escaparHtml(  
                                            foto.imagem  
                                          )}" />`  
                                        : ""  
                                    }  

                                    ${  
                                      foto.descricao  
                                        ? `<div>${escaparHtml(  
                                            foto.descricao  
                                          )}</div>`  
                                        : ""  
                                    }  
                                  </div>  
                                `  
                              )  
                              .join("")}  
                          </div>  
                        `  
                        : "";  

                    return `  
                      <div class="servico">  
                        <strong>Serviço:</strong>  

                        ${escaparHtml(  
                          servico.descricao ||  
                            "Sem descrição"  
                        )}  

                        ${fotosHtml}  
                      </div>  
                    `;  
                  })  
                  .join("")  
              : "<p>Nenhum serviço registrado.</p>";  

          return `  
            <div class="manutencao">  

              <h3>  
                Manutenção ${index + 1}  
              </h3>  

              <div class="grid">  

                <div>  
                  <strong>Data</strong>  

                  <span>  
                    ${escaparHtml(  
                      formatarData(  
                        manutencao.data  
                      )  
                    )}  
                  </span>  
                </div>  

                <div>  
                  <strong>Tipo</strong>  

                  <span>  
                    ${escaparHtml(  
                      manutencao.tipo || "-"  
                    )}  
                  </span>  
                </div>  

                <div>  
                  <strong>Mecânico</strong>  

                  <span>  
                    ${escaparHtml(  
                      manutencao.mecanico || "-"  
                    )}  
                  </span>  
                </div>  

                <div>  
                  <strong>Horímetro</strong>  

                  <span>  
                    ${escaparHtml(  
                      manutencao.horimetro || "-"  
                    )}  
                  </span>  
                </div>  

                <div>  
                  <strong>Prioridade</strong>  

                  <span>  
                    ${escaparHtml(  
                      manutencao.prioridade || "-"  
                    )}  
                  </span>  
                </div>  

                <div>  
                  <strong>Status</strong>  

                  <span>  
                    ${escaparHtml(  
                      manutencao.status || "-"  
                    )}  
                  </span>  
                </div>  

              </div>  

              <div class="servicos">  

                <h4>  
                  Serviços realizados  
                </h4>  

                ${servicosHtml}  

              </div>  

            </div>  
          `;  
        })  
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
      Relatório -  
      ${escaparHtml(equipamento.nome)}  
    </title>  

    <style>  

      * {  
        box-sizing: border-box;  
      }  

      body {  
        font-family:  
          Arial,  
          Helvetica,  
          sans-serif;  

        margin: 0;  
        padding: 30px;  

        color: #111;  
        background: #fff;  
      }  

      .cabecalho {  
        border-bottom: 3px solid #222;  

        padding-bottom: 15px;  
        margin-bottom: 25px;  
      }  

      .cabecalho h1 {  
        margin: 0;  
        font-size: 25px;  
      }  

      .cabecalho p {  
        margin: 6px 0 0;  
        font-size: 13px;  
      }  

      .titulo {  
        font-size: 21px;  
        margin-bottom: 18px;  
      }  

      .dados {  
        display: grid;  

        grid-template-columns:  
          repeat(3, 1fr);  

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

        font-size: 11px;  

        color: #555;  

        text-transform: uppercase;  

        margin-bottom: 5px;  
      }  

      .campo span {  
        font-size: 14px;  
      }  

      .status {  
        font-weight: bold;  
      }  

      .resumo {  
        border: 1px solid #ccc;  

        padding: 15px;  

        margin-bottom: 25px;  
      }  

      .resumo strong {  
        font-size: 18px;  
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

        grid-template-columns:  
          repeat(3, 1fr);  

        gap: 10px;  

        margin-bottom: 18px;  
      }  

      .grid div {  
        border: 1px solid #ddd;  

        padding: 9px;  
      }  

      .grid strong {  
        display: block;  

        font-size: 10px;  

        color: #666;  

        text-transform: uppercase;  

        margin-bottom: 4px;  
      }  

      .grid span {  
        font-size: 13px;  
      }  

      .servicos h4 {  
        margin-bottom: 10px;  
      }  

      .servico {  
        border-left: 3px solid #444;  

        padding: 8px 12px;  

        margin-bottom: 10px;  

        background: #f7f7f7;  
      }  

      .fotos {  
        display: flex;  

        flex-wrap: wrap;  

        gap: 10px;  

        margin-top: 10px;  
      }  

      .foto {  
        width: 150px;  

        border: 1px solid #ccc;  

        padding: 5px;  

        background: #fff;  
      }  

      .foto img {  
        width: 100%;  
        height: 110px;  

        object-fit: contain;  
      }  

      .foto div {  
        font-size: 10px;  

        margin-top: 5px;  
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

        .manutencao {  
          page-break-inside: avoid;  
        }  

      }  

    </style>  

  </head>  

  <body>  

    <div class="cabecalho">  

      <h1>  
        MasterMec  
      </h1>  

      <p>  
        Gestão de Manutenção de Equipamentos  
      </p>  

    </div>  

    <div class="titulo">  
      Relatório do Equipamento  
    </div>  

    <div class="dados">  

      <div class="campo">  

        <strong>  
          Equipamento  
        </strong>  

        <span>  
          ${escaparHtml(  
            equipamento.nome  
          )}  
        </span>  

      </div>  

      <div class="campo">  

        <strong>  
          Modelo  
        </strong>  

        <span>  
          ${escaparHtml(  
            equipamento.modelo  
          )}  
        </span>  

      </div>  

      <div class="campo">  

        <strong>  
          Fabricante  
        </strong>  

        <span>  
          ${escaparHtml(  
            equipamento.fabricante  
          )}  
        </span>  

      </div>  

      <div class="campo">  

        <strong>  
          Ano  
        </strong>  

        <span>  
          ${escaparHtml(  
            equipamento.ano  
          )}  
        </span>  

      </div>  

      <div class="campo">  

        <strong>  
          Horímetro atual  
        </strong>  

        <span>  
          ${escaparHtml(  
            equipamento.horimetro  
          )}  
        </span>  

      </div>  

      <div class="campo">  

        <strong>  
          Status  
        </strong>  

        <span class="status">  
          ${escaparHtml(  
            equipamento.status  
          )}  
        </span>  

      </div>  

      <div class="campo">  

        <strong>  
          Responsável  
        </strong>  

        <span>  
          ${escaparHtml(  
            equipamento.responsavel  
          )}  
        </span>  

      </div>  

      <div class="campo">  

        <strong>  
          Localização  
        </strong>  

        <span>  
          ${escaparHtml(  
            equipamento.localizacao  
          )}  
        </span>  

      </div>  

      <div class="campo">  

        <strong>  
          Próxima manutenção  
        </strong>  

        <span>  
          ${escaparHtml(  
            formatarData(  
              equipamento.proxima_manutencao  
            )  
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

    <h2>  
      Histórico de Manutenção  
    </h2>  

    ${historicoHtml}  

    <div class="rodape">  

      Relatório emitido em  
      ${escaparHtml(dataEmissao)}  

      <br />  

      MasterMec -  
      Gestão de Manutenção de Equipamentos  

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

const equipamentosFiltrados =
equipamentos.filter((equipamento) => {

const texto = `  
    ${equipamento.nome}  
    ${equipamento.modelo}  
    ${equipamento.fabricante}  
    ${equipamento.localizacao}  
    ${equipamento.status}  
  `.toLowerCase();  

  return texto.includes(  
    busca.toLowerCase()  
  );  
});

if (equipamentoSelecionado) {

const historico =  
  historicoDoEquipamento(  
    equipamentoSelecionado.id  
  );  

return (  
  <main className="mastermec-app">  

    <div  
      style={{  
        padding: "25px",  
        maxWidth: "1400px",  
        margin: "0 auto",  
      }}  
    >  

      <button  
        onClick={() =>  
          setEquipamentoSelecionado(null)  
        }  
        style={{  
          border: "none",  
          background: "#eee",  
          padding: "10px 16px",  
          borderRadius: "8px",  
          cursor: "pointer",  
          marginBottom: "20px",  
        }}  
      >  
        ← Voltar para equipamentos  
      </button>  

      <div  
        style={{  
          display: "flex",  
          justifyContent: "space-between",  
          alignItems: "center",  
          gap: "15px",  
          flexWrap: "wrap",  
        }}  
      >  

        <div>  

          <h1 style={{ margin: 0 }}>  
            {equipamentoSelecionado.nome}  
          </h1>  

          <p  
            style={{  
              marginTop: "6px",  
              color: "#666",  
            }}  
          >  
            {equipamentoSelecionado.fabricante}{" "}  
            {equipamentoSelecionado.modelo}  
          </p>  

        </div>  

        <button  
          onClick={() =>  
            imprimirEquipamento(  
              equipamentoSelecionado  
            )  
          }  
          style={{  
            display: "flex",  
            alignItems: "center",  
            gap: "8px",  
            border: "none",  
            background: "#222",  
            color: "#fff",  
            padding: "12px 18px",  
            borderRadius: "8px",  
            cursor: "pointer",  
            fontWeight: 600,  
          }}  
        >  
          <Printer size={19} />  

          Imprimir  
        </button>  

      </div>  

      <div  
        style={{  
          display: "grid",  

          gridTemplateColumns:  
            "repeat(auto-fit,minmax(180px,1fr))",  

          gap: "15px",  

          marginTop: "25px",  
        }}  
      >  

        <div className="card">  

          <strong>  
            Status  
          </strong>  

          <div  
            style={{  
              marginTop: "8px",  
              fontSize: "18px",  
            }}  
          >  
            {equipamentoSelecionado.status}  
          </div>  

        </div>  

        <div className="card">  

          <strong>  
            Horímetro  
          </strong>  

          <div  
            style={{  
              marginTop: "8px",  
              fontSize: "18px",  
            }}  
          >  
            {equipamentoSelecionado.horimetro ||  
              "-"}  
          </div>  

        </div>  

        <div className="card">  

          <strong>  
            Fabricante  
          </strong>  

          <div  
            style={{  
              marginTop: "8px",  
              fontSize: "18px",  
            }}  
          >  
            {equipamentoSelecionado.fabricante ||  
              "-"}  
          </div>  

        </div>  

        <div className="card">  

          <strong>  
            Modelo  
          </strong>  

          <div  
            style={{  
              marginTop: "8px",  
              fontSize: "18px",  
            }}  
          >  
            {equipamentoSelecionado.modelo ||  
              "-"}  
          </div>  

        </div>  

        <div className="card">  

          <strong>  
            Localização  
          </strong>  

          <div  
            style={{  
              marginTop: "8px",  
              fontSize: "18px",  
            }}  
          >  
            {equipamentoSelecionado.localizacao ||  
              "-"}  
          </div>  

        </div>  

        <div className="card">  

          <strong>  
            Manutenções  
          </strong>  

          <div  
            style={{  
              marginTop: "8px",  
              fontSize: "18px",  
            }}  
          >  
            {historico.length}  
          </div>  

        </div>  

      </div>  

      <div  
        style={{  
          marginTop: "30px",  
          background: "#fff",  
          borderRadius: "12px",  
          padding: "20px",  
          boxShadow:  
            "0 2px 10px rgba(0,0,0,.08)",  
        }}  
      >  

        <h2>  
          Histórico de manutenção  
        </h2>  

        {historico.length === 0 ? (  

          <p>  
            Nenhuma manutenção registrada.  
          </p>  

        ) : (  

          historico.map((manutencao) => (  

            <div  
              key={manutencao.id}  
              style={{  
                border: "1px solid #ddd",  
                borderRadius: "10px",  
                padding: "18px",  
                marginTop: "15px",  
              }}  
            >  

              <div  
                style={{  
                  display: "grid",  

                  gridTemplateColumns:  
                    "repeat(auto-fit,minmax(150px,1fr))",  

                  gap: "12px",  
                }}  
              >  

                <div>  

                  <strong>  
                    Data  
                  </strong>  

                  <div>  
                    {formatarData(  
                      manutencao.data  
                    )}  
                  </div>  

                </div>  

                <div>  

                  <strong>  
                    Tipo  
                  </strong>  

                  <div>  
                    {manutencao.tipo || "-"}  
                  </div>  

                </div>  

                <div>  

                  <strong>  
                    Mecânico  
                  </strong>  

                  <div>  
                    {manutencao.mecanico ||  
                      "-"}  
                  </div>  

                </div>  

                <div>  

                  <strong>  
                    Horímetro  
                  </strong>  

                  <div>  
                    {manutencao.horimetro ||  
                      "-"}  
                  </div>  

                </div>  

                <div>  

                  <strong>  
                    Status  
                  </strong>  

                  <div>  
                    {manutencao.status ||  
                      "-"}  
                  </div>  

                </div>  

              </div>  

              {Array.isArray(  
                manutencao.servicos  
              ) &&  
                manutencao.servicos.length >  
                  0 && (  

                  <div  
                    style={{  
                      marginTop: "20px",  
                    }}  
                  >  

                    <strong>  
                      Serviços realizados  
                    </strong>  

                    {manutencao.servicos.map(  
                      (  
                        servico,  
                        index  
                      ) => (  

                        <div  
                          key={  
                            servico.id ??  
                            index  
                          }  
                          style={{  
                            marginTop:  
                              "10px",  

                            padding:  
                              "12px",  

                            background:  
                              "#f5f5f5",  

                            borderRadius:  
                              "8px",  
                          }}  
                        >  

                          {servico.descricao ||  
                            "Sem descrição"}  

                          {Array.isArray(  
                            servico.fotos  
                          ) &&  
                            servico.fotos  
                              .length >  
                              0 && (  

                              <div  
                                style={{  
                                  display:  
                                    "flex",  

                                  gap:  
                                    "10px",  

                                  flexWrap:  
                                    "wrap",  

                                  marginTop:  
                                    "10px",  
                                }}  
                              >  

                                {servico.fotos.map(  
                                  (  
                                    foto,  
                                    fotoIndex  
                                  ) =>  
                                    foto.imagem ? (  

                                      <div  
                                        key={  
                                          foto.id ??  
                                          fotoIndex  
                                        }  
                                      >  

                                        <img  
                                          src={  
                                            foto.imagem  
                                          }  
                                          alt={  
                                            foto.descricao ||  
                                            "Foto"  
                                          }  
                                          style={{  
                                            width:  
                                              "150px",  

                                            height:  
                                              "110px",  

                                            objectFit:  
                                              "cover",  

                                            borderRadius:  
                                              "8px",  
                                          }}  
                                        />  

                                        {foto.descricao && (  

                                          <div  
                                            style={{  
                                              fontSize:  
                                                "12px",  

                                              marginTop:  
                                                "4px",  
                                            }}  
                                          >  
                                            {  
                                              foto.descricao  
                                            }  
                                          </div>  

                                        )}  

                                      </div>  

                                    ) : null  
                                )}  

                              </div>  

                            )}  

                        </div>  

                      )  
                    )}  

                  </div>  

                )}  

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

<div  
    style={{  
      padding: "25px",  
      maxWidth: "1500px",  
      margin: "0 auto",  
    }}  
  >  

    <div  
      style={{  
        display: "flex",  
        justifyContent: "space-between",  
        alignItems: "center",  
        gap: "15px",  
        flexWrap: "wrap",  
        marginBottom: "25px",  
      }}  
    >  

      <div>  

        <h1 style={{ margin: 0 }}>  
          Equipamentos  
        </h1>  

        <p style={{ color: "#666" }}>  
          Equipamentos cadastrados no sistema  
        </p>  

      </div>  

      <button  
        onClick={abrirNovoCadastro}  
        style={{  
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
        }}  
      >  

        <Plus size={19} />  

        Novo equipamento  

      </button>  

    </div>  

    <div  
      style={{  
        display: "flex",  
        alignItems: "center",  
        gap: "10px",  
        background: "#fff",  
        border: "1px solid #ddd",  
        borderRadius: "8px",  
        padding: "10px 14px",  
        marginBottom: "20px",  
      }}  
    >  

      <Search  
        size={20}  
        color="#777"  
      />  

      <input  
        type="text"  
        placeholder="Pesquisar equipamento..."  
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

      <div  
        style={{  
          padding: "30px",  
          textAlign: "center",  
        }}  
      >  
        Carregando equipamentos...  
      </div>  

    ) : equipamentosFiltrados.length ===  
      0 ? (  

      <div  
        style={{  
          background: "#fff",  
          borderRadius: "10px",  
          padding: "40px",  
          textAlign: "center",  
        }}  
      >  
        Nenhum equipamento encontrado.  
      </div>  

    ) : (  

      <div  
        style={{  
          background: "#fff",  
          borderRadius: "12px",  
          overflowX: "auto",  
          boxShadow:  
            "0 2px 10px rgba(0,0,0,.06)",  
        }}  
      >  

        <table  
          style={{  
            width: "100%",  
            borderCollapse:  
              "collapse",  
            minWidth: "950px",  
          }}  
        >  

          <thead>  

            <tr  
              style={{  
                background: "#f4f4f4",  
                textAlign: "left",  
              }}  
            >  

              <th  
                style={{  
                  padding: "14px",  
                }}  
              >  
                Equipamento  
              </th>  

              <th  
                style={{  
                  padding: "14px",  
                }}  
              >  
                Modelo  
              </th>  

              <th  
                style={{  
                  padding: "14px",  
                }}  
              >  
                Fabricante  
              </th>  

              <th  
                style={{  
                  padding: "14px",  
                }}  
              >  
                Horímetro  
              </th>  

              <th  
                style={{  
                  padding: "14px",  
                }}  
              >  
                Status  
              </th>  

              <th  
                style={{  
                  padding: "14px",  
                }}  
              >  
                Manutenções  
              </th>  

              <th  
                style={{  
                  padding: "14px",  
                  textAlign:  
                    "center",  
                }}  
              >  
                Ações  
              </th>  

            </tr>  

          </thead>  

          <tbody>  

            {equipamentosFiltrados.map(  
              (equipamento) => {  

                const totalManutencoes =  
                  historicoDoEquipamento(  
                    equipamento.id  
                  ).length;  

                return (  

                  <tr  
                    key={  
                      equipamento.id  
                    }  
                    style={{  
                      borderTop:  
                        "1px solid #eee",  
                    }}  
                  >  

                    <td  
                      style={{  
                        padding:  
                          "14px",  
                      }}  
                    >  
                      <strong>  
                        {  
                          equipamento.nome  
                        }  
                      </strong>  
                    </td>  

                    <td  
                      style={{  
                        padding:  
                          "14px",  
                      }}  
                    >  
                      {  
                        equipamento.modelo ||  
                        "-"  
                      }  
                    </td>  

                    <td  
                      style={{  
                        padding:  
                          "14px",  
                      }}  
                    >  
                      {  
                        equipamento.fabricante ||  
                        "-"  
                      }  
                    </td>  

                    <td  
                      style={{  
                        padding:  
                          "14px",  
                      }}  
                    >  
                      {  
                        equipamento.horimetro ||  
                        "-"  
                      }  
                    </td>  

                    <td  
                      style={{  
                        padding:  
                          "14px",  
                      }}  
                    >  

                      <span  
                        style={{  
                          display:  
                            "inline-block",  

                          padding:  
                            "6px 10px",  

                          borderRadius:  
                            "20px",  

                          background:  
                            equipamento.status ===  
                            "Operando"  
                              ? "#dff5e3"  
                              : equipamento.status ===  
                                "Em Manutenção"  
                              ? "#fff0c2"  
                              : "#f5dada",  

                          fontWeight:  
                            600,  

                          fontSize:  
                            "13px",  
                        }}  
                      >  
                        {  
                          equipamento.status  
                        }  
                      </span>  

                    </td>  

                    <td  
                      style={{  
                        padding:  
                          "14px",  
                      }}  
                    >  
                      {  
                        totalManutencoes  
                      }  
                    </td>  

                    <td  
                      style={{  
                        padding:  
                          "14px",  
                        textAlign:  
                          "center",  
                      }}  
                    >  

                      <div  
                        style={{  
                          display:  
                            "flex",  

                          justifyContent:  
                            "center",  

                          alignItems:  
                            "center",  

                          gap: "8px",  
                        }}  
                      >  

                        <button  
                          title="Ver equipamento"  
                          onClick={() =>  
                            setEquipamentoSelecionado(  
                              equipamento  
                            )  
                          }  
                          style={{  
                            width:  
                              "38px",  

                            height:  
                              "38px",  

                            border:  
                              "none",  

                            borderRadius:  
                              "7px",  

                            background:  
                              "#eee",  

                            cursor:  
                              "pointer",  

                            display:  
                              "flex",  

                            alignItems:  
                              "center",  

                            justifyContent:  
                              "center",  
                          }}  
                        >  
                          <Eye  
                            size={18}  
                          />  
                        </button>  

                        <button  
                          title="Imprimir equipamento"  
                          onClick={() =>  
                            imprimirEquipamento(  
                              equipamento  
                            )  
                          }  
                          style={{  
                            width:  
                              "38px",  

                            height:  
                              "38px",  

                            border:  
                              "none",  

                            borderRadius:  
                              "7px",  

                            background:  
                              "#222",  

                            color:  
                              "#fff",  

                            cursor:  
                              "pointer",  

                            display:  
                              "flex",  

                            alignItems:  
                              "center",  

                            justifyContent:  
                              "center",  
                          }}  
                        >  
                          <Printer  
                            size={18}  
                          />  
                        </button>  

                        <button  
                          title="Editar equipamento"  
                          onClick={() =>  
                            editarEquipamento(  
                              equipamento  
                            )  
                          }  
                          style={{  
                            width:  
                              "38px",  

                            height:  
                              "38px",  

                            border:  
                              "none",  

                            borderRadius:  
                              "7px",  

                            background:  
                              "#eee",  

                            cursor:  
                              "pointer",  

                            display:  
                              "flex",  

                            alignItems:  
                              "center",  

                            justifyContent:  
                              "center",  
                          }}  
                        >  
                          <Pencil  
                            size={18}  
                          />  
                        </button>  

                        <button  
                          title="Excluir equipamento"  
                          onClick={() =>  
                            excluirEquipamento(  
                              equipamento.id  
                            )  
                          }  
                          style={{  
                            width:  
                              "38px",  

                            height:  
                              "38px",  

                            border:  
                              "none",  

                            borderRadius:  
                              "7px",  

                            background:  
                              "#f7dddd",  

                            color:  
                              "#b00000",  

                            cursor:  
                              "pointer",  

                            display:  
                              "flex",  

                            alignItems:  
                              "center",  

                            justifyContent:  
                              "center",  
                          }}  
                        >  
                          <Trash2  
                            size={18}  
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

    {mostrarCadastro && (  

      <div  
        style={{  
          position:  
            "fixed",  

          inset: 0,  

          background:  
            "rgba(0,0,0,.55)",  

          display:  
            "flex",  

          alignItems:  
            "center",  

          justifyContent:  
            "center",  

          padding:  
            "20px",  

          zIndex:  
            9999,  
        }}  
      >  

        <div  
          style={{  
            background:  
              "#fff",  

            borderRadius:  
              "12px",  

            padding:  
              "25px",  

            width:  
              "100%",  

            maxWidth:  
              "700px",  

            maxHeight:  
              "90vh",  

            overflowY:  
              "auto",  
          }}  
        >  

          <div  
            style={{  
              display:  
                "flex",  

              justifyContent:  
                "space-between",  

              alignItems:  
                "center",  

              marginBottom:  
                "20px",  
            }}  
          >  

            <h2  
              style={{  
                margin: 0,  
              }}  
            >  
              {editandoId  
                ? "Editar equipamento"  
                : "Novo equipamento"}  
            </h2>  

            <button  
              onClick={() =>  
                setMostrarCadastro(  
                  false  
                )  
              }  
              style={{  
                border:  
                  "none",  

                background:  
                  "#eee",  

                width:  
                  "38px",  

                height:  
                  "38px",  

                borderRadius:  
                  "50%",  

                cursor:  
                  "pointer",  
              }}  
            >  
              <X size={19} />  
            </button>  

          </div>  

          <div  
            style={{  
              display:  
                "grid",  

              gridTemplateColumns:  
                "repeat(auto-fit,minmax(220px,1fr))",  

              gap:  
                "15px",  
            }}  
          >  

            <div>  

              <label>  
                Nome do equipamento  
              </label>  

              <input  
                value={  
                  form.nome  
                }  
                onChange={(e) =>  
                  setForm({  
                    ...form,  
                    nome:  
                      e.target.value,  
                  })  
                }  
                style={  
                  inputStyle  
                }  
              />  

            </div>  

            <div>  

              <label>  
                Modelo  
              </label>  

              <input  
                value={  
                  form.modelo  
                }  
                onChange={(e) =>  
                  setForm({  
                    ...form,  
                    modelo:  
                      e.target.value,  
                  })  
                }  
                style={  
                  inputStyle  
                }  
              />  

            </div>  

            <div>  

              <label>  
                Fabricante  
              </label>  

              <input  
                value={  
                  form.fabricante  
                }  
                onChange={(e) =>  
                  setForm({  
                    ...form,  
                    fabricante:  
                      e.target.value,  
                  })  
                }  
                style={  
                  inputStyle  
                }  
              />  

            </div>  

            <div>  

              <label>  
                Ano  
              </label>  

              <input  
                value={  
                  form.ano  
                }  
                onChange={(e) =>  
                  setForm({  
                    ...form,  
                    ano:  
                      e.target.value,  
                  })  
                }  
                style={  
                  inputStyle  
                }  
              />  

            </div>  

            <div>  

              <label>  
                Horímetro  
              </label>  

              <input  
                value={  
                  form.horimetro  
                }  
                onChange={(e) =>  
                  setForm({  
                    ...form,  
                    horimetro:  
                      e.target.value,  
                  })  
                }  
                style={  
                  inputStyle  
                }  
              />  

            </div>  

            <div>  

              <label>  
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
                      e.target.value,  
                  })  
                }  
                style={  
                  inputStyle  
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

            <div>  

              <label>  
                Responsável  
              </label>  

              <input  
                value={  
                  form.responsavel  
                }  
                onChange={(e) =>  
                  setForm({  
                    ...form,  
                    responsavel:  
                      e.target.value,  
                  })  
                }  
                style={  
                  inputStyle  
                }  
              />  

            </div>  

            <div>  

              <label>  
                Localização  
              </label>  

              <input  
                value={  
                  form.localizacao  
                }  
                onChange={(e) =>  
                  setForm({  
                    ...form,  
                    localizacao:  
                      e.target.value,  
                  })  
                }  
                style={  
                  inputStyle  
                }  
              />  

            </div>  

            <div>  

              <label>  
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
                style={  
                  inputStyle  
                }  
              />  

            </div>  

          </div>  

          <button  
            onClick={  
              salvarCadastro  
            }  
            style={{  
              marginTop:  
                "25px",  

              width:  
                "100%",  

              display:  
                "flex",  

              alignItems:  
                "center",  

              justifyContent:  
                "center",  

              gap:  
                "8px",  

              background:  
                "#222",  

              color:  
                "#fff",  

              border:  
                "none",  

              padding:  
                "14px",  

              borderRadius:  
                "8px",  

              cursor:  
                "pointer",  

              fontWeight:  
                600,  
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

const inputStyle: React.CSSProperties = {
width: "100%",
marginTop: "6px",
padding: "11px",
border: "1px solid #ccc",
borderRadius: "7px",
outline: "none",
fontSize: "14px",
};
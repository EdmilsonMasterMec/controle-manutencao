"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "../../lib/supabase";

type FotoRelatorio = {
  id?: number | string;
  imagem?: string;
  descricao?: string;
  caminho?: string;
};

type HistoricoRelatorio = {
  id: string;
  data?: string;
  descricao?: string;
  tipo?: string;
  mecanico?: string;
  horimetro?: string;
  prioridade?: string;
  status?: string;
  fotos: FotoRelatorio[];
};

type MaquinaRelatorio = {
  id: number;
  nome: string;
  fabricante?: string;
  modelo?: string;
  ano?: string;
  numeroSerie?: string;
  horimetro?: string;
  status?: string;
  tipo?: string;
  proximaManutencao?: string;
  observacoes?: string;
  foto?: string;
  fotos: string[];
  historico: HistoricoRelatorio[];
};

type EquipamentoBanco = {
  id: number;
  nome?: string | null;
  fabricante?: string | null;
  modelo?: string | null;
  ano?: string | number | null;
  numero_serie?: string | null;
  numeroSerie?: string | null;
  horimetro?: string | number | null;
  status?: string | null;
  tipo?: string | null;
  tipo_maquina?: string | null;
  proxima_manutencao?: string | null;
  proximaManutencao?: string | null;
  observacoes?: string | null;
  foto?: string | null;
  fotos?: unknown;
};

type ServicoBanco = {
  id?: number | string;
  descricao?: string;
  fotos?: unknown;
};

type ManutencaoBanco = {
  id: number;
  equipamento_id?: number | null;
  maquina?: string | null;
  tipo?: string | null;
  mecanico?: string | null;
  data?: string | null;
  horimetro?: string | number | null;
  prioridade?: string | null;
  status?: string | null;
  defeito?: string | null;
  observacao?: string | null;
  servicos?: unknown;
};

function texto(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  return String(valor);
}

function listaFotos(valor: unknown): FotoRelatorio[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .map((item, index) => {
      if (typeof item === "string") {
        return { id: index, imagem: item, descricao: "" };
      }

      if (item && typeof item === "object") {
        const foto = item as Record<string, unknown>;

        return {
          id:
            typeof foto.id === "number" || typeof foto.id === "string"
              ? foto.id
              : index,
          imagem:
            texto(foto.imagem) ||
            texto(foto.url) ||
            texto(foto.caminho),
          descricao: texto(foto.descricao),
          caminho: texto(foto.caminho),
        };
      }

      return null;
    })
    .filter((foto): foto is FotoRelatorio => Boolean(foto?.imagem));
}

function listaFotosMaquina(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .map((item) => {
      if (typeof item === "string") return item;

      if (item && typeof item === "object") {
        const foto = item as Record<string, unknown>;
        return (
          texto(foto.imagem) ||
          texto(foto.url) ||
          texto(foto.caminho)
        );
      }

      return "";
    })
    .filter(Boolean);
}

function formatarData(data?: string): string {
  if (!data) return "Não informada";

  const partes = data.split("-");
  if (partes.length === 3 && partes[0].length === 4) {
    return `${partes[2].slice(0, 2)}/${partes[1]}/${partes[0]}`;
  }

  return data;
}

function normalizarNome(nome?: string | null): string {
  return (nome || "").trim().toLocaleLowerCase("pt-BR");
}

function obterServicos(valor: unknown): ServicoBanco[] {
  if (!Array.isArray(valor)) return [];

  return valor.filter(
    (item): item is ServicoBanco =>
      Boolean(item) && typeof item === "object"
  );
}

/*
 * CORREÇÃO:
 * A manutenção pode estar vinculada pelo equipamento_id ou somente
 * pelo nome da máquina. Agora o relatório aceita qualquer um dos dois.
 */
function obterHistoricoDaMaquina(
  equipamento: EquipamentoBanco,
  manutencoes: ManutencaoBanco[]
): HistoricoRelatorio[] {
  const nomeEquipamento = normalizarNome(equipamento.nome);

  const manutencoesDaMaquina = manutencoes.filter((manutencao) => {
    const mesmoId =
      manutencao.equipamento_id !== null &&
      manutencao.equipamento_id !== undefined &&
      Number(manutencao.equipamento_id) === Number(equipamento.id);

    const mesmoNome =
      normalizarNome(manutencao.maquina) === nomeEquipamento;

    return mesmoId || mesmoNome;
  });

  return manutencoesDaMaquina.flatMap((manutencao) => {
    const servicos = obterServicos(manutencao.servicos);

    const servicosParaExibir =
      servicos.length > 0
        ? servicos
        : [
            {
              descricao:
                manutencao.defeito || "Manutenção registrada",
            },
          ];

    return servicosParaExibir.map((servico, indice) => {
      const fotos = listaFotos(servico.fotos);

      const descricao =
        texto(servico.descricao).trim() ||
        texto(manutencao.defeito).trim() ||
        texto(manutencao.observacao).trim() ||
        "Serviço realizado";

      return {
        id: `${manutencao.id}-${indice}`,
        data: manutencao.data || "",
        descricao,
        tipo: manutencao.tipo || "",
        mecanico: manutencao.mecanico || "",
        horimetro: texto(manutencao.horimetro),
        prioridade: manutencao.prioridade || "",
        status: manutencao.status || "",
        fotos,
      };
    });
  });
}

export default function Relatorios() {
  const [maquinas, setMaquinas] = useState<MaquinaRelatorio[]>([]);
  const [maquinaSelecionada, setMaquinaSelecionada] =
    useState<MaquinaRelatorio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErro("");

      const [equipamentosResposta, manutencoesResposta] =
        await Promise.all([
          supabase
            .from("equipamentos")
            .select("*")
            .order("id", { ascending: true }),
          supabase
            .from("manutencoes")
            .select("*")
            .order("data", { ascending: false }),
        ]);

      if (!ativo) return;

      if (equipamentosResposta.error) {
        console.error(
          "Erro ao carregar equipamentos:",
          equipamentosResposta.error
        );
        setErro(
          `Não foi possível carregar as máquinas: ${equipamentosResposta.error.message}`
        );
        setMaquinas([]);
        setCarregando(false);
        return;
      }

      if (manutencoesResposta.error) {
        console.error(
          "Erro ao carregar manutenções:",
          manutencoesResposta.error
        );
        setErro(
          `Não foi possível carregar as manutenções: ${manutencoesResposta.error.message}`
        );
        setMaquinas([]);
        setCarregando(false);
        return;
      }

      const equipamentos =
        (equipamentosResposta.data || []) as EquipamentoBanco[];

      const manutencoes =
        (manutencoesResposta.data || []) as ManutencaoBanco[];

      const maquinasFormatadas: MaquinaRelatorio[] =
        equipamentos.map((equipamento) => ({
          id: equipamento.id,
          nome: equipamento.nome || "Máquina sem nome",
          fabricante: equipamento.fabricante || "",
          modelo: equipamento.modelo || "",
          ano: texto(equipamento.ano),
          numeroSerie:
            equipamento.numero_serie ||
            equipamento.numeroSerie ||
            "",
          horimetro: texto(equipamento.horimetro),
          status: equipamento.status || "",
          tipo:
            equipamento.tipo ||
            equipamento.tipo_maquina ||
            "",
          proximaManutencao:
            equipamento.proxima_manutencao ||
            equipamento.proximaManutencao ||
            "",
          observacoes: equipamento.observacoes || "",
          foto: equipamento.foto || "",
          fotos: listaFotosMaquina(equipamento.fotos),
          historico: obterHistoricoDaMaquina(
            equipamento,
            manutencoes
          ),
        }));

      setMaquinas(maquinasFormatadas);

      setMaquinaSelecionada((selecionada) => {
        if (!selecionada) return null;

        return (
          maquinasFormatadas.find(
            (maquina) => maquina.id === selecionada.id
          ) || null
        );
      });

      setCarregando(false);
    }

    carregarDados();

    return () => {
      ativo = false;
    };
  }, []);

  function imprimirRelatorio() {
    window.print();
  }

  function classeStatus(status?: string) {
    if (status === "Operando") return "status-operando";
    if (status === "Em Manutenção") return "status-manutencao";
    return "status-parada";
  }

  return (
    <>
      <main className="mastermec-app relatorio-page">
        <section className="page-container">
          <div className="no-print">
            <Link href="/" className="voltar">
              ← Voltar ao Dashboard
            </Link>

            <div className="page-header">
              <div>
                <h1>📊 Relatórios</h1>
                <p>
                  Relatórios completos das máquinas e histórico de
                  manutenção
                </p>
              </div>
            </div>

            <div className="relatorio-introducao">
              <h2>Selecione uma máquina</h2>
              <p>
                Escolha uma máquina abaixo para visualizar e imprimir
                seu relatório completo.
              </p>
            </div>

            {carregando && (
              <div className="mensagem-relatorio">
                Carregando máquinas e manutenções...
              </div>
            )}

            {erro && (
              <div className="erro-relatorio" role="alert">
                {erro}
              </div>
            )}

            {!carregando && !erro && maquinas.length === 0 && (
              <div className="sem-maquinas">
                <h3>Nenhuma máquina cadastrada</h3>
                <p>
                  Cadastre máquinas primeiro para gerar relatórios.
                </p>
              </div>
            )}

            {!carregando && maquinas.length > 0 && (
              <div className="relatorio-maquinas-grid">
                {maquinas.map((maquina) => (
                  <button
                    type="button"
                    key={maquina.id}
                    className={
                      maquinaSelecionada?.id === maquina.id
                        ? "relatorio-maquina-card ativo"
                        : "relatorio-maquina-card"
                    }
                    onClick={() => setMaquinaSelecionada(maquina)}
                  >
                    <div className="relatorio-card-icon">🚜</div>

                    <div className="relatorio-card-texto">
                      <h3>{maquina.nome}</h3>
                      <p>
                        {maquina.fabricante} {maquina.modelo}
                      </p>
                      <span
                        className={classeStatus(maquina.status)}
                      >
                        {maquina.status || "Sem status"}
                      </span>
                      <small>
                        {maquina.historico.length} registro(s) de
                        manutenção
                      </small>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {maquinaSelecionada && (
            <div className="relatorio-documento">
              <div className="relatorio-cabecalho">
                <div>
                  <h1>MasterMec</h1>
                  <p>
                    Sistema Inteligente de Gestão e Manutenção de
                    Máquinas
                  </p>
                </div>

                <div className="relatorio-titulo">
                  <h2>RELATÓRIO TÉCNICO</h2>
                  <p>
                    Emissão:{" "}
                    {new Date().toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </div>

              <div className="relatorio-linha" />

              <div className="relatorio-nome-maquina">
                <div>
                  <span>RELATÓRIO DA MÁQUINA</span>
                  <h2>🚜 {maquinaSelecionada.nome}</h2>
                </div>

                <div className="relatorio-status">
                  <strong>Status</strong>
                  <span
                    className={classeStatus(
                      maquinaSelecionada.status
                    )}
                  >
                    {maquinaSelecionada.status || "Não informado"}
                  </span>
                </div>
              </div>

              <div className="relatorio-acoes no-print">
                <button
                  type="button"
                  className="btn-imprimir"
                  onClick={imprimirRelatorio}
                >
                  🖨️ Imprimir / Salvar PDF
                </button>
              </div>

              {maquinaSelecionada.foto && (
                <section className="relatorio-secao">
                  <h3>📷 Foto da Máquina</h3>
                  <div className="foto-principal-container">
                    <img
                      src={maquinaSelecionada.foto}
                      alt={`Foto de ${maquinaSelecionada.nome}`}
                      className="foto-principal-relatorio"
                    />
                  </div>
                </section>
              )}

              <section className="relatorio-secao">
                <h3>📋 Dados Técnicos da Máquina</h3>

                <div className="dados-maquina-grid">
                  <div className="dado-item">
                    <span>Nome da Máquina</span>
                    <strong>{maquinaSelecionada.nome || "-"}</strong>
                  </div>

                  <div className="dado-item">
                    <span>Fabricante</span>
                    <strong>
                      {maquinaSelecionada.fabricante || "-"}
                    </strong>
                  </div>

                  <div className="dado-item">
                    <span>Modelo</span>
                    <strong>{maquinaSelecionada.modelo || "-"}</strong>
                  </div>

                  <div className="dado-item">
                    <span>Ano</span>
                    <strong>{maquinaSelecionada.ano || "-"}</strong>
                  </div>

                  <div className="dado-item">
                    <span>Número de Série</span>
                    <strong>
                      {maquinaSelecionada.numeroSerie || "-"}
                    </strong>
                  </div>

                  <div className="dado-item">
                    <span>Horímetro</span>
                    <strong>
                      {maquinaSelecionada.horimetro || "-"}
                    </strong>
                  </div>

                  <div className="dado-item">
                    <span>Tipo de Máquina</span>
                    <strong>{maquinaSelecionada.tipo || "-"}</strong>
                  </div>

                  <div className="dado-item">
                    <span>Próxima Manutenção</span>
                    <strong>
                      {maquinaSelecionada.proximaManutencao || "-"}
                    </strong>
                  </div>
                </div>
              </section>

              {maquinaSelecionada.observacoes && (
                <section className="relatorio-secao">
                  <h3>📝 Observações Gerais</h3>
                  <div className="observacoes-relatorio">
                    {maquinaSelecionada.observacoes}
                  </div>
                </section>
              )}

              <section className="relatorio-secao">
                <h3>🔧 Histórico de Manutenção</h3>

                {maquinaSelecionada.historico.length > 0 ? (
                  <div className="historico-lista">
                    {maquinaSelecionada.historico.map(
                      (item, index) => (
                        <div
                          className="historico-item"
                          key={item.id}
                        >
                          <div className="historico-numero">
                            {index + 1}
                          </div>

                          <div className="historico-conteudo">
                            <div className="historico-data">
                              <strong>Data:</strong>{" "}
                              {formatarData(item.data)}
                            </div>

                            <div className="historico-descricao">
                              {item.descricao ||
                                "Serviço realizado"}
                            </div>

                            <div className="historico-detalhes">
                              {item.tipo && (
                                <p>
                                  <strong>Tipo:</strong> {item.tipo}
                                </p>
                              )}
                              {item.mecanico && (
                                <p>
                                  <strong>Mecânico:</strong>{" "}
                                  {item.mecanico}
                                </p>
                              )}
                              {item.horimetro && (
                                <p>
                                  <strong>Horímetro:</strong>{" "}
                                  {item.horimetro}
                                </p>
                              )}
                              {item.prioridade && (
                                <p>
                                  <strong>Prioridade:</strong>{" "}
                                  {item.prioridade}
                                </p>
                              )}
                              {item.status && (
                                <p>
                                  <strong>Status:</strong>{" "}
                                  {item.status}
                                </p>
                              )}
                            </div>

                            {item.fotos.length > 0 && (
                              <div className="fotos-servico-relatorio">
                                <h4>📷 Fotos do Serviço</h4>

                                <div className="galeria-relatorio">
                                  {item.fotos.map(
                                    (foto, fotoIndex) => (
                                      <div
                                        className="galeria-item"
                                        key={`${item.id}-foto-${foto.id ?? fotoIndex}`}
                                      >
                                        <img
                                          src={foto.imagem}
                                          alt={
                                            foto.descricao ||
                                            `Foto ${fotoIndex + 1} do serviço`
                                          }
                                        />
                                        {foto.descricao && (
                                          <p>{foto.descricao}</p>
                                        )}
                                      </div>
                                    )
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )
                    )}
                  </div>
                ) : (
                  <div className="sem-historico">
                    Nenhuma manutenção registrada para esta máquina.
                  </div>
                )}
              </section>

              {maquinaSelecionada.fotos.length > 0 && (
                <section className="relatorio-secao">
                  <h3>📸 Galeria de Fotos da Máquina</h3>

                  <div className="galeria-relatorio">
                    {maquinaSelecionada.fotos.map((foto, index) => (
                      <div
                        className="galeria-item"
                        key={`${foto}-${index}`}
                      >
                        <img
                          src={foto}
                          alt={`Foto ${index + 1} da máquina`}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <div className="relatorio-rodape">
                <div>
                  <strong>MasterMec</strong>
                  <p>Gestão Inteligente de Máquinas e Manutenção</p>
                </div>
                <div>
                  <p>Relatório gerado pelo sistema MasterMec</p>
                </div>
              </div>
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        .relatorio-introducao {
          margin-top: 25px;
          margin-bottom: 25px;
        }

        .relatorio-introducao h2 {
          color: #f1f5f9;
          margin-bottom: 8px;
        }

        .relatorio-introducao p {
          color: #94a3b8;
        }

        .mensagem-relatorio,
        .erro-relatorio {
          padding: 15px 18px;
          margin: 16px 0;
          border-radius: 8px;
        }

        .mensagem-relatorio {
          color: #cbd5e1;
          background: #162231;
        }

        .erro-relatorio {
          color: #fecaca;
          background: #450a0a;
          border: 1px solid #991b1b;
          overflow-wrap: anywhere;
        }

        .relatorio-maquinas-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(min(280px, 100%), 1fr)
          );
          gap: 18px;
          margin-bottom: 30px;
        }

        .relatorio-maquina-card {
          width: 100%;
          min-width: 0;
          display: flex;
          align-items: center;
          gap: 16px;
          text-align: left;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #334155;
          background: #162231;
          cursor: pointer;
          color: white;
        }

        .relatorio-maquina-card.ativo {
          border-color: #f59e0b;
          box-shadow: 0 0 0 1px #f59e0b;
        }

        .relatorio-card-icon {
          flex: 0 0 55px;
          width: 55px;
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          background: #263445;
          border-radius: 12px;
        }

        .relatorio-card-texto {
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .relatorio-maquina-card h3 {
          margin: 0 0 6px;
          font-size: 17px;
        }

        .relatorio-maquina-card p {
          margin: 0 0 10px;
          color: #aab5c2;
          font-size: 14px;
        }

        .relatorio-card-texto small {
          display: block;
          margin-top: 9px;
          color: #cbd5e1;
        }

        .relatorio-documento {
          background: #ffffff;
          color: #111827;
          padding: 45px;
          border-radius: 12px;
          margin-top: 30px;
          margin-bottom: 40px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.25);
          min-width: 0;
        }

        .relatorio-cabecalho {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 30px;
        }

        .relatorio-cabecalho h1 {
          color: #b45309;
          font-size: 32px;
          margin: 0 0 8px;
        }

        .relatorio-cabecalho p {
          color: #374151;
          margin: 0;
          font-size: 14px;
        }

        .relatorio-titulo {
          text-align: right;
        }

        .relatorio-titulo h2 {
          color: #111827;
          margin: 0 0 8px;
          font-size: 20px;
        }

        .relatorio-titulo p {
          color: #374151;
          font-weight: 500;
        }

        .relatorio-linha {
          height: 3px;
          background: #d97706;
          margin: 25px 0;
        }

        .relatorio-nome-maquina {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          padding: 20px;
          background: #f3f4f6;
          border-left: 5px solid #d97706;
          margin-bottom: 25px;
        }

        .relatorio-nome-maquina span {
          color: #4b5563;
          font-size: 12px;
          font-weight: bold;
        }

        .relatorio-nome-maquina h2 {
          margin: 6px 0 0;
          color: #111827;
          overflow-wrap: anywhere;
        }

        .relatorio-status {
          display: flex;
          flex-direction: column;
          gap: 8px;
          align-items: flex-end;
        }

        .relatorio-status strong {
          color: #374151;
        }

        .relatorio-acoes {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 25px;
        }

        .btn-imprimir {
          background: #d97706;
          color: white;
          border: none;
          padding: 13px 22px;
          border-radius: 8px;
          font-weight: bold;
          cursor: pointer;
          font-size: 15px;
        }

        .relatorio-secao {
          margin-top: 30px;
          margin-bottom: 30px;
        }

        .relatorio-secao h3 {
          color: #111827;
          font-size: 18px;
          border-bottom: 2px solid #d1d5db;
          padding-bottom: 10px;
          margin-bottom: 20px;
        }

        .foto-principal-container {
          width: 100%;
          display: flex;
          justify-content: center;
        }

        .foto-principal-relatorio {
          max-width: 100%;
          max-height: 500px;
          object-fit: contain;
          border-radius: 8px;
          border: 1px solid #9ca3af;
        }

        .dados-maquina-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 15px;
        }

        .dado-item {
          min-width: 0;
          background: #f8fafc;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 14px;
          overflow-wrap: anywhere;
        }

        .dado-item span {
          display: block;
          color: #374151;
          font-size: 12px;
          margin-bottom: 6px;
          font-weight: 600;
        }

        .dado-item strong {
          display: block;
          color: #111827;
          font-size: 15px;
          font-weight: 700;
        }

        .observacoes-relatorio {
          background: #fffbeb;
          border-left: 4px solid #d97706;
          padding: 18px;
          color: #1f2937;
          white-space: pre-wrap;
          line-height: 1.6;
          font-weight: 500;
        }

        .historico-lista {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .historico-item {
          display: flex;
          gap: 15px;
          border: 1px solid #d1d5db;
          padding: 18px;
          border-radius: 8px;
          min-width: 0;
        }

        .historico-numero {
          flex: 0 0 38px;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #d97706;
          color: #ffffff;
          font-weight: bold;
        }

        .historico-conteudo {
          flex: 1;
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .historico-data {
          color: #111827;
          margin-bottom: 10px;
          font-size: 14px;
          font-weight: 600;
        }

        .historico-descricao {
          color: #1f2937;
          line-height: 1.6;
          font-size: 15px;
          white-space: pre-wrap;
          font-weight: 500;
        }

        .historico-detalhes {
          margin-top: 12px;
          color: #374151;
          font-size: 14px;
        }

        .historico-detalhes p {
          margin: 5px 0;
        }

        .fotos-servico-relatorio {
          margin-top: 18px;
        }

        .fotos-servico-relatorio h4 {
          color: #111827;
          margin: 0 0 12px;
        }

        .galeria-relatorio {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(min(220px, 100%), 1fr)
          );
          gap: 15px;
        }

        .galeria-item {
          min-width: 0;
          border: 1px solid #d1d5db;
          padding: 5px;
          border-radius: 6px;
          break-inside: avoid;
        }

        .galeria-item img {
          display: block;
          width: 100%;
          max-height: 350px;
          object-fit: contain;
          border-radius: 4px;
        }

        .galeria-item p {
          margin: 8px 4px 4px;
          color: #374151;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .sem-historico {
          padding: 25px;
          background: #f3f4f6;
          color: #374151;
          text-align: center;
          border-radius: 6px;
          font-weight: 500;
        }

        .sem-maquinas {
          padding: 30px;
          border: 1px dashed #64748b;
          border-radius: 10px;
          color: #cbd5e1;
        }

        .relatorio-rodape {
          border-top: 2px solid #d1d5db;
          margin-top: 50px;
          padding-top: 20px;
          display: flex;
          justify-content: space-between;
          gap: 20px;
          color: #374151;
          font-size: 12px;
        }

        .relatorio-rodape strong {
          color: #111827;
        }

        .status-operando,
        .status-manutencao,
        .status-parada {
          display: inline-block;
          padding: 4px 9px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 700;
        }

        .status-operando {
          color: #065f46;
          background: #d1fae5;
        }

        .status-manutencao {
          color: #92400e;
          background: #fef3c7;
        }

        .status-parada {
          color: #991b1b;
          background: #fee2e2;
        }

        @media (max-width: 700px) {
          .relatorio-documento {
            padding: 20px;
          }

          .relatorio-cabecalho,
          .relatorio-nome-maquina,
          .relatorio-rodape {
            flex-direction: column;
            align-items: flex-start;
          }

          .relatorio-titulo {
            text-align: left;
          }

          .relatorio-status {
            align-items: flex-start;
          }

          .dados-maquina-grid {
            grid-template-columns: 1fr;
          }
        }

        @media print {
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          body {
            background: white !important;
            color: #000000 !important;
          }

          .no-print,
          .mastermec-app > .sidebar,
          nav,
          button {
            display: none !important;
          }

          .mastermec-app {
            background: white !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .page-container {
            width: 100% !important;
            max-width: none !important;
            padding: 0 !important;
            margin: 0 !important;
          }

          .relatorio-documento {
            display: block !important;
            background: white !important;
            color: #000000 !important;
            box-shadow: none !important;
            border-radius: 0 !important;
            padding: 10px !important;
            margin: 0 !important;
            width: 100% !important;
          }

          .relatorio-documento,
          .relatorio-documento p,
          .relatorio-documento span,
          .relatorio-documento div,
          .relatorio-documento strong,
          .relatorio-documento h1,
          .relatorio-documento h2,
          .relatorio-documento h3,
          .relatorio-documento h4 {
            color: #111111 !important;
          }

          .relatorio-cabecalho h1 {
            color: #9a4d00 !important;
          }

          .relatorio-linha {
            background: #b45309 !important;
          }

          .relatorio-nome-maquina {
            background: #eeeeee !important;
            border-left-color: #b45309 !important;
          }

          .dado-item {
            background: #f5f5f5 !important;
            border-color: #999999 !important;
          }

          .observacoes-relatorio {
            background: #f8f8f8 !important;
            border-left-color: #b45309 !important;
          }

          .historico-numero {
            background: #b45309 !important;
            color: #ffffff !important;
          }

          .sem-historico {
            background: #eeeeee !important;
          }

          img {
            max-width: 100% !important;
            break-inside: avoid !important;
          }

          .relatorio-secao,
          .historico-item,
          .galeria-item {
            break-inside: avoid;
          }

          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
    </>
  );
}
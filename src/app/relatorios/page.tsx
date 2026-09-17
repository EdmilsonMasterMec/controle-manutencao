"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FotoRelatorio = {
  id?: number | string;
  imagem: string;
  descricao?: string;
};

type HistoricoRelatorio = {
  id: string;
  data?: string;
  descricao: string;
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
  fabricante: string;
  modelo: string;
  ano: string;
  numeroSerie: string;
  horimetro: string;
  status: string;
  tipo: string;
  proximaManutencao: string;
  observacoes: string;
  foto: string;
  fotos: string[];
  historico: HistoricoRelatorio[];
};

type RegistroBanco = Record<string, unknown>;

function texto(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  return String(valor);
}

function normalizarNome(nome: unknown): string {
  return texto(nome).trim().toLocaleLowerCase("pt-BR");
}

function formatarData(data?: string): string {
  if (!data) return "Não informada";

  const partes = data.slice(0, 10).split("-");
  if (partes.length === 3 && partes[0].length === 4) {
    return `${partes[2]}/${partes[1]}/${partes[0]}`;
  }

  return data;
}

function lerLista(valor: unknown): RegistroBanco[] {
  if (Array.isArray(valor)) {
    return valor.filter(
      (item): item is RegistroBanco =>
        Boolean(item) && typeof item === "object"
    );
  }

  // Alguns campos JSON podem chegar como texto.
  if (typeof valor === "string" && valor.trim()) {
    try {
      const convertido: unknown = JSON.parse(valor);
      if (Array.isArray(convertido)) {
        return convertido.filter(
          (item): item is RegistroBanco =>
            Boolean(item) && typeof item === "object"
        );
      }
    } catch {
      return [];
    }
  }

  return [];
}

function lerFotos(valor: unknown): FotoRelatorio[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .map((item, index) => {
      if (typeof item === "string") {
        return {
          id: index,
          imagem: item,
          descricao: "",
        };
      }

      if (item && typeof item === "object") {
        const foto = item as RegistroBanco;
        const imagem =
          texto(foto.imagem) ||
          texto(foto.url) ||
          texto(foto.caminho);

        if (!imagem) return null;

        return {
          id:
            typeof foto.id === "number" || typeof foto.id === "string"
              ? foto.id
              : index,
          imagem,
          descricao: texto(foto.descricao),
        };
      }

      return null;
    })
    .filter((foto): foto is FotoRelatorio => foto !== null);
}

function lerFotosMaquina(valor: unknown): string[] {
  if (!Array.isArray(valor)) return [];

  return valor
    .map((item) => {
      if (typeof item === "string") return item;

      if (item && typeof item === "object") {
        const foto = item as RegistroBanco;
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

function converterHistoricoEmRegistro(
  registro: RegistroBanco,
  indice: number,
  idMaquina: number
): HistoricoRelatorio {
  const fotos = lerFotos(
    registro.fotos ?? registro.imagens ?? registro.anexos
  );

  return {
    id: `${idMaquina}-historico-${texto(registro.id) || indice}`,
    data: texto(registro.data ?? registro.data_manutencao),
    descricao:
      texto(
        registro.descricao ??
          registro.defeito ??
          registro.observacao ??
          registro.servico
      ) || "Manutenção registrada",
    tipo: texto(registro.tipo),
    mecanico: texto(registro.mecanico ?? registro.responsavel),
    horimetro: texto(registro.horimetro),
    prioridade: texto(registro.prioridade),
    status: texto(registro.status),
    fotos,
  };
}

function historicoDoEquipamento(
  equipamento: RegistroBanco,
  manutencoes: RegistroBanco[]
): HistoricoRelatorio[] {
  const idMaquina = Number(equipamento.id);
  const nomeMaquina = normalizarNome(equipamento.nome);

  // Primeiro, lê o histórico JSON que está na própria tabela equipamentos.
  const historicoSalvo = lerLista(equipamento.historico).map(
    (registro, indice) =>
      converterHistoricoEmRegistro(registro, indice, idMaquina)
  );

  // Depois, procura registros na tabela manutencoes pelo ID ou nome.
  const manutencoesRelacionadas = manutencoes.filter((registro) => {
    const idRegistro =
      registro.equipamento_id ??
      registro.maquina_id ??
      registro.id_equipamento;

    const mesmoId =
      idRegistro !== null &&
      idRegistro !== undefined &&
      texto(idRegistro) === texto(equipamento.id);

    const mesmoNome =
      normalizarNome(registro.maquina) === nomeMaquina;

    return mesmoId || mesmoNome;
  });

  const historicoDaTabela = manutencoesRelacionadas.flatMap(
    (registro, indice) => {
      const servicos = lerLista(registro.servicos);

      if (servicos.length > 0) {
        return servicos.map((servico, servicoIndice) => {
          const descricao =
            texto(servico.descricao).trim() ||
            texto(registro.defeito).trim() ||
            texto(registro.observacao).trim() ||
            "Serviço realizado";

          return {
            id: `manutencao-${texto(registro.id)}-${servicoIndice}`,
            data: texto(registro.data),
            descricao,
            tipo: texto(registro.tipo),
            mecanico: texto(registro.mecanico),
            horimetro: texto(registro.horimetro),
            prioridade: texto(registro.prioridade),
            status: texto(registro.status),
            fotos: lerFotos(servico.fotos),
          };
        });
      }

      return [
        converterHistoricoEmRegistro(
          registro,
          indice,
          idMaquina
        ),
      ];
    }
  );

  // Junta os dois históricos, evitando duplicar registros idênticos.
  const todos = [...historicoSalvo, ...historicoDaTabela];
  const vistos = new Set<string>();

  return todos.filter((item) => {
    const chave = [
      item.data,
      item.descricao,
      item.tipo,
      item.mecanico,
    ].join("|");

    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}

function formatarEquipamento(
  equipamento: RegistroBanco,
  manutencoes: RegistroBanco[]
): MaquinaRelatorio {
  return {
    id: Number(equipamento.id),
    nome: texto(equipamento.nome) || "Máquina sem nome",
    fabricante: texto(equipamento.fabricante),
    modelo: texto(equipamento.modelo),
    ano: texto(equipamento.ano),
    numeroSerie: texto(
      equipamento.numero_serie ?? equipamento.numeroSerie
    ),
    horimetro: texto(equipamento.horimetro),
    status: texto(equipamento.status),
    tipo: texto(equipamento.tipo ?? equipamento.tipo_maquina),
    proximaManutencao: texto(
      equipamento.proxima_manutencao ??
        equipamento.proxima_manutencao ??
        equipamento.proximaManutencao ??
        equipamento.proxima_manutencao
    ),
    observacoes: texto(equipamento.observacoes),
    foto: texto(equipamento.foto),
    fotos: lerFotosMaquina(equipamento.fotos),
    historico: historicoDoEquipamento(equipamento, manutencoes),
  };
}

export default function RelatoriosPage() {
  const [maquinas, setMaquinas] = useState<MaquinaRelatorio[]>([]);
  const [maquinaSelecionada, setMaquinaSelecionada] =
    useState<MaquinaRelatorio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");
  const [avisoManutencoes, setAvisoManutencoes] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregarDados() {
      setCarregando(true);
      setErro("");
      setAvisoManutencoes("");

      // A consulta de máquinas é independente da consulta de manutenções.
      const equipamentosResposta = await supabase
        .from("equipamentos")
        .select("*")
        .order("id", { ascending: true });

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

      const equipamentos = (equipamentosResposta.data || []) as RegistroBanco[];

      // Mesmo que a tabela manutencoes apresente erro, a lista de máquinas
      // continua sendo exibida e o histórico JSON do equipamento será lido.
      const manutencoesResposta = await supabase
        .from("manutencoes")
        .select("*");

      if (!ativo) return;

      let manutencoes: RegistroBanco[] = [];

      if (manutencoesResposta.error) {
        console.error(
          "Erro ao carregar manutenções:",
          manutencoesResposta.error
        );
        setAvisoManutencoes(
          `As máquinas foram carregadas, mas não foi possível consultar a tabela manutencoes: ${manutencoesResposta.error.message}`
        );
      } else {
        manutencoes = (manutencoesResposta.data || []) as RegistroBanco[];
      }

      const maquinasFormatadas = equipamentos.map((equipamento) =>
        formatarEquipamento(equipamento, manutencoes)
      );

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

  function selecionarParaImprimir(maquina: MaquinaRelatorio) {
    setMaquinaSelecionada(maquina);

    // Aguarda a atualização da tela antes de abrir a impressão.
    window.setTimeout(() => {
      window.print();
    }, 300);
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

            <header className="page-header">
              <div>
                <h1>📊 Relatórios</h1>
                <p>
                  Selecione uma máquina para visualizar ou imprimir
                  seu relatório.
                </p>
              </div>
            </header>

            {carregando && (
              <div className="mensagem-relatorio">
                Carregando máquinas...
              </div>
            )}

            {erro && (
              <div className="erro-relatorio" role="alert">
                {erro}
              </div>
            )}

            {avisoManutencoes && (
              <div className="aviso-relatorio" role="status">
                {avisoManutencoes}
              </div>
            )}

            {!carregando && !erro && maquinas.length === 0 && (
              <div className="sem-maquinas">
                Nenhuma máquina encontrada na tabela equipamentos.
              </div>
            )}

            {!carregando && maquinas.length > 0 && (
              <div className="relatorio-maquinas-grid">
                {maquinas.map((maquina) => (
                  <div className="relatorio-maquina-card" key={maquina.id}>
                    <button
                      type="button"
                      className="relatorio-selecionar"
                      onClick={() => setMaquinaSelecionada(maquina)}
                    >
                      <span className="relatorio-card-icon">🚜</span>

                      <span className="relatorio-card-texto">
                        <strong>{maquina.nome}</strong>
                        <span>
                          {maquina.fabricante} {maquina.modelo}
                        </span>
                        <span className={classeStatus(maquina.status)}>
                          {maquina.status || "Sem status"}
                        </span>
                        <small>
                          {maquina.historico.length} registro(s) de manutenção
                        </small>
                      </span>
                    </button>

                    <button
                      type="button"
                      className="btn-imprimir-card"
                      title={`Imprimir relatório de ${maquina.nome}`}
                      aria-label={`Imprimir relatório de ${maquina.nome}`}
                      onClick={() => selecionarParaImprimir(maquina)}
                    >
                      🖨️
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {maquinaSelecionada && (
            <div className="relatorio-documento">
              <header className="relatorio-cabecalho">
                <div>
                  <h1>MasterMec</h1>
                  <p>Gestão de Manutenção de Máquinas</p>
                </div>

                <div className="relatorio-titulo">
                  <h2>RELATÓRIO TÉCNICO</h2>
                  <p>Emissão: {new Date().toLocaleDateString("pt-BR")}</p>
                </div>
              </header>

              <div className="relatorio-linha" />

              <div className="relatorio-nome-maquina">
                <div>
                  <span>RELATÓRIO DA MÁQUINA</span>
                  <h2>🚜 {maquinaSelecionada.nome}</h2>
                </div>

                <div className="relatorio-status">
                  <strong>Status</strong>
                  <span className={classeStatus(maquinaSelecionada.status)}>
                    {maquinaSelecionada.status || "Não informado"}
                  </span>
                </div>
              </div>

              <div className="relatorio-acoes no-print">
                <button
                  type="button"
                  className="btn-imprimir"
                  onClick={() => window.print()}
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
                    <strong>{maquinaSelecionada.fabricante || "-"}</strong>
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
                    <strong>{maquinaSelecionada.numeroSerie || "-"}</strong>
                  </div>
                  <div className="dado-item">
                    <span>Horímetro</span>
                    <strong>{maquinaSelecionada.horimetro || "-"}</strong>
                  </div>
                  <div className="dado-item">
                    <span>Tipo de Máquina</span>
                    <strong>{maquinaSelecionada.tipo || "-"}</strong>
                  </div>
                  <div className="dado-item">
                    <span>Próxima Manutenção</span>
                    <strong>
                      {maquinaSelecionada.proximaManutencao
                        ? formatarData(maquinaSelecionada.proximaManutencao)
                        : "-"}
                    </strong>
                  </div>
                  <div className="dado-item">
                    <span>Responsável</span>
                    <strong>{maquinaSelecionada.observacoes || "-"}</strong>
                  </div>
                </div>
              </section>

              <section className="relatorio-secao">
                <h3>🔧 Histórico de Manutenção</h3>

                {maquinaSelecionada.historico.length > 0 ? (
                  <div className="historico-lista">
                    {maquinaSelecionada.historico.map((item, index) => (
                      <article className="historico-item" key={item.id}>
                        <div className="historico-numero">{index + 1}</div>

                        <div className="historico-conteudo">
                          <div className="historico-data">
                            <strong>Data:</strong> {formatarData(item.data)}
                          </div>

                          <div className="historico-descricao">
                            {item.descricao}
                          </div>

                          <div className="historico-detalhes">
                            {item.tipo && (
                              <p><strong>Tipo:</strong> {item.tipo}</p>
                            )}
                            {item.mecanico && (
                              <p><strong>Mecânico:</strong> {item.mecanico}</p>
                            )}
                            {item.horimetro && (
                              <p><strong>Horímetro:</strong> {item.horimetro}</p>
                            )}
                            {item.prioridade && (
                              <p><strong>Prioridade:</strong> {item.prioridade}</p>
                            )}
                            {item.status && (
                              <p><strong>Status:</strong> {item.status}</p>
                            )}
                          </div>

                          {item.fotos.length > 0 && (
                            <div className="fotos-servico-relatorio">
                              <h4>📷 Fotos do Serviço</h4>

                              <div className="galeria-relatorio">
                                {item.fotos.map((foto, fotoIndex) => (
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
                                    {foto.descricao && <p>{foto.descricao}</p>}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </article>
                    ))}
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
                      <div className="galeria-item" key={`${foto}-${index}`}>
                        <img
                          src={foto}
                          alt={`Foto ${index + 1} da máquina`}
                        />
                      </div>
                    ))}
                  </div>
                </section>
              )}

              <footer className="relatorio-rodape">
                <div>
                  <strong>MasterMec</strong>
                  <p>Gestão de Máquinas e Manutenção</p>
                </div>
                <p>Relatório gerado pelo sistema MasterMec</p>
              </footer>
            </div>
          )}
        </section>
      </main>

      <style jsx global>{`
        .relatorio-introducao {
          margin: 25px 0;
        }

        .mensagem-relatorio,
        .erro-relatorio,
        .aviso-relatorio {
          padding: 15px 18px;
          margin: 16px 0;
          border-radius: 8px;
          overflow-wrap: anywhere;
        }

        .mensagem-relatorio {
          color: #cbd5e1;
          background: #162231;
        }

        .erro-relatorio {
          color: #fecaca;
          background: #450a0a;
          border: 1px solid #991b1b;
        }

        .aviso-relatorio {
          color: #fef3c7;
          background: #422006;
          border: 1px solid #92400e;
        }

        .relatorio-maquinas-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
          gap: 14px;
          margin: 24px 0 30px;
        }

        .relatorio-maquina-card {
          display: flex;
          align-items: stretch;
          gap: 10px;
          min-width: 0;
          padding: 12px;
          border: 1px solid #334155;
          border-radius: 12px;
          background: #162231;
          color: white;
        }

        .relatorio-selecionar {
          display: flex;
          align-items: center;
          gap: 12px;
          flex: 1;
          min-width: 0;
          padding: 6px;
          border: 0;
          background: transparent;
          color: inherit;
          text-align: left;
          cursor: pointer;
        }

        .relatorio-card-icon {
          display: flex;
          flex: 0 0 48px;
          width: 48px;
          height: 48px;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
          background: #263445;
          font-size: 26px;
        }

        .relatorio-card-texto {
          display: flex;
          flex-direction: column;
          gap: 5px;
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .relatorio-card-texto strong {
          font-size: 16px;
        }

        .relatorio-card-texto > span:not(.status-operando):not(.status-manutencao):not(.status-parada) {
          color: #aab5c2;
          font-size: 13px;
        }

        .relatorio-card-texto small {
          color: #cbd5e1;
          font-size: 12px;
        }

        .btn-imprimir-card {
          flex: 0 0 44px;
          align-self: center;
          width: 44px;
          height: 44px;
          border: 1px solid #d97706;
          border-radius: 9px;
          background: #d97706;
          color: white;
          font-size: 20px;
          cursor: pointer;
        }

        .btn-imprimir-card:hover,
        .btn-imprimir:hover {
          background: #b45309;
        }

        .relatorio-documento {
          min-width: 0;
          margin: 30px 0 40px;
          padding: 40px;
          border-radius: 12px;
          background: white;
          color: #111827;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        }

        .relatorio-cabecalho {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 24px;
        }

        .relatorio-cabecalho h1 {
          margin: 0 0 8px;
          color: #b45309;
          font-size: 32px;
        }

        .relatorio-cabecalho p {
          margin: 0;
          color: #374151;
          font-size: 14px;
        }

        .relatorio-titulo {
          text-align: right;
        }

        .relatorio-titulo h2 {
          margin: 0 0 8px;
          font-size: 20px;
        }

        .relatorio-linha {
          height: 3px;
          margin: 25px 0;
          background: #d97706;
        }

        .relatorio-nome-maquina {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 18px;
          margin-bottom: 25px;
          padding: 20px;
          border-left: 5px solid #d97706;
          background: #f3f4f6;
        }

        .relatorio-nome-maquina > div:first-child > span {
          color: #4b5563;
          font-size: 12px;
          font-weight: bold;
        }

        .relatorio-nome-maquina h2 {
          margin: 6px 0 0;
          overflow-wrap: anywhere;
        }

        .relatorio-status {
          display: flex;
          flex-direction: column;
          align-items: flex-end;
          gap: 8px;
        }

        .relatorio-acoes {
          display: flex;
          justify-content: flex-end;
          margin-bottom: 25px;
        }

        .btn-imprimir {
          padding: 13px 22px;
          border: 0;
          border-radius: 8px;
          background: #d97706;
          color: white;
          font-size: 15px;
          font-weight: bold;
          cursor: pointer;
        }

        .relatorio-secao {
          margin: 30px 0;
        }

        .relatorio-secao h3 {
          margin-bottom: 20px;
          padding-bottom: 10px;
          border-bottom: 2px solid #d1d5db;
          color: #111827;
          font-size: 18px;
        }

        .foto-principal-container {
          display: flex;
          justify-content: center;
          width: 100%;
        }

        .foto-principal-relatorio {
          max-width: 100%;
          max-height: 500px;
          object-fit: contain;
          border: 1px solid #9ca3af;
          border-radius: 8px;
        }

        .dados-maquina-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .dado-item {
          min-width: 0;
          padding: 14px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          background: #f8fafc;
          overflow-wrap: anywhere;
        }

        .dado-item span {
          display: block;
          margin-bottom: 6px;
          color: #374151;
          font-size: 12px;
          font-weight: 600;
        }

        .dado-item strong {
          display: block;
          color: #111827;
          font-size: 15px;
        }

        .historico-lista {
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .historico-item {
          display: flex;
          gap: 14px;
          min-width: 0;
          padding: 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
        }

        .historico-numero {
          display: flex;
          flex: 0 0 36px;
          width: 36px;
          height: 36px;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          background: #d97706;
          color: white;
          font-weight: bold;
        }

        .historico-conteudo {
          flex: 1;
          min-width: 0;
          overflow-wrap: anywhere;
        }

        .historico-data {
          margin-bottom: 10px;
          color: #111827;
          font-size: 14px;
        }

        .historico-descricao {
          color: #1f2937;
          font-size: 15px;
          line-height: 1.6;
          white-space: pre-wrap;
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
          margin: 0 0 12px;
          color: #111827;
        }

        .galeria-relatorio {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
          gap: 14px;
        }

        .galeria-item {
          min-width: 0;
          padding: 5px;
          border: 1px solid #d1d5db;
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
          padding: 24px;
          border-radius: 6px;
          background: #f3f4f6;
          color: #374151;
          text-align: center;
        }

        .sem-maquinas {
          padding: 25px;
          border: 1px dashed #64748b;
          border-radius: 10px;
          color: #cbd5e1;
        }

        .relatorio-rodape {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          margin-top: 45px;
          padding-top: 18px;
          border-top: 2px solid #d1d5db;
          color: #374151;
          font-size: 12px;
        }

        .relatorio-rodape p {
          margin: 5px 0 0;
        }

        .status-operando,
        .status-manutencao,
        .status-parada {
          display: inline-block;
          width: fit-content;
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
            padding: 18px;
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
          @page {
            size: A4;
            margin: 15mm;
          }

          body {
            background: white !important;
            color: #111 !important;
          }

          .no-print,
          nav,
          button {
            display: none !important;
          }

          .mastermec-app,
          .page-container {
            width: 100% !important;
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            background: white !important;
          }

          .relatorio-documento {
            display: block !important;
            width: 100% !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
            background: white !important;
            color: #111 !important;
            box-shadow: none !important;
          }

          .relatorio-documento * {
            color: #111 !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          .relatorio-cabecalho h1 {
            color: #9a4d00 !important;
          }

          .relatorio-linha {
            background: #b45309 !important;
          }

          .relatorio-nome-maquina {
            background: #eee !important;
            border-left-color: #b45309 !important;
          }

          .historico-numero {
            background: #b45309 !important;
            color: white !important;
          }

          .historico-item,
          .galeria-item,
          .relatorio-secao {
            break-inside: avoid;
          }

          img {
            max-width: 100% !important;
            break-inside: avoid !important;
          }
        }
      `}</style>
    </>
  );
}
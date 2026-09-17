"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabase";

type FotoRelatorio = {
  id?: number | string;
  imagem?: string;
  url?: string;
  caminho?: string;
  descricao?: string;
};

type ServicoRelatorio = {
  id?: number | string;
  descricao?: string;
  fotos?: unknown;
};

type HistoricoRelatorio = {
  id?: number | string;
  data?: string;
  descricao?: string;
  defeito?: string;
  observacao?: string;
  tipo?: string;
  mecanico?: string;
  horimetro?: string | number;
  prioridade?: string;
  status?: string;
  servicos?: unknown;
  fotos?: unknown;
};

type EquipamentoRelatorio = {
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
  historico?: unknown;
};

function texto(valor: unknown): string {
  if (valor === null || valor === undefined) return "";
  return String(valor);
}

function arraySeguro(valor: unknown): unknown[] {
  if (Array.isArray(valor)) return valor;

  if (typeof valor === "string") {
    try {
      const convertido = JSON.parse(valor);
      return Array.isArray(convertido) ? convertido : [];
    } catch {
      return [];
    }
  }

  return [];
}

function formatarData(data?: string): string {
  if (!data) return "Não informada";

  const partes = data.split("-");
  if (partes.length === 3 && partes[0].length === 4) {
    return `${partes[2].slice(0, 2)}/${partes[1]}/${partes[0]}`;
  }

  return data;
}

function obterFotos(valor: unknown): FotoRelatorio[] {
  return arraySeguro(valor)
    .map((item, index) => {
      if (typeof item === "string") {
        return { id: index, imagem: item };
      }

      if (!item || typeof item !== "object") return null;

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
    })
    .filter((foto): foto is FotoRelatorio => Boolean(foto?.imagem));
}

function obterHistorico(valor: unknown): HistoricoRelatorio[] {
  return arraySeguro(valor).filter(
    (item): item is HistoricoRelatorio =>
      Boolean(item) && typeof item === "object"
  );
}

function obterServicos(valor: unknown): ServicoRelatorio[] {
  return arraySeguro(valor).filter(
    (item): item is ServicoRelatorio =>
      Boolean(item) && typeof item === "object"
  );
}

export default function RelatoriosPage() {
  const searchParams = useSearchParams();
  const idParam = searchParams.get("id");

  const [maquinas, setMaquinas] = useState<EquipamentoRelatorio[]>([]);
  const [selecionada, setSelecionada] =
    useState<EquipamentoRelatorio | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  useEffect(() => {
    let ativo = true;

    async function carregar() {
      setCarregando(true);
      setErro("");

      const { data, error } = await supabase
        .from("equipamentos")
        .select("*")
        .order("id", { ascending: true });

      if (!ativo) return;

      if (error) {
        console.error("Erro ao carregar equipamentos:", error);
        setErro("Erro ao carregar máquinas: " + error.message);
        setMaquinas([]);
        setSelecionada(null);
        setCarregando(false);
        return;
      }

      const lista = (data || []) as EquipamentoRelatorio[];
      setMaquinas(lista);

      if (idParam) {
        const encontrada = lista.find(
          (maquina) => String(maquina.id) === String(idParam)
        );

        if (encontrada) {
          setSelecionada(encontrada);
        } else {
          setSelecionada(null);
          setErro("Não encontrei uma máquina com esse ID.");
        }
      } else {
        setSelecionada(null);
      }

      setCarregando(false);
    }

    carregar();

    return () => {
      ativo = false;
    };
  }, [idParam]);

  function imprimir() {
    window.print();
  }

  function escolherMaquina(maquina: EquipamentoRelatorio) {
    setSelecionada(maquina);
    window.history.replaceState(
      null,
      "",
      `/relatorios?id=${maquina.id}`
    );
  }

  const historico = selecionada
    ? obterHistorico(selecionada.historico)
    : [];

  const fotosMaquina = selecionada
    ? obterFotos(selecionada.fotos)
    : [];

  return (
    <main className="relatorio-page">
      <div className="no-print">
        <Link href="/maquinas" className="voltar">
          ← Voltar para Equipamentos
        </Link>

        <header className="page-header">
          <div>
            <h1>📊 Relatórios</h1>
            <p>Selecione uma máquina para visualizar e imprimir o relatório.</p>
          </div>
        </header>

        {carregando && <p>Carregando máquinas...</p>}

        {erro && <div className="erro">{erro}</div>}

        {!carregando && maquinas.length === 0 && !erro && (
          <p>Nenhuma máquina cadastrada.</p>
        )}

        {!carregando && maquinas.length > 0 && (
          <div className="lista-maquinas">
            {maquinas.map((maquina) => (
              <button
                key={maquina.id}
                type="button"
                className={
                  selecionada?.id === maquina.id
                    ? "maquina-card selecionada"
                    : "maquina-card"
                }
                onClick={() => escolherMaquina(maquina)}
              >
                <span className="icone-maquina">🚜</span>
                <span className="maquina-texto">
                  <strong>{maquina.nome || "Máquina sem nome"}</strong>
                  <small>
                    {maquina.fabricante || ""} {maquina.modelo || ""}
                  </small>
                  <small>
                    {obterHistorico(maquina.historico).length} registro(s)
                    no histórico
                  </small>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {selecionada && (
        <article className="documento">
          <header className="cabecalho-relatorio">
            <div>
              <h1>MasterMec</h1>
              <p>Gestão e Manutenção de Máquinas</p>
            </div>
            <div className="titulo-relatorio">
              <h2>RELATÓRIO TÉCNICO</h2>
              <p>Emissão: {new Date().toLocaleDateString("pt-BR")}</p>
            </div>
          </header>

          <div className="linha" />

          <div className="nome-maquina">
            <div>
              <small>RELATÓRIO DA MÁQUINA</small>
              <h2>🚜 {selecionada.nome || "Máquina sem nome"}</h2>
            </div>
            <div>
              <strong>Status</strong>
              <p>{selecionada.status || "Não informado"}</p>
            </div>
          </div>

          <div className="acoes-relatorio no-print">
            <button className="btn-imprimir" onClick={imprimir}>
              🖨️ Imprimir / Salvar PDF
            </button>
          </div>

          {selecionada.foto && (
            <section className="secao">
              <h3>📷 Foto da Máquina</h3>
              <img
                className="foto-principal"
                src={selecionada.foto}
                alt={`Foto de ${selecionada.nome || "máquina"}`}
              />
            </section>
          )}

          <section className="secao">
            <h3>📋 Dados Técnicos</h3>
            <div className="dados-grid">
              <div><span>Nome</span><strong>{selecionada.nome || "-"}</strong></div>
              <div><span>Fabricante</span><strong>{selecionada.fabricante || "-"}</strong></div>
              <div><span>Modelo</span><strong>{selecionada.modelo || "-"}</strong></div>
              <div><span>Ano</span><strong>{texto(selecionada.ano) || "-"}</strong></div>
              <div><span>Número de Série</span><strong>{selecionada.numero_serie || selecionada.numeroSerie || "-"}</strong></div>
              <div><span>Horímetro</span><strong>{texto(selecionada.horimetro) || "-"}</strong></div>
              <div><span>Tipo</span><strong>{selecionada.tipo || selecionada.tipo_maquina || "-"}</strong></div>
              <div><span>Próxima Manutenção</span><strong>{formatarData(selecionada.proxima_manutencao || selecionada.proximaManutencao || "")}</strong></div>
            </div>
          </section>

          {selecionada.observacoes && (
            <section className="secao">
              <h3>📝 Observações Gerais</h3>
              <div className="observacoes">{selecionada.observacoes}</div>
            </section>
          )}

          <section className="secao">
            <h3>🔧 Histórico de Manutenção</h3>

            {historico.length === 0 ? (
              <div className="sem-historico">
                Nenhuma manutenção registrada no campo histórico desta máquina.
              </div>
            ) : (
              <div className="historico-lista">
                {historico.map((item, index) => {
                  const servicos = obterServicos(item.servicos);
                  const fotosDoRegistro = obterFotos(item.fotos);

                  return (
                    <div className="historico-item" key={item.id ?? index}>
                      <div className="numero">{index + 1}</div>
                      <div className="historico-conteudo">
                        <p><strong>Data:</strong> {formatarData(item.data)}</p>

                        <p className="descricao">
                          {item.descricao ||
                            item.defeito ||
                            item.observacao ||
                            "Serviço registrado"}
                        </p>

                        {item.tipo && <p><strong>Tipo:</strong> {item.tipo}</p>}
                        {item.mecanico && <p><strong>Mecânico:</strong> {item.mecanico}</p>}
                        {item.horimetro !== undefined && item.horimetro !== null && (
                          <p><strong>Horímetro:</strong> {texto(item.horimetro)}</p>
                        )}
                        {item.prioridade && <p><strong>Prioridade:</strong> {item.prioridade}</p>}
                        {item.status && <p><strong>Status:</strong> {item.status}</p>}

                        {servicos.map((servico, servicoIndex) => {
                          const fotosServico = obterFotos(servico.fotos);

                          return (
                            <div key={servico.id ?? servicoIndex}>
                              {servico.descricao && (
                                <p className="descricao">
                                  {servico.descricao}
                                </p>
                              )}

                              {fotosServico.length > 0 && (
                                <div className="galeria">
                                  {fotosServico.map((foto, fotoIndex) => (
                                    <figure key={foto.id ?? fotoIndex}>
                                      <img src={foto.imagem} alt={foto.descricao || "Foto do serviço"} />
                                      {foto.descricao && <figcaption>{foto.descricao}</figcaption>}
                                    </figure>
                                  ))}
                                </div>
                              )}
                            </div>
                          );
                        })}

                        {fotosDoRegistro.length > 0 && (
                          <div className="galeria">
                            {fotosDoRegistro.map((foto, fotoIndex) => (
                              <figure key={foto.id ?? fotoIndex}>
                                <img src={foto.imagem} alt={foto.descricao || "Foto da manutenção"} />
                                {foto.descricao && <figcaption>{foto.descricao}</figcaption>}
                              </figure>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {fotosMaquina.length > 0 && (
            <section className="secao">
              <h3>📸 Fotos da Máquina</h3>
              <div className="galeria">
                {fotosMaquina.map((foto, index) => (
                  <figure key={foto.id ?? index}>
                    <img src={foto.imagem} alt={foto.descricao || `Foto ${index + 1} da máquina`} />
                    {foto.descricao && <figcaption>{foto.descricao}</figcaption>}
                  </figure>
                ))}
              </div>
            </section>
          )}

          <footer className="rodape">
            <strong>MasterMec</strong>
            <span>Relatório gerado pelo sistema MasterMec</span>
          </footer>
        </article>
      )}

      <style jsx global>{`
        .relatorio-page {
          min-height: 100vh;
          padding: 24px;
          background: #101923;
          color: #f8fafc;
        }

        .page-header {
          margin: 24px 0;
        }

        .page-header h1 {
          margin: 0 0 8px;
          font-size: 28px;
        }

        .page-header p {
          color: #aeb8c6;
        }

        .voltar {
          color: #ffb000;
          text-decoration: none;
        }

        .erro {
          margin: 16px 0;
          padding: 14px;
          color: #fecaca;
          background: #450a0a;
          border-radius: 8px;
          overflow-wrap: anywhere;
        }

        .lista-maquinas {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(280px, 100%), 1fr));
          gap: 12px;
          margin-bottom: 28px;
        }

        .maquina-card {
          display: flex;
          align-items: center;
          gap: 14px;
          width: 100%;
          padding: 16px;
          color: white;
          text-align: left;
          background: #162231;
          border: 1px solid #334155;
          border-radius: 10px;
          cursor: pointer;
        }

        .maquina-card.selecionada {
          border-color: #f59e0b;
          box-shadow: 0 0 0 1px #f59e0b;
        }

        .icone-maquina {
          font-size: 28px;
        }

        .maquina-texto {
          display: flex;
          flex-direction: column;
          gap: 5px;
          overflow-wrap: anywhere;
        }

        .maquina-texto small {
          color: #cbd5e1;
        }

        .documento {
          max-width: 1100px;
          margin: 24px auto;
          padding: 40px;
          color: #111827;
          background: white;
          border-radius: 10px;
        }

        .cabecalho-relatorio {
          display: flex;
          justify-content: space-between;
          gap: 20px;
        }

        .cabecalho-relatorio h1 {
          margin: 0 0 8px;
          color: #b45309;
          font-size: 32px;
        }

        .cabecalho-relatorio p {
          margin: 0;
          color: #374151;
        }

        .titulo-relatorio {
          text-align: right;
        }

        .titulo-relatorio h2 {
          margin: 0 0 8px;
          font-size: 20px;
        }

        .linha {
          height: 3px;
          margin: 24px 0;
          background: #d97706;
        }

        .nome-maquina {
          display: flex;
          justify-content: space-between;
          gap: 20px;
          padding: 18px;
          background: #f3f4f6;
          border-left: 5px solid #d97706;
        }

        .nome-maquina small {
          color: #4b5563;
          font-weight: bold;
        }

        .nome-maquina h2 {
          overflow-wrap: anywhere;
        }

        .acoes-relatorio {
          display: flex;
          justify-content: flex-end;
          margin: 20px 0;
        }

        .btn-imprimir {
          padding: 12px 18px;
          color: white;
          background: #b45309;
          border: 0;
          border-radius: 8px;
          cursor: pointer;
          font-weight: bold;
        }

        .secao {
          margin: 28px 0;
        }

        .secao h3 {
          padding-bottom: 10px;
          border-bottom: 2px solid #d1d5db;
        }

        .dados-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 12px;
        }

        .dados-grid > div {
          padding: 12px;
          background: #f8fafc;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          overflow-wrap: anywhere;
        }

        .dados-grid span,
        .dados-grid strong {
          display: block;
        }

        .dados-grid span {
          margin-bottom: 5px;
          color: #4b5563;
          font-size: 12px;
        }

        .observacoes,
        .sem-historico {
          padding: 16px;
          background: #f3f4f6;
          border-radius: 6px;
          white-space: pre-wrap;
          overflow-wrap: anywhere;
        }

        .historico-lista {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .historico-item {
          display: flex;
          align-items: flex-start;
          gap: 14px;
          padding: 16px;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          break-inside: avoid;
        }

        .numero {
          display: flex;
          align-items: center;
          justify-content: center;
          flex: 0 0 34px;
          width: 34px;
          height: 34px;
          color: white;
          background: #b45309;
          border-radius: 50%;
          font-weight: bold;
        }

        .historico-conteudo {
          min-width: 0;
          flex: 1;
          overflow-wrap: anywhere;
        }

        .historico-conteudo p {
          margin: 6px 0;
        }

        .descricao {
          white-space: pre-wrap;
        }

        .galeria {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(min(200px, 100%), 1fr));
          gap: 12px;
          margin-top: 14px;
        }

        .galeria figure {
          min-width: 0;
          margin: 0;
          padding: 6px;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          break-inside: avoid;
        }

        .galeria img {
          display: block;
          width: 100%;
          max-height: 350px;
          object-fit: contain;
        }

        .galeria figcaption {
          padding: 8px 4px;
          font-size: 13px;
          overflow-wrap: anywhere;
        }

        .foto-principal {
          display: block;
          max-width: 100%;
          max-height: 450px;
          margin: auto;
          object-fit: contain;
        }

        .rodape {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          margin-top: 40px;
          padding-top: 16px;
          border-top: 2px solid #d1d5db;
          color: #374151;
          font-size: 12px;
        }

        @media (max-width: 650px) {
          .relatorio-page {
            padding: 14px;
          }

          .documento {
            padding: 18px;
          }

          .cabecalho-relatorio,
          .nome-maquina,
          .rodape {
            flex-direction: column;
          }

          .titulo-relatorio {
            text-align: left;
          }

          .dados-grid {
            grid-template-columns: 1fr;
          }
        }

        @media print {
          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          .relatorio-page {
            padding: 0 !important;
            background: white !important;
          }

          .documento {
            max-width: none !important;
            margin: 0 !important;
            padding: 0 !important;
            border-radius: 0 !important;
          }

          .secao,
          .historico-item,
          .galeria figure {
            break-inside: avoid;
          }

          @page {
            size: A4;
            margin: 15mm;
          }
        }
      `}</style>
    </main>
  );
}
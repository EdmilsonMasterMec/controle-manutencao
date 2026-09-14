"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  carregarMaquinas,
  FotoServico,
} from "../../lib/store";

type HistoricoRelatorio = {
  id?: number;
  data?: string;
  descricao?: string;
  observacao?: string;
  observacoes?: string;
  servico?: string;
  foto?: string;

  // NOVA ESTRUTURA
  fotos?: FotoServico[];

  tipo?: string;
  mecanico?: string;
  horimetro?: string;
  prioridade?: string;
  status?: string;
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
  tipoMaquina?: string;
  proximaManutencao?: string;
  observacoes?: string;
  foto?: string;
  fotos?: string[];
  historico?: HistoricoRelatorio[];
};

export default function Relatorios() {
  const [maquinas, setMaquinas] =
    useState<MaquinaRelatorio[]>([]);

  const [
    maquinaSelecionada,
    setMaquinaSelecionada,
  ] = useState<MaquinaRelatorio | null>(null);

  useEffect(() => {
    const dados =
      carregarMaquinas() as MaquinaRelatorio[];

    setMaquinas(dados);
  }, []);

  function imprimirRelatorio() {
    window.print();
  }

  function formatarData(data?: string) {
    if (!data) {
      return "Não informada";
    }

    // Data do input type="date"
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(data)
    ) {
      const partes = data.split("-");

      return `${partes[2]}/${partes[1]}/${partes[0]}`;
    }

    return data;
  }

  function formatarTextoHistorico(
    item: HistoricoRelatorio
  ) {
    return (
      item.descricao ||
      item.servico ||
      item.observacao ||
      item.observacoes ||
      "Serviço realizado"
    );
  }

  function obterFotosDoHistorico(
    item: HistoricoRelatorio
  ): FotoServico[] {
    /*
     * NOVA ESTRUTURA:
     * item.fotos
     */
    if (
      Array.isArray(item.fotos) &&
      item.fotos.length > 0
    ) {
      return item.fotos;
    }

    /*
     * COMPATIBILIDADE:
     * Se existir somente a foto antiga,
     * transforma em uma foto do novo formato.
     */
    if (item.foto) {
      return [
        {
          id:
            item.id ||
            Date.now(),

          imagem: item.foto,

          descricao: "",
        },
      ];
    }

    return [];
  }

  return (
    <>
      <main className="robert-app relatorio-page">
        <section className="page-container">

          {/* ============================================
              ÁREA DE SELEÇÃO
          ============================================ */}

          <div className="no-print">

            <Link
              href="/"
              className="voltar"
            >
              ← Voltar ao Dashboard
            </Link>

            <div className="page-header">

              <div>
                <h1>
                  📊 Relatórios
                </h1>

                <p>
                  Relatórios completos das
                  máquinas e histórico de
                  manutenção
                </p>
              </div>

            </div>

            <div className="relatorio-introducao">

              <h2>
                Selecione uma máquina
              </h2>

              <p>
                Escolha uma máquina abaixo
                para visualizar e imprimir
                seu relatório completo.
              </p>

            </div>

            <div className="relatorio-maquinas-grid">

              {maquinas.length > 0 ? (

                maquinas.map(
                  (maquina) => (

                    <button
                      key={maquina.id}
                      className={
                        maquinaSelecionada?.id ===
                        maquina.id
                          ? "relatorio-maquina-card ativo"
                          : "relatorio-maquina-card"
                      }
                      onClick={() =>
                        setMaquinaSelecionada(
                          maquina
                        )
                      }
                    >

                      <div className="relatorio-card-icon">
                        🚜
                      </div>

                      <div>

                        <h3>
                          {maquina.nome}
                        </h3>

                        <p>
                          {maquina.fabricante}{" "}
                          {maquina.modelo}
                        </p>

                        <span
                          className={
                            maquina.status ===
                            "Operando"
                              ? "status-operando"
                              : maquina.status ===
                                "Em Manutenção"
                              ? "status-manutencao"
                              : "status-parada"
                          }
                        >
                          {maquina.status ||
                            "Sem status"}
                        </span>

                      </div>

                    </button>

                  )
                )

              ) : (

                <div className="sem-maquinas">

                  <h3>
                    Nenhuma máquina
                    cadastrada
                  </h3>

                  <p>
                    Cadastre máquinas
                    primeiro para gerar
                    relatórios.
                  </p>

                </div>

              )}

            </div>

          </div>

          {/* ============================================
              DOCUMENTO DO RELATÓRIO
          ============================================ */}

          {maquinaSelecionada && (

            <div className="relatorio-documento">

              {/* CABEÇALHO */}

              <div className="relatorio-cabecalho">

                <div>

                  <h1>
                    Robert Engenharia
                  </h1>

                  <p>
                    Sistema Inteligente de
                    Gestão e Manutenção de
                    Máquinas
                  </p>

                </div>

                <div className="relatorio-titulo">

                  <h2>
                    RELATÓRIO TÉCNICO
                  </h2>

                  <p>
                    Emissão:{" "}
                    {new Date().toLocaleDateString(
                      "pt-BR"
                    )}
                  </p>

                </div>

              </div>

              <div className="relatorio-linha"></div>

              {/* ==========================================
                  IDENTIFICAÇÃO DA MÁQUINA
              ========================================== */}

              <div className="relatorio-nome-maquina">

                <div>

                  <span>
                    RELATÓRIO DA MÁQUINA
                  </span>

                  <h2>
                    🚜{" "}
                    {maquinaSelecionada.nome}
                  </h2>

                </div>

                <div className="relatorio-status">

                  <strong>
                    Status
                  </strong>

                  <span
                    className={
                      maquinaSelecionada.status ===
                      "Operando"
                        ? "status-operando"
                        : maquinaSelecionada.status ===
                          "Em Manutenção"
                        ? "status-manutencao"
                        : "status-parada"
                    }
                  >
                    {maquinaSelecionada.status ||
                      "Não informado"}
                  </span>

                </div>

              </div>

              {/* BOTÃO */}

              <div className="relatorio-acoes no-print">

                <button
                  className="btn-imprimir"
                  onClick={
                    imprimirRelatorio
                  }
                >
                  🖨️ Imprimir / Salvar PDF
                </button>

              </div>

              {/* ==========================================
                  FOTO PRINCIPAL
              ========================================== */}

              {maquinaSelecionada.foto && (

                <section className="relatorio-secao">

                  <h3>
                    📷 Foto da Máquina
                  </h3>

                  <div className="foto-principal-container">

                    <img
                      src={
                        maquinaSelecionada.foto
                      }
                      alt={
                        maquinaSelecionada.nome
                      }
                      className="foto-principal-relatorio"
                    />

                  </div>

                </section>

              )}

              {/* ==========================================
                  DADOS TÉCNICOS
              ========================================== */}

              <section className="relatorio-secao">

                <h3>
                  📋 Dados Técnicos da Máquina
                </h3>

                <div className="dados-maquina-grid">

                  <div className="dado-item">

                    <span>
                      Nome da Máquina
                    </span>

                    <strong>
                      {maquinaSelecionada.nome ||
                        "-"}
                    </strong>

                  </div>

                  <div className="dado-item">

                    <span>
                      Fabricante
                    </span>

                    <strong>
                      {maquinaSelecionada.fabricante ||
                        "-"}
                    </strong>

                  </div>

                  <div className="dado-item">

                    <span>
                      Modelo
                    </span>

                    <strong>
                      {maquinaSelecionada.modelo ||
                        "-"}
                    </strong>

                  </div>

                  <div className="dado-item">

                    <span>
                      Ano
                    </span>

                    <strong>
                      {maquinaSelecionada.ano ||
                        "-"}
                    </strong>

                  </div>

                  <div className="dado-item">

                    <span>
                      Número de Série
                    </span>

                    <strong>
                      {maquinaSelecionada.numeroSerie ||
                        "-"}
                    </strong>

                  </div>

                  <div className="dado-item">

                    <span>
                      Horímetro
                    </span>

                    <strong>
                      {maquinaSelecionada.horimetro ||
                        "-"}
                    </strong>

                  </div>

                  <div className="dado-item">

                    <span>
                      Tipo de Máquina
                    </span>

                    <strong>
                      {maquinaSelecionada.tipo ||
                        maquinaSelecionada.tipoMaquina ||
                        "-"}
                    </strong>

                  </div>

                  <div className="dado-item">

                    <span>
                      Próxima Manutenção
                    </span>

                    <strong>
                      {maquinaSelecionada.proximaManutencao ||
                        "-"}
                    </strong>

                  </div>

                </div>

              </section>

              {/* ==========================================
                  OBSERVAÇÕES
              ========================================== */}

              {maquinaSelecionada.observacoes && (

                <section className="relatorio-secao">

                  <h3>
                    📝 Observações Gerais
                  </h3>

                  <div className="observacoes-relatorio">
                    {maquinaSelecionada.observacoes}
                  </div>

                </section>

              )}

              {/* ==========================================
                  HISTÓRICO DE MANUTENÇÃO
              ========================================== */}

              <section className="relatorio-secao">

                <h3>
                  🔧 Histórico de Manutenção
                </h3>

                {maquinaSelecionada.historico &&
                maquinaSelecionada.historico.length >
                  0 ? (

                  <div className="historico-lista">

                    {maquinaSelecionada.historico.map(
                      (
                        item,
                        index
                      ) => {

                        const fotos =
                          obterFotosDoHistorico(
                            item
                          );

                        return (

                          <div
                            className="historico-item"
                            key={
                              item.id ||
                              index
                            }
                          >

                            <div className="historico-numero">
                              {index + 1}
                            </div>

                            <div className="historico-conteudo">

                              {/* DATA */}

                              <div className="historico-data">

                                <strong>
                                  Data:
                                </strong>{" "}

                                {formatarData(
                                  item.data
                                )}

                              </div>

                              {/* TIPO */}

                              {item.tipo && (

                                <div className="historico-informacao">

                                  <strong>
                                    Tipo:
                                  </strong>{" "}

                                  {item.tipo}

                                </div>

                              )}

                              {/* MECÂNICO */}

                              {item.mecanico && (

                                <div className="historico-informacao">

                                  <strong>
                                    Mecânico:
                                  </strong>{" "}

                                  {item.mecanico}

                                </div>

                              )}

                              {/* HORÍMETRO */}

                              {item.horimetro && (

                                <div className="historico-informacao">

                                  <strong>
                                    Horímetro:
                                  </strong>{" "}

                                  {item.horimetro}

                                </div>

                              )}

                              {/* PRIORIDADE */}

                              {item.prioridade && (

                                <div className="historico-informacao">

                                  <strong>
                                    Prioridade:
                                  </strong>{" "}

                                  {item.prioridade}

                                </div>

                              )}

                              {/* STATUS */}

                              {item.status && (

                                <div className="historico-informacao">

                                  <strong>
                                    Status:
                                  </strong>{" "}

                                  {item.status}

                                </div>

                              )}

                              {/* =================================
                                  DESCRIÇÃO DO SERVIÇO
                              ================================= */}

                              <div className="servico-relatorio-titulo">

                                <strong>
                                  🔧 Serviço Executado
                                </strong>

                              </div>

                              <div className="historico-descricao">

                                {formatarTextoHistorico(
                                  item
                                )}

                              </div>

                              {/* =================================
                                  FOTOS DO SERVIÇO
                              ================================= */}

                              {fotos.length >
                                0 && (

                                <div className="fotos-historico-relatorio">

                                  <div className="fotos-historico-titulo">

                                    📷 Fotos do Serviço

                                  </div>

                                  <div className="fotos-historico-grid">

                                    {fotos.map(
                                      (
                                        foto,
                                        fotoIndex
                                      ) => (

                                        <div
                                          className="foto-servico-relatorio"
                                          key={
                                            foto.id ||
                                            fotoIndex
                                          }
                                        >

                                          <img
                                            src={
                                              foto.imagem
                                            }
                                            alt={`Foto ${
                                              fotoIndex +
                                              1
                                            } do serviço`}
                                          />

                                          {/* DESCRIÇÃO DA FOTO */}

                                          {foto.descricao && (

                                            <div className="descricao-foto-relatorio">

                                              <strong>
                                                Observação da foto:
                                              </strong>

                                              <p>
                                                {
                                                  foto.descricao
                                                }
                                              </p>

                                            </div>

                                          )}

                                        </div>

                                      )
                                    )}

                                  </div>

                                </div>

                              )}

                              {/* OBSERVAÇÃO GERAL */}

                              {item.observacao && (

                                <div className="observacao-servico-relatorio">

                                  <strong>
                                    Observação:
                                  </strong>

                                  <p>
                                    {
                                      item.observacao
                                    }
                                  </p>

                                </div>

                              )}

                            </div>

                          </div>

                        );
                      }
                    )}

                  </div>

                ) : (

                  <div className="sem-historico">

                    Nenhum histórico de
                    manutenção registrado
                    para esta máquina.

                  </div>

                )}

              </section>

              {/* ==========================================
                  GALERIA ANTIGA
                  Mantida para compatibilidade
              ========================================== */}

              {maquinaSelecionada.fotos &&
              maquinaSelecionada.fotos.length >
                0 && (

                <section className="relatorio-secao">

                  <h3>
                    📸 Galeria de Fotos
                  </h3>

                  <div className="galeria-relatorio">

                    {maquinaSelecionada.fotos.map(
                      (
                        foto,
                        index
                      ) => (

                        <div
                          className="galeria-item"
                          key={index}
                        >

                          <img
                            src={foto}
                            alt={`Foto ${
                              index + 1
                            }`}
                          />

                        </div>

                      )
                    )}

                  </div>

                </section>

              )}

              {/* ==========================================
                  RODAPÉ
              ========================================== */}

              <div className="relatorio-rodape">

                <div>

                  <strong>
                    Robert Engenharia
                  </strong>

                  <p>
                    Gestão Inteligente de
                    Máquinas e Manutenção
                  </p>

                </div>

                <div>

                  <p>
                    Relatório gerado pelo
                    sistema Robert Engenharia
                  </p>

                </div>

              </div>

            </div>

          )}

        </section>
      </main>

      {/* ====================================================
          CSS
      ==================================================== */}

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

        .relatorio-maquinas-grid {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(280px, 1fr)
          );
          gap: 18px;
          margin-bottom: 30px;
        }

        .relatorio-maquina-card {
          width: 100%;
          display: flex;
          align-items: center;
          gap: 16px;
          text-align: left;
          padding: 20px;
          border-radius: 12px;
          border: 1px solid #334155;
          background: #162231;
          cursor: pointer;
          transition: 0.2s;
          color: white;
        }

        .relatorio-maquina-card:hover {
          transform: translateY(-3px);
          border-color: #f59e0b;
          background: #1c2a3a;
        }

        .relatorio-maquina-card.ativo {
          border-color: #f59e0b;
          box-shadow:
            0 0 0 1px #f59e0b;
        }

        .relatorio-card-icon {
          width: 55px;
          height: 55px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
          background: #263445;
          border-radius: 12px;
          flex-shrink: 0;
        }

        .relatorio-maquina-card h3 {
          margin: 0 0 6px 0;
          font-size: 17px;
        }

        .relatorio-maquina-card p {
          margin: 0 0 10px 0;
          color: #aab5c2;
          font-size: 14px;
        }

        .relatorio-documento {
          background: #ffffff;
          color: #111827;
          padding: 45px;
          border-radius: 12px;
          margin-top: 30px;
          margin-bottom: 40px;
          box-shadow:
            0 10px 30px
            rgba(0, 0, 0, 0.25);
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
          margin: 0 0 8px 0;
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
          margin: 0 0 8px 0;
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
          margin: 6px 0 0 0;
          color: #111827;
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

        .btn-imprimir:hover {
          background: #b45309;
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
          grid-template-columns: repeat(
            2,
            1fr
          );
          gap: 15px;
        }

        .dado-item {
          background: #f8fafc;
          border: 1px solid #d1d5db;
          border-radius: 6px;
          padding: 14px;
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
          gap: 25px;
        }

        .historico-item {
          display: flex;
          gap: 15px;
          border: 1px solid #d1d5db;
          padding: 20px;
          border-radius: 8px;
          page-break-inside: avoid;
        }

        .historico-numero {
          min-width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #d97706;
          color: #ffffff;
          font-weight: bold;
          flex-shrink: 0;
        }

        .historico-conteudo {
          flex: 1;
          min-width: 0;
        }

        .historico-data {
          color: #111827;
          margin-bottom: 8px;
          font-size: 14px;
          font-weight: 600;
        }

        .historico-informacao {
          color: #374151;
          margin-bottom: 5px;
          font-size: 14px;
        }

        .historico-informacao strong {
          color: #111827;
        }

        .servico-relatorio-titulo {
          margin-top: 15px;
          margin-bottom: 8px;
          color: #92400e;
          font-size: 16px;
        }

        .historico-descricao {
          color: #1f2937;
          line-height: 1.6;
          font-size: 15px;
          white-space: pre-wrap;
          font-weight: 500;
          background: #f8fafc;
          border-left: 3px solid #d97706;
          padding: 12px;
          border-radius: 5px;
        }

        /* ================================================
           FOTOS DOS SERVIÇOS
        ================================================= */

        .fotos-historico-relatorio {
          margin-top: 22px;
        }

        .fotos-historico-titulo {
          font-size: 16px;
          font-weight: bold;
          color: #111827;
          margin-bottom: 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #d1d5db;
        }

        .fotos-historico-grid {
          display: grid;
          grid-template-columns: repeat(
            2,
            minmax(0, 1fr)
          );
          gap: 18px;
        }

        .foto-servico-relatorio {
          border: 1px solid #cbd5e1;
          border-radius: 8px;
          overflow: hidden;
          background: #f8fafc;
          page-break-inside: avoid;
        }

        .foto-servico-relatorio img {
          width: 100%;
          max-height: 430px;
          object-fit: contain;
          display: block;
          background: #ffffff;
        }

        .descricao-foto-relatorio {
          padding: 12px;
          border-top: 1px solid #d1d5db;
          background: #f8fafc;
        }

        .descricao-foto-relatorio strong {
          display: block;
          color: #111827;
          font-size: 13px;
          margin-bottom: 5px;
        }

        .descricao-foto-relatorio p {
          margin: 0;
          color: #374151;
          font-size: 14px;
          line-height: 1.5;
          white-space: pre-wrap;
        }

        .observacao-servico-relatorio {
          margin-top: 18px;
          padding: 14px;
          background: #fffbeb;
          border-left: 4px solid #d97706;
          color: #374151;
        }

        .observacao-servico-relatorio p {
          margin: 6px 0 0;
          white-space: pre-wrap;
          line-height: 1.5;
        }

        .galeria-relatorio {
          display: grid;
          grid-template-columns: repeat(
            auto-fit,
            minmax(250px, 1fr)
          );
          gap: 15px;
        }

        .galeria-item {
          border: 1px solid #d1d5db;
          padding: 5px;
          border-radius: 6px;
          page-break-inside: avoid;
        }

        .galeria-item img {
          width: 100%;
          height: 250px;
          object-fit: cover;
          border-radius: 4px;
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
          color: #374151;
          font-size: 12px;
        }

        .relatorio-rodape strong {
          color: #111827;
        }

        /* ================================================
           RESPONSIVO
        ================================================= */

        @media (max-width: 700px) {

          .relatorio-documento {
            padding: 20px;
          }

          .relatorio-cabecalho,
          .relatorio-nome-maquina,
          .relatorio-rodape {
            flex-direction: column;
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

          .fotos-historico-grid {
            grid-template-columns: 1fr;
          }

        }

        /* ================================================
           IMPRESSÃO / PDF
        ================================================= */

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
          .robert-app > .sidebar,
          nav,
          button {
            display: none !important;
          }

          .robert-app {
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
            padding: 20px !important;
            margin: 0 !important;
            width: 100% !important;
          }

          /* FORÇA TEXTO ESCURO */

          .relatorio-documento,
          .relatorio-documento p,
          .relatorio-documento span,
          .relatorio-documento div,
          .relatorio-documento strong,
          .relatorio-documento h1,
          .relatorio-documento h2,
          .relatorio-documento h3 {
            color: #111111 !important;
          }

          .relatorio-cabecalho h1 {
            color: #9a4d00 !important;
          }

          .relatorio-titulo h2 {
            color: #000000 !important;
          }

          .relatorio-linha {
            background: #b45309 !important;
          }

          .relatorio-nome-maquina {
            background: #eeeeee !important;
            border-left-color: #b45309 !important;
          }

          .relatorio-secao h3 {
            color: #000000 !important;
            border-bottom-color: #777777 !important;
          }

          .dado-item {
            background: #f5f5f5 !important;
            border-color: #999999 !important;
          }

          .dado-item span {
            color: #333333 !important;
          }

          .dado-item strong {
            color: #000000 !important;
          }

          .observacoes-relatorio {
            background: #f8f8f8 !important;
            border-left-color: #b45309 !important;
            color: #000000 !important;
          }

          .historico-item {
            border-color: #888888 !important;
          }

          .historico-numero {
            background: #b45309 !important;
            color: #ffffff !important;
          }

          .historico-data,
          .historico-data strong,
          .historico-informacao,
          .historico-informacao strong,
          .historico-descricao,
          .servico-relatorio-titulo {
            color: #000000 !important;
          }

          .historico-descricao {
            background: #f5f5f5 !important;
          }

          .fotos-historico-titulo {
            color: #000000 !important;
            border-bottom-color: #888888 !important;
          }

          .foto-servico-relatorio {
            border-color: #888888 !important;
            background: #ffffff !important;
          }

          .foto-servico-relatorio img {
            background: #ffffff !important;
          }

          .descricao-foto-relatorio {
            background: #f5f5f5 !important;
            border-top-color: #888888 !important;
          }

          .descricao-foto-relatorio strong,
          .descricao-foto-relatorio p {
            color: #000000 !important;
          }

          .observacao-servico-relatorio {
            background: #f8f8f8 !important;
            border-left-color: #b45309 !important;
          }

          .observacao-servico-relatorio,
          .observacao-servico-relatorio strong,
          .observacao-servico-relatorio p {
            color: #000000 !important;
          }

          .sem-historico {
            background: #eeeeee !important;
            color: #000000 !important;
          }

          .relatorio-rodape,
          .relatorio-rodape p,
          .relatorio-rodape strong {
            color: #222222 !important;
          }

          .status-operando {
            color: #064e3b !important;
            border: 1px solid #064e3b !important;
          }

          .status-manutencao {
            color: #78350f !important;
            border: 1px solid #78350f !important;
          }

          .status-parada {
            color: #7f1d1d !important;
            border: 1px solid #7f1d1d !important;
          }

          img {
            max-width: 100% !important;
            page-break-inside: avoid !important;
          }

          .relatorio-secao {
            page-break-inside: avoid;
          }

          .historico-item {
            page-break-inside: avoid;
          }

          .foto-servico-relatorio {
            page-break-inside: avoid;
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
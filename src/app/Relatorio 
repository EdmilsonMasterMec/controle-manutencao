"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase } from "@/lib/supabase";

type FotoServico = {
  id?: string | number;
  imagem?: string;
  url?: string;
  descricao?: string;
};

type HistoricoManutencao = {
  id?: string | number;
  data?: string;
  tipo?: string;
  horimetro?: string;
  defeito?: string;
  descricao?: string;
  pecas?: string;
  horasGastas?: string;
  mecanico?: string;
  status?: string;
  fotos?: FotoServico[];
};

type Equipamento = {
  id: number;
  nome?: string;
  modelo?: string;
  fabricante?: string;
  ano?: string;
  horimetro?: string;
  responsavel?: string;
  localizacao?: string;
  status?: string;
  proxima_manutencao?: string;
  historico?: HistoricoManutencao[];
};

export default function RelatoriosPage() {
  const [equipamentos, setEquipamentos] = useState<Equipamento[]>([]);
  const [equipamentoSelecionado, setEquipamentoSelecionado] =
    useState<Equipamento | null>(null);

  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    carregarEquipamentos();
  }, []);

  async function carregarEquipamentos() {
    setCarregando(true);

    const { data, error } = await supabase
      .from("equipamentos")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      console.error("Erro ao carregar equipamentos:", error);
      alert("Erro ao carregar as máquinas.");
      setCarregando(false);
      return;
    }

    setEquipamentos(data || []);
    setCarregando(false);
  }

  function selecionarEquipamento(id: string) {
    const equipamento = equipamentos.find(
      (item) => item.id === Number(id)
    );

    if (equipamento) {
      setEquipamentoSelecionado(equipamento);
    }
  }

  function imprimirRelatorio() {
    if (!equipamentoSelecionado) {
      alert("Selecione uma máquina primeiro.");
      return;
    }

    window.print();
  }

  const historico = Array.isArray(equipamentoSelecionado?.historico)
    ? equipamentoSelecionado.historico
    : [];

  return (
    <>
      <div className="pagina-relatorio">

        {/* CABEÇALHO DA PÁGINA */}
        <div className="cabecalho no-print">
          <div>
            <h1>Relatório de Manutenção</h1>
            <p>
              Consulte e imprima o histórico completo da máquina.
            </p>
          </div>

          <div className="botoes">
            <Link href="/" className="botao-secundario">
              ← Voltar
            </Link>

            <button
              type="button"
              className="botao-imprimir"
              onClick={imprimirRelatorio}
              disabled={!equipamentoSelecionado}
            >
              🖨️ Imprimir
            </button>
          </div>
        </div>

        {/* SELEÇÃO DA MÁQUINA */}
        <div className="selecao no-print">
          <label>Selecione a máquina</label>

          <select
            defaultValue=""
            onChange={(e) => selecionarEquipamento(e.target.value)}
          >
            <option value="">Selecione uma máquina...</option>

            {equipamentos.map((equipamento) => (
              <option
                key={equipamento.id}
                value={equipamento.id}
              >
                {equipamento.nome || "Máquina"}{" "}
                {equipamento.modelo
                  ? `- ${equipamento.modelo}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        {/* ÁREA DO RELATÓRIO */}
        {equipamentoSelecionado && (
          <div className="relatorio">

            {/* CABEÇALHO PARA IMPRESSÃO */}
            <div className="cabecalho-impressao">
              <h1>MASTER MEC</h1>
              <h2>RELATÓRIO DE MANUTENÇÃO</h2>

              <p>
                Documento de acompanhamento e histórico de manutenção
                do equipamento.
              </p>
            </div>

            {/* DADOS DA MÁQUINA */}
            <section className="bloco">
              <h2>Dados do Equipamento</h2>

              <div className="dados-grid">

                <div>
                  <strong>Máquina</strong>
                  <span>
                    {equipamentoSelecionado.nome || "-"}
                  </span>
                </div>

                <div>
                  <strong>Fabricante</strong>
                  <span>
                    {equipamentoSelecionado.fabricante || "-"}
                  </span>
                </div>

                <div>
                  <strong>Modelo</strong>
                  <span>
                    {equipamentoSelecionado.modelo || "-"}
                  </span>
                </div>

                <div>
                  <strong>Ano</strong>
                  <span>
                    {equipamentoSelecionado.ano || "-"}
                  </span>
                </div>

                <div>
                  <strong>Horímetro atual</strong>
                  <span>
                    {equipamentoSelecionado.horimetro || "-"}
                  </span>
                </div>

                <div>
                  <strong>Status</strong>
                  <span>
                    {equipamentoSelecionado.status || "-"}
                  </span>
                </div>

                <div>
                  <strong>Responsável</strong>
                  <span>
                    {equipamentoSelecionado.responsavel || "-"}
                  </span>
                </div>

                <div>
                  <strong>Localização</strong>
                  <span>
                    {equipamentoSelecionado.localizacao || "-"}
                  </span>
                </div>

                <div>
                  <strong>Próxima manutenção</strong>
                  <span>
                    {equipamentoSelecionado.proxima_manutencao || "-"}
                  </span>
                </div>

              </div>
            </section>

            {/* HISTÓRICO */}
            <section className="bloco">
              <div className="titulo-historico">
                <h2>Histórico de Manutenção</h2>

                <span>
                  {historico.length} registro
                  {historico.length !== 1 ? "s" : ""}
                </span>
              </div>

              {historico.length === 0 ? (
                <div className="sem-registros">
                  Nenhum registro de manutenção foi encontrado
                  para esta máquina.
                </div>
              ) : (
                historico.map((manutencao, index) => (
                  <div
                    className="manutencao"
                    key={
                      manutencao.id ??
                      `${equipamentoSelecionado.id}-${index}`
                    }
                  >

                    <div className="manutencao-cabecalho">
                      <div>
                        <h3>
                          Manutenção #{index + 1}
                        </h3>

                        <p>
                          {manutencao.data
                            ? `Data: ${manutencao.data}`
                            : ""}
                        </p>
                      </div>

                      <div className="status">
                        {manutencao.status || "-"}
                      </div>
                    </div>

                    <div className="dados-manutencao">

                      <div>
                        <strong>Tipo</strong>
                        <span>
                          {manutencao.tipo || "-"}
                        </span>
                      </div>

                      <div>
                        <strong>Horímetro</strong>
                        <span>
                          {manutencao.horimetro || "-"}
                        </span>
                      </div>

                      <div>
                        <strong>Mecânico</strong>
                        <span>
                          {manutencao.mecanico || "-"}
                        </span>
                      </div>

                      <div>
                        <strong>Horas trabalhadas</strong>
                        <span>
                          {manutencao.horasGastas || "-"}
                        </span>
                      </div>

                    </div>

                    {manutencao.defeito && (
                      <div className="texto">
                        <strong>Defeito relatado</strong>
                        <p>{manutencao.defeito}</p>
                      </div>
                    )}

                    {manutencao.descricao && (
                      <div className="texto">
                        <strong>Descrição do serviço</strong>
                        <p>{manutencao.descricao}</p>
                      </div>
                    )}

                    {manutencao.pecas && (
                      <div className="texto">
                        <strong>Peças utilizadas</strong>
                        <p>{manutencao.pecas}</p>
                      </div>
                    )}

                    {/* FOTOS */}
                    {Array.isArray(manutencao.fotos) &&
                      manutencao.fotos.length > 0 && (
                        <div className="fotos">

                          <h4>Fotos do serviço</h4>

                          <div className="grade-fotos">

                            {manutencao.fotos.map(
                              (foto, fotoIndex) => {

                                const endereco =
                                  foto.imagem || foto.url;

                                if (!endereco) {
                                  return null;
                                }

                                return (
                                  <div
                                    className="foto"
                                    key={
                                      foto.id ??
                                      `${index}-${fotoIndex}`
                                    }
                                  >

                                    <img
                                      src={endereco}
                                      alt={
                                        foto.descricao ||
                                        `Foto ${fotoIndex + 1}`
                                      }
                                    />

                                    {foto.descricao && (
                                      <p>
                                        {foto.descricao}
                                      </p>
                                    )}

                                  </div>
                                );
                              }
                            )}

                          </div>
                        </div>
                      )}

                  </div>
                ))
              )}
            </section>

            {/* ASSINATURAS */}
            <section className="assinaturas">
              <div>
                <div className="linha"></div>
                <span>Responsável pela manutenção</span>
              </div>

              <div>
                <div className="linha"></div>
                <span>Mecânico responsável</span>
              </div>
            </section>

            <div className="rodape">
              MasterMec - Gestão de Manutenção
            </div>

          </div>
        )}

        {/* QUANDO NÃO SELECIONOU */}
        {!equipamentoSelecionado && !carregando && (
          <div className="mensagem no-print">
            <div>📋</div>
            <h2>Selecione uma máquina</h2>
            <p>
              Escolha um equipamento acima para visualizar
              o histórico de manutenção.
            </p>
          </div>
        )}

        {carregando && (
          <div className="mensagem no-print">
            Carregando equipamentos...
          </div>
        )}

      </div>

      <style jsx>{`

        .pagina-relatorio {
          min-height: 100vh;
          padding: 30px;
          background: #f2f3f5;
          color: #222;
        }

        .cabecalho {
          max-width: 1200px;
          margin: 0 auto 25px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 20px;
        }

        .cabecalho h1 {
          margin: 0;
          font-size: 30px;
        }

        .cabecalho p {
          margin: 6px 0 0;
          color: #666;
        }

        .botoes {
          display: flex;
          gap: 10px;
        }

        .botao-secundario,
        .botao-imprimir {
          border: none;
          border-radius: 8px;
          padding: 12px 18px;
          font-size: 15px;
          cursor: pointer;
          text-decoration: none;
        }

        .botao-secundario {
          background: #ddd;
          color: #222;
        }

        .botao-imprimir {
          background: #1976d2;
          color: white;
        }

        .botao-imprimir:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .selecao {
          max-width: 1200px;
          margin: 0 auto 25px;
          background: white;
          padding: 20px;
          border-radius: 12px;
          box-shadow: 0 2px 10px rgba(0,0,0,.08);
        }

        .selecao label {
          display: block;
          font-weight: bold;
          margin-bottom: 8px;
        }

        .selecao select {
          width: 100%;
          padding: 13px;
          border: 1px solid #ccc;
          border-radius: 8px;
          font-size: 16px;
          background: white;
        }

        .relatorio {
          max-width: 1200px;
          margin: 0 auto;
          background: white;
          padding: 35px;
          box-shadow: 0 2px 12px rgba(0,0,0,.1);
        }

        .cabecalho-impressao {
          text-align: center;
          border-bottom: 2px solid #222;
          padding-bottom: 20px;
          margin-bottom: 25px;
        }

        .cabecalho-impressao h1 {
          margin: 0;
          font-size: 28px;
        }

        .cabecalho-impressao h2 {
          margin: 8px 0;
          font-size: 20px;
        }

        .cabecalho-impressao p {
          margin: 0;
          color: #666;
        }

        .bloco {
          margin-bottom: 30px;
        }

        .bloco h2 {
          border-bottom: 2px solid #ddd;
          padding-bottom: 8px;
          margin-bottom: 18px;
        }

        .dados-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 15px;
        }

        .dados-grid > div,
        .dados-manutencao > div {
          background: #f7f7f7;
          padding: 12px;
          border-radius: 7px;
        }

        .dados-grid strong,
        .dados-manutencao strong {
          display: block;
          font-size: 12px;
          color: #666;
          margin-bottom: 5px;
        }

        .dados-grid span,
        .dados-manutencao span {
          font-size: 15px;
        }

        .titulo-historico {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .titulo-historico span {
          background: #eee;
          padding: 6px 12px;
          border-radius: 20px;
          font-size: 13px;
        }

        .manutencao {
          border: 1px solid #ddd;
          border-radius: 10px;
          padding: 20px;
          margin-bottom: 20px;
          page-break-inside: avoid;
        }

        .manutencao-cabecalho {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #ddd;
          padding-bottom: 12px;
          margin-bottom: 15px;
        }

        .manutencao-cabecalho h3 {
          margin: 0;
        }

        .manutencao-cabecalho p {
          margin: 5px 0 0;
          color: #666;
        }

        .status {
          background: #eee;
          padding: 7px 12px;
          border-radius: 20px;
          font-size: 13px;
        }

        .dados-manutencao {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 10px;
          margin-bottom: 15px;
        }

        .texto {
          margin-top: 15px;
        }

        .texto strong {
          display: block;
          margin-bottom: 5px;
        }

        .texto p {
          margin: 0;
          white-space: pre-wrap;
        }

        .fotos {
          margin-top: 20px;
        }

        .fotos h4 {
          margin-bottom: 12px;
        }

        .grade-fotos {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 15px;
        }

        .foto {
          border: 1px solid #ddd;
          border-radius: 8px;
          overflow: hidden;
          page-break-inside: avoid;
        }

        .foto img {
          display: block;
          width: 100%;
          max-height: 400px;
          object-fit: contain;
          background: #eee;
        }

        .foto p {
          margin: 0;
          padding: 10px;
          font-size: 13px;
        }

        .sem-registros {
          padding: 30px;
          text-align: center;
          background: #f5f5f5;
          border-radius: 8px;
          color: #666;
        }

        .assinaturas {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 80px;
          margin-top: 60px;
          page-break-inside: avoid;
        }

        .assinaturas > div {
          text-align: center;
        }

        .linha {
          border-top: 1px solid #222;
          margin-bottom: 8px;
        }

        .assinaturas span {
          font-size: 13px;
        }

        .rodape {
          text-align: center;
          margin-top: 40px;
          padding-top: 15px;
          border-top: 1px solid #ddd;
          color: #777;
          font-size: 12px;
        }

        .mensagem {
          max-width: 600px;
          margin: 60px auto;
          text-align: center;
          background: white;
          padding: 50px 30px;
          border-radius: 15px;
          box-shadow: 0 2px 10px rgba(0,0,0,.08);
        }

        .mensagem div {
          font-size: 45px;
        }

        .mensagem h2 {
          margin: 10px 0;
        }

        .mensagem p {
          color: #666;
        }

        @media (max-width: 800px) {

          .pagina-relatorio {
            padding: 15px;
          }

          .cabecalho {
            flex-direction: column;
            align-items: stretch;
          }

          .botoes {
            width: 100%;
          }

          .botao-secundario,
          .botao-imprimir {
            flex: 1;
            text-align: center;
          }

          .relatorio {
            padding: 20px;
          }

          .dados-grid {
            grid-template-columns: 1fr 1fr;
          }

          .dados-manutencao {
            grid-template-columns: 1fr 1fr;
          }

          .grade-fotos {
            grid-template-columns: 1fr;
          }

          .assinaturas {
            gap: 30px;
          }
        }

        @media (max-width: 500px) {

          .dados-grid,
          .dados-manutencao {
            grid-template-columns: 1fr;
          }

          .assinaturas {
            grid-template-columns: 1fr;
          }

        }

        @media print {

          @page {
            size: A4;
            margin: 12mm;
          }

          .pagina-relatorio {
            background: white !important;
            padding: 0 !important;
          }

          .no-print {
            display: none !important;
          }

          .relatorio {
            max-width: none;
            box-shadow: none;
            padding: 0;
          }

          .cabecalho-impressao {
            margin-top: 0;
          }

          .manutencao {
            break-inside: avoid;
          }

          .foto {
            break-inside: avoid;
          }

          .foto img {
            max-height: 350px;
          }

        }

      `}</style>
    </>
  );
}
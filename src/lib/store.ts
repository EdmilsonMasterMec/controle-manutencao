export type FotoServico = {
  id: number;
  imagem: string;
  descricao: string;
};

export type HistoricoManutencao = {
  id: number;
  data: string;
  descricao: string;

  // Compatibilidade com registros antigos
  foto?: string;

  // Novas fotos do serviço
  fotos?: FotoServico[];

  // Observação do serviço/foto
  observacao?: string;

  // Dados adicionais da manutenção
  tipo?: string;
  mecanico?: string;
  horimetro?: string;
  prioridade?: string;
  status?: string;
};

export type Maquina = {
  id: number;

  // Dados principais
  nome: string;
  fabricante: string;
  modelo: string;
  ano: string;
  numeroSerie: string;
  horimetro: string;
  status: string;
  tipo: string;

  // Manutenção
  proximaManutencao: string;

  // Informações adicionais
  observacoes: string;

  // Foto principal da máquina
  foto: string;

  // Histórico de serviços
  historico: HistoricoManutencao[];
};

const CHAVE_MAQUINAS = "mastermec_maquinas";

/**
 * Salva as máquinas no navegador
 */
export function salvarMaquinas(maquinas: Maquina[]) {
  if (typeof window !== "undefined") {
    localStorage.setItem(
      CHAVE_MAQUINAS,
      JSON.stringify(maquinas)
    );
  }
}

/**
 * Carrega as máquinas do navegador
 *
 * Também faz uma normalização dos dados antigos
 * para evitar que registros já existentes quebrem
 * depois das novas funcionalidades.
 */
export function carregarMaquinas(): Maquina[] {
  if (typeof window === "undefined") {
    return [];
  }

  const dados = localStorage.getItem(CHAVE_MAQUINAS);

  if (!dados) {
    return [];
  }

  try {
    const maquinas = JSON.parse(dados);

    if (!Array.isArray(maquinas)) {
      return [];
    }

    return maquinas.map((maquina: Partial<Maquina>) => ({
      id: maquina.id || Date.now(),

      nome: maquina.nome || "",
      fabricante: maquina.fabricante || "",
      modelo: maquina.modelo || "",
      ano: maquina.ano || "",
      numeroSerie: maquina.numeroSerie || "",
      horimetro: maquina.horimetro || "",
      status: maquina.status || "Operando",
      tipo: maquina.tipo || "",

      proximaManutencao:
        maquina.proximaManutencao || "",

      observacoes:
        maquina.observacoes || "",

      foto:
        maquina.foto || "",

      historico: Array.isArray(maquina.historico)
        ? maquina.historico.map(
            (
              item: Partial<HistoricoManutencao>
            ) => ({
              id: item.id || Date.now(),

              data:
                item.data || "",

              descricao:
                item.descricao || "",

              // Mantém fotos antigas
              foto:
                item.foto || "",

              // Novas fotos
              fotos: Array.isArray(item.fotos)
                ? item.fotos.map(
                    (
                      foto: Partial<FotoServico>
                    ) => ({
                      id:
                        foto.id ||
                        Date.now(),

                      imagem:
                        foto.imagem || "",

                      descricao:
                        foto.descricao || "",
                    })
                  )
                : [],

              observacao:
                item.observacao || "",

              tipo:
                item.tipo || "",

              mecanico:
                item.mecanico || "",

              horimetro:
                item.horimetro || "",

              prioridade:
                item.prioridade || "",

              status:
                item.status || "",
            })
          )
        : [],
    }));
  } catch (erro) {
    console.error(
      "Erro ao carregar máquinas:",
      erro
    );

    return [];
  }
}

/**
 * Limpa todas as máquinas salvas
 */
export function limparMaquinas() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(
      CHAVE_MAQUINAS
    );
  }
}
/**
 * Espelha a tabela associativa `ParticipacaoCampeonato` do card [Back-end]
 * Campeonato: liga um Aluno a um Campeonato, com as estatísticas dele
 * naquele campeonato (posição, jogos disputados, aproveitamento).
 *
 * Atenção: isso substitui o modelo anterior, que ligava Turma/time externo
 * ao campeonato — o card real define participação individual por aluno,
 * não por turma.
 *
 * @typedef {Object} ParticipacaoCampeonato
 * @property {string} id
 * @property {string} campeonatoId
 * @property {string} alunoId
 * @property {string} nomeAluno
 * @property {number|null} posicao - opcional no cadastro, preenchida depois
 * @property {number} jogosDisputados
 * @property {number} aproveitamento - percentual (0 a 100)
 */

/**
 * @param {any} apiResponse
 * @returns {ParticipacaoCampeonato}
 */
export function criarParticipacaoFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    campeonatoId: apiResponse.campeonatoId,
    alunoId: apiResponse.alunoId,
    nomeAluno: apiResponse.nomeAluno ?? apiResponse.aluno ?? "—",
    posicao: apiResponse.posicao ?? null,
    jogosDisputados: apiResponse.jogosDisputados ?? 0,
    aproveitamento: apiResponse.aproveitamento ?? 0,
  };
}

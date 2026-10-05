/**
 * Formato de presença usado no front-end.
 * Espelha a entidade `Presenca` do back-end (ainda não implementada — ver
 * card [Back-end] Presença (Chamada) — Registro e Consulta).
 *
 * Sem `DataRegistro`: o card atual não expõe esse campo pro front, só
 * alunoId/nome/presente — mais `ehInadimplente`, que vem pronto do back
 * (calculado a partir do Contrato/Financeiro do aluno, sem expor o valor).
 *
 * @typedef {Object} RegistroPresenca
 * @property {string} alunoId
 * @property {string} nome
 * @property {boolean} presente
 * @property {boolean} ehInadimplente
 */

/**
 * Monta o corpo esperado pelo endpoint POST /api/Turmas/{turmaId}/chamada.
 *
 * A turma já vai na URL (não existe mais `turmaId` no corpo) — só a data e
 * a lista de presenças.
 *
 * @param {string} dataIso - formato aaaa-mm-dd
 * @param {Array<{ alunoId: string, presente: boolean }>} presencas
 */
export function montarRegistrarChamadaPayload(dataIso, presencas) {
  return {
    data: dataIso,
    presencas: presencas.map((p) => ({ alunoId: p.alunoId, presente: p.presente })),
  };
}

/**
 * Converte a resposta de GET /api/Turmas/{turmaId}/chamada?data=... numa
 * lista de alunos da turma já com `presente` (chamada já registrada nesse
 * dia, ou tudo desmarcado se ainda não houver) e `ehInadimplente` resolvidos
 * pelo back-end.
 *
 * @param {any} apiResponse
 */
export function criarListaChamadaFromApi(apiResponse) {
  const lista = apiResponse?.alunos ?? apiResponse ?? [];
  return lista.map((item) => ({
    alunoId: item.alunoId ?? item.id,
    nome: item.nome ?? "",
    presente: !!item.presente,
    ehInadimplente: !!(item.ehInadimplente ?? item.EhInadimplente),
  }));
}

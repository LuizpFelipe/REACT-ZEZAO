export function criarPagamentoFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    alunoId: apiResponse.alunoId,
    aluno: apiResponse.aluno ?? apiResponse.nomeAluno,
    vencimento: apiResponse.vencimento,
    valor: apiResponse.valor,
    status: apiResponse.status,
  };
}

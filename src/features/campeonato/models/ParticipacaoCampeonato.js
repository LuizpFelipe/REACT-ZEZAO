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

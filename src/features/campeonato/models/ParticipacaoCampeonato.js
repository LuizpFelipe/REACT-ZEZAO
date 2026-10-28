export function criarParticipacaoFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    campeonatoId: apiResponse.campeonatoId,
    alunoId: apiResponse.alunoId,
    nomeAluno: apiResponse.alunoNome ?? apiResponse.nomeAluno ?? apiResponse.aluno ?? "—",
    posicaoDeJogo: apiResponse.posicaoDeJogo ?? null,
    equipeId: apiResponse.equipeId ?? null,
    posicao: apiResponse.posicao ?? null,
    jogosDisputados: apiResponse.jogosDisputados ?? 0,
    aproveitamento: apiResponse.aproveitamento ?? 0,
  };
}

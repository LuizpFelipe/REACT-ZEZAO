export function criarReposicaoFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    alunoId: apiResponse.alunoId,
    turmaOrigemId: apiResponse.turmaOrigemId,
    turmaDestinoId: apiResponse.turmaDestinoId,
    dataOriginal: apiResponse.dataOriginal,
    dataReposicao: apiResponse.dataReposicao,
  };
}

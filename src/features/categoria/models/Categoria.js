export function criarCategoriaFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    nome: apiResponse.nome,
    idadeMin: apiResponse.idadeMin,
    idadeMax: apiResponse.idadeMax,
  };
}

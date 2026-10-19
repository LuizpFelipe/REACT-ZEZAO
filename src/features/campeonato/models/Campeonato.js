export function criarCampeonatoFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    nome: apiResponse.nome,
    categoriaId: apiResponse.categoriaId,
    data: apiResponse.data,
  };
}

export function estadoCampeonato(dataIso) {
  if (!dataIso) return "Agendado";
  return new Date(dataIso) < new Date() ? "Realizado" : "Agendado";
}

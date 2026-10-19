export function criarTurmaFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    nome: apiResponse.nome,
    categoriaId: apiResponse.categoriaId,
    professorId: apiResponse.professorId,
    diasSemana: apiResponse.diasSemana,
    horario: apiResponse.horario,
  };
}

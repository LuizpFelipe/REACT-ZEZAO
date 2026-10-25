export const DIAS_DA_SEMANA = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

function normalizarTexto(texto) {
  return (texto || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function converterDiasParaLista(textoDosDias) {
  const textoNormalizado = normalizarTexto(textoDosDias);
  return DIAS_DA_SEMANA.filter((dia) => textoNormalizado.includes(normalizarTexto(dia).slice(0, 3)));
}

export function formatarListaDeDias(listaDeDias) {
  return DIAS_DA_SEMANA.filter((dia) => listaDeDias.includes(dia)).join(",");
}

export function formatarDiasParaExibicao(textoDosDias) {
  const listaDeDias = converterDiasParaLista(textoDosDias);
  return listaDeDias.length > 0 ? listaDeDias.join(", ") : textoDosDias || "";
}

export function criarTurmaFromApi(apiResponse) {
  return {
    id: apiResponse.id,
    nome: apiResponse.nome,
    categoriaId: apiResponse.categoriaId,
    professorId: apiResponse.professorId,
    diasSemana: apiResponse.diasSemana,
    diasLegiveis: formatarDiasParaExibicao(apiResponse.diasSemana),
    horario: apiResponse.horario,
    temAulaNaData: apiResponse.temAulaNaData ?? apiResponse.temAula ?? null,
  };
}

/**
 * Converte uma data digitada como "dd/mm/aaaa" para o formato ISO
 * ("aaaa-mm-dd") que o back-end espera (campo DateOnly do C#).
 *
 * Mantém o campo do formulário amigável em português, sem depender do
 * seletor de data nativo do navegador (que aparece em inglês).
 *
 * @param {string} dataBr
 * @returns {string|null} a data em formato ISO, ou null se o texto não
 *   estiver no formato esperado
 */
export function converterDataBrParaIso(dataBr) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((dataBr || "").trim());
  if (!match) return null;

  const [, dia, mes, ano] = match;
  return `${ano}-${mes}-${dia}`;
}

/**
 * Converte uma data ISO ("aaaa-mm-dd") vinda da API para exibição em
 * português ("dd/mm/aaaa").
 *
 * @param {string} dataIso
 * @returns {string}
 */
export function converterDataIsoParaBr(dataIso) {
  if (!dataIso) return "";
  const [ano, mes, dia] = dataIso.split("T")[0].split("-");
  if (!ano || !mes || !dia) return dataIso;
  return `${dia}/${mes}/${ano}`;
}

export function converterDataBrParaIso(dataBr) {
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec((dataBr || "").trim());
  if (!match) return null;

  const [, dia, mes, ano] = match;
  return `${ano}-${mes}-${dia}`;
}

export function converterDataIsoParaBr(dataIso) {
  if (!dataIso) return "";
  const [ano, mes, dia] = dataIso.split("T")[0].split("-");
  if (!ano || !mes || !dia) return dataIso;
  return `${dia}/${mes}/${ano}`;
}

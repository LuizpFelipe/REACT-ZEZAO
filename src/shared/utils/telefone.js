export function removerMascaraTelefone(valor) {
  return (valor || "").replace(/\D/g, "").slice(0, 11);
}

export function formatarTelefone(valor) {
  const digitos = removerMascaraTelefone(valor);
  if (digitos.length === 0) return "";

  const ddd = digitos.slice(0, 2);
  const resto = digitos.slice(2);

  if (digitos.length <= 2) return `(${ddd}`;
  if (resto.length <= 4) return `(${ddd}) ${resto}`;

  const quantidadeNoPrefixo = digitos.length === 11 ? 5 : 4;
  return `(${ddd}) ${resto.slice(0, quantidadeNoPrefixo)}-${resto.slice(quantidadeNoPrefixo)}`;
}

/**
 * O back só envia a cobrança por WhatsApp se o número tiver DDD + 8 ou 9 dígitos.
 * Retorna a mensagem de erro, ou null quando o telefone é válido.
 */
export function validarTelefone(valor) {
  const digitos = removerMascaraTelefone(valor);

  if (digitos.length === 0) return "Informe o telefone.";
  if (digitos.length < 10) return "Telefone incompleto. Informe o DDD e o número.";
  if (digitos.startsWith("0") || digitos.slice(0, 2) < "11") return "DDD inválido.";
  if (digitos.length === 11 && digitos[2] !== "9") return "Celular com 11 dígitos precisa começar com 9 depois do DDD.";

  return null;
}

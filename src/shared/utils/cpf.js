export function removerMascaraCpf(valor) {
  return (valor || "").replace(/\D/g, "").slice(0, 11);
}

export function formatarCpf(valor) {
  const digitos = removerMascaraCpf(valor);
  const parteUm = digitos.slice(0, 3);
  const parteDois = digitos.slice(3, 6);
  const parteTres = digitos.slice(6, 9);
  const digitosVerificadores = digitos.slice(9, 11);

  let resultado = parteUm;
  if (parteDois) resultado += `.${parteDois}`;
  if (parteTres) resultado += `.${parteTres}`;
  if (digitosVerificadores) resultado += `-${digitosVerificadores}`;
  return resultado;
}

function calcularDigitoVerificador(digitos, quantidadeDeDigitos) {
  let soma = 0;
  for (let posicao = 0; posicao < quantidadeDeDigitos; posicao++) {
    soma += Number(digitos[posicao]) * (quantidadeDeDigitos + 1 - posicao);
  }
  const resto = (soma * 10) % 11;
  return resto === 10 ? 0 : resto;
}

export function cpfEhValido(valor) {
  const digitos = removerMascaraCpf(valor);
  if (digitos.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(digitos)) return false;

  const primeiroDigito = calcularDigitoVerificador(digitos, 9);
  if (primeiroDigito !== Number(digitos[9])) return false;

  const segundoDigito = calcularDigitoVerificador(digitos, 10);
  return segundoDigito === Number(digitos[10]);
}

export function validarCpfDoResponsavel(valor) {
  if (!removerMascaraCpf(valor)) return "Informe o CPF do responsável.";
  if (!cpfEhValido(valor)) return "CPF do responsável inválido.";
  return "";
}

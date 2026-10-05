import "./StatusBadge.css";

// Mapeia o status (vindo do back-end) para o estilo visual do badge.
// Adicionar novos status aqui conforme o back-end for definindo mais (ex: "Cancelado").
const ESTILOS = {
  Ativo: "ok",
  Pago: "ok",
  Renovado: "ok",
  Inadimplente: "bad",
  Atrasado: "bad",
  Cancelado: "bad",
  Pendente: "wait",
  Encerrado: "wait",
};

export default function StatusBadge({ status }) {
  const estilo = ESTILOS[status] || "wait";
  return <span className={`status-badge status-badge--${estilo}`}>{status}</span>;
}

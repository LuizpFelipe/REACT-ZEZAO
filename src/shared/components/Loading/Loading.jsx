import "./Loading.css";

export default function Loading({ label = "Carregando..." }) {
  return (
    <div className="loading-wrap">
      <div className="loading-spinner" />
      <span>{label}</span>
    </div>
  );
}

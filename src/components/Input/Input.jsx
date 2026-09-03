/**
 * Campo de texto padrão, já com label acoplado.
 * Repassa qualquer prop extra (placeholder, type, value, onChange, disabled...) pro <input>.
 */
export default function Input({ label, id, ...inputProps }) {
  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} {...inputProps} />
    </div>
  );
}

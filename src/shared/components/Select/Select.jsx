/**
 * Select padrão, já com label acoplado.
 * options: [{ value, label }]
 */
export default function Select({ label, id, options = [], ...selectProps }) {
  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <select id={id} {...selectProps}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

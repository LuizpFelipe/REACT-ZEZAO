export default function Input({ label, id, ...inputProps }) {
  return (
    <div>
      {label && <label htmlFor={id}>{label}</label>}
      <input id={id} {...inputProps} />
    </div>
  );
}

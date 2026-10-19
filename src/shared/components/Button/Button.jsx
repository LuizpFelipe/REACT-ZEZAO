export default function Button({
  children,
  variant = "primary",
  size = "md",
  type = "button",
  disabled = false,
  onClick,
  style,
}) {
  const className = [
    "btn",
    variant === "outline" ? "btn-outline" : "btn-primary",
    size === "sm" ? "btn-sm" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <button type={type} className={className} disabled={disabled} onClick={onClick} style={style}>
      {children}
    </button>
  );
}

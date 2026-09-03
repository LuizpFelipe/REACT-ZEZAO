export default function LogoBall({
  size = 34,
  ringColor = "#8FB6C9",
  fillColor = "#fff",
  accentColor = "#C97B5A",
  variant = "ball",
}) {
  if (variant === "play") {
    return (
      <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="19" fill={fillColor} />
        <circle cx="20" cy="20" r="18.3" stroke={ringColor} strokeWidth="1.2" />
        <path d="M16 13.5v13l11-6.5-11-6.5z" fill={accentColor} />
      </svg>
    );
  }

  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none">
      <circle cx="20" cy="20" r="17" stroke={ringColor} strokeWidth="1.4" fill={fillColor} />
      <path d="M20 9l4.7 3.4-1.8 5.6h-5.8l-1.8-5.6L20 9z" fill={accentColor} opacity="0.85" />
      <path d="M20 31l-4.7-3.4 1.8-5.6h5.8l1.8 5.6L20 31z" fill={ringColor} opacity="0.55" />
    </svg>
  );
}

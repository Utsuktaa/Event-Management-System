export default function Logo({ size = "md" }) {
  const sizes = {
    sm: "text-lg",
    md: "text-2xl",
    lg: "text-3xl",
  };
  return (
    <span
      className={`font-extrabold ${sizes[size]}`}
      style={{ color: "#1E3A8A" }}
    >
      Event<span style={{ color: "#1E3A8A" }}>Sync</span>
    </span>
  );
}

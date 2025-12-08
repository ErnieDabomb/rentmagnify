export default function Button({ as, variant = "primary", className = "", children, ...props }) {
  const Comp = as || "button";
  const base = "inline-flex items-center justify-center rounded-xl px-4 py-2 text-sm font-semibold transition";
  const styles = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow",
    ghost: "border border-slate-200 text-slate-800 hover:bg-white/60",
  };
  return (
    <Comp className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </Comp>
  );
}

export function LoadingDots() {
  return (
    <div className="flex items-center gap-1 text-slate-500">
      <span className="animate-bounce">•</span>
      <span className="animate-bounce" style={{ animationDelay: "0.1s" }}>
        •
      </span>
      <span className="animate-bounce" style={{ animationDelay: "0.2s" }}>
        •
      </span>
    </div>
  );
}

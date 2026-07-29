import { formatPKR } from "../utils/pricing";

export default function OptionCard({ label, price, selected, onClick, children, subtitle }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      className={`group relative flex flex-col items-center justify-between gap-2 p-4 w-36 sm:w-40 shrink-0 border transition-colors
        ${selected ? "border-ink bg-white" : "border-line bg-white hover:border-ink-soft"}
      `}
    >
      <div className="w-20 h-20 flex items-center justify-center">{children}</div>
      <div className="text-center">
        <p className="tracked text-xs text-ink leading-tight">{label}</p>
        {subtitle && <p className="text-[11px] text-ink-soft mt-0.5">{subtitle}</p>}
        <p className="text-[11px] text-ink-soft mt-1">
          {price ? `+ ${formatPKR(price)}` : "Included"}
        </p>
      </div>
      {selected && (
        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-ink text-white text-[10px] flex items-center justify-center">
          &#10003;
        </span>
      )}
    </button>
  );
}

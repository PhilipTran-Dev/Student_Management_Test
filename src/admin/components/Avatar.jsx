const BG_COLORS = [
    "bg-slate-100 text-slate-700",
    "bg-indigo-100 text-indigo-700",
    "bg-purple-100 text-purple-700",
    "bg-emerald-100 text-emerald-700",
    "bg-rose-100 text-rose-700",
    "bg-amber-100 text-amber-700",
    "bg-cyan-100 text-cyan-700",
    "bg-pink-100 text-pink-700",
    "bg-teal-100 text-teal-700",
    "bg-orange-100 text-orange-700",
    "bg-sky-100 text-sky-700",
    "bg-lime-100 text-lime-700",
    "bg-violet-100 text-violet-700",
    "bg-fuchsia-100 text-fuchsia-700",
];

/** Deterministic hash from a string -> index into BG_COLORS */
function hashColor(name) {
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
        hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return BG_COLORS[Math.abs(hash) % BG_COLORS.length];
}

/** Extract the first letter of the last (first) name */
function getInitial(name) {
    if (!name) return "?";
    const lastWord = name.split(" ").pop();
    return lastWord ? lastWord[0].toUpperCase() : "?";
}

/**
 * Avatar component.
 *
 * Renders an <img> when `src` is a valid URL, otherwise falls back to a
 * deterministic initial‑letter circle with a consistent pastel background.
 */
export default function Avatar({ name, src, className = "", size = "w-9 h-9" }) {
    if (src) {
        return (
            <img
                src={src}
                alt={name || "Avatar"}
                className={`${size} rounded-xl object-cover ${className}`}
            />
        );
    }

    const initial = getInitial(name);
    const colorClass = name ? hashColor(name) : "bg-zinc-100 text-zinc-500";

    return (
        <div
            className={`${size} rounded-xl flex items-center justify-center text-sm font-semibold ${colorClass} ${className}`}
        >
            {initial}
        </div>
    );
}
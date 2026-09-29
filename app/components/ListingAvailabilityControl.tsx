"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle2, XCircle } from "lucide-react";

type Availability = "active" | "sold" | "rented";

const OPTIONS: {
  value: Availability;
  label: string;
  sub: string;
  className: string;
  activeClassName: string;
}[] = [
  {
    value: "sold",
    label: "Mark as Sold",
    sub: "ተርዟል",
    className: "text-red-400 hover:bg-red-500/10",
    activeClassName: "bg-red-500/10 text-red-400 border-red-500/40",
  },
  {
    value: "rented",
    label: "Mark as Rented",
    sub: "ተከራይቷል",
    className: "text-amber-400 hover:bg-amber-500/10",
    activeClassName: "bg-amber-500/10 text-amber-400 border-amber-500/40",
  },
  {
    value: "active",
    label: "Mark as Available",
    sub: "እንደሚገኝ",
    className: "text-emerald-400 hover:bg-emerald-500/10",
    activeClassName: "bg-emerald-500/10 text-emerald-400 border-emerald-500/40",
  },
];

export default function ListingAvailabilityControl({
  id,
  availability,
  compact = false,
}: {
  id: string;
  availability?: Availability;
  compact?: boolean;
}) {
  const [current, setCurrent] = useState<Availability>(availability || "active");
  const [pending, setPending] = useState<Availability | null>(null);
  const [error, setError] = useState("");
  const router = useRouter();

  const setAvailability = async (next: Availability) => {
    if (next === current || pending) return;
    setPending(next);
    setError("");

    const previous = current;
    setCurrent(next);

    try {
      const res = await fetch(`/api/listings/${id}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: next }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setCurrent(previous);
        setError(data?.error || "Failed to update status");
        return;
      }

      router.refresh();
    } catch {
      setCurrent(previous);
      setError("Failed to update status");
    } finally {
      setPending(null);
    }
  };

  const label =
    current === "sold" ? "Sold" : current === "rented" ? "Rented" : "Available";
  const labelColor =
    current === "sold"
      ? "text-red-400"
      : current === "rented"
        ? "text-amber-400"
        : "text-emerald-400";

  if (compact) {
    return (
      <div className="flex flex-wrap items-center gap-1.5">
        {OPTIONS.map((opt) => {
          const isActive = current === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setAvailability(opt.value)}
              disabled={isActive || pending !== null}
              title={isActive ? label : opt.label}
              aria-label={opt.label}
              className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border transition disabled:opacity-40 disabled:cursor-not-allowed ${
                isActive
                  ? opt.activeClassName
                  : "border-neutral-800 text-neutral-400 hover:border-neutral-600 hover:text-neutral-200"
              }`}
            >
              {isActive ? <CheckCircle2 className="w-3 h-3 inline mr-1" /> : null}
              {opt.label.replace("Mark as ", "")}
            </button>
          );
        })}
        {error && <span className="text-[11px] text-red-400">{error}</span>}
      </div>
    );
  }

  return (
    <div className="border-t border-neutral-800">
      <div className="px-4 pt-3 pb-1 flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-widest text-neutral-500">
          Status · ሁኔታ
        </span>
        <span className={`text-xs font-semibold ${labelColor}`}>{label}</span>
      </div>
      {OPTIONS.map((opt) => {
        const isActive = current === opt.value;
        return (
          <button
            key={opt.value}
            onClick={() => setAvailability(opt.value)}
            disabled={isActive || pending !== null}
            className={`flex w-full items-center gap-3 px-4 py-2.5 text-sm transition disabled:opacity-50 disabled:cursor-not-allowed ${opt.className}`}
          >
            {isActive ? (
              <CheckCircle2 className="w-4 h-4" />
            ) : (
              <XCircle className="w-4 h-4 opacity-0" />
            )}
            <span className="text-left leading-tight">
              {opt.label}
              <span className="block text-[10px] text-neutral-500">{opt.sub}</span>
            </span>
          </button>
        );
      })}
      {error && <p className="px-4 pb-2 text-[11px] text-red-400">{error}</p>}
    </div>
  );
}

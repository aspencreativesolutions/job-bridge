"use client";

import { useId } from "react";
import { CROSS_INDUSTRY_TOOLTIP } from "@/lib/jobs/job-titles";

export function CrossIndustryTag({
  glass = false,
  showTooltip = false,
  tooltipBelow = false,
  tooltip = CROSS_INDUSTRY_TOOLTIP,
  className = "",
}: {
  glass?: boolean;
  showTooltip?: boolean;
  tooltipBelow?: boolean;
  tooltip?: string;
  className?: string;
}) {
  const tooltipId = useId();

  return (
    <span className={`group/tag relative shrink-0 ${className}`}>
      <span
        className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
          showTooltip ? "cursor-help" : ""
        } ${
          glass
            ? "border border-cyan-500/40 bg-cyan-500/15 text-cyan-300"
            : "border border-cyan-200 bg-cyan-50 text-cyan-800 dark:border-cyan-800 dark:bg-cyan-950 dark:text-cyan-200"
        }`}
        tabIndex={showTooltip ? 0 : undefined}
        aria-describedby={showTooltip ? tooltipId : undefined}
      >
        Cross-Industry
      </span>
      {showTooltip && (
        <span
          id={tooltipId}
          role="tooltip"
          className={`pointer-events-none absolute right-0 z-[60] hidden w-56 rounded-md px-3 py-2 text-xs font-normal normal-case tracking-normal shadow-lg group-hover/tag:block group-focus-within/tag:block ${
            tooltipBelow ? "top-full mt-2" : "bottom-full mb-2"
          } ${
            glass
              ? "border border-white/10 bg-slate-900 text-slate-200"
              : "border border-indigo-200 bg-white text-zinc-700 dark:border-indigo-800 dark:bg-indigo-950 dark:text-indigo-100"
          }`}
        >
          {tooltip}
        </span>
      )}
    </span>
  );
}

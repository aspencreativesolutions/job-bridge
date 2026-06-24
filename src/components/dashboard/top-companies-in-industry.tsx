"use client";

import { useMemo, useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { INDUSTRY_TOP_COMPANIES } from "@/lib/types";

interface Props {
  industries: string[];
  glass?: boolean;
}

export function TopCompaniesInIndustry({ industries, glass }: Props) {
  const [expanded, setExpanded] = useState(false);

  const industryCompanies = useMemo(
    () =>
      industries
        .filter(
          (industry): industry is keyof typeof INDUSTRY_TOP_COMPANIES =>
            industry in INDUSTRY_TOP_COMPANIES
        )
        .map((industry) => ({
          industry,
          companies: INDUSTRY_TOP_COMPANIES[industry],
        })),
    [industries]
  );

  const companyCount = industryCompanies.reduce(
    (total, { companies }) => total + companies.length,
    0
  );

  const outer = glass
    ? "dash-box"
    : "rounded-xl border border-cyan-200 bg-cyan-50 shadow-md dark:border-cyan-800 dark:bg-cyan-950/60";
  const divider = glass
    ? "border-t border-slate-600/50"
    : "border-t border-cyan-200/80 dark:border-cyan-800";
  const titleText = glass
    ? "text-lg font-bold text-white"
    : "text-xl font-bold text-cyan-950 dark:text-cyan-50";
  const subText = glass
    ? "text-sm text-slate-400"
    : "text-sm text-cyan-700/80 dark:text-cyan-300/80";
  const labelText = glass
    ? "text-sm font-bold text-slate-200"
    : "font-bold text-cyan-900 dark:text-cyan-100";
  const mutedText = glass
    ? "text-xs text-slate-500"
    : "text-xs italic text-cyan-600/60 dark:text-cyan-400/60";
  const companyPill = glass
    ? "rounded-full border border-slate-600/60 bg-slate-700/50 px-2.5 py-0.5 text-xs font-bold text-slate-200"
    : "rounded-full border border-cyan-200 bg-white px-2.5 py-0.5 text-xs font-bold text-cyan-800 dark:border-cyan-700 dark:bg-cyan-950 dark:text-cyan-200";

  return (
    <section className={outer}>
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        aria-expanded={expanded}
        className="flex w-full items-start gap-2 text-left"
      >
        <ChevronDown
          className={`mt-1 h-4 w-4 shrink-0 text-slate-400 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
        />
        <div className="min-w-0">
          <h2 className={`flex items-center gap-2 ${titleText}`}>
            <Building2 className="h-5 w-5 shrink-0 text-cyan-400" />
            Top companies in your industries
          </h2>
          <p className={subText}>
            Leading employers to target in your selected fields
          </p>
          {!expanded && (
            <p className={`mt-1 ${mutedText}`}>
              {industryCompanies.length === 0
                ? "Select industries above to see companies"
                : `${industryCompanies.length} ${industryCompanies.length === 1 ? "industry" : "industries"} · ${companyCount} companies · Click to expand`}
            </p>
          )}
        </div>
      </button>

      {expanded && (
        <div className={`${divider} mt-4 space-y-4 pt-4`}>
          {industryCompanies.length === 0 ? (
            <p className={mutedText}>
              Choose one or more industries in Configure Preferences to see top
              employers in those fields.
            </p>
          ) : (
            industryCompanies.map(({ industry, companies }) => (
              <div key={industry}>
                <h3 className={`mb-2 ${labelText}`}>{industry}</h3>
                <ol className="space-y-1.5">
                  {companies.map((company, index) => (
                    <li
                      key={company}
                      className="flex items-center gap-2 text-sm"
                    >
                      <span
                        className={
                          glass
                            ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-500/20 text-xs font-bold text-cyan-300"
                            : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300"
                        }
                      >
                        {index + 1}
                      </span>
                      <span className={companyPill}>{company}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ))
          )}
        </div>
      )}
    </section>
  );
}

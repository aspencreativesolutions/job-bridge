"use client";

import { useMemo, useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import type { JobPreferencesData } from "@/lib/types";
import {
  getCompaniesForIndustries,
  resolvePreferenceIndustries,
} from "@/lib/types";

interface Props {
  preferences: JobPreferencesData;
  glass?: boolean;
}

export function CompaniesInFieldBox({ preferences, glass }: Props) {
  const [expanded, setExpanded] = useState(true);

  const industries = useMemo(
    () => resolvePreferenceIndustries(preferences),
    [preferences]
  );
  const companies = useMemo(
    () => getCompaniesForIndustries(industries),
    [industries]
  );
  const inferredFromTitles =
    preferences.industries.length === 0 && preferences.jobTitles.length > 0;

  const selectedField = useMemo(() => {
    if (preferences.industries.length > 0) {
      return preferences.industries.join(", ");
    }
    if (preferences.jobTitles.length > 0) {
      return preferences.jobTitles.join(", ");
    }
    return null;
  }, [preferences.industries, preferences.jobTitles]);

  const fieldSubtext = useMemo(() => {
    if (!selectedField) return "Top employers in your selected industries";
    if (inferredFromTitles && industries.length > 0) {
      return `In ${industries.join(", ")} · Top employers in your field`;
    }
    return "Top employers in your selected industries";
  }, [selectedField, inferredFromTitles, industries]);

  const fieldText = glass
    ? "text-base font-semibold text-emerald-300"
    : "text-base font-semibold text-emerald-700 dark:text-emerald-300";

  const outer = glass
    ? "dash-box"
    : "rounded-xl border border-emerald-200 bg-emerald-50 shadow-md dark:border-emerald-800 dark:bg-emerald-950/60";
  const divider = glass
    ? "border-t border-slate-600/50"
    : "border-t border-emerald-200/80 dark:border-emerald-800";
  const titleText = glass
    ? "text-lg font-bold text-white"
    : "text-xl font-bold text-emerald-950 dark:text-emerald-50";
  const subText = glass
    ? "text-sm text-slate-400"
    : "text-sm text-emerald-700/80 dark:text-emerald-300/80";
  const labelText = glass
    ? "text-sm font-bold text-slate-200"
    : "font-bold text-emerald-900 dark:text-emerald-100";
  const bodyText = glass
    ? "text-sm text-slate-300"
    : "text-sm text-emerald-900 dark:text-emerald-100";
  const mutedText = glass
    ? "text-xs text-slate-500"
    : "text-xs italic text-emerald-600/60 dark:text-emerald-400/60";

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
            <Building2 className="h-5 w-5 shrink-0 text-emerald-400" />
            Companies in Your Field
          </h2>
          {selectedField ? (
            <p className={fieldText}>{selectedField}</p>
          ) : null}
          <p className={subText}>{fieldSubtext}</p>
          {!expanded && (
            <p className={`mt-1 ${mutedText}`}>
              {companies.length === 0
                ? "Add a job title or industry to see companies"
                : `${companies.length} companies · Click to expand`}
            </p>
          )}
        </div>
      </button>

      {expanded && (
        <div className={`${divider} mt-4 pt-4`}>
          {companies.length > 0 ? (
            <>
              {inferredFromTitles && (
                <p className={`mb-3 ${mutedText}`}>
                  Select industries above to refine this list.
                </p>
              )}
              {industries.map((industry) => {
                const industryCompanies = getCompaniesForIndustries([industry]);
                const midpoint = Math.ceil(industryCompanies.length / 2);
                const columns = [
                  industryCompanies.slice(0, midpoint),
                  industryCompanies.slice(midpoint),
                ];

                return (
                  <div key={industry} className="mb-4 last:mb-0">
                    <h3 className={`mb-2 ${labelText}`}>{industry}</h3>
                    <div className="grid grid-cols-2 gap-x-6">
                      {columns.map((columnCompanies, columnIndex) => (
                        <ol key={columnIndex} className="space-y-1.5">
                          {columnCompanies.map((company, index) => {
                            const rank = columnIndex * midpoint + index + 1;

                            return (
                              <li
                                key={company}
                                className={`flex items-center gap-2 ${bodyText}`}
                              >
                                <span
                                  className={
                                    glass
                                      ? "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-xs font-bold text-emerald-300"
                                      : "flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700 dark:bg-emerald-900 dark:text-emerald-300"
                                  }
                                >
                                  {rank}
                                </span>
                                {company}
                              </li>
                            );
                          })}
                        </ol>
                      ))}
                    </div>
                  </div>
                );
              })}
            </>
          ) : (
            <p className={mutedText}>
              {preferences.jobTitles.length > 0
                ? "We couldn't match your job title to an industry yet. Select an industry above (e.g. Technology for software roles)."
                : "Add a job title or select industries above to see leading companies in your field."}
            </p>
          )}
        </div>
      )}
    </section>
  );
}

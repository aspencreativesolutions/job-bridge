"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { Building2, ChevronDown } from "lucide-react";
import { getCompanyTooltipText } from "@/lib/companies/company-stats";
import {
  getCrossIndustryContext,
  type IndustryOption,
} from "@/lib/jobs/job-titles";
import type { JobPreferencesData } from "@/lib/types";
import {
  getCompaniesForIndustries,
  inferIndustriesFromJobTitles,
  INDUSTRY_OPTIONS,
  resolvePreferenceIndustries,
} from "@/lib/types";

function resolveIndustriesForPosition(
  title: string,
  preferences: JobPreferencesData
): (typeof INDUSTRY_OPTIONS)[number][] {
  const ctx = getCrossIndustryContext([title]);

  const explicit = preferences.industries.filter(
    (industry): industry is (typeof INDUSTRY_OPTIONS)[number] =>
      (INDUSTRY_OPTIONS as readonly string[]).includes(industry)
  );

  if (explicit.length > 0) {
    if (ctx.hasCrossIndustry) {
      const relevant = explicit.filter((industry) =>
        ctx.relevantIndustries.includes(industry as IndustryOption)
      );
      if (relevant.length > 0) return relevant;
    } else {
      return explicit;
    }
  }

  const inferred = inferIndustriesFromJobTitles([title]);
  if (inferred.length > 0) return inferred;

  if (ctx.hasCrossIndustry) {
    return [...ctx.relevantIndustries];
  }

  return [];
}

interface Props {
  preferences: JobPreferencesData;
  glass?: boolean;
}

function CompanyListItem({
  company,
  rank,
  jobTitles,
  glass,
  bodyText,
}: {
  company: string;
  rank: number;
  jobTitles: string[];
  glass?: boolean;
  bodyText: string;
}) {
  const tooltipId = useId();
  const tooltipText = useMemo(
    () => getCompanyTooltipText(company, jobTitles),
    [company, jobTitles]
  );

  return (
    <li className={`group/company relative ${bodyText}`}>
      <span
        className="inline-flex origin-left cursor-default items-center gap-2 transition-transform duration-200 ease-out group-hover/company:scale-[1.04]"
        tabIndex={0}
        aria-describedby={tooltipId}
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
      </span>
      <span
        id={tooltipId}
        role="tooltip"
        className={`pointer-events-none absolute left-0 top-full z-[60] mt-1.5 hidden w-max max-w-[16rem] whitespace-pre-line rounded-md px-3 py-2 text-xs font-normal normal-case tracking-normal shadow-lg group-hover/company:block group-focus-within/company:block ${
          glass
            ? "border border-white/10 bg-slate-900 text-slate-200"
            : "border border-emerald-200 bg-white text-emerald-900 dark:border-emerald-800 dark:bg-emerald-950 dark:text-emerald-100"
        }`}
      >
        {tooltipText}
      </span>
    </li>
  );
}

export function CompaniesInFieldBox({ preferences, glass }: Props) {
  const [expanded, setExpanded] = useState(true);
  const [selectedPosition, setSelectedPosition] = useState(
    preferences.jobTitles[0] ?? ""
  );
  const [positionMenuOpen, setPositionMenuOpen] = useState(false);
  const positionMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setSelectedPosition((current) => {
      const titles = preferences.jobTitles;
      if (titles.length === 0) return "";
      if (current && titles.includes(current)) return current;
      return titles[0];
    });
  }, [preferences.jobTitles]);

  useEffect(() => {
    if (!positionMenuOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (
        positionMenuRef.current &&
        !positionMenuRef.current.contains(e.target as Node)
      ) {
        setPositionMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [positionMenuOpen]);

  const industries = useMemo(() => {
    if (selectedPosition) {
      return resolveIndustriesForPosition(selectedPosition, preferences);
    }
    return resolvePreferenceIndustries(preferences);
  }, [preferences, selectedPosition]);

  const companies = useMemo(
    () => getCompaniesForIndustries(industries),
    [industries]
  );
  const inferredFromTitles =
    preferences.industries.length === 0 && selectedPosition.length > 0;

  const fieldSubtext = useMemo(() => {
    if (selectedPosition) {
      return "Top employers for your position";
    }
    if (preferences.industries.length > 0) {
      return "Top employers in your selected industries";
    }
    return "Add a job title or industry to see companies";
  }, [selectedPosition, preferences.industries]);

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
  const arrowClass = glass
    ? "text-emerald-300"
    : "text-emerald-700 dark:text-emerald-300";
  const menuClass = glass
    ? "border border-slate-600/60 bg-slate-800 py-1 shadow-lg ring-1 ring-white/5"
    : "border border-emerald-200 bg-white py-1 shadow-lg ring-1 ring-emerald-100 dark:border-emerald-800 dark:bg-emerald-950 dark:ring-emerald-900";
  const menuItemClass = glass
    ? "text-slate-200 hover:bg-white/5"
    : "text-emerald-900 hover:bg-emerald-50 dark:text-emerald-100 dark:hover:bg-emerald-900/50";
  const menuItemActiveClass = glass
    ? "bg-emerald-500/20 text-emerald-300"
    : "bg-emerald-100 text-emerald-900 dark:bg-emerald-900 dark:text-emerald-100";

  const activeJobTitles = selectedPosition
    ? [selectedPosition]
    : preferences.jobTitles;

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
            Top Companies
          </h2>
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

      {selectedPosition ? (
        <div className="mt-1 flex items-center gap-2 pl-6">
          <span className={fieldText}>{selectedPosition}</span>
          {preferences.jobTitles.length > 1 && (
            <div ref={positionMenuRef} className="relative">
              <button
                type="button"
                onClick={() => setPositionMenuOpen((open) => !open)}
                aria-label="Switch target position"
                aria-expanded={positionMenuOpen}
                aria-haspopup="listbox"
                className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-white/5"
              >
                <ChevronDown className={`h-4 w-4 ${arrowClass}`} />
              </button>
              {positionMenuOpen && (
                <ul
                  role="listbox"
                  aria-label="Target positions"
                  className={`absolute left-0 top-full z-[60] mt-1 min-w-[12rem] overflow-hidden rounded-md ${menuClass}`}
                >
                  {preferences.jobTitles.map((title) => (
                    <li key={title} role="option" aria-selected={title === selectedPosition}>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedPosition(title);
                          setPositionMenuOpen(false);
                        }}
                        className={`block w-full px-3 py-2 text-left text-sm ${
                          title === selectedPosition
                            ? menuItemActiveClass
                            : menuItemClass
                        }`}
                      >
                        {title}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      ) : preferences.industries.length > 0 ? (
        <p className={`mt-1 pl-6 ${fieldText}`}>
          {preferences.industries.join(", ")}
        </p>
      ) : null}

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

                return (
                  <div key={industry} className="mb-4 last:mb-0">
                    <h3 className={`mb-2 ${labelText}`}>{industry}</h3>
                    <ol className="space-y-1.5">
                      {industryCompanies.map((company, index) => (
                        <CompanyListItem
                          key={company}
                          company={company}
                          rank={index + 1}
                          jobTitles={activeJobTitles}
                          glass={glass}
                          bodyText={bodyText}
                        />
                      ))}
                    </ol>
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

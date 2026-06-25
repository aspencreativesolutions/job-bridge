"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import {
  getCrossIndustryTooltip,
  type JobTitleSuggestion,
} from "@/lib/jobs/job-titles";
import { CrossIndustryTag } from "@/components/ui/cross-industry-tag";

interface Props {
  value: string;
  onChange: (value: string) => void;
  onAddTitle: () => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  glass?: boolean;
}

export function JobTitlesInput({
  value,
  onChange,
  onAddTitle,
  placeholder = "",
  className = "",
  inputClassName = "",
  glass = false,
}: Props) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<JobTitleSuggestion[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentQuery = value.trim();

  const fetchSuggestions = useCallback(async (query: string) => {
    if (!query.trim()) {
      setSuggestions([]);
      setOpen(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/job-titles?q=${encodeURIComponent(query)}&limit=8`
      );
      const data = await res.json();
      const results = (data.results ?? []) as JobTitleSuggestion[];
      setSuggestions(results);
      setActiveIndex(0);
      setOpen(true);
    } catch {
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      void fetchSuggestions(currentQuery);
    }, 150);
    return () => clearTimeout(timer);
  }, [currentQuery, fetchSuggestions]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function selectSuggestion(suggestion: JobTitleSuggestion) {
    onChange(suggestion.title);
    setOpen(false);
    setSuggestions([]);
    inputRef.current?.focus();
  }

  function handleAdd() {
    if (!value.trim()) return;
    onAddTitle();
    setOpen(false);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      if (open && suggestions[activeIndex]) {
        e.preventDefault();
        selectSuggestion(suggestions[activeIndex]);
        return;
      }
      if (value.trim()) {
        e.preventDefault();
        handleAdd();
      }
      return;
    }

    if (!open || suggestions.length === 0) {
      if (e.key === "Escape") setOpen(false);
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % suggestions.length);
        break;
      case "ArrowUp":
        e.preventDefault();
        setActiveIndex(
          (i) => (i - 1 + suggestions.length) % suggestions.length
        );
        break;
      case "Escape":
        e.preventDefault();
        setOpen(false);
        break;
      case "Tab":
        setOpen(false);
        break;
    }
  }

  const showDropdown =
    open && currentQuery.length > 0 && (suggestions.length > 0 || !loading);

  const inputWrapperClass = glass
    ? "border border-slate-600/60 bg-slate-700/50 focus-within:border-violet-400/60 focus-within:ring-1 focus-within:ring-violet-400/30"
    : "border border-indigo-200 bg-white focus-within:border-indigo-400 focus-within:ring-1 focus-within:ring-indigo-200 dark:border-indigo-700 dark:bg-indigo-950 dark:focus-within:border-indigo-500 dark:focus-within:ring-indigo-900";

  const dropdownClass = glass
    ? "border border-slate-600/60 bg-slate-800 py-1 shadow-lg ring-1 ring-white/5"
    : "border border-indigo-200 bg-white py-1 shadow-lg ring-1 ring-indigo-100 dark:border-indigo-700 dark:bg-indigo-950 dark:ring-indigo-900";

  const activeItemClass = glass
    ? "bg-violet-500/20 text-white"
    : "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100";

  const itemClass = glass
    ? "text-slate-200 hover:bg-white/5"
    : "text-zinc-800 hover:bg-indigo-50 dark:text-zinc-200 dark:hover:bg-indigo-900/50";

  const buttonClass = glass
    ? "shrink-0 rounded-md border border-violet-500/40 bg-violet-600 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-violet-500 disabled:cursor-not-allowed disabled:opacity-40"
    : "shrink-0 rounded-md border border-indigo-600 bg-indigo-600 px-2 py-1 text-[11px] font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40 dark:border-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-400";

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="flex items-center gap-1.5">
        <div className={`relative min-w-0 flex-1 rounded-md ${inputWrapperClass}`}>
          <input
            ref={inputRef}
            type="text"
            role="combobox"
            aria-expanded={showDropdown}
            aria-controls={listboxId}
            aria-autocomplete="list"
            aria-activedescendant={
              showDropdown && suggestions[activeIndex]
                ? `${listboxId}-option-${activeIndex}`
                : undefined
            }
            className={`w-full border-0 bg-transparent px-2 py-1 text-sm outline-none focus:ring-0 ${
              glass
                ? "text-white placeholder:text-slate-500"
                : "text-zinc-900 placeholder:text-zinc-400 dark:text-zinc-100"
            } ${inputClassName}`}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onFocus={() => {
              if (currentQuery && suggestions.length > 0) setOpen(true);
            }}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoComplete="off"
          />

          {showDropdown && (
            <ul
              id={listboxId}
              role="listbox"
              className={`absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md ${dropdownClass}`}
            >
              {suggestions.length > 0 ? (
                suggestions.map((suggestion, index) => (
                  <li
                    key={suggestion.title}
                    id={`${listboxId}-option-${index}`}
                    role="option"
                    aria-selected={index === activeIndex}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      selectSuggestion(suggestion);
                    }}
                    onMouseEnter={() => setActiveIndex(index)}
                    className={`flex cursor-pointer items-center gap-2 px-3 py-2 text-sm ${
                      index === activeIndex ? activeItemClass : itemClass
                    }`}
                  >
                    <span className="min-w-0 flex-1 truncate">{suggestion.title}</span>
                    {suggestion.crossIndustry && (
                      <CrossIndustryTag
                        glass={glass}
                        showTooltip
                        tooltip={getCrossIndustryTooltip(suggestion.title)}
                      />
                    )}
                  </li>
                ))
              ) : (
                <li
                  className={`px-3 py-2 text-sm italic ${
                    glass ? "text-slate-500" : "text-zinc-500 dark:text-zinc-400"
                  }`}
                >
                  No matches — continue typing your custom title
                </li>
              )}
            </ul>
          )}
        </div>
        <button
          type="button"
          onClick={handleAdd}
          disabled={!value.trim()}
          className={buttonClass}
        >
          Add Title
        </button>
      </div>
    </div>
  );
}

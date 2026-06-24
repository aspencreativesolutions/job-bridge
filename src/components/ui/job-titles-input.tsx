"use client";

import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";

interface Props {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
}

function getCurrentSegment(value: string): string {
  const lastComma = value.lastIndexOf(",");
  const segment = lastComma === -1 ? value : value.slice(lastComma + 1);
  return segment.trimStart();
}

function applySuggestion(value: string, suggestion: string): string {
  const lastComma = value.lastIndexOf(",");
  if (lastComma === -1) {
    return suggestion;
  }
  return `${value.slice(0, lastComma + 1)} ${suggestion}`;
}

export function JobTitlesInput({
  value,
  onChange,
  placeholder = "Software Engineer, Product Manager",
  className = "",
  inputClassName = "",
}: Props) {
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [open, setOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  const currentQuery = getCurrentSegment(value);

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
      const results = (data.results ?? []) as string[];
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

  function selectSuggestion(suggestion: string) {
    const next = applySuggestion(value, suggestion);
    onChange(next.endsWith(", ") ? next : `${next}, `);
    setOpen(false);
    setSuggestions([]);
    inputRef.current?.focus();
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
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
      case "Enter":
        if (open && suggestions[activeIndex]) {
          e.preventDefault();
          selectSuggestion(suggestions[activeIndex]);
        }
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

  return (
    <div ref={containerRef} className={`relative ${className}`}>
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
        className={inputClassName}
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
          className="absolute z-50 mt-1 max-h-56 w-full overflow-auto rounded-md border border-indigo-200 bg-white py-1 shadow-lg ring-1 ring-indigo-100 dark:border-indigo-700 dark:bg-indigo-950 dark:ring-indigo-900"
        >
          {suggestions.length > 0 ? (
            suggestions.map((title, index) => (
              <li
                key={title}
                id={`${listboxId}-option-${index}`}
                role="option"
                aria-selected={index === activeIndex}
                onMouseDown={(e) => {
                  e.preventDefault();
                  selectSuggestion(title);
                }}
                onMouseEnter={() => setActiveIndex(index)}
                className={`cursor-pointer px-3 py-2 text-sm ${
                  index === activeIndex
                    ? "bg-indigo-100 text-indigo-900 dark:bg-indigo-900 dark:text-indigo-100"
                    : "text-zinc-800 hover:bg-indigo-50 dark:text-zinc-200 dark:hover:bg-indigo-900/50"
                }`}
              >
                {title}
              </li>
            ))
          ) : (
            <li className="px-3 py-2 text-sm italic text-zinc-500 dark:text-zinc-400">
              No matches — continue typing your custom title
            </li>
          )}
        </ul>
      )}
    </div>
  );
}

import { formatSalaryRange } from "@/lib/jobs/format-salary";

interface Props {
  salaryMin?: number | null;
  salaryMax?: number | null;
  variant?: "default" | "glass";
  className?: string;
}

export function JobSalary({
  salaryMin,
  salaryMax,
  variant = "default",
  className = "",
}: Props) {
  const label = formatSalaryRange(salaryMin, salaryMax);

  if (label) {
    const badgeClass =
      variant === "glass"
        ? "rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300"
        : "rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-semibold text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300";

    return (
      <span className={`inline-flex items-center ${badgeClass} ${className}`.trim()}>
        {label}
      </span>
    );
  }

  const mutedClass =
    variant === "glass"
      ? "text-xs font-medium text-slate-500"
      : "text-xs font-medium text-zinc-400 dark:text-zinc-500";

  return (
    <span className={`${mutedClass} ${className}`.trim()}>
      Salary not listed
    </span>
  );
}

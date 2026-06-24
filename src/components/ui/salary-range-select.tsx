import type { ChangeEvent } from "react";
import {
  SALARY_TIERS,
  getSalaryTierId,
  type SalaryTierId,
} from "@/lib/types";

interface Props {
  salaryMin: number | null;
  salaryMax: number | null;
  onChange: (salaryMin: number | null, salaryMax: number | null) => void;
  className?: string;
}

export function SalaryRangeSelect({
  salaryMin,
  salaryMax,
  onChange,
  className,
}: Props) {
  const selectedTierId = getSalaryTierId(salaryMin, salaryMax);

  function handleChange(e: ChangeEvent<HTMLSelectElement>) {
    const tierId = e.target.value as SalaryTierId | "";
    if (!tierId) {
      onChange(null, null);
      return;
    }

    const tier = SALARY_TIERS.find((t) => t.id === tierId);
    if (tier) {
      onChange(tier.min, tier.max);
    }
  }

  return (
    <select
      className={className}
      value={selectedTierId}
      onChange={handleChange}
    >
      <option value="">Select salary range</option>
      {SALARY_TIERS.map((tier) => (
        <option key={tier.id} value={tier.id}>
          {tier.label}
        </option>
      ))}
    </select>
  );
}

import type { JobPreferencesData } from "../types";

export function jobMatchesSalary(
  job: { salaryMin?: number | null; salaryMax?: number | null },
  preferences: JobPreferencesData
): boolean {
  if (preferences.salaryMin == null && preferences.salaryMax == null) {
    return true;
  }
  if (job.salaryMin == null && job.salaryMax == null) {
    return true;
  }

  const jobMin = job.salaryMin ?? job.salaryMax ?? 0;
  const jobMax = job.salaryMax ?? job.salaryMin ?? jobMin;
  const prefMin = preferences.salaryMin ?? 0;
  const prefMax = preferences.salaryMax ?? Number.MAX_SAFE_INTEGER;

  return jobMax >= prefMin && jobMin <= prefMax;
}

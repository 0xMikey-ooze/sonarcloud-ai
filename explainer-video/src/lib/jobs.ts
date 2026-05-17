import { JobRecord } from '../types';

declare global {
  // eslint-disable-next-line no-var
  var __explainerJobs: Map<string, JobRecord> | undefined;
}

const store: Map<string, JobRecord> = global.__explainerJobs ?? new Map();
if (!global.__explainerJobs) global.__explainerJobs = store;

export function createJob(rec: JobRecord): void {
  store.set(rec.id, rec);
}

export function getJob(id: string): JobRecord | undefined {
  return store.get(id);
}

export function updateJob(id: string, patch: Partial<JobRecord>): JobRecord | undefined {
  const cur = store.get(id);
  if (!cur) return undefined;
  const next = { ...cur, ...patch };
  store.set(id, next);
  return next;
}

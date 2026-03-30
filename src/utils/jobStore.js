const jobs = new Map();

const JOB_STATUS = {
  PENDING: 'pending',
  RUNNING: 'running',
  SUCCESS: 'success',
  FAILED: 'failed',
};

function createJob(id, meta) {
  const job = {
    id,
    status: JOB_STATUS.PENDING,
    steps: [],
    meta,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    error: null,
    result: null,
  };
  jobs.set(id, job);
  return job;
}

function updateJob(id, patch) {
  const job = jobs.get(id);
  if (!job) return null;
  Object.assign(job, patch, { updatedAt: new Date().toISOString() });
  return job;
}

function pushStep(id, step) {
  const job = jobs.get(id);
  if (!job) return;
  job.steps.push({ ...step, timestamp: new Date().toISOString() });
  job.updatedAt = new Date().toISOString();
}

function getJob(id) {
  return jobs.get(id) ?? null;
}

function listJobs() {
  return Array.from(jobs.values()).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
}

export { JOB_STATUS, createJob, updateJob, pushStep, getJob, listJobs };

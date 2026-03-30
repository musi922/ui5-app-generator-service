import { Router } from 'express';
import { validateScaffoldRequest } from '../validators/scaffoldValidator.js';
import { runScaffold } from '../services/scaffoldService.js';
import { getJob, listJobs } from '../utils/jobStore.js';
import logger from '../utils/logger.js';

const router = Router();

router.post('/', async (req, res) => {
  const parsed = validateScaffoldRequest(req.body);

  if (!parsed.success) {
    return res.status(400).json({
      error: 'Validation failed',
      details: parsed.error.flatten().fieldErrors,
    });
  }

  logger.info(`Scaffold request received for project: ${parsed.data.projectName}`);

  const jobId = await runScaffold(parsed.data);

  res.status(202).json({
    jobId,
    status: 'accepted',
    message: 'Scaffolding job queued',
    pollUrl: `/api/scaffold/jobs/${jobId}`,
  });
});

router.get('/jobs', (_req, res) => {
  res.json(listJobs());
});

router.get('/jobs/:jobId', (req, res) => {
  const job = getJob(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: `Job ${req.params.jobId} not found` });
  }
  res.json(job);
});

export default router;

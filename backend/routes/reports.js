import express from 'express';
import { getReports, createReport } from '../controllers/reportController.js';

const router = express.Router();

router.route('/')
  .get(getReports)
  .post(createReport);

export default router;

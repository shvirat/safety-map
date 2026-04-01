import express from 'express';
import { getAllReports, updateReportStatus } from '../controllers/adminController.js';

const router = express.Router();

router.route('/')
  .get(getAllReports);

router.route('/:id')
  .put(updateReportStatus);

export default router;

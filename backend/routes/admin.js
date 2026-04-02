import express from 'express';
import { getAllReports, updateReportStatus, adminLogin } from '../controllers/adminController.js';

const router = express.Router();

router.post('/login', adminLogin);

router.route('/reports')
  .get(getAllReports);

router.route('/reports/:id')
  .put(updateReportStatus);

export default router;

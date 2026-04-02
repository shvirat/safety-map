import Report from '../models/Report.js';

// @desc    Get all reports (only admin)
// @route   GET /api/admin/reports
export const getAllReports = async (req, res) => {
  try {

    if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const reports = await Report.find().sort({ createdAt: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Update report status
// @route   PUT /api/admin/reports/:id
export const updateReportStatus = async (req, res) => {
  try {
    if (req.headers['x-admin-secret'] !== process.env.ADMIN_SECRET) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    const { status } = req.body;
    
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const report = await Report.findById(req.params.id);

    if (report) {
      report.status = status;
      const updatedReport = await report.save();
      res.json(updatedReport);
    } else {
      res.status(404).json({ message: 'Report not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Verify admin credentials
// @route   POST /api/admin/login
export const adminLogin = async (req, res) => {
  try {
    const { secret } = req.body;
    if (secret === process.env.ADMIN_SECRET) {
      res.json({ success: true, message: 'Authentication successful' });
    } else {
      res.status(401).json({ message: 'Invalid credentials' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

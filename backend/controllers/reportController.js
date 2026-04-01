import Report from '../models/Report.js';

// @desc    Get all approved reports
// @route   GET /api/reports
export const getReports = async (req, res) => {
  try {
    const reports = await Report.find({ status: 'approved' });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', details: error.message });
  }
};

// @desc    Create a new report
// @route   POST /api/reports
export const createReport = async (req, res) => {
  try {
    const { location, type, severity, datetime, description, imageUrl } = req.body;
    
    // Quick validation
    if (!location || !location.lat || !location.lng || !type) {
      return res.status(400).json({ message: 'Location and type are required' });
    }

    const report = new Report({
      location,
      type,
      severity: severity || 'Medium',
      datetime: datetime || new Date(),
      description,
      imageUrl
    });

    const createdReport = await report.save();
    res.status(201).json(createdReport);
  } catch (error) {
    console.error('Create Report Error:', error);
    res.status(500).json({ message: error.message || 'Server Error', details: error });
  }
};

import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema({
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  type: {
    type: String,
    required: true,
    enum: ['theft', 'harassment', 'poor lighting', 'accident', 'suspicious activity']
  },
  severity: {
    type: String,
    enum: ['Low', 'Medium', 'High', 'Critical'],
    default: 'Medium'
  },
  datetime: {
    type: Date,
    default: Date.now
  },
  description: {
    type: String
  },
  imageUrl: {
    type: String
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  }
}, { timestamps: true });

const Report = mongoose.model('Report', reportSchema);

export default Report;

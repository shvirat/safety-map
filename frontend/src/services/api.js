import axios from 'axios';

const API_URL = 'http://localhost:5000/api';

export const reportService = {
  
  getApprovedReports: async () => {
    const response = await axios.get(`${API_URL}/reports`);
    return response.data;
  },
  
  createReport: async (reportData) => {
    let imageUrl = '';

    // Upload to Cloudinary
    if (reportData.imageFile) {
      const cloudName = 'dsfcdfrlz';
      const uploadPreset = 'safety-map-str-742-ram-108';

      const formData = new FormData();
      formData.append('file', reportData.imageFile);
      formData.append('upload_preset', uploadPreset);

      try {
        const cloudinaryRes = await axios.post(
          `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
          formData,
          { headers: { 'Content-Type': 'multipart/form-data' } }
        );
        imageUrl = cloudinaryRes.data.secure_url;
      } catch (error) {
        throw new Error('Failed to upload image to Cloudinary. Check your upload preset strictly matches: ' + uploadPreset);
      }
    }

    // Send the normal JSON to backend
    const payload = {
      location: reportData.location,
      type: reportData.type,
      severity: reportData.severity,
      datetime: reportData.datetime,
      description: reportData.description,
      imageUrl: imageUrl
    };

    const response = await axios.post(`${API_URL}/reports`, payload);
    return response.data;
  },

  // Admin things
  verifyAdmin: async (adminSecret) => {
    const response = await axios.post(`${API_URL}/admin/login`, { secret: adminSecret });
    return response.data;
  },

  getAllReports: async (adminSecret) => {
    const response = await axios.get(`${API_URL}/admin/reports`, {
      headers: { 'x-admin-secret': adminSecret }
    });
    return response.data;
  },

  updateReportStatus: async (id, status, adminSecret) => {
    const response = await axios.put(`${API_URL}/admin/reports/${id}`, { status }, {
      headers: { 'x-admin-secret': adminSecret }
    });
    return response.data;
  }
};

import axios from "axios";

const API = axios.create({
  baseURL: "http://127.0.0.1:5000",
  headers: {
    "Content-Type": "application/json",
  },
});

// =========================
// Predict Career
// =========================
export const predictCareer = async (formData) => {

  try {

    console.log("Sending Data:", formData);

    const response = await API.post("/predict", formData);

    console.log("Prediction Response:", response.data);

    return response.data;

  } catch (error) {

    console.error(
      "Prediction API Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// =========================
// Dashboard Stats
// =========================
export const getStats = async () => {

  try {

    const response = await API.get("/stats");

    return response.data;

  } catch (error) {

    console.error(
      "Stats API Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// =========================
// History
// =========================
export const getHistory = async () => {

  try {

    const response = await API.get("/history");

    return response.data;

  } catch (error) {

    console.error(
      "History API Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// =========================
// Comparison
// =========================
export const getComparison = async () => {

  try {

    const response = await API.get("/comparison");

    return response.data;

  } catch (error) {

    console.error(
      "Comparison API Error:",
      error.response?.data || error.message
    );

    throw error;
  }
};

// =========================
// Generate PDF
// =========================
export const generatePDF = (id) => {

  return `${API.defaults.baseURL}/generate-pdf/${id}`;
};

// =========================
// PDF URL
// =========================
export const getPdfUrl = (id) => {

  return `http://127.0.0.1:5000/generate-pdf/${id}`;
};

export default API;
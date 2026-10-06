import axios from "axios";

const API_BASE_URL = "http://localhost:8080/api/provider-verification";

export const providerVerificationService = {
  saveStepOne: async (userId, formData) => {
    let cleanUserId = userId;
    if (typeof userId === "object" && userId !== null) {
      cleanUserId = userId.id || userId._id || userId.userId || "12345";
    }

    const response = await axios.post(
      `${API_BASE_URL}/step1?userId=${cleanUserId}`,
      formData
    );
    return response.data;
  },

  saveStepTwo: async (userId, nicFrontFile, nicBackFile, businessCertFile = null) => {
    let cleanUserId = userId;
    if (typeof userId === "object" && userId !== null) {
      cleanUserId = userId.id || userId._id || userId.userId || "12345";
    }

    const formData = new FormData();
    formData.append("userId", cleanUserId);
    formData.append("nicFront", nicFrontFile);
    formData.append("nicBack", nicBackFile);

    if (businessCertFile) {
      formData.append("businessCert", businessCertFile);
    }

    const response = await axios.post(`${API_BASE_URL}/step2`, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  },

  getByUserId: async (userId) => {
    let cleanUserId = userId;
    if (typeof userId === "object" && userId !== null) {
      cleanUserId = userId.id || userId._id || userId.userId || "12345";
    }

    const response = await axios.get(
      `${API_BASE_URL}?userId=${cleanUserId}`
    );
    return response.data;
  },
};
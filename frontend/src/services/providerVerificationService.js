import api from "../config/api";

export const submitVerificationDetails = async (formData) => {
    try {
        // Once the backend is ready, this line will be uncommented
        // const response = await api.post("/provider/verification/details", formData);
        // return response.data;

        // For now, we simulate a successful API response (Mocking)
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: "Details saved successfully" });
            }, 1000);
        });
    } catch (error) {
        throw error.response?.data || new Error("Failed to submit details");
    }
};

export const uploadVerificationDocuments = async (files) => {
    try {
        // const response = await api.post("/provider/verification/documents", files, {
        //   headers: { "Content-Type": "multipart/form-data" }
        // });
        // return response.data;

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({ success: true, message: "Documents uploaded successfully" });
            }, 1500);
        });
    } catch (error) {
        throw error.response?.data || new Error("Failed to upload documents");
    }
};
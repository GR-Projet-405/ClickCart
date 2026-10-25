// Mock Cloud Upload Service
export const mockUploadToCloud = async (file) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve(`https://mock-cloud-storage.com/${file.name}`);
        }, 2000); //delay to simulate upload time
    });
};
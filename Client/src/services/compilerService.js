import axiosInstance from "./axiosInstance";


export const runCode = async (language, code, input) => {
  try {    const response = await axiosInstance.post(`/run`, {
      language,
      code,
      input,
    });
    return response.data;
  } catch (error) {
    console.error("Error executing code:", error);
    throw error;
  }
};

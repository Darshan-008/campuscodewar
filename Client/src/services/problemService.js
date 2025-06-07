import axiosInstance from "./axiosInstance";

export const getUserProblems = async () => {
  try {
    const response = await axiosInstance.get("/problems/my-problems");
    return response.data;
  } catch (error) {
    throw new Error(
      error.response?.data.message || "Failed to fetch user's problems"
    );
  }
};

export const getProblemById = async (id) => {
  try {
    const response = await axiosInstance.get(`/problems/${id}`);
    return response.data.data; // Return the data property from the response
  } catch (error) {
    throw new Error(error.response?.data.message || "Failed to fetch problem");
  }
};

export const updateProblem = async (id, problemData) => {
  try {
    const response = await axiosInstance.put(`/problems/${id}`, problemData);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data.message || "Failed to update problem");
  }
};

export const getAllProblems = async () => {
  try {
    const response = await axiosInstance.get("/problems");

    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Failed to fetch problems");
    }

    // Sort problems by creation date, newest first
    const problems = response.data.data.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    return problems;
  } catch (error) {
    console.error("Error fetching problems:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch problems");
  }
};

export const getVisibleProblems = async () => {
  try {
    const response = await axiosInstance.get("/problems/visible");
    if (!response.data || !response.data.success) {
      throw new Error(response.data?.message || "Failed to fetch problems");
    }
    return response.data.data;
  } catch (error) {
    console.error("Error fetching visible problems:", error);
    throw new Error(error.response?.data?.message || "Failed to fetch problems");
  }
};

export const deleteProblem = async (problemId) => {
  try {
    await axiosInstance.delete(`/problems/${problemId}`);
  } catch (error) {
    throw new Error(error.response?.data.message || "Failed to delete problem");
  }
};

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import axiosInstance from "../services/axiosInstance";

function MyProblems() {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    fetchProblems();
  }, []);

  const fetchProblems = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await axiosInstance.get('/problems');
      if (response.data?.success) {
        setProblems(response.data.data);
      }
    } catch (err) {
      console.error('Error fetching problems:', err);
      setError(err.response?.data?.message || 'Failed to fetch problems');
    } finally {
      setLoading(false);
    }
  };

  const toggleDailyChallenge = async (problemId) => {
    try {
      await axiosInstance.patch(`/problems/${problemId}/toggle-daily`);
      fetchProblems();
    } catch (err) {
      console.error("Error toggling daily challenge:", err);
    }
  };

  const toggleVisibility = async (problemId) => {
    try {
      await axiosInstance.patch(`/problems/${problemId}/toggle-visibility`);
      fetchProblems();
    } catch (err) {
      console.error("Error toggling problem visibility:", err);
    }
  };

  const handleDelete = async (problemId) => {
    if (!window.confirm("Are you sure you want to delete this problem?")) return;
    try {
      await axiosInstance.delete(`/problems/${problemId}`);
      setProblems(problems.filter((p) => p._id !== problemId));
    } catch (err) {
      console.error("Error deleting problem:", err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        <div className="pt-20 flex justify-center items-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="pt-20 container mx-auto px-4">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-white">My Problems</h1>
          {isAdmin && (
            <button
              onClick={() => navigate("/add-problem")}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
            >
              Add New Problem
            </button>
          )}
        </div>
        <div className="mt-6">
          {!problems.length ? (
            <div className="text-center py-10">
              <p className="text-gray-400 text-lg">No problems found</p>
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {problems.map((problem) => (
                <div
                  key={problem._id}
                  className="bg-gray-700 rounded-lg shadow-lg transition-all duration-300 hover:shadow-2xl hover:scale-102"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <h2 className="text-xl font-semibold text-white">
                        {problem.title}
                      </h2>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          problem.difficulty === "easy"
                            ? "bg-green-500/20 text-green-400"
                            : problem.difficulty === "medium"
                            ? "bg-yellow-500/20 text-yellow-400"
                            : "bg-red-500/20 text-red-400"
                        }`}
                      >
                        {problem.difficulty}
                      </span>
                    </div>

                    <div className="space-y-3">
                      {isAdmin && (
                        <div className="flex items-center space-x-4">
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={problem.isDaily}
                              onChange={() => toggleDailyChallenge(problem._id)}
                              className="w-4 h-4 rounded border-gray-500 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-300">Daily Challenge</span>
                          </label>
                          <label className="flex items-center space-x-2 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={problem.isPublished}
                              onChange={() => toggleVisibility(problem._id)}
                              className="w-4 h-4 rounded border-gray-500 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-gray-300">Published</span>
                          </label>
                        </div>
                      )}

                      <div className="flex items-center space-x-2 text-sm text-gray-400">
                        <span>Created: {new Date(problem.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        onClick={() => handleDelete(problem._id)}
                        className="px-3 py-1.5 text-sm text-red-400 hover:text-red-300 transition-colors"
                      >
                        Delete
                      </button>
                      <button
                        onClick={() => navigate(`/my-problems/${problem._id}/update`)}
                        className="px-3 py-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                      >
                        Edit
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyProblems;

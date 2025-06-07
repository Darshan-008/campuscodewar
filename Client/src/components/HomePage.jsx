import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import { getAllProblems } from "../services/problemService";

function HomePage() {
  const [problems, setProblems] = useState([]);
  const [filteredProblems, setFilteredProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6;

  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllProblems();
        // Filter out unpublished problems for non-admin users
        const visibleProblems =
          user?.role === "admin"
            ? data
            : data.filter((p) => p.isPublished || p.isDaily);
        setProblems(visibleProblems);
        setFilteredProblems(visibleProblems);
      } catch (error) {
        console.error("Failed to fetch problems:", error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, [user?.role]);

  useEffect(() => {
    const filterProblems = () => {
      let filtered = problems;

      if (search) {
        filtered = filtered.filter((problem) =>
          problem.title.toLowerCase().includes(search.toLowerCase())
        );
      }

      if (difficultyFilter) {
        filtered = filtered.filter(
          (problem) => problem.difficulty === difficultyFilter
        );
      }

      if (tagFilter) {
        filtered = filtered.filter((problem) =>
          problem.tags.some((tag) =>
            tag.toLowerCase().includes(tagFilter.toLowerCase())
          )
        );
      }

      setFilteredProblems(filtered);
      setCurrentPage(1); // Reset to first page when filters change
    };

    filterProblems();
  }, [search, difficultyFilter, tagFilter, problems]);

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const displayedProblems = filteredProblems.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-white text-xl">Loading problems...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-red-500 text-xl">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Navbar />
      <div className="container mx-auto px-4 pt-20">
        <h1 className="text-4xl font-bold text-white text-center mb-8">
          Welcome to CampusCodeWars!
        </h1>

        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <input
            type="text"
            placeholder="Search problems..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
          />

          <select
            value={difficultyFilter}
            onChange={(e) => setDifficultyFilter(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
          >
            <option value="">All Difficulties</option>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <input
            type="text"
            placeholder="Filter by tag..."
            value={tagFilter}
            onChange={(e) => setTagFilter(e.target.value)}
            className="p-2 rounded bg-gray-800 text-white border border-gray-700 focus:border-blue-500 focus:outline-none"
          />
        </div>

        {displayedProblems.length === 0 ? (
          <div className="text-center py-10">
            <p className="text-gray-400 text-lg">No problems found</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {displayedProblems.map((problem) => (
              <div
                key={problem._id}
                className="bg-gray-800 rounded-lg shadow-lg p-6 cursor-pointer hover:bg-gray-700 transition-all duration-300"
                onClick={() => navigate(`/problem/${problem._id}`)}
              >
                <div className="flex justify-between items-start mb-4">
                  <h2 className="text-xl font-semibold text-white">
                    {problem.title}
                  </h2>
                  <div className="flex flex-col items-end space-y-2">
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
                    {problem.isDaily && (
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-500/20 text-blue-400">
                        Daily Challenge
                      </span>
                    )}
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {problem.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-700 rounded-md text-xs text-gray-300"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <div className="flex justify-center mt-8 space-x-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-white">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() =>
                setCurrentPage((prev) => Math.min(prev + 1, totalPages))
              }
              disabled={currentPage === totalPages}
              className="px-4 py-2 bg-gray-700 text-white rounded disabled:opacity-50"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default HomePage;

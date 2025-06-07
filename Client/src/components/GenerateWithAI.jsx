import React, { useState } from 'react';
import axiosInstance from '../services/axiosInstance';

const GenerateWithAI = ({ onProblemGenerated, onClose }) => {
  const [mode, setMode] = useState('quick');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generationParams, setGenerationParams] = useState({
    difficulty: 'easy',
    tags: [],
    customPrompt: ''
  });
  const [tagInput, setTagInput] = useState('');

  const handleTagInput = (e) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      e.preventDefault();
      setGenerationParams({
        ...generationParams,
        tags: [...generationParams.tags, tagInput.trim()]
      });
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setGenerationParams({
      ...generationParams,
      tags: generationParams.tags.filter(tag => tag !== tagToRemove)
    });
  };

  const handleGenerate = async () => {
    try {
      setLoading(true);
      setError(null);

      // Validate input
      if (mode === 'custom' && !generationParams.customPrompt.trim()) {
        setError('Please provide custom requirements for the problem generation.');
        return;
      }

      const response = await axiosInstance.post('/problems/generate', {
        mode,
        ...generationParams
      });

      if (response.status === 201 && response.data) {
        onProblemGenerated(response.data);
        onClose();
      } else {
        setError(`Unexpected status code: ${response.status}`);
      }
    } catch (err) {
      console.error('Error generating problem:', err);
      
      // Handle specific error cases
      if (err.response?.status === 401) {
        setError('You must be logged in as an admin to generate problems.');
      } else if (err.response?.status === 403) {
        setError('You do not have permission to generate problems. Admin access required.');
      } else if (err.response?.data?.error) {
        // Show the specific error from the server
        setError(`Generation failed: ${err.response.data.error}`);
      } else if (err.message === 'Network Error') {
        setError('Unable to connect to the server. Please check your internet connection.');
      } else {
        setError(
          err.response?.data?.message || 
          err.message || 
          'Failed to generate problem. Please try again.'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-xl w-full max-w-2xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white">Generate Problem with AI</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500 rounded text-red-400">
            {error}
          </div>
        )}

        <div className="flex gap-4 mb-6">
          <button
            onClick={() => setMode('quick')}
            className={`flex-1 py-2 px-4 rounded transition-colors ${
              mode === 'quick' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Quick Generate
          </button>
          <button
            onClick={() => setMode('custom')}
            className={`flex-1 py-2 px-4 rounded transition-colors ${
              mode === 'custom' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Custom Generate
          </button>
        </div>

        {mode === 'quick' ? (
          <>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Difficulty Level
              </label>
              <select
                value={generationParams.difficulty}
                onChange={(e) => setGenerationParams({
                  ...generationParams,
                  difficulty: e.target.value
                })}
                className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-gray-100"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
              </select>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Problem Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {generationParams.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="bg-blue-600 text-white px-3 py-1 rounded-full text-sm flex items-center"
                  >
                    {tag}
                    <button
                      onClick={() => removeTag(tag)}
                      className="ml-2 text-blue-200 hover:text-white"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={handleTagInput}
                className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-gray-100"
                placeholder="Type a tag and press Enter (e.g., arrays, dynamic-programming)"
              />
            </div>
          </>
        ) : (
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Requirements
            </label>
            <textarea
              value={generationParams.customPrompt}
              onChange={(e) => setGenerationParams({
                ...generationParams,
                customPrompt: e.target.value
              })}
              className="w-full p-3 border border-gray-600 rounded bg-gray-700 text-gray-100"
              rows="6"
              placeholder="Describe your problem requirements here...
Example:
- Create a medium difficulty problem about binary trees
- Should involve traversal and recursion
- Include time and space complexity requirements
- Add constraints for tree size and node values"
            />
          </div>
        )}

        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Generating...
              </>
            ) : (
              'Generate Problem'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default GenerateWithAI;
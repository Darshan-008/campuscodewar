import { GoogleGenerativeAI } from "@google/generative-ai";
import Problem from "../models/Problem.js";
import Solution from "../models/Solution.js";

// Initialize Gemini with the correct model configuration
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-pro" });

// Common prompt template for consistent problem generation
const generatePromptTemplate = (mode, difficulty, tags, customPrompt) => {
  if (mode === 'quick') {
    return `You are a competitive programming problem generator. Create a ${difficulty} difficulty coding problem related to: ${tags.join(', ')}.
Output only a JSON object with no additional text. Structure:
{
  "title": "Short, descriptive title",
  "description": "Clear problem statement",
  "input_format": "Input specification",
  "output_format": "Output specification",
  "constraints": "Numerical and logical constraints",
  "examples": [
    {
      "input": "Example input",
      "output": "Example output",
      "explanation": "Clear explanation"
    }
  ],
  "test_cases": [
    {
      "input": "Test input",
      "output": "Expected output"
    }
  ]
}`;
  } else {
    return `${customPrompt}

Please ensure your response is a valid JSON object with exactly this structure:
{
  "title": "Problem title",
  "description": "Detailed problem description",
  "input_format": "Description of input format",
  "output_format": "Description of expected output format",
  "constraints": "List of constraints",
  "examples": [{"input": "", "output": "", "explanation": ""}],
  "test_cases": [{"input": "", "output": ""}]
}`;
  }
};

// Add a problem (Admin only)
export const addProblem = async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({ 
        message: "Only administrators can add problems manually" 
      });
    }

    const newProblem = new Problem({
      ...req.body,
      author: req.user.id,
      isDaily: req.body.isDaily || false
    });
    
    const savedProblem = await newProblem.save();
    res.status(201).json(savedProblem);
  } catch (error) {
    console.error("Error adding problem:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Generate problem using Gemini AI (Admin only)
export const generateProblem = async (req, res) => {
  try {
    console.log('Starting problem generation with params:', {
      mode: req.body.mode,
      difficulty: req.body.difficulty,
      tags: req.body.tags,
      hasCustomPrompt: !!req.body.customPrompt
    });

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY is missing from environment variables');
      throw new Error('GEMINI_API_KEY is not configured');
    }

    // Validate request
    const { mode, difficulty = 'medium', tags = [], customPrompt } = req.body;
    if (!mode || (mode === 'custom' && !customPrompt)) {
      return res.status(400).json({
        message: "Invalid request. Mode is required and customPrompt is required for custom mode."
      });
    }

    console.log('Initializing Gemini model with API key length:', process.env.GEMINI_API_KEY.length);

    // Generate the prompt
    const prompt = generatePromptTemplate(mode, difficulty, tags, customPrompt);
    console.log('Generated prompt template');

    // Generate content using the correct API structure for v0.1.3
    console.log('Calling Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('Received response from Gemini API');

    if (!text) {
      console.error('Empty response from Gemini');
      throw new Error('No response from Gemini AI');
    }

    console.log('Generated text length:', text.length);
    
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('Raw AI response:', text);
      throw new Error('No valid JSON found in AI response');
    }

    let parsedProblem;
    try {
      parsedProblem = JSON.parse(jsonMatch[0]);
      console.log('Successfully parsed JSON response');
    } catch (parseError) {
      console.error('JSON parsing error:', parseError);
      console.error('Failed JSON content:', jsonMatch[0]);
      throw new Error(`Failed to parse AI response as JSON: ${parseError.message}`);
    }

    // Validate required fields
    const requiredFields = ['title', 'description', 'input_format', 'output_format', 'examples', 'test_cases'];
    const missingFields = requiredFields.filter(field => !parsedProblem[field]);
    if (missingFields.length > 0) {
      console.error('Missing fields in parsed problem:', missingFields);
      console.error('Parsed problem structure:', Object.keys(parsedProblem));
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Create and save the problem
    const problemData = {
      ...parsedProblem,
      difficulty: difficulty,
      tags: tags,
      author: req.user._id,
      isDaily: false,
      generatedBy: 'gemini'
    };

    console.log('Creating new problem in database');
    const newProblem = new Problem(problemData);
    const savedProblem = await newProblem.save();
    console.log('Problem saved successfully with ID:', savedProblem._id);

    res.status(201).json(savedProblem);

  } catch (error) {
    console.error('Problem generation error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      message: "Failed to generate problem",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get all problems (with role-based filtering)
export const getAllProblems = async (req, res) => {
  try {
    let query = {};
    
    // If not admin, only show published problems and daily challenges
    if (req.user && req.user.role !== 'admin') {
      query = { 
        $or: [
          { isPublished: true },
          { isDaily: true }
        ]
      };
    }

    const problems = await Problem.find(query)
      .select('-test_cases') // Don't send test cases to client for security
      .populate('author', 'userName')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: problems
    });
  } catch (error) {
    console.error('Error fetching problems:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching problems',
      error: error.message
    });
  }
};

// Get problem by ID (with auth check)
export const getProblemById = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id)
      .populate('author', 'userName');

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found'
      });
    }

    // If user is not admin and problem is not published/daily
    if (req.user.role !== 'admin' && !problem.isPublished && !problem.isDaily) {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    // Fetch solutions separately
    const solutions = await Solution.find({ problem: problem._id })
      .populate('user', 'userName')
      .select('-code'); // Don't send solution code for security

    res.status(200).json({
      success: true,
      data: {
        ...problem.toObject(),
        solutions: solutions
      }
    });
  } catch (error) {
    console.error('Error fetching problem:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching problem',
      error: error.message
    });
  }
};

// Update problem
export const updateProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Only admin or problem author can update
    if (req.user.role !== 'admin' && problem.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to update this problem" });
    }

    const updatedProblem = await Problem.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    res.status(200).json(updatedProblem);
  } catch (error) {
    console.error("Error updating problem:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Delete problem
export const deleteProblem = async (req, res) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({ message: "Problem not found" });
    }

    // Only admin or problem author can delete
    if (req.user.role !== 'admin' && problem.author.toString() !== req.user.id) {
      return res.status(403).json({ message: "Unauthorized to delete this problem" });
    }

    await Problem.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Problem deleted successfully" });
  } catch (error) {
    console.error("Error deleting problem:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

// Get problems by user ID
export const getUserProblems = async (req, res) => {
  try {
    const problems = await Problem.find({ author: req.user.id })
      .sort({ createdAt: -1 });
    res.status(200).json(problems);
  } catch (error) {
    console.error("Error fetching user problems:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

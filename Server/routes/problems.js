import express from "express";
import Problem from "../models/Problem.js";
import {
  addProblem,
  generateProblem,
  getAllProblems,
  getProblemById,
  updateProblem,
  deleteProblem,
} from "../controllers/problems.js";
import { authMiddleware, adminMiddleware } from "../middleware/auth.js";

const router = express.Router();

// Admin only routes
router.post("/", authMiddleware, adminMiddleware, addProblem);
router.post("/generate", authMiddleware, adminMiddleware, generateProblem);
router.put("/:id", authMiddleware, adminMiddleware, updateProblem);
router.delete("/:id", authMiddleware, adminMiddleware, deleteProblem);

// Toggle problem publication status
router.patch(
  "/:id/toggle-visibility",
  authMiddleware,
  adminMiddleware,
  async (req, res) => {
    try {
      const problem = await Problem.findById(req.params.id);
      if (!problem) {
        return res.status(404).json({ message: "Problem not found" });
      }

      problem.isPublished = !problem.isPublished;
      await problem.save();

      res.json({
        message: "Problem visibility updated",
        isPublished: problem.isPublished,
      });
    } catch (error) {
      console.error("Error toggling problem visibility:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

// Get all problems (with role-based filtering)
router.get("/", authMiddleware, getAllProblems);

// Get problem by ID
router.get("/:id", authMiddleware, getProblemById);

// Get user's specific problems
router.get("/user/:userId", authMiddleware, async (req, res) => {
  try {
    // Add authorization check
    if (req.user.role !== "admin" && req.user._id !== req.params.userId) {
      return res.status(403).json({ message: "Access denied" });
    }

    const problems = await Problem.find({ author: req.params.userId }).sort({
      createdAt: -1,
    });
    res.json(problems);
  } catch (error) {
    console.error("Error fetching user problems:", error);
    res.status(500).json({ message: error.message });
  }
});

export default router;

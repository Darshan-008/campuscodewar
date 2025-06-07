import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
dotenv.config();

const listAvailableModels = async () => {
    try {
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        console.log("Checking available models...");
        const result = await genAI.getGenerativeModel({ model: "gemini-1.0-pro" }).generateContent("Test");
        console.log("Successfully connected to model");
        return true;
    } catch (error) {
        console.error("Error testing model connection:", error);
        return false;
    }
};

listAvailableModels();

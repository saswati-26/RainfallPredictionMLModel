import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { GoogleGenerativeAI } from "@google/generative-ai";
import createRecommendationRoutes from "./routes/recommendationRoutes.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(express.static("public"));

const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
if (!GEMINI_API_KEY) {
  console.error(
    "ERROR: GEMINI_API_KEY is not set in the .env file. Please get one from Google AI Studio."
  );
  process.exit(1);
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const recommendationRoutes = createRecommendationRoutes(model);
app.use("/", recommendationRoutes);

app.listen(port, () => {
  console.log(
    `Rainfall LLM Backend server running on http://localhost:${port}`
  );
  console.log(`Remember to set GEMINI_API_KEY in your .env file!`);
});

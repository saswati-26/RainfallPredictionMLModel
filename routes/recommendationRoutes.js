import express from "express";
import {
  getRainfallCategory,
  simulateRainfallPrediction,
} from "../utils/helpers.js";
import { getLLMRecommendations } from "../services/llmService.js";

export default function createRecommendationRoutes(model) {
  const router = express.Router();

  router.post("/predict-and-recommend", async (req, res) => {
    const { subdivision, year, month, language } = req.body;

    if (
      !subdivision ||
      typeof subdivision !== "string" ||
      !year ||
      typeof year !== "number" ||
      !month ||
      typeof month !== "number"
    ) {
      return res.status(400).json({
        error:
          "Subdivision (string), year (number), and month (number 1-12) are required.",
      });
    }
    if (month < 1 || month > 12) {
      return res
        .status(400)
        .json({ error: "Month must be an integer between 1 and 12." });
    }

    const lang = language || "en";

    try {
      const { rainfallAmount, rainClass } = simulateRainfallPrediction(
        subdivision,
        year,
        month
      );
      const rainfallCategory = getRainfallCategory(rainfallAmount);

      const [
        selfCareRecs,
        agricultureRecs,
        waterConservationRecs,
        stagnantWaterRecs,
      ] = await Promise.all([
        getLLMRecommendations(
          model,
          rainfallCategory,
          rainfallAmount,
          "self_care",
          lang
        ),
        getLLMRecommendations(
          model,
          rainfallCategory,
          rainfallAmount,
          "agriculture",
          lang
        ),
        getLLMRecommendations(
          model,
          rainfallCategory,
          rainfallAmount,
          "water_conservation_storage",
          lang
        ),
        getLLMRecommendations(
          model,
          rainfallCategory,
          rainfallAmount,
          "stagnant_water",
          lang
        ),
      ]);

      res.json({
        predictionInput: { subdivision, year, month, language: lang },
        predictedRainfall: {
          amount: rainfallAmount,
          category: rainfallCategory,
          willRain: rainClass,
        },
        recommendations: {
          selfCare: selfCareRecs,
          agriculture: agricultureRecs,
          waterConservationAndStorage: waterConservationRecs,
          stagnantWaterManagement: stagnantWaterRecs,
        },
      });
    } catch (error) {
      console.error(
        "ERROR: Failed to process prediction and recommendations:",
        error
      );
      res.status(500).json({
        error:
          "An internal server error occurred while processing your request.",
      });
    }
  });

  router.post("/get-recommendations", async (req, res) => {
    const { rainfallAmount, language } = req.body;

    if (rainfallAmount === undefined || typeof rainfallAmount !== "number") {
      return res
        .status(400)
        .json({ error: "rainfallAmount (number) is required." });
    }

    const rainfallCategory = getRainfallCategory(rainfallAmount);
    const lang = language || "en";

    try {
      const [
        selfCareRecs,
        agricultureRecs,
        waterConservationRecs,
        stagnantWaterRecs,
      ] = await Promise.all([
        getLLMRecommendations(
          model,
          rainfallCategory,
          rainfallAmount,
          "self_care",
          lang
        ),
        getLLMRecommendations(
          model,
          rainfallCategory,
          rainfallAmount,
          "agriculture",
          lang
        ),
        getLLMRecommendations(
          model,
          rainfallCategory,
          rainfallAmount,
          "water_conservation_storage",
          lang
        ),
        getLLMRecommendations(
          model,
          rainfallCategory,
          rainfallAmount,
          "stagnant_water",
          lang
        ),
      ]);

      res.json({
        inputRainfall: {
          amount: rainfallAmount,
          category: rainfallCategory,
          language: lang,
        },
        recommendations: {
          selfCare: selfCareRecs,
          agriculture: agricultureRecs,
          waterConservationAndStorage: waterConservationRecs,
          stagnantWaterManagement: stagnantWaterRecs,
        },
      });
    } catch (error) {
      console.error("ERROR: Failed to fetch recommendations directly:", error);
      res.status(500).json({
        error:
          "An internal server error occurred while fetching recommendations.",
      });
    }
  });

  router.get("/", (req, res) => {
    res.send(
      "Welcome to the Rainfall Prediction LLM Backend! Use /predict-and-recommend or /get-recommendations endpoints."
    );
  });

  return router;
}

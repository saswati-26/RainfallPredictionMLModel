export async function getLLMRecommendations(
  model,
  rainfallCategory,
  rainfallAmount,
  featureType,
  language = "en"
) {
  let prompt = "";
  const baseInstruction = `You are an AI assistant specialized in providing actionable advice related to rainfall. Provide concise recommendations in ${language}.`;

  switch (featureType) {
    case "self_care":
      if (rainfallCategory === "no_rain") {
        prompt = `${baseInstruction} There is no rain predicted. Provide self-care recommendations suitable for dry, possibly hot, weather conditions.`;
      } else {
        prompt = `${baseInstruction} Based on a ${rainfallCategory} rainfall of approximately ${rainfallAmount}mm, what self-care recommendations (e.g., clothing, health precautions, travel advice, daily activities) would you give?`;
      }
      break;
    case "agriculture":
      if (rainfallCategory === "no_rain") {
        prompt = `${baseInstruction} There is no rain predicted. Provide agriculture recommendations for dry weather, focusing on irrigation, crop selection, or drought management.`;
      } else {
        prompt = `${baseInstruction} Based on a ${rainfallCategory} rainfall of approximately ${rainfallAmount}mm, what agriculture recommendations (e.g., crop management, irrigation needs, pest/disease prevention, planting schedules) would you give?`;
      }
      break;
    case "water_conservation_storage":
      if (rainfallCategory === "heavy") {
        prompt = `${baseInstruction} There is a prediction of heavy rainfall (approximately ${rainfallAmount}mm). Provide recommendations on how to effectively save rainwater (harvesting methods), how to use the collected water, and for how many days one can safely store collected rainwater without attracting insects, assuming basic domestic collection methods (e.g., in clean covered barrels/tanks).`;
      } else if (rainfallCategory === "no_rain") {
        prompt = `${baseInstruction} There is no rain predicted. Provide recommendations on general household and community water conservation practices.`;
      } else {
        prompt = `${baseInstruction} Based on a ${rainfallCategory} rainfall of approximately ${rainfallAmount}mm, provide recommendations for general water conservation and basic rainwater collection strategies.`;
      }
      break;
    case "stagnant_water":
      if (rainfallCategory === "heavy" || rainfallCategory === "normal") {
        prompt = `${baseInstruction} Due to predicted ${rainfallCategory} rainfall (approximately ${rainfallAmount}mm), there is a significant risk of stagnant water. Provide recommendations on how to deal with stagnant water effectively to prevent health hazards like mosquito breeding and waterborne diseases.`;
      } else if (rainfallCategory === "light") {
        prompt = `${baseInstruction} Due to predicted light rainfall (approximately ${rainfallAmount}mm), there might be minor puddles. Provide recommendations on how to manage small stagnant water issues.`;
      } else {
        prompt = `${baseInstruction} There is no rain predicted. Provide general recommendations on maintaining a clean environment and preventing water stagnation from other sources.`;
      }
      break;
    default:
      return "Invalid feature type requested.";
  }

  try {
    console.log(
      `[LLM Call] Fetching ${featureType} in ${language} for ${rainfallCategory} rain (${rainfallAmount}mm)`
    );
    const result = await model.generateContent(prompt);
    const response = result.response;
    const text = response.text();
    return text;
  } catch (error) {
    console.error(
      `ERROR: Failed to generate content for ${featureType}:`,
      error
    );
    return `Sorry, I couldn't fetch recommendations for ${featureType} at the moment. Please ensure your API key is valid and try again later.`;
  }
}

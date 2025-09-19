const API_BASE_URL = "https://rainfallpredictionmlmodel.onrender.com";

const subdivisionInput = document.getElementById("subdivision");
const yearInput = document.getElementById("year");
const monthSelect = document.getElementById("month");
const langPredictSelect = document.getElementById("langPredict");
const requestRecsPredictCheckbox =
  document.getElementById("requestRecsPredict");
const recommendationCheckboxesPredict = document.getElementById(
  "recommendationCheckboxesPredict"
);
const selfCarePredictCheckbox = document.getElementById("selfCarePredict");
const agriculturePredictCheckbox =
  document.getElementById("agriculturePredict");
const waterConservationPredictCheckbox = document.getElementById(
  "waterConservationPredict"
);
const stagnantWaterPredictCheckbox = document.getElementById(
  "stagnantWaterPredict"
);
const getPredictionBtn = document.getElementById("getPredictionBtn");

const rainfallAmountInput = document.getElementById("rainfallAmount");
const langDirectSelect = document.getElementById("langDirect");
const selfCareDirectCheckbox = document.getElementById("selfCareDirect");
const agricultureDirectCheckbox = document.getElementById("agricultureDirect");
const waterConservationDirectCheckbox = document.getElementById(
  "waterConservationDirect"
);
const stagnantWaterDirectCheckbox = document.getElementById(
  "stagnantWaterDirect"
);
const getDirectRecsBtn = document.getElementById("getDirectRecsBtn");

const predictionResultsDiv = document.getElementById("predictionResults");
const predictionTextP = document.getElementById("predictionText");
const rainfallImageDiv = document.getElementById("rainfallImage");
const recommendationsDisplayDiv = document.getElementById(
  "recommendationsDisplay"
);
const selfCareRecsP = document.querySelector("#selfCareRecs p");
const agricultureRecsP = document.querySelector("#agricultureRecs p");
const waterConservationRecsP = document.querySelector(
  "#waterConservationRecs p"
);
const stagnantWaterRecsP = document.querySelector("#stagnantWaterRecs p");
const errorDisplayDiv = document.getElementById("errorDisplay");

requestRecsPredictCheckbox.addEventListener("change", () => {
  recommendationCheckboxesPredict.classList.toggle(
    "hidden",
    !requestRecsPredictCheckbox.checked
  );
});

getPredictionBtn.addEventListener("click", fetchPredictionAndRecommendations);
getDirectRecsBtn.addEventListener("click", fetchDirectRecommendations);

yearInput.value = new Date().getFullYear();

function showLoading(button) {
  button.disabled = true;
  button.textContent = "Loading...";
}

function hideLoading(button, originalText) {
  button.disabled = false;
  button.textContent = originalText;
}

function displayError(message) {
  errorDisplayDiv.textContent = `Error: ${message}`;
  errorDisplayDiv.classList.remove("hidden");
  predictionResultsDiv.classList.add("hidden");
  recommendationsDisplayDiv.classList.add("hidden");
  clearRecommendationsDisplay();
}

function clearError() {
  errorDisplayDiv.classList.add("hidden");
  errorDisplayDiv.textContent = "";
}

function clearRecommendationsDisplay() {
  document.querySelectorAll(".recommendation-item").forEach((item) => {
    item.classList.add("hidden");
    item.querySelector("p").textContent = "";
  });
  recommendationsDisplayDiv.classList.add("hidden");
}

async function fetchPredictionAndRecommendations() {
  clearError();
  clearRecommendationsDisplay();
  predictionResultsDiv.classList.add("hidden");

  const subdivision = subdivisionInput.value.trim();
  const year = parseInt(yearInput.value);
  const month = parseInt(monthSelect.value);
  const language = langPredictSelect.value;
  const requestRecs = requestRecsPredictCheckbox.checked;

  if (!subdivision || !year || !month) {
    displayError("Please fill in Subdivision, Year, and Month for prediction.");
    return;
  }

  showLoading(getPredictionBtn);

  try {
    const response = await fetch(`${API_BASE_URL}/predict-and-recommend`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ subdivision, year, month, language }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(
        data.error || "Failed to get prediction and recommendations."
      );
    }

    predictionResultsDiv.classList.remove("hidden");
    const { amount, category, willRain } = data.predictedRainfall;
    predictionTextP.textContent = `Predicted Rainfall for ${subdivision}, ${
      monthSelect.options[monthSelect.selectedIndex].text
    } ${year}: ${
      willRain ? `${amount}mm (${category} rain)` : "No rain predicted."
    }`;

    rainfallImageDiv.setAttribute("data-category", category);
    rainfallImageDiv.innerHTML = `<em>${category.replace(
      "_",
      " "
    )} rain visualization</em>`;

    if (requestRecs) {
      recommendationsDisplayDiv.classList.remove("hidden");
      const recs = data.recommendations;

      const updateRec = (checkbox, elementP, recText, parentDivId) => {
        if (checkbox.checked && recText) {
          document.getElementById(parentDivId).classList.remove("hidden");
          elementP.textContent = recText;
        } else {
          document.getElementById(parentDivId).classList.add("hidden");
        }
      };

      updateRec(
        selfCarePredictCheckbox,
        selfCareRecsP,
        recs.selfCare,
        "selfCareRecs"
      );
      updateRec(
        agriculturePredictCheckbox,
        agricultureRecsP,
        recs.agriculture,
        "agricultureRecs"
      );
      updateRec(
        waterConservationPredictCheckbox,
        waterConservationRecsP,
        recs.waterConservationAndStorage,
        "waterConservationRecs"
      );
      updateRec(
        stagnantWaterPredictCheckbox,
        stagnantWaterRecsP,
        recs.stagnantWaterManagement,
        "stagnantWaterRecs"
      );
    } else {
      recommendationsDisplayDiv.classList.add("hidden");
    }
  } catch (error) {
    console.error("Fetch error:", error);
    displayError(error.message);
  } finally {
    hideLoading(getPredictionBtn, "Get Rainfall Info");
  }
}

async function fetchDirectRecommendations() {
  clearError();
  clearRecommendationsDisplay();
  predictionResultsDiv.classList.add("hidden");

  const rainfallAmount = parseFloat(rainfallAmountInput.value);
  const language = langDirectSelect.value;

  if (isNaN(rainfallAmount) || rainfallAmount < 0) {
    displayError("Please enter a valid positive Rainfall Amount (mm).");
    return;
  }

  const requestedFeatures = {
    selfCare: selfCareDirectCheckbox.checked,
    agriculture: agricultureDirectCheckbox.checked,
    waterConservationAndStorage: waterConservationDirectCheckbox.checked,
    stagnantWaterManagement: stagnantWaterDirectCheckbox.checked,
  };

  if (!Object.values(requestedFeatures).some(Boolean)) {
    displayError("Please select at least one type of recommendation.");
    return;
  }

  showLoading(getDirectRecsBtn);

  try {
    const response = await fetch(`${API_BASE_URL}/get-recommendations`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ rainfallAmount, language }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to get direct recommendations.");
    }

    recommendationsDisplayDiv.classList.remove("hidden");
    const recs = data.recommendations;

    const updateRec = (checkbox, elementP, recText, parentDivId) => {
      if (checkbox.checked && recText) {
        document.getElementById(parentDivId).classList.remove("hidden");
        elementP.textContent = recText;
      } else {
        document.getElementById(parentDivId).classList.add("hidden");
      }
    };

    updateRec(
      selfCareDirectCheckbox,
      selfCareRecsP,
      recs.selfCare,
      "selfCareRecs"
    );
    updateRec(
      agricultureDirectCheckbox,
      agricultureRecsP,
      recs.agriculture,
      "agricultureRecs"
    );
    updateRec(
      waterConservationDirectCheckbox,
      waterConservationRecsP,
      recs.waterConservationAndStorage,
      "waterConservationRecs"
    );
    updateRec(
      stagnantWaterDirectCheckbox,
      stagnantWaterRecsP,
      recs.stagnantWaterManagement,
      "stagnantWaterRecs"
    );
  } catch (error) {
    console.error("Fetch error:", error);
    displayError(error.message);
  } finally {
    hideLoading(getDirectRecsBtn, "Get Recommendations");
  }
}

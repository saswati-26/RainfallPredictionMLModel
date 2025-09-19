export function getRainfallCategory(rainfallAmount) {
  if (rainfallAmount <= 0) {
    return "no_rain";
  } else if (rainfallAmount < 20) {
    return "light";
  } else if (rainfallAmount < 100) {
    return "normal";
  } else {
    return "heavy";
  }
}

export function simulateRainfallPrediction(subdivision, year, monthNum) {
  let rainfallAmount = 0;
  let rainClass = false;

  if ([6, 7, 8, 9].includes(monthNum)) {
    rainfallAmount = Math.floor(Math.random() * 200) + 70;
    rainClass = true;
  } else if ([10, 11, 12, 1, 2].includes(monthNum)) {
    rainfallAmount = Math.floor(Math.random() * 30);
    rainClass = rainfallAmount > 0;
  } else {
    rainfallAmount = Math.floor(Math.random() * 60) + 10;
    rainClass = rainfallAmount > 0;
  }

  if (subdivision.toLowerCase().includes("rajasthan"))
    rainfallAmount = Math.max(0, rainfallAmount - 50);
  if (subdivision.toLowerCase().includes("kerala")) rainfallAmount += 30;

  console.log(
    `[SIMULATION] Prediction for ${subdivision}, ${year}, Month ${monthNum}: ${rainfallAmount.toFixed(
      2
    )}mm, Rain: ${rainClass}`
  );
  return { rainfallAmount: parseFloat(rainfallAmount.toFixed(2)), rainClass };
}

import express from "express";
const router = express.Router();

router.route("/").post(async (req, res) => {
  const { options } = req.body;
  try {
    const results = await runGetCurrentWeather(req, options);
    res.status(200).json({ results });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal server error." });
  }
});

const runGetCurrentWeather = async (req: any, options: any) => {
  const { location, startDate, endDate } = options;
  const apiKey = process.env.VISUAL_CROSSING_API_KEY;
  console.log(`${location} ${startDate} ${endDate}`);

  let url = `https://weather.visualcrossing.com/VisualCrossingWebServices/rest/services/timeline/${location}`;

  if (startDate) url += `/${startDate}`;
  if (endDate) url += `/${endDate}`;

  url += `?key=${apiKey}`;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

    const data = await response.json();

    let result = `Weather for ${data.resolvedAddress} - ${data.description}\n`;

    for (let day of data.days) {
      const currentTempInCelcius = convertFahrenheitToCelsius(day.temp);
      const tempMaxInCelcius = convertFahrenheitToCelsius(day.tempmax);
      const tempMinInCelcius = convertFahrenheitToCelsius(day.tempmin);
      result += `On ${day.datetime}, temp: ${currentTempInCelcius}, max temp: ${tempMaxInCelcius}, min temp: ${tempMinInCelcius}, condition: ${day.conditions}\n`;
    }
    console.log(result);
    return result;
  } catch (error) {
    console.error(`Error fetching weather data:`, error);
    throw error;
  }
};

const convertFahrenheitToCelsius = (fahrenheit: any) => {
  let celsius = ((fahrenheit - 32) * 5) / 9;
  return celsius.toFixed(2);
};

export default router;

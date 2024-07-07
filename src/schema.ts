// Temperature: 31.0°C (87.8°F)\n' +
//     '- Condition: Light rain shower\n' +
//     '- Wind: 25.2 km/h from the south\n' +
//     '- Humidity: 71%\n' +
//     '- Cloud cover: 99%\n' +
//     '- Feels like: 37.7°C (99.8°F)\n' +
//     '- Precipitation: 0.71 mm\n' +
//     '- Visibility: 10.0 km (6.0 miles)\n' +
//     '- UV Index: 7.0\n' +

import { z } from "zod";

export const weatherSchema = z.object({
  temperature: z.string().describe("weather Temperature"),
  condition: z.string().describe("weather condition"),
  wind: z.string().describe("weather wind"),
  humidity: z.string().describe("weather humidity"),
});


interface NutritionData {
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber: number;
  sugar: number;
}

interface GeminiNutritionResponse {
  nutrition: NutritionData;
  confidence: number;
}

export class GeminiNutritionService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async getNutritionData(foodName: string, weight: number = 100): Promise<GeminiNutritionResponse> {
    const prompt = `
    Please provide accurate nutrition information for ${weight}g of "${foodName}".
    
    Return ONLY a JSON object in this exact format:
    {
      "nutrition": {
        "calories": <number>,
        "protein": <number>,
        "carbs": <number>,
        "fat": <number>,
        "fiber": <number>,
        "sugar": <number>
      },
      "confidence": <number between 0-1>
    }
    
    Ensure all values are accurate and based on reliable nutrition databases like USDA. 
    For Indian foods, use authentic recipes and ingredients.
    `;

    try {
      const response = await fetch(`${this.baseUrl}?key=${this.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      
      // Check if the response has the expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        throw new Error('Invalid response structure from Gemini API');
      }
      
      const text = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format from Gemini');
      }

      const nutritionData = JSON.parse(jsonMatch[0]);
      return nutritionData;
    } catch (error) {
      console.error('Error fetching nutrition data:', error);
      // Fallback to estimated values
      return {
        nutrition: {
          calories: Math.round((weight / 100) * 200), // Rough estimate
          protein: Math.round((weight / 100) * 8),
          carbs: Math.round((weight / 100) * 25),
          fat: Math.round((weight / 100) * 5),
          fiber: Math.round((weight / 100) * 3),
          sugar: Math.round((weight / 100) * 5)
        },
        confidence: 0.5
      };
    }
  }
}

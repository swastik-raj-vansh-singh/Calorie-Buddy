
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

  private createContextAwarePrompt(foodName: string, weight: number, unit: string): string {
    let quantityDescription: string;
    let contextualPrompt: string;

    // Create natural quantity descriptions based on unit
    switch (unit.toLowerCase()) {
      case 'quantity':
        quantityDescription = `${weight} ${weight === 1 ? 'piece' : 'pieces'} of ${foodName}`;
        contextualPrompt = `
        I need accurate nutrition information for ${quantityDescription}.
        
        Important context:
        - This is ${weight} individual ${weight === 1 ? 'item' : 'items'} of ${foodName}
        - For foods like roti, chapati, samosa, idli, dosa etc., calculate based on standard/typical size
        - For items like pizza, consider it as ${weight} ${weight === 1 ? 'slice' : 'slices'} of medium pizza unless specified otherwise
        - Don't convert to weight - calculate nutrition for the actual ${weight} ${weight === 1 ? 'piece' : 'pieces'}
        
        Calculate nutrition as if you were asked: "What's the nutrition in ${quantityDescription}?"
        `;
        break;

      case 'size':
        quantityDescription = `${weight} ${foodName}`;
        contextualPrompt = `
        I need accurate nutrition information for ${quantityDescription}.
        
        Important context:
        - This refers to size-based portions (small/medium/large)
        - For pizza: calculate for the specified size (small = ~200g slice, medium = ~300g slice, large = ~400g slice)
        - For other items, use standard size portions
        
        Calculate nutrition as if you were asked: "What's the nutrition in ${quantityDescription}?"
        `;
        break;

      case 'slices':
        quantityDescription = `${weight} ${weight === 1 ? 'slice' : 'slices'} of ${foodName}`;
        contextualPrompt = `
        I need accurate nutrition information for ${quantityDescription}.
        
        Important context:
        - This is ${weight} standard ${weight === 1 ? 'slice' : 'slices'} of ${foodName}
        - Use typical slice thickness and size for the food item
        
        Calculate nutrition as if you were asked: "What's the nutrition in ${quantityDescription}?"
        `;
        break;

      case 'ml':
        quantityDescription = `${weight}ml of ${foodName}`;
        contextualPrompt = `
        I need accurate nutrition information for ${quantityDescription}.
        
        Important context:
        - This is a liquid measurement
        - Calculate based on the liquid volume, not weight
        
        Calculate nutrition as if you were asked: "What's the nutrition in ${quantityDescription}?"
        `;
        break;

      case 'teaspoon':
        quantityDescription = `${weight} ${weight === 1 ? 'teaspoon' : 'teaspoons'} of ${foodName}`;
        contextualPrompt = `
        I need accurate nutrition information for ${quantityDescription}.
        
        Important context:
        - This is a volume measurement (1 teaspoon ≈ 5ml)
        - Usually used for spices, sugar, oil, etc.
        
        Calculate nutrition as if you were asked: "What's the nutrition in ${quantityDescription}?"
        `;
        break;

      case 'grams':
      default:
        quantityDescription = `${weight}g of ${foodName}`;
        contextualPrompt = `
        I need accurate nutrition information for ${quantityDescription}.
        
        Calculate nutrition as if you were asked: "What's the nutrition in ${quantityDescription}?"
        `;
        break;
    }

    return `
    ${contextualPrompt}
    
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
    Be precise with portion sizes - ${quantityDescription} should give realistic, accurate values.
    `;
  }

  async getNutritionData(foodName: string, weight: number = 100, unit: string = 'grams'): Promise<GeminiNutritionResponse> {
    const prompt = this.createContextAwarePrompt(foodName, weight, unit);
    
    console.log('Gemini API Request:', { foodName, weight, unit, prompt });

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
      // Unit-aware fallback estimation
      return this.getUnitAwareFallback(foodName, weight, unit);
    }
  }

  private getUnitAwareFallback(foodName: string, weight: number, unit: string): GeminiNutritionResponse {
    let multiplier: number;

    switch (unit.toLowerCase()) {
      case 'quantity':
        // For discrete items, use realistic per-piece estimates
        if (foodName.toLowerCase().includes('roti') || foodName.toLowerCase().includes('chapati')) {
          multiplier = weight * 80; // ~80 calories per roti
        } else if (foodName.toLowerCase().includes('pizza')) {
          multiplier = weight * 250; // ~250 calories per slice
        } else if (foodName.toLowerCase().includes('samosa')) {
          multiplier = weight * 150; // ~150 calories per samosa
        } else {
          multiplier = weight * 100; // Generic fallback per piece
        }
        break;
      
      case 'teaspoon':
        multiplier = weight * 4; // ~4 calories per teaspoon (varies by food)
        break;
      
      case 'ml':
        multiplier = weight * 0.5; // ~0.5 calories per ml (varies by liquid)
        break;
      
      case 'slices':
        multiplier = weight * 50; // ~50 calories per slice (varies by food)
        break;
      
      case 'grams':
      default:
        multiplier = (weight / 100) * 200; // Standard per 100g estimation
        break;
    }

    return {
      nutrition: {
        calories: Math.round(multiplier),
        protein: Math.round(multiplier * 0.1), // ~10% protein
        carbs: Math.round(multiplier * 0.15), // ~15% carbs  
        fat: Math.round(multiplier * 0.05), // ~5% fat
        fiber: Math.round(multiplier * 0.03), // ~3% fiber
        sugar: Math.round(multiplier * 0.05) // ~5% sugar
      },
      confidence: 0.3 // Low confidence for fallback
    };
  }
}

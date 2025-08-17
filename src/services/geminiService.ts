
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
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private createContextAwarePrompt(foodName: string, weight: number, unit: string): string {
    let quantityDescription: string;
    let contextualPrompt: string;

    // Create natural quantity descriptions based on unit
    switch (unit.toLowerCase()) {
      case 'quantity':
        quantityDescription = `${weight} whole ${weight === 1 ? 'piece' : 'pieces'} of ${foodName}`;
        contextualPrompt = `
        You are a professional nutritionist calculating precise nutrition for: ${quantityDescription}.
        
        CRITICAL CONTEXT:
        - This means ${weight} complete, whole ${weight === 1 ? 'item' : 'items'} of ${foodName}
        - For roti/chapati: standard Indian roti (6-7 inches, ~30g each)
        - For samosa: typical Indian samosa (medium size, ~50g each)
        - For idli: standard South Indian idli (~30g each)
        - For dosa: regular plain dosa (~60g each)
        - For burger: complete burger with bun and fillings
        - For pizza slice: regular triangular slice from 12-inch pizza
        - Calculate nutrition for exactly ${weight} complete ${weight === 1 ? 'serving' : 'servings'}
        
        Think step by step: "${quantityDescription}" means total nutrition from all ${weight} items combined.
        `;
        break;

      case 'size':
        quantityDescription = `1 ${weight}-sized ${foodName}`;
        contextualPrompt = `
        You are a professional nutritionist calculating precise nutrition for: ${quantityDescription}.
        
        CRITICAL PIZZA SIZE CONTEXT (if ${foodName} contains "pizza"):
        - Small pizza: 8-10 inches diameter, entire pizza = ~800-1200 calories
        - Medium pizza: 12 inches diameter, entire pizza = ~1500-2000 calories  
        - Large pizza: 14 inches diameter, entire pizza = ~2200-2800 calories
        
        For other foods, interpret size as:
        - Small: 70% of standard portion
        - Medium/Regular: Standard portion size
        - Large: 140% of standard portion
        
        Calculate nutrition for exactly 1 complete ${weight}-sized ${foodName}.
        `;
        break;

      case 'glass':
        quantityDescription = `${weight} ${weight === 1 ? 'glass' : 'glasses'} of ${foodName}`;
        contextualPrompt = `
        You are a professional nutritionist calculating precise nutrition for: ${quantityDescription}.
        
        CRITICAL GLASS SIZE CONTEXT:
        - 1 glass = typical Indian glass size (~200-250ml)
        - For chai/tea: standard Indian chai glass
        - For juice: regular drinking glass
        - For milk: standard milk glass
        - For water: standard water glass
        
        Calculate nutrition for exactly ${weight} ${weight === 1 ? 'glass' : 'glasses'} (${weight * 225}ml approximately).
        `;
        break;

      case 'slices':
        quantityDescription = `${weight} ${weight === 1 ? 'slice' : 'slices'} of ${foodName}`;
        contextualPrompt = `
        You are a professional nutritionist calculating precise nutrition for: ${quantityDescription}.
        
        CRITICAL CONTEXT:
        - This is ${weight} standard ${weight === 1 ? 'slice' : 'slices'} of ${foodName}
        - For bread: standard slice thickness (~25g each)
        - For cheese: typical slice thickness (~20g each)
        - For fruits: medium slice thickness
        
        Calculate nutrition for exactly ${weight} ${weight === 1 ? 'slice' : 'slices'}.
        `;
        break;

      case 'ml':
        quantityDescription = `${weight}ml of ${foodName}`;
        contextualPrompt = `
        You are a professional nutritionist calculating precise nutrition for: ${quantityDescription}.
        
        CRITICAL CONTEXT:
        - This is exactly ${weight} milliliters of liquid ${foodName}
        - Calculate based on liquid volume, not weight
        - For thick liquids (like lassi), account for density
        
        Calculate nutrition for exactly ${weight}ml of ${foodName}.
        `;
        break;

      case 'teaspoon':
        quantityDescription = `${weight} ${weight === 1 ? 'teaspoon' : 'teaspoons'} of ${foodName}`;
        contextualPrompt = `
        You are a professional nutritionist calculating precise nutrition for: ${quantityDescription}.
        
        CRITICAL CONTEXT:
        - 1 teaspoon = exactly 5ml volume
        - For sugar: ~4g per teaspoon
        - For oil: ~4.5g per teaspoon  
        - For honey: ~7g per teaspoon
        - For spices: varies by density
        
        Calculate nutrition for exactly ${weight} ${weight === 1 ? 'teaspoon' : 'teaspoons'}.
        `;
        break;

      case 'grams':
      default:
        quantityDescription = `${weight}g of ${foodName}`;
        contextualPrompt = `
        You are a professional nutritionist calculating precise nutrition for: ${quantityDescription}.
        
        Calculate nutrition for exactly ${weight} grams of ${foodName}.
        `;
        break;
    }

    return `
    ${contextualPrompt}
    
    INSTRUCTIONS:
    - Use USDA nutrition database values where possible
    - For Indian foods, use authentic traditional recipes and standard serving sizes
    - Consider actual food density, preparation methods, and typical ingredients
    - All values must be realistic and accurate for ${quantityDescription}
    - Double-check your calculations - this is for a nutrition tracking app
    
    Return ONLY a JSON object in this exact format:
    {
      "nutrition": {
        "calories": <precise number>,
        "protein": <precise number in grams>,
        "carbs": <precise number in grams>,
        "fat": <precise number in grams>,
        "fiber": <precise number in grams>,
        "sugar": <precise number in grams>
      },
      "confidence": <number between 0.8-1.0 (be confident in standard foods)>
    }
    
    Example: For "2 medium rotis", calculate total nutrition for both rotis combined.
    Example: For "1 large pizza", calculate nutrition for entire large pizza.
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

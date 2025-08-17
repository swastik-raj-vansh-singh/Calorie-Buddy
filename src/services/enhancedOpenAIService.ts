interface NutritionItem {
  name: string;
  quantity: number;
  unit: string;
  estimated_calories: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
}

interface NutritionResponse {
  items: NutritionItem[];
  total_calories: number;
  confidence: number;
}

export class EnhancedOpenAIService {
  private apiKey: string;
  private baseUrl = 'https://api.openai.com/v1/chat/completions';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  private getSystemPrompt(): string {
    return `You are a calorie estimation assistant for a health and fitness app. The user will describe what they ate using casual language like "1 cup tea with sugar" or "2 slices of pizza with Coke".

Your job is to:
1. Parse the input into structured food items with name, quantity, and unit.
2. Normalize vague inputs like "some sugar", "1 bowl", or "a plate" using common Indian food portions.
3. Estimate the calorie content for each item along with protein, carbs, fat, and fiber.
4. Return the result in strict JSON format like this:

{
  "items": [
    { 
      "name": "<food>", 
      "quantity": <number>, 
      "unit": "<unit>", 
      "estimated_calories": <number>,
      "protein": <number>,
      "carbs": <number>,
      "fat": <number>,
      "fiber": <number>
    }
  ],
  "total_calories": <number>
}

Portion size guidelines:
- "1 cup" = 240ml for liquids, 150-200g for solids
- "1 bowl" = 250ml for dal/curry, 150g for rice
- "1 plate" = 200-250g serving
- "some" or "little" = 1 teaspoon for condiments, 1 tablespoon for sides
- "a glass" = 200ml for Indian portions

For Indian foods, use traditional recipes and authentic portion sizes. If an input is unclear, assume a safe average. Do not add explanations, only return the JSON.`;
  }

  private getFewShotExamples(): Array<{role: string, content: string}> {
    return [
      {
        role: "user",
        content: "1 cup chai with 1 teaspoon sugar"
      },
      {
        role: "assistant",
        content: JSON.stringify({
          items: [
            { name: "chai", quantity: 1, unit: "cup", estimated_calories: 72, protein: 3, carbs: 10, fat: 3, fiber: 0 },
            { name: "sugar", quantity: 1, unit: "teaspoon", estimated_calories: 16, protein: 0, carbs: 4, fat: 0, fiber: 0 }
          ],
          total_calories: 88
        })
      },
      {
        role: "user",
        content: "cheese burst pizza with 1 coke"
      },
      {
        role: "assistant",
        content: JSON.stringify({
          items: [
            { name: "cheese burst pizza", quantity: 2, unit: "slice", estimated_calories: 600, protein: 24, carbs: 60, fat: 28, fiber: 3 },
            { name: "coke", quantity: 1, unit: "can", estimated_calories: 139, protein: 0, carbs: 39, fat: 0, fiber: 0 }
          ],
          total_calories: 739
        })
      },
      {
        role: "user",
        content: "1 plate dal chawal with curd and some sugar"
      },
      {
        role: "assistant",
        content: JSON.stringify({
          items: [
            { name: "dal", quantity: 1, unit: "cup", estimated_calories: 180, protein: 12, carbs: 30, fat: 1, fiber: 8 },
            { name: "rice", quantity: 1, unit: "cup", estimated_calories: 200, protein: 4, carbs: 45, fat: 0, fiber: 1 },
            { name: "curd", quantity: 0.5, unit: "cup", estimated_calories: 60, protein: 6, carbs: 8, fat: 2, fiber: 0 },
            { name: "sugar", quantity: 1, unit: "teaspoon", estimated_calories: 16, protein: 0, carbs: 4, fat: 0, fiber: 0 }
          ],
          total_calories: 456
        })
      },
      {
        role: "user",
        content: "2 samosas with green chutney and a cup of chai"
      },
      {
        role: "assistant",
        content: JSON.stringify({
          items: [
            { name: "samosa", quantity: 2, unit: "piece", estimated_calories: 260, protein: 6, carbs: 30, fat: 12, fiber: 3 },
            { name: "green chutney", quantity: 2, unit: "tablespoon", estimated_calories: 20, protein: 1, carbs: 3, fat: 1, fiber: 1 },
            { name: "chai", quantity: 1, unit: "cup", estimated_calories: 90, protein: 4, carbs: 12, fat: 4, fiber: 0 }
          ],
          total_calories: 370
        })
      },
      {
        role: "user",
        content: "had maggi and some ketchup"
      },
      {
        role: "assistant",
        content: JSON.stringify({
          items: [
            { name: "maggi noodles", quantity: 1, unit: "pack", estimated_calories: 350, protein: 8, carbs: 50, fat: 14, fiber: 2 },
            { name: "ketchup", quantity: 1, unit: "tablespoon", estimated_calories: 20, protein: 0, carbs: 5, fat: 0, fiber: 0 }
          ],
          total_calories: 370
        })
      }
    ];
  }

  async parseAndEstimateNutrition(input: string): Promise<NutritionResponse> {
    console.log('Enhanced OpenAI API Request:', { input });

    try {
      const messages = [
        { role: "system", content: this.getSystemPrompt() },
        ...this.getFewShotExamples(),
        { role: "user", content: input }
      ];

      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o',
          messages: messages,
          max_tokens: 800,
          temperature: 0.2, // Low temperature for consistent responses
          response_format: { type: "json_object" }
        })
      });

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${response.status} - ${response.statusText}`);
      }

      const data = await response.json();
      
      if (!data.choices || !data.choices[0] || !data.choices[0].message) {
        throw new Error('Invalid response structure from OpenAI API');
      }
      
      const content = data.choices[0].message.content;
      
      try {
        const parsed = JSON.parse(content);
        
        // Validate response structure
        if (!parsed.items || !Array.isArray(parsed.items) || typeof parsed.total_calories !== 'number') {
          throw new Error('Invalid response format from OpenAI');
        }

        // Add confidence score based on response quality
        const confidence = this.calculateConfidence(input, parsed);
        
        return {
          ...parsed,
          confidence
        };
      } catch (parseError) {
        console.error('Error parsing OpenAI response:', parseError);
        throw new Error('Failed to parse nutrition data from AI response');
      }
    } catch (error) {
      console.error('Error in parseAndEstimateNutrition:', error);
      
      // Fallback to intelligent estimation
      return this.getFallbackEstimation(input);
    }
  }

  private calculateConfidence(input: string, response: any): number {
    let confidence = 0.8; // Base confidence
    
    // Higher confidence for specific quantities
    if (/\d+/.test(input)) {
      confidence += 0.1;
    }
    
    // Higher confidence for common units
    if (/(cup|glass|plate|bowl|piece|slice)/.test(input.toLowerCase())) {
      confidence += 0.05;
    }
    
    // Lower confidence for vague terms
    if (/(some|little|bit|few)/.test(input.toLowerCase())) {
      confidence -= 0.1;
    }
    
    // Higher confidence for well-structured responses
    if (response.items && response.items.length > 0) {
      const hasCompleteNutrition = response.items.every((item: any) => 
        typeof item.protein === 'number' && 
        typeof item.carbs === 'number' && 
        typeof item.fat === 'number'
      );
      if (hasCompleteNutrition) {
        confidence += 0.05;
      }
    }
    
    return Math.min(Math.max(confidence, 0.3), 1.0); // Clamp between 0.3 and 1.0
  }

  private getFallbackEstimation(input: string): NutritionResponse {
    console.log('Using fallback estimation for:', input);
    
    // Simple pattern matching for common foods
    const words = input.toLowerCase().split(/[\s,]+/);
    const items: NutritionItem[] = [];
    
    // Extract quantity if present
    const quantityMatch = input.match(/(\d+)/);
    const quantity = quantityMatch ? parseInt(quantityMatch[1]) : 1;
    
    // Common food patterns
    if (words.some(w => ['roti', 'chapati'].includes(w))) {
      items.push({
        name: 'roti',
        quantity: quantity,
        unit: 'piece',
        estimated_calories: quantity * 80,
        protein: quantity * 3,
        carbs: quantity * 15,
        fat: quantity * 1,
        fiber: quantity * 2
      });
    }
    
    if (words.some(w => ['rice', 'chawal'].includes(w))) {
      items.push({
        name: 'rice',
        quantity: 1,
        unit: 'cup',
        estimated_calories: 200,
        protein: 4,
        carbs: 45,
        fat: 0,
        fiber: 1
      });
    }
    
    if (words.some(w => ['dal', 'lentil'].includes(w))) {
      items.push({
        name: 'dal',
        quantity: 1,
        unit: 'cup',
        estimated_calories: 180,
        protein: 12,
        carbs: 30,
        fat: 1,
        fiber: 8
      });
    }
    
    if (words.some(w => ['chai', 'tea'].includes(w))) {
      items.push({
        name: 'chai',
        quantity: quantity,
        unit: 'cup',
        estimated_calories: quantity * 90,
        protein: quantity * 4,
        carbs: quantity * 12,
        fat: quantity * 4,
        fiber: 0
      });
    }
    
    // If no patterns matched, create a generic item
    if (items.length === 0) {
      items.push({
        name: input.trim(),
        quantity: 1,
        unit: 'serving',
        estimated_calories: 150,
        protein: 5,
        carbs: 20,
        fat: 5,
        fiber: 2
      });
    }
    
    const total_calories = items.reduce((sum, item) => sum + item.estimated_calories, 0);
    
    return {
      items,
      total_calories,
      confidence: 0.3 // Low confidence for fallback
    };
  }

  // Method to test the service with sample inputs
  async testService(): Promise<void> {
    const testInputs = [
      "1 cup chai with sugar",
      "2 rotis with dal",
      "pizza and coke",
      "some rice with curd"
    ];
    
    console.log('Testing Enhanced OpenAI Service...');
    
    for (const input of testInputs) {
      try {
        const result = await this.parseAndEstimateNutrition(input);
        console.log(`Input: "${input}"`);
        console.log('Result:', result);
        console.log('---');
      } catch (error) {
        console.error(`Error testing "${input}":`, error);
      }
    }
  }
}
interface ParsedInput {
  items: Array<{
    name: string;
    quantity?: number;
    unit?: string;
    size?: string;
  }>;
}

export class InputParsingService {
  private apiKey: string;
  private baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent';

  constructor(apiKey: string) {
    this.apiKey = apiKey;
  }

  async parseUserInput(input: string): Promise<ParsedInput> {
    const prompt = `
    You are an expert food parsing AI. Parse this user input to extract food items with their quantities and units.
    
    User said: "${input}"
    
    Extract:
    1. Food names (clean, simple names)
    2. Quantities (numbers mentioned)
    3. Units (glasses, pieces, slices, small/medium/large, etc.)
    4. Sizes (small, medium, large, etc.)
    
    Examples:
    - "4 roti and 1 large pizza" → [{"name": "roti", "quantity": 4, "unit": "quantity"}, {"name": "pizza", "quantity": 1, "size": "large", "unit": "size"}]
    - "2 glasses of chai" → [{"name": "chai", "quantity": 2, "unit": "glass"}]
    - "3 samosa" → [{"name": "samosa", "quantity": 3, "unit": "quantity"}]
    - "pizza" → [{"name": "pizza", "quantity": 1, "unit": "size", "size": "medium"}]
    
    Return ONLY a JSON object in this format:
    {
      "items": [
        {
          "name": "food_name",
          "quantity": number,
          "unit": "quantity|glass|ml|grams|slices|teaspoon|size",
          "size": "small|medium|large" (only if unit is "size")
        }
      ]
    }
    
    Guidelines:
    - If no quantity mentioned, assume 1
    - For drinks, prefer "glass" unit over "ml"
    - For counted items (roti, samosa, etc.), use "quantity"
    - For pizza without size, default to "medium"
    - Extract actual food names, not descriptions
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
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        throw new Error('Invalid response structure');
      }
      
      const text = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return parsed;
    } catch (error) {
      console.error('Error parsing user input:', error);
      
      // Fallback parsing
      return this.fallbackParsing(input);
    }
  }

  private fallbackParsing(input: string): ParsedInput {
    const items = [];
    const words = input.toLowerCase().split(/[\s,]+/);
    
    // Simple pattern matching
    if (words.includes('pizza')) {
      const size = words.includes('large') ? 'large' : 
                   words.includes('small') ? 'small' : 'medium';
      items.push({ name: 'pizza', quantity: 1, unit: 'size', size });
    }
    
    if (words.includes('roti') || words.includes('chapati')) {
      const qty = this.extractNumber(input) || 1;
      items.push({ name: 'roti', quantity: qty, unit: 'quantity' });
    }
    
    if (words.includes('chai') || words.includes('tea')) {
      const qty = this.extractNumber(input) || 1;
      items.push({ name: 'chai', quantity: qty, unit: 'glass' });
    }
    
    // If no patterns matched, treat as single item
    if (items.length === 0) {
      items.push({ 
        name: input.trim(), 
        quantity: 1, 
        unit: 'grams' 
      });
    }
    
    return { items };
  }

  private extractNumber(text: string): number | null {
    const match = text.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  }
}
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { GeminiNutritionService } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X } from 'lucide-react';

interface ParsedFoodItem {
  name: string;
  type: 'solid' | 'liquid' | 'spice';
  unit: string;
  weight?: number;
  hasQuantity: boolean;
}

interface FoodParserProps {
  foodDescription: string;
  onItemsCalculated: (items: any[]) => void;
  onCancel: () => void;
  selectedMealType: string;
}

export const FoodParser: React.FC<FoodParserProps> = ({
  foodDescription,
  onItemsCalculated,
  onCancel,
  selectedMealType
}) => {
  const [parsedItems, setParsedItems] = useState<ParsedFoodItem[]>([]);
  const [itemWeights, setItemWeights] = useState<Record<string, number>>({});
  const [isParsing, setIsParsing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasParsed, setHasParsed] = useState(false);
  const { toast } = useToast();

  const geminiService = new GeminiNutritionService('AIzaSyCUtMTwF_zESPQltG94mT6TAixcf42-lUQ');

  const parseDescription = async () => {
    if (!foodDescription.trim()) return;
    
    setIsParsing(true);
    
    try {
      const parsePrompt = `
      You are a food quantity and calorie estimation expert.

      Given this user input: "${foodDescription}".
      
      Extract all food items and intelligently determine the correct unit for each one using real-world measurement units that people naturally use:

      - For liquids (like Coke, milk, juice), use **milliliters (ml)**
      - For general solids (like rice, bread, sabzi), use **grams (g)**
      - For spices or sugar/oil, use **teaspoons (tsp)** or **tablespoons (tbsp)**
      - For food items that are naturally counted (like Gulab Jamun, eggs, bananas), use **quantity (pieces)**
      - For pizza, use **size-based units**: small/medium/large pizza or slices
      - For cheese, use **cheese slice(s)**
      - For ice cream, determine if it's a **tub**, **cone**, or **candy** based on context
      - For Indian or cultural dishes (like samosa, dosa, chole bhature), use **quantity (pieces)**
      - For bread items (like roti, naan), use **quantity (pieces)**

      Check if quantity is already mentioned in the description. If yes, extract the amount and set hasQuantity to true.
      
      Return ONLY a JSON array in this exact format:
      [
        {
          "name": "food name",
          "type": "liquid|solid|spice|counted|sized",
          "unit": "ml|g|tsp|pieces|slices|size",
          "weight": <number if mentioned, otherwise null>,
          "hasQuantity": <true if quantity mentioned, false otherwise>
        }
      ]
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=AIzaSyCUtMTwF_zESPQltG94mT6TAixcf42-lUQ`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: parsePrompt
            }]
          }]
        })
      });

      const data = await response.json();
      const text = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const items = JSON.parse(jsonMatch[0]);
      setParsedItems(items);
      
      // Initialize weights for items that don't have quantity
      const weights: Record<string, number> = {};
      items.forEach((item: ParsedFoodItem) => {
        if (item.hasQuantity && item.weight) {
          weights[item.name] = item.weight;
        } else {
          // Set intelligent defaults based on unit type
          if (item.unit === 'ml') {
            weights[item.name] = 250; // ml for liquids
          } else if (item.unit === 'tsp') {
            weights[item.name] = 5; // teaspoons for spices
          } else if (item.unit === 'pieces' || item.unit === 'slices') {
            weights[item.name] = 1; // 1 piece/slice as default
          } else if (item.unit === 'size') {
            weights[item.name] = 1; // 1 size (medium) as default
          } else {
            weights[item.name] = 100; // grams for solids
          }
        }
      });
      setItemWeights(weights);
      setHasParsed(true);
      
    } catch (error) {
      console.error('Error parsing food description:', error);
    } finally {
      setIsParsing(false);
    }
  };

  const handleWeightChange = (itemName: string, weight: number) => {
    setItemWeights(prev => ({
      ...prev,
      [itemName]: weight
    }));
  };

  const calculateAllNutrition = async () => {
    setIsCalculating(true);
    
    try {
      const calculatedItems = [];
      
      for (const item of parsedItems) {
        const weight = itemWeights[item.name] || 100;
        
        try {
          const nutritionData = await geminiService.getNutritionData(item.name, weight);
          
          calculatedItems.push({
            id: Date.now() + Math.random(),
            name: `${item.name} (${weight}${item.unit})`,
            calories: nutritionData.nutrition.calories,
            protein: nutritionData.nutrition.protein,
            type: selectedMealType,
            weight,
            carbs: nutritionData.nutrition.carbs,
            fat: nutritionData.nutrition.fat,
            fiber: nutritionData.nutrition.fiber,
            aiEnhanced: true
          });
        } catch (error) {
          console.error(`Error calculating nutrition for ${item.name}:`, error);
          // Add with fallback values
          calculatedItems.push({
            id: Date.now() + Math.random(),
            name: `${item.name} (${weight}${item.unit})`,
            calories: Math.round((weight / 100) * 200),
            protein: Math.round((weight / 100) * 8),
            type: selectedMealType,
            weight,
            carbs: Math.round((weight / 100) * 25),
            fat: Math.round((weight / 100) * 5),
            fiber: Math.round((weight / 100) * 3),
            aiEnhanced: false
          });
        }
      }
      
      onItemsCalculated(calculatedItems);
      
    } catch (error) {
      console.error('Error calculating nutrition:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  React.useEffect(() => {
    parseDescription();
  }, []);

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/95 backdrop-blur-sm border-primary/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          🧠 Smart Food Parser
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Breaking down: "{foodDescription}"
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {isParsing && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" />
            Parsing food items with AI...
          </div>
        )}

        {hasParsed && parsedItems.length > 0 && (
          <>
            <div className="space-y-4">
              <h3 className="font-semibold text-foreground">Found Items:</h3>
              {parsedItems.map((item, index) => (
                <div key={index} className="bg-background/50 rounded-lg p-4 border border-border/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-medium text-foreground capitalize">{item.name}</h4>
                        <Badge variant="secondary" className="text-xs">
                          {item.type} • {item.unit}
                        </Badge>
                      </div>
                      
                      {!item.hasQuantity && (
                        <div className="space-y-2">
                          <label className="text-sm text-muted-foreground">
                            Enter quantity ({item.unit === 'size' ? 'small/medium/large' : item.unit}):
                          </label>
                          {item.unit === 'size' ? (
                            <select 
                              value={itemWeights[item.name] === 1 ? 'medium' : itemWeights[item.name] === 0.7 ? 'small' : 'large'}
                              onChange={(e) => {
                                const sizeValue = e.target.value === 'small' ? 0.7 : e.target.value === 'large' ? 1.5 : 1;
                                handleWeightChange(item.name, sizeValue);
                              }}
                              className="w-32 px-3 py-2 border border-border rounded-md bg-background"
                            >
                              <option value="small">Small</option>
                              <option value="medium">Medium</option>
                              <option value="large">Large</option>
                            </select>
                          ) : (
                            <Input
                              type="number"
                              value={itemWeights[item.name] || ''}
                              onChange={(e) => handleWeightChange(item.name, Number(e.target.value))}
                              placeholder={`e.g., ${item.unit === 'ml' ? '250' : item.unit === 'tsp' ? '5' : item.unit === 'pieces' || item.unit === 'slices' ? '1' : '100'}`}
                              className="w-32"
                            />
                          )}
                        </div>
                      )}
                      
                      {item.hasQuantity && (
                        <div className="text-sm text-green-600 flex items-center gap-1">
                          ✅ Quantity already specified: {item.weight}{item.unit}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex gap-3">
              <Button
                onClick={calculateAllNutrition}
                disabled={isCalculating || parsedItems.some(item => !item.hasQuantity && !itemWeights[item.name])}
                className="flex-1 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Calculating Nutrition...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add All to Meal
                  </>
                )}
              </Button>
              
              <Button variant="outline" onClick={onCancel}>
                <X className="mr-2 h-4 w-4" />
                Cancel
              </Button>
            </div>
          </>
        )}

        {hasParsed && parsedItems.length === 0 && (
          <div className="text-center text-muted-foreground">
            No food items found in the description. Please try rephrasing.
          </div>
        )}
      </CardContent>
    </Card>
  );
};
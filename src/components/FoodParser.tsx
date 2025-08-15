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
      The user said: "${foodDescription}".
      
      Break this down into individual food components.
      For each food item:
      - If it's a liquid (e.g., Coke, juice, milk, water), classify as "liquid" with unit "ml"
      - If it's a solid (e.g., pizza, rice, bread), classify as "solid" with unit "g"  
      - If it's a condiment/spice (e.g., sugar, oil, salt), classify as "spice" with unit "tsp"
      
      Check if quantity is already mentioned in the description. If yes, extract the weight and set hasQuantity to true.
      
      Return ONLY a JSON array in this exact format:
      [
        {
          "name": "food name",
          "type": "solid|liquid|spice",
          "unit": "g|ml|tsp",
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
      
      // Check if response has the expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts || !data.candidates[0].content.parts[0]) {
        throw new Error('Invalid API response structure');
      }
      
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
          weights[item.name] = item.type === 'liquid' ? 250 : item.type === 'spice' ? 5 : 100;
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
                            Enter quantity ({item.unit}):
                          </label>
                          <Input
                            type="number"
                            value={itemWeights[item.name] || ''}
                            onChange={(e) => handleWeightChange(item.name, Number(e.target.value))}
                            placeholder={`e.g., ${item.type === 'liquid' ? '250' : item.type === 'spice' ? '5' : '100'}`}
                            className="w-32"
                          />
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
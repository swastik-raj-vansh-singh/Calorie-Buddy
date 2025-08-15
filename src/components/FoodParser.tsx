import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GeminiNutritionService } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X } from 'lucide-react';

interface ParsedFoodItem {
  name: string;
  unit: string;
  weight?: number;
  hasQuantity: boolean;
  prompt: string;
  dropdownOptions: string[];
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
  const [itemWeights, setItemWeights] = useState<Record<string, string>>({});
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>({});
  const [isParsing, setIsParsing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasParsed, setHasParsed] = useState(false);
  const { toast } = useToast();

  const geminiService = new GeminiNutritionService('AIzaSyC9TTXCJFHUeRyhW8inLdQ42Fpw1amm1Go');

  // Smart unit detection logic
  const getSmartUnitForFood = (foodName: string): { unit: string; prompt: string; dropdownOptions: string[] } => {
    const food = foodName.toLowerCase();
    
    // Drinks/Liquids
    if (food.includes('coke') || food.includes('cola') || food.includes('juice') || 
        food.includes('milk') || food.includes('water') || food.includes('tea') || 
        food.includes('coffee') || food.includes('beer') || food.includes('wine') || 
        food.includes('soda') || food.includes('drink')) {
      return {
        unit: 'ml',
        prompt: `How many milliliters of ${foodName} did you have?`,
        dropdownOptions: ['ml', 'grams', 'quantity', 'slices', 'size', 'teaspoon']
      };
    }
    
    // Pizza
    if (food.includes('pizza')) {
      return {
        unit: 'size',
        prompt: `What was the pizza size?`,
        dropdownOptions: ['small', 'medium', 'regular', 'large']
      };
    }
    
    // Counted items
    if (food.includes('gulab jamun') || food.includes('samosa') || food.includes('dosa') || 
        food.includes('egg') || food.includes('banana') || food.includes('apple') || 
        food.includes('chole bhature') || food.includes('idli') || food.includes('vada') ||
        food.includes('paratha') || food.includes('naan') || food.includes('chapati') ||
        food.includes('roti')) {
      return {
        unit: 'quantity',
        prompt: `How many ${foodName}s did you have?`,
        dropdownOptions: ['quantity', 'grams', 'ml', 'slices', 'size', 'teaspoon']
      };
    }
    
    // Cheese
    if (food.includes('cheese')) {
      return {
        unit: 'slices',
        prompt: `How many slices of ${foodName} did you have?`,
        dropdownOptions: ['slices', 'grams', 'ml', 'quantity', 'size', 'teaspoon']
      };
    }
    
    // Ice cream (detect type)
    if (food.includes('ice cream')) {
      if (food.includes('cone')) {
        return {
          unit: 'quantity',
          prompt: `How many ice cream cones did you have?`,
          dropdownOptions: ['quantity', 'grams', 'ml', 'slices', 'size', 'teaspoon']
        };
      } else if (food.includes('tub') || food.includes('container')) {
        return {
          unit: 'grams',
          prompt: `How many grams of ${foodName} did you have?`,
          dropdownOptions: ['grams', 'ml', 'quantity', 'slices', 'size', 'teaspoon']
        };
      } else {
        return {
          unit: 'quantity',
          prompt: `How many servings of ${foodName} did you have?`,
          dropdownOptions: ['quantity', 'grams', 'ml', 'slices', 'size', 'teaspoon']
        };
      }
    }
    
    // Spices and condiments
    if (food.includes('sugar') || food.includes('salt') || food.includes('oil') || 
        food.includes('honey') || food.includes('jam') || food.includes('sauce') ||
        food.includes('spice') || food.includes('masala') || food.includes('powder')) {
      return {
        unit: 'teaspoon',
        prompt: `How many teaspoons of ${foodName} did you use?`,
        dropdownOptions: ['teaspoon', 'grams', 'ml', 'quantity', 'slices', 'size']
      };
    }
    
    // Default to grams for solids
    return {
      unit: 'grams',
      prompt: `How many grams of ${foodName} did you have?`,
      dropdownOptions: ['grams', 'ml', 'quantity', 'slices', 'size', 'teaspoon']
    };
  };

  const parseDescription = async () => {
    if (!foodDescription.trim()) return;
    
    setIsParsing(true);
    
    try {
      // Check if it's a single food item or multiple
      const isSingleItem = !foodDescription.includes(' and ') && 
                          !foodDescription.includes(',') && 
                          !foodDescription.includes(' with ') &&
                          foodDescription.split(' ').length <= 3;

      if (isSingleItem) {
        // Handle single food item directly with smart unit detection
        const smartUnit = getSmartUnitForFood(foodDescription.trim());
        const singleItem = {
          name: foodDescription.trim(),
          unit: smartUnit.unit,
          hasQuantity: false,
          weight: undefined,
          prompt: smartUnit.prompt,
          dropdownOptions: smartUnit.dropdownOptions
        };
        
        setParsedItems([singleItem]);
        setItemWeights({ [singleItem.name]: '' });
        setSelectedUnits({ [singleItem.name]: singleItem.unit });
        setHasParsed(true);
        setIsParsing(false);
        return;
      }

      const parsePrompt = `
      The user said: "${foodDescription}".
      
      Break this down into individual food components and extract just the food names.
      Return ONLY a JSON array of food names like: ["pizza", "coke", "gulab jamun"]
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=AIzaSyC9TTXCJFHUeRyhW8inLdQ42Fpw1amm1Go`, {
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
      
      // Handle API errors
      if (data.error) {
        throw new Error(`Gemini API error: ${data.error.message}`);
      }
      
      // Check if the response has the expected structure
      if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
        throw new Error('Invalid response structure from Gemini API');
      }
      
      const text = data.candidates[0].content.parts[0].text;
      
      const jsonMatch = text.match(/\[[\s\S]*?\]/);
      if (!jsonMatch) {
        throw new Error('Invalid response format');
      }

      const foodNames = JSON.parse(jsonMatch[0]);
      
      // Apply smart unit detection to each food item
      const smartItems = foodNames.map((name: string) => {
        const smartUnit = getSmartUnitForFood(name);
        return {
          name,
          unit: smartUnit.unit,
          hasQuantity: false,
          weight: undefined,
          prompt: smartUnit.prompt,
          dropdownOptions: smartUnit.dropdownOptions
        };
      });
      
      setParsedItems(smartItems);
      
      // Initialize weights and units
      const weights: Record<string, string> = {};
      const units: Record<string, string> = {};
      smartItems.forEach((item: ParsedFoodItem) => {
        weights[item.name] = '';
        units[item.name] = item.unit;
      });
      setItemWeights(weights);
      setSelectedUnits(units);
      setHasParsed(true);
      
    } catch (error) {
      console.error('Error parsing food description:', error);
      
      // Show user-friendly error message
      toast({
        title: "AI Service Temporarily Unavailable",
        description: "Using fallback parsing...",
        variant: "destructive",
      });
      
      // Fallback: try to parse manually
      const words = foodDescription.toLowerCase().split(/[\s,]+/);
      const fallbackItems = [];
      
      // Simple detection patterns with smart units
      if (words.includes('pizza')) {
        const smartUnit = getSmartUnitForFood('pizza');
        fallbackItems.push({ name: 'pizza', ...smartUnit, hasQuantity: false, weight: undefined });
      }
      if (words.includes('coke') || words.includes('cola')) {
        const smartUnit = getSmartUnitForFood('coke');
        fallbackItems.push({ name: 'coke', ...smartUnit, hasQuantity: false, weight: undefined });
      }
      if (words.includes('roti') || words.includes('chapati')) {
        const smartUnit = getSmartUnitForFood('roti');
        fallbackItems.push({ name: 'roti', ...smartUnit, hasQuantity: false, weight: undefined });
      }
      
      if (fallbackItems.length > 0) {
        setParsedItems(fallbackItems);
        const weights: Record<string, string> = {};
        const units: Record<string, string> = {};
        fallbackItems.forEach((item: any) => {
          weights[item.name] = '';
          units[item.name] = item.unit;
        });
        setItemWeights(weights);
        setSelectedUnits(units);
        setHasParsed(true);
      } else {
        setParsedItems([]);
        setHasParsed(true);
      }
    } finally {
      setIsParsing(false);
    }
  };

  const handleWeightChange = (itemName: string, weight: string) => {
    setItemWeights(prev => ({
      ...prev,
      [itemName]: weight
    }));
  };

  const handleUnitChange = (itemName: string, unit: string) => {
    setSelectedUnits(prev => ({
      ...prev,
      [itemName]: unit
    }));
  };

  const calculateAllNutrition = async () => {
    setIsCalculating(true);
    
    try {
      const calculatedItems = [];
      
      for (const item of parsedItems) {
        const weightStr = itemWeights[item.name] || '100';
        const weight = parseFloat(weightStr) || 100;
        const unit = selectedUnits[item.name] || item.unit;
        
        try {
          const nutritionData = await geminiService.getNutritionData(item.name, weight, unit);
          
          calculatedItems.push({
            id: Date.now() + Math.random(),
            name: `${item.name} (${weight} ${unit})`,
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
          const fallbackWeight = Math.max(weight, 1);
          calculatedItems.push({
            id: Date.now() + Math.random(),
            name: `${item.name} (${weight} ${unit})`,
            calories: Math.round((fallbackWeight / 100) * 200),
            protein: Math.round((fallbackWeight / 100) * 8),
            type: selectedMealType,
            weight: fallbackWeight,
            carbs: Math.round((fallbackWeight / 100) * 25),
            fat: Math.round((fallbackWeight / 100) * 5),
            fiber: Math.round((fallbackWeight / 100) * 3),
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
                          Smart Unit: {selectedUnits[item.name] || item.unit}
                        </Badge>
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">
                          {item.prompt}
                        </label>
                        
                        <div className="flex gap-2">
                          {selectedUnits[item.name] === 'size' ? (
                            <Select
                              value={itemWeights[item.name] || ''}
                              onValueChange={(value) => handleWeightChange(item.name, value)}
                            >
                              <SelectTrigger className="w-32">
                                <SelectValue placeholder="Select size" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="small">Small</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="regular">Regular</SelectItem>
                                <SelectItem value="large">Large</SelectItem>
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              type="number"
                              value={itemWeights[item.name] || ''}
                              onChange={(e) => handleWeightChange(item.name, e.target.value)}
                              placeholder="Enter amount"
                              className="w-32"
                            />
                          )}
                          
                          <Select
                            value={selectedUnits[item.name] || item.unit}
                            onValueChange={(value) => handleUnitChange(item.name, value)}
                          >
                            <SelectTrigger className="w-28">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {item.dropdownOptions.map((option) => (
                                <SelectItem key={option} value={option}>
                                  {option}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
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
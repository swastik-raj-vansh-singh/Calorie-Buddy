import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { GeminiNutritionService } from '@/services/geminiService';
import { InputParsingService } from '@/services/inputParsingService';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X } from 'lucide-react';

interface ParsedFoodItem {
  name: string;
  unit: string;
  weight?: string | number;
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
  const inputParsingService = new InputParsingService('AIzaSyC9TTXCJFHUeRyhW8inLdQ42Fpw1amm1Go');

  // Enhanced smart unit detection with glass support
  const getSmartUnitForFood = (foodName: string): { unit: string; prompt: string; dropdownOptions: string[] } => {
    const food = foodName.toLowerCase();
    
    // Drinks/Liquids - Glass as primary unit
    if (food.includes('chai') || food.includes('tea') || food.includes('coffee') ||
        food.includes('coke') || food.includes('cola') || food.includes('juice') || 
        food.includes('milk') || food.includes('water') || food.includes('beer') || 
        food.includes('wine') || food.includes('soda') || food.includes('drink') ||
        food.includes('lassi') || food.includes('smoothie')) {
      return {
        unit: 'glass',
        prompt: `Quantity`,
        dropdownOptions: ['glass', 'ml', 'quantity', 'grams', 'slices', 'teaspoon']
      };
    }
    
    // Pizza
    if (food.includes('pizza')) {
      return {
        unit: 'size',
        prompt: `Size`,
        dropdownOptions: ['small', 'medium', 'regular', 'large']
      };
    }
    
    // Counted items
    if (food.includes('gulab jamun') || food.includes('samosa') || food.includes('dosa') || 
        food.includes('egg') || food.includes('banana') || food.includes('apple') || 
        food.includes('chole bhature') || food.includes('idli') || food.includes('vada') ||
        food.includes('paratha') || food.includes('naan') || food.includes('chapati') ||
        food.includes('roti') || food.includes('burger') || food.includes('sandwich') ||
        food.includes('chips') || food.includes('cookie') || food.includes('biscuit')) {
      return {
        unit: 'quantity',
        prompt: `Quantity`,
        dropdownOptions: ['quantity', 'grams', 'glass', 'ml', 'slices', 'teaspoon']
      };
    }
    
    // Cheese and sliceable items
    if (food.includes('cheese') || food.includes('bread') || food.includes('cake')) {
      return {
        unit: 'slices',
        prompt: `Slices`,
        dropdownOptions: ['slices', 'grams', 'quantity', 'glass', 'ml', 'teaspoon']
      };
    }
    
    // Spices and condiments
    if (food.includes('sugar') || food.includes('salt') || food.includes('oil') || 
        food.includes('honey') || food.includes('jam') || food.includes('sauce') ||
        food.includes('spice') || food.includes('masala') || food.includes('powder') ||
        food.includes('ghee') || food.includes('butter')) {
      return {
        unit: 'teaspoon',
        prompt: `Teaspoons`,
        dropdownOptions: ['teaspoon', 'grams', 'ml', 'quantity', 'slices', 'glass']
      };
    }
    
    // Default to grams for solids
    return {
      unit: 'grams',
      prompt: `Weight (grams)`,
      dropdownOptions: ['grams', 'ml', 'quantity', 'slices', 'glass', 'teaspoon']
    };
  };

  const parseDescription = async () => {
    if (!foodDescription.trim()) return;
    
    setIsParsing(true);
    
    try {
      // Use AI-powered input parsing to extract quantities and units
      const parsedInput = await inputParsingService.parseUserInput(foodDescription);
      
      const smartItems = parsedInput.items.map((item) => {
        const smartUnit = getSmartUnitForFood(item.name);
        
        // Use parsed quantity and unit if available, otherwise use smart defaults
        const finalUnit = item.unit || smartUnit.unit;
        const finalQuantity = item.quantity || '';
        
        return {
          name: item.name,
          unit: finalUnit,
          hasQuantity: !!item.quantity,
          weight: finalQuantity,
          prompt: smartUnit.prompt,
          dropdownOptions: item.unit === 'size' ? ['small', 'medium', 'regular', 'large'] : smartUnit.dropdownOptions
        };
      });
      
      setParsedItems(smartItems);
      
      // Pre-fill weights and units based on AI parsing
      const weights: Record<string, string> = {};
      const units: Record<string, string> = {};
      
      smartItems.forEach((item: ParsedFoodItem) => {
        // Pre-fill with parsed data
        if (item.hasQuantity && item.weight) {
          weights[item.name] = item.weight.toString();
        } else {
          weights[item.name] = '';
        }
        units[item.name] = item.unit;
      });
      
      setItemWeights(weights);
      setSelectedUnits(units);
      setHasParsed(true);
      
    } catch (error) {
      console.error('Error parsing food description:', error);
      
      // Fallback to basic parsing
      const words = foodDescription.toLowerCase().split(/[\s,]+/);
      const fallbackItems = [];
      
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
      
      if (fallbackItems.length === 0) {
        // Treat entire input as single food item
        const smartUnit = getSmartUnitForFood(foodDescription.trim());
        fallbackItems.push({ 
          name: foodDescription.trim(), 
          ...smartUnit, 
          hasQuantity: false, 
          weight: undefined 
        });
      }
      
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
                        {item.hasQuantity && (
                          <Badge variant="secondary" className="text-xs bg-green-100 text-green-800">
                            ✓ Auto-detected
                          </Badge>
                        )}
                      </div>
                      
                      <div className="space-y-2">
                        <label className="text-sm text-muted-foreground font-medium">
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
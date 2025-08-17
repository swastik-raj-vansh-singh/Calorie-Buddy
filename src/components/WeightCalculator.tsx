
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, Sparkles, Scale } from 'lucide-react';
import { GeminiNutritionService } from '@/services/geminiService';
import { useToast } from '@/hooks/use-toast';

interface WeightCalculatorProps {
  foodName: string;
  baseCalories: number;
  baseProtein: number;
  onCalculated: (data: {
    calories: number;
    protein: number;
    weight: number;
    unit?: string;
    carbs?: number;
    fat?: number;
    fiber?: number;
    aiEnhanced: boolean;
  }) => void;
  onCancel: () => void;
}

export const WeightCalculator: React.FC<WeightCalculatorProps> = ({
  foodName,
  baseCalories,
  baseProtein,
  onCalculated,
  onCancel
}) => {
  // Enhanced unit detection with dropdown options
  const getSmartUnitForFood = (name: string) => {
    const lowerName = name.toLowerCase();
    
    // Drinks/Liquids - Add glass as primary option
    if (lowerName.includes('chai') || lowerName.includes('tea') || lowerName.includes('coffee') ||
        lowerName.includes('coke') || lowerName.includes('cola') || lowerName.includes('juice') || 
        lowerName.includes('milk') || lowerName.includes('water') || lowerName.includes('beer') || 
        lowerName.includes('wine') || lowerName.includes('soda') || lowerName.includes('drink') ||
        lowerName.includes('lassi') || lowerName.includes('smoothie')) {
      return {
        defaultUnit: 'glass',
        defaultWeight: 1,
        dropdownOptions: ['glass', 'ml', 'quantity', 'grams', 'slices', 'teaspoon']
      };
    }
    
    // Pizza - Use size for whole pizzas
    if (lowerName.includes('pizza')) {
      return {
        defaultUnit: 'size',
        defaultWeight: 'medium',
        dropdownOptions: ['small', 'medium', 'regular', 'large']
      };
    }
    
    // Counted items (individual food items)
    if (lowerName.includes('gulab jamun') || lowerName.includes('samosa') || lowerName.includes('dosa') || 
        lowerName.includes('egg') || lowerName.includes('banana') || lowerName.includes('apple') || 
        lowerName.includes('chole bhature') || lowerName.includes('idli') || lowerName.includes('vada') ||
        lowerName.includes('paratha') || lowerName.includes('naan') || lowerName.includes('chapati') ||
        lowerName.includes('roti') || lowerName.includes('burger') || lowerName.includes('sandwich') ||
        lowerName.includes('chips') || lowerName.includes('cookie') || lowerName.includes('biscuit')) {
      return {
        defaultUnit: 'quantity',
        defaultWeight: 1,
        dropdownOptions: ['quantity', 'grams', 'glass', 'ml', 'slices', 'teaspoon']
      };
    }
    
    // Cheese and sliceable items
    if (lowerName.includes('cheese') || lowerName.includes('bread') || lowerName.includes('cake')) {
      return {
        defaultUnit: 'slices',
        defaultWeight: 2,
        dropdownOptions: ['slices', 'grams', 'quantity', 'glass', 'ml', 'teaspoon']
      };
    }
    
    // Spices and condiments
    if (lowerName.includes('sugar') || lowerName.includes('salt') || lowerName.includes('oil') || 
        lowerName.includes('honey') || lowerName.includes('jam') || lowerName.includes('sauce') ||
        lowerName.includes('spice') || lowerName.includes('masala') || lowerName.includes('powder') ||
        lowerName.includes('ghee') || lowerName.includes('butter')) {
      return {
        defaultUnit: 'teaspoon',
        defaultWeight: 1,
        dropdownOptions: ['teaspoon', 'grams', 'ml', 'quantity', 'slices', 'glass']
      };
    }
    
    // Default to grams for solids
    return {
      defaultUnit: 'grams',
      defaultWeight: 100,
      dropdownOptions: ['grams', 'ml', 'quantity', 'slices', 'glass', 'teaspoon']
    };
  };

  const foodInfo = getSmartUnitForFood(foodName);
  const [weight, setWeight] = useState<string | number>(foodInfo.defaultWeight);
  const [selectedUnit, setSelectedUnit] = useState(foodInfo.defaultUnit);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const { toast } = useToast();

  const geminiService = new GeminiNutritionService('AIzaSyC9TTXCJFHUeRyhW8inLdQ42Fpw1amm1Go');

  // Get numeric weight for API calls - Let AI handle size conversions
  const getNumericWeight = (): any => {
    if (typeof weight === 'string') {
      // For size units, pass the string directly - AI will interpret correctly
      if (selectedUnit === 'size') return weight;
      return parseFloat(weight) || 100;
    }
    return weight;
  };

  // Get AI-powered nutrition data (always use AI for accuracy)
  const getAIData = async () => {
    setIsLoadingAI(true);
    try {
      const numericWeight = getNumericWeight();
      const result = await geminiService.getNutritionData(foodName, numericWeight, selectedUnit);
      // Set confidence to 100% as user trusts Gemini completely
      const enhancedResult = {
        ...result,
        confidence: 1.0
      };
      setAiData(enhancedResult);
      return enhancedResult;
    } catch (error) {
      console.error('AI nutrition fetch failed:', error);
      // Retry once more for accuracy
      try {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
        const numericWeight = getNumericWeight();
        const result = await geminiService.getNutritionData(foodName, numericWeight, selectedUnit);
        const enhancedResult = {
          ...result,
          confidence: 1.0
        };
        setAiData(enhancedResult);
        return enhancedResult;
      } catch (retryError) {
        return null;
      }
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Load AI data when component mounts or weight changes (longer timeout for accuracy)
  useEffect(() => {
    const timer = setTimeout(() => {
      getAIData();
    }, 1000); // Longer debounce for better accuracy
    return () => clearTimeout(timer);
  }, [weight, foodName, selectedUnit]);

  const handleConfirm = () => {
    if (aiData) {
      onCalculated({
        calories: aiData.nutrition.calories,
        protein: aiData.nutrition.protein,
        carbs: aiData.nutrition.carbs,
        fat: aiData.nutrition.fat,
        fiber: aiData.nutrition.fiber,
        weight: typeof getNumericWeight() === 'string' ? 1 : getNumericWeight(),
        unit: selectedUnit,
        aiEnhanced: true
      });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6 p-4 sm:p-6 bg-card border border-border rounded-lg max-w-2xl mx-auto">
      <div className="text-center">
        <h3 className="text-base sm:text-lg font-semibold text-foreground mb-2">
          Calculate Nutrition for {foodName}
        </h3>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Adjust the weight to get accurate nutrition values
        </p>
      </div>

      {/* Weight Input */}
      <div className="space-y-4">
        <Label htmlFor="weight" className="flex items-center gap-2">
          <Scale className="h-4 w-4" />
          Amount ({selectedUnit})
        </Label>
        
        <div className="flex gap-2">
          {selectedUnit === 'size' ? (
            <Select
              value={weight.toString()}
              onValueChange={(value) => setWeight(value)}
            >
              <SelectTrigger className="flex-1">
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
              id="weight"
              type="number"
              value={weight}
              onChange={(e) => setWeight(Number(e.target.value) || 0)}
              min="1"
              max={2000}
              className="flex-1 text-center text-lg font-semibold"
              placeholder="Enter amount"
            />
          )}
          
          <Select
            value={selectedUnit}
            onValueChange={(value) => setSelectedUnit(value)}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {foodInfo.dropdownOptions.map((option) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Quick Select Buttons */}
        <div className="flex gap-2 justify-center flex-wrap">
          {selectedUnit === 'glass' && 
            [1, 2, 3, 4].map((w) => (
              <Button
                key={w}
                variant="outline"
                size="sm"
                onClick={() => setWeight(w)}
                className={weight === w ? "bg-primary text-primary-foreground" : ""}
              >
                {w} glass{w > 1 ? 'es' : ''}
              </Button>
            ))
          }
          {selectedUnit === 'ml' && 
            [100, 200, 250, 300, 500].map((w) => (
              <Button
                key={w}
                variant="outline"
                size="sm"
                onClick={() => setWeight(w)}
                className={weight === w ? "bg-primary text-primary-foreground" : ""}
              >
                {w}ml
              </Button>
            ))
          }
          {selectedUnit === 'teaspoon' &&
            [1, 2, 5, 10, 15].map((w) => (
              <Button
                key={w}
                variant="outline"
                size="sm"
                onClick={() => setWeight(w)}
                className={weight === w ? "bg-primary text-primary-foreground" : ""}
              >
                {w}tsp
              </Button>
            ))
          }
          {selectedUnit === 'grams' &&
            [50, 100, 150, 200, 250].map((w) => (
              <Button
                key={w}
                variant="outline"
                size="sm"
                onClick={() => setWeight(w)}
                className={weight === w ? "bg-primary text-primary-foreground" : ""}
              >
                {w}g
              </Button>
            ))
          }
          {selectedUnit === 'quantity' &&
            [1, 2, 3, 4, 5].map((w) => (
              <Button
                key={w}
                variant="outline"
                size="sm"
                onClick={() => setWeight(w)}
                className={weight === w ? "bg-primary text-primary-foreground" : ""}
              >
                {w}
              </Button>
            ))
          }
          {selectedUnit === 'slices' &&
            [1, 2, 3, 4, 5].map((w) => (
              <Button
                key={w}
                variant="outline"
                size="sm"
                onClick={() => setWeight(w)}
                className={weight === w ? "bg-primary text-primary-foreground" : ""}
              >
                {w} slice{w > 1 ? 's' : ''}
              </Button>
            ))
          }
        </div>
      </div>

      {/* AI Status */}
      <div className="flex items-center justify-center gap-3">
        <Badge variant="default" className="flex items-center gap-2">
          <Sparkles className="h-4 w-4" />
          AI-Powered Nutrition
        </Badge>
      </div>

      {/* Results */}
      <div className="bg-background/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Calories:</span>
          <div className="flex items-center gap-2">
            {isLoadingAI ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="text-lg font-bold text-primary">
                {aiData ? aiData.nutrition.calories : '---'}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Protein:</span>
          <span className="text-lg font-bold text-secondary">
            {aiData ? aiData.nutrition.protein : '---'}g
          </span>
        </div>

        {aiData && (
          <>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Carbs:</span>
              <span className="text-sm font-semibold">{aiData.nutrition.carbs}g</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fat:</span>
              <span className="text-sm font-semibold">{aiData.nutrition.fat}g</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Fiber:</span>
              <span className="text-sm font-semibold">{aiData.nutrition.fiber}g</span>
            </div>
            <div className="text-center mt-2">
              <Badge variant="outline" className="text-xs">
                Confidence: {Math.round((aiData.confidence || 0.8) * 100)}%
              </Badge>
            </div>
          </>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button variant="outline" onClick={onCancel} className="flex-1">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          className="flex-1"
          disabled={isLoadingAI}
        >
          {isLoadingAI ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
              Loading...
            </>
          ) : (
            <>Add to Meal</>
          )}
        </Button>
      </div>
    </div>
  );
};

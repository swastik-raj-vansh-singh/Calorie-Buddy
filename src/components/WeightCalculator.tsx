
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
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
  // Detect food type and set appropriate unit and default weight
  const detectFoodType = (name: string) => {
    const lowerName = name.toLowerCase();
    
    // Liquids
    if (lowerName.includes('coke') || lowerName.includes('juice') || lowerName.includes('milk') || 
        lowerName.includes('water') || lowerName.includes('coffee') || lowerName.includes('tea') ||
        lowerName.includes('soda') || lowerName.includes('drink') || lowerName.includes('beer') ||
        lowerName.includes('wine') || lowerName.includes('smoothie') || lowerName.includes('shake')) {
      return { type: 'liquid', unit: 'ml', defaultWeight: 250 };
    }
    
    // Spices/condiments
    if (lowerName.includes('sugar') || lowerName.includes('salt') || lowerName.includes('oil') ||
        lowerName.includes('honey') || lowerName.includes('spice') || lowerName.includes('sauce') ||
        lowerName.includes('ketchup') || lowerName.includes('mayo') || lowerName.includes('butter') ||
        lowerName.includes('jam') || lowerName.includes('cream') || lowerName.includes('syrup')) {
      return { type: 'spice', unit: 'tsp', defaultWeight: 5 };
    }
    
    // Default to solid
    return { type: 'solid', unit: 'g', defaultWeight: 100 };
  };

  const foodTypeInfo = detectFoodType(foodName);
  const [weight, setWeight] = useState(foodTypeInfo.defaultWeight);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const { toast } = useToast();

  const geminiService = new GeminiNutritionService('AIzaSyCUtMTwF_zESPQltG94mT6TAixcf42-lUQ');

  // Get AI-powered nutrition data (always use AI for accuracy)
  const getAIData = async () => {
    setIsLoadingAI(true);
    try {
      const result = await geminiService.getNutritionData(foodName, weight);
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
        const result = await geminiService.getNutritionData(foodName, weight);
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
  }, [weight, foodName]);

  const handleConfirm = () => {
    if (aiData) {
      onCalculated({
        calories: aiData.nutrition.calories,
        protein: aiData.nutrition.protein,
        carbs: aiData.nutrition.carbs,
        fat: aiData.nutrition.fat,
        fiber: aiData.nutrition.fiber,
        weight,
        unit: foodTypeInfo.unit,
        aiEnhanced: true
      });
    }
  };

  return (
    <div className="space-y-6 p-6 bg-card border border-border rounded-lg">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Calculate Nutrition for {foodName}
        </h3>
        <p className="text-sm text-muted-foreground">
          Adjust the weight to get accurate nutrition values
        </p>
      </div>

      {/* Weight Input */}
      <div className="space-y-2">
        <Label htmlFor="weight" className="flex items-center gap-2">
          <Scale className="h-4 w-4" />
          {foodTypeInfo.type === 'liquid' ? 'Volume (milliliters)' : 
           foodTypeInfo.type === 'spice' ? 'Amount (teaspoons)' : 
           'Weight (grams)'}
        </Label>
        <Input
          id="weight"
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          min="1"
          max={foodTypeInfo.type === 'liquid' ? 2000 : foodTypeInfo.type === 'spice' ? 50 : 2000}
          className="text-center text-lg font-semibold"
        />
        <div className="flex gap-2 justify-center flex-wrap">
          {foodTypeInfo.type === 'liquid' ? 
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
            )) :
           foodTypeInfo.type === 'spice' ?
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
            )) :
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

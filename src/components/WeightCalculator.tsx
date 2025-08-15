
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
  const [weight, setWeight] = useState(100);
  const [isLoadingAI, setIsLoadingAI] = useState(false);
  const [aiData, setAiData] = useState<any>(null);
  const [useAI, setUseAI] = useState(true);
  const { toast } = useToast();

  const geminiService = new GeminiNutritionService('AIzaSyCUtMTwF_zESPQltG94mT6TAixcf42-lUQ');

  // Calculate based on weight proportion
  const calculateBasic = () => {
    const multiplier = weight / 100;
    return {
      calories: Math.round(baseCalories * multiplier),
      protein: Math.round(baseProtein * multiplier * 10) / 10,
      weight,
      aiEnhanced: false
    };
  };

  // Get AI-enhanced nutrition data
  const getAIData = async () => {
    if (!useAI) return null;
    
    setIsLoadingAI(true);
    try {
      const result = await geminiService.getNutritionData(foodName, weight);
      setAiData(result);
      return result;
    } catch (error) {
      console.error('AI nutrition fetch failed:', error);
      toast({
        title: "AI Enhancement Failed",
        description: "Using standard calculation instead",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsLoadingAI(false);
    }
  };

  // Load AI data when component mounts or weight changes
  useEffect(() => {
    if (useAI) {
      const timer = setTimeout(() => {
        getAIData();
      }, 500); // Debounce
      return () => clearTimeout(timer);
    }
  }, [weight, useAI, foodName]);

  const handleConfirm = () => {
    if (aiData && useAI) {
      onCalculated({
        calories: aiData.nutrition.calories,
        protein: aiData.nutrition.protein,
        carbs: aiData.nutrition.carbs,
        fat: aiData.nutrition.fat,
        fiber: aiData.nutrition.fiber,
        weight,
        aiEnhanced: true
      });
    } else {
      onCalculated(calculateBasic());
    }
  };

  const basicCalc = calculateBasic();
  const showingAI = aiData && useAI;

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
          Weight (grams)
        </Label>
        <Input
          id="weight"
          type="number"
          value={weight}
          onChange={(e) => setWeight(Number(e.target.value))}
          min="1"
          max="2000"
          className="text-center text-lg font-semibold"
        />
        <div className="flex gap-2 justify-center">
          {[50, 100, 150, 200, 250].map((w) => (
            <Button
              key={w}
              variant="outline"
              size="sm"
              onClick={() => setWeight(w)}
              className={weight === w ? "bg-primary text-primary-foreground" : ""}
            >
              {w}g
            </Button>
          ))}
        </div>
      </div>

      {/* AI Toggle */}
      <div className="flex items-center justify-center gap-3">
        <Button
          variant={useAI ? "default" : "outline"}
          size="sm"
          onClick={() => setUseAI(!useAI)}
          className="flex items-center gap-2"
        >
          <Sparkles className="h-4 w-4" />
          AI Enhanced
        </Button>
        <Badge variant={useAI ? "default" : "secondary"}>
          {useAI ? "AI Mode" : "Basic Mode"}
        </Badge>
      </div>

      {/* Results */}
      <div className="bg-background/50 rounded-lg p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Calories:</span>
          <div className="flex items-center gap-2">
            {isLoadingAI && useAI ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <span className="text-lg font-bold text-primary">
                {showingAI ? aiData.nutrition.calories : basicCalc.calories}
              </span>
            )}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium">Protein:</span>
          <span className="text-lg font-bold text-secondary">
            {showingAI ? aiData.nutrition.protein : basicCalc.protein}g
          </span>
        </div>

        {showingAI && (
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

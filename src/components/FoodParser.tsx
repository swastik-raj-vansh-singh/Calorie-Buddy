import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { OpenAINutritionService } from "@/services/openaiService";
import { OpenAIInputParsingService } from "@/services/openaiInputParsingService";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X } from "lucide-react";

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
  selectedMealType,
}) => {
  const [parsedItems, setParsedItems] = useState<ParsedFoodItem[]>([]);
  const [itemWeights, setItemWeights] = useState<Record<string, string>>({});
  const [selectedUnits, setSelectedUnits] = useState<Record<string, string>>(
    {}
  );
  const [isParsing, setIsParsing] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasParsed, setHasParsed] = useState(false);
  const { toast } = useToast();

  const openaiService = new OpenAINutritionService(
    import.meta.env.VITE_OPENAI_API_KEY
  );
  const inputParsingService = new OpenAIInputParsingService(
    import.meta.env.VITE_OPENAI_API_KEY
  );

  // Enhanced smart unit detection with glass support
  const getSmartUnitForFood = (
    foodName: string
  ): { unit: string; prompt: string; dropdownOptions: string[] } => {
    const food = foodName.toLowerCase();

    // Drinks/Liquids - Glass as primary unit
    if (
      food.includes("chai") ||
      food.includes("tea") ||
      food.includes("coffee") ||
      food.includes("coke") ||
      food.includes("cola") ||
      food.includes("juice") ||
      food.includes("milk") ||
      food.includes("water") ||
      food.includes("beer") ||
      food.includes("wine") ||
      food.includes("soda") ||
      food.includes("drink") ||
      food.includes("lassi") ||
      food.includes("smoothie")
    ) {
      return {
        unit: "glass",
        prompt: `Quantity`,
        dropdownOptions: [
          "glass",
          "ml",
          "quantity",
          "grams",
          "slices",
          "teaspoon",
        ],
      };
    }

    // Pizza
    if (food.includes("pizza")) {
      return {
        unit: "size",
        prompt: `Size`,
        dropdownOptions: ["small", "medium", "regular", "large"],
      };
    }

    // Counted items
    if (
      food.includes("gulab jamun") ||
      food.includes("samosa") ||
      food.includes("dosa") ||
      food.includes("egg") ||
      food.includes("banana") ||
      food.includes("apple") ||
      food.includes("chole bhature") ||
      food.includes("idli") ||
      food.includes("vada") ||
      food.includes("paratha") ||
      food.includes("naan") ||
      food.includes("chapati") ||
      food.includes("roti") ||
      food.includes("burger") ||
      food.includes("sandwich") ||
      food.includes("chips") ||
      food.includes("cookie") ||
      food.includes("biscuit")
    ) {
      return {
        unit: "quantity",
        prompt: `Quantity`,
        dropdownOptions: [
          "quantity",
          "grams",
          "glass",
          "ml",
          "slices",
          "teaspoon",
        ],
      };
    }

    // Cheese and sliceable items
    if (
      food.includes("cheese") ||
      food.includes("bread") ||
      food.includes("cake")
    ) {
      return {
        unit: "slices",
        prompt: `Slices`,
        dropdownOptions: [
          "slices",
          "grams",
          "quantity",
          "glass",
          "ml",
          "teaspoon",
        ],
      };
    }

    // Spices and condiments
    if (
      food.includes("sugar") ||
      food.includes("salt") ||
      food.includes("oil") ||
      food.includes("honey") ||
      food.includes("jam") ||
      food.includes("sauce") ||
      food.includes("spice") ||
      food.includes("masala") ||
      food.includes("powder") ||
      food.includes("ghee") ||
      food.includes("butter")
    ) {
      return {
        unit: "teaspoon",
        prompt: `Teaspoons`,
        dropdownOptions: [
          "teaspoon",
          "grams",
          "ml",
          "quantity",
          "slices",
          "glass",
        ],
      };
    }

    // Default to grams for solids
    return {
      unit: "grams",
      prompt: `Weight (grams)`,
      dropdownOptions: [
        "grams",
        "ml",
        "quantity",
        "slices",
        "glass",
        "teaspoon",
      ],
    };
  };

  const parseDescription = async () => {
    if (!foodDescription.trim()) return;

    setIsParsing(true);

    try {
      // Use AI-powered input parsing to extract quantities and units
      const parsedInput = await inputParsingService.parseUserInput(
        foodDescription
      );

      const smartItems = parsedInput.items.map((item) => {
        const smartUnit = getSmartUnitForFood(item.name);

        // Use parsed quantity and unit if available, otherwise use smart defaults
        const finalUnit = item.unit || smartUnit.unit;
        const finalQuantity = item.quantity || "";

        return {
          name: item.name,
          unit: finalUnit,
          hasQuantity: !!item.quantity,
          weight: finalQuantity,
          prompt: smartUnit.prompt,
          dropdownOptions:
            item.unit === "size"
              ? ["small", "medium", "regular", "large"]
              : smartUnit.dropdownOptions,
        };
      });

      setParsedItems(smartItems);

      // Pre-fill weights and units based on AI parsing
      const weights: Record<string, string> = {};
      const units: Record<string, string> = {};

      // Create an array to store auto-detected items for nutrition calculation
      const autoDetectedItems = [];
      
      smartItems.forEach((item: ParsedFoodItem) => {
        // Pre-fill with parsed data
        if (item.hasQuantity && item.weight) {
          weights[item.name] = item.weight.toString();
          // Add to list for nutrition calculation
          autoDetectedItems.push(item);
        } else {
          weights[item.name] = "";
        }
        units[item.name] = item.unit;
      });
      
      // Calculate nutrition for auto-detected items
      if (autoDetectedItems.length > 0) {
        setTimeout(async () => {
          const calculatedItems = [];
          
          for (const item of autoDetectedItems) {
            try {
              const nutritionData = await calculateNutritionForItem(
                item.name, 
                item.weight?.toString() || "100", 
                item.unit
              );
              
              if (nutritionData) {
                calculatedItems.push({
                  id: Date.now() + Math.random(),
                  name: `${item.name} (${item.weight} ${item.unit})`,
                  calories: nutritionData.nutrition.calories,
                  protein: nutritionData.nutrition.protein,
                  type: selectedMealType,
                  weight: parseFloat(item.weight?.toString() || "100"),
                  carbs: nutritionData.nutrition.carbs,
                  fat: nutritionData.nutrition.fat,
                  fiber: nutritionData.nutrition.fiber,
                  aiEnhanced: true,
                });
              }
            } catch (error) {
              console.error(`Error pre-calculating nutrition for ${item.name}:`, error);
            }
          }
          
          if (calculatedItems.length > 0) {
            onItemsCalculated(calculatedItems);
          }
        }, 500);
      }

      setItemWeights(weights);
      setSelectedUnits(units);
      setHasParsed(true);
    } catch (error) {
      console.error("Error parsing food description:", error);

      // Fallback to basic parsing
      const words = foodDescription.toLowerCase().split(/[\s,]+/);
      const fallbackItems = [];

      if (words.includes("pizza")) {
        const smartUnit = getSmartUnitForFood("pizza");
        fallbackItems.push({
          name: "pizza",
          ...smartUnit,
          hasQuantity: false,
          weight: undefined,
        });
      }
      if (words.includes("coke") || words.includes("cola")) {
        const smartUnit = getSmartUnitForFood("coke");
        fallbackItems.push({
          name: "coke",
          ...smartUnit,
          hasQuantity: false,
          weight: undefined,
        });
      }
      if (words.includes("roti") || words.includes("chapati")) {
        const smartUnit = getSmartUnitForFood("roti");
        fallbackItems.push({
          name: "roti",
          ...smartUnit,
          hasQuantity: false,
          weight: undefined,
        });
      }

      if (fallbackItems.length === 0) {
        // Treat entire input as single food item
        const smartUnit = getSmartUnitForFood(foodDescription.trim());
        fallbackItems.push({
          name: foodDescription.trim(),
          ...smartUnit,
          hasQuantity: false,
          weight: undefined,
        });
      }

      setParsedItems(fallbackItems);
      const weights: Record<string, string> = {};
      const units: Record<string, string> = {};
      fallbackItems.forEach((item: any) => {
        weights[item.name] = "";
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
    setItemWeights((prev) => ({
      ...prev,
      [itemName]: weight,
    }));
  };

  const handleUnitChange = (itemName: string, unit: string) => {
    setSelectedUnits((prev) => ({
      ...prev,
      [itemName]: unit,
    }));
  };

  const calculateNutritionForItem = async (itemName: string, weightStr: string, unitStr: string) => {
    const weight = parseFloat(weightStr) || 100;
    const unit = unitStr || "grams";
    
    try {
      return await openaiService.getNutritionData(
        itemName,
        weight,
        unit
      );
    } catch (error) {
      console.error(`Error calculating nutrition for ${itemName}:`, error);
      return null;
    }
  };

  const calculateAllNutrition = async () => {
    setIsCalculating(true);

    try {
      const calculatedItems = [];

      for (const item of parsedItems) {
        const weightStr = itemWeights[item.name] || "100";
        const weight = parseFloat(weightStr) || 100;
        const unit = selectedUnits[item.name] || item.unit;

        try {
          const nutritionData = await openaiService.getNutritionData(
            item.name,
            weight,
            unit
          );

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
            aiEnhanced: true,
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
            aiEnhanced: false,
          });
        }
      }

      onItemsCalculated(calculatedItems);
    } catch (error) {
      console.error("Error calculating nutrition:", error);
    } finally {
      setIsCalculating(false);
    }
  };

  React.useEffect(() => {
    parseDescription();
  }, []);

  return (
    <Card className="w-full max-w-4xl mx-auto bg-card/95 backdrop-blur-sm border-primary/20 shadow-xl">
      <CardHeader className="pb-3 sm:pb-4">
        <CardTitle className="flex items-center gap-2 text-primary text-base sm:text-lg">
          🧠 Smart Food Parser
        </CardTitle>
        <p className="text-xs sm:text-sm text-muted-foreground">
          Breaking down: "{foodDescription}"
        </p>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-6 px-3 sm:px-6">
        {isParsing && (
          <div className="flex items-center justify-center gap-2 text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span className="text-sm">Parsing food items with AI...</span>
          </div>
        )}

        {hasParsed && parsedItems.length > 0 && (
          <>
            <div className="space-y-3 sm:space-y-4">
              <h3 className="font-semibold text-foreground text-sm sm:text-base">
                Found Items:
              </h3>
              {parsedItems.map((item, index) => (
                <div
                  key={index}
                  className="bg-background/50 rounded-lg p-3 sm:p-4 border border-border/50"
                >
                  <div className="flex flex-col gap-3 sm:gap-4">
                    <div className="flex-1">
                      <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-2 sm:mb-3">
                        <h4 className="font-medium text-foreground capitalize text-sm sm:text-base">
                          {item.name}
                        </h4>
                        {item.hasQuantity && (
                          <Badge
                            variant="secondary"
                            className="text-xs bg-green-100 text-green-800 w-fit"
                          >
                            ✓ Auto-detected
                          </Badge>
                        )}
                      </div>

                      <div className="space-y-2 sm:space-y-3">
                        <label className="text-xs sm:text-sm text-muted-foreground font-medium">
                          {item.prompt}
                        </label>

                        <div className="flex flex-col sm:flex-row gap-2">
                          {selectedUnits[item.name] === "size" ? (
                            <Select
                              value={itemWeights[item.name] || ""}
                              onValueChange={(value) =>
                                handleWeightChange(item.name, value)
                              }
                            >
                              <SelectTrigger className="w-full sm:w-32 h-10 sm:h-9">
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
                              value={itemWeights[item.name] || ""}
                              onChange={(e) =>
                                handleWeightChange(item.name, e.target.value)
                              }
                              placeholder="Enter amount"
                              step="0.1"
                              className="w-full sm:w-32 h-10 sm:h-9 text-center"
                            />
                          )}

                          <Select
                            value={selectedUnits[item.name] || item.unit}
                            onValueChange={(value) =>
                              handleUnitChange(item.name, value)
                            }
                          >
                            <SelectTrigger className="w-full sm:w-28 h-10 sm:h-9">
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

                      {/* Display quantity info for auto-detected items */}
                      {item.hasQuantity && (
                        <div className="text-xs sm:text-sm text-green-600 flex items-center gap-2 mt-2 justify-between border-t border-green-100 pt-2">
                          <div>
                            ✅ Quantity already specified: {item.weight}
                            {item.unit}
                          </div>
                        </div>
                      )}
                      
                      {/* Edit Quantity/Size button for all food items */}
                      <div className="mt-3 border-t border-green-200 pt-2">
                        <div className="text-center text-sm text-green-700 mb-2 font-bold animate-bounce">👇 CLICK TO EDIT QUANTITY 👇</div>
                        <Button 
                          variant="default" 
                          size="lg" 
                          className="w-full h-14 text-lg bg-green-500 hover:bg-green-600 text-white font-extrabold shadow-xl flex items-center justify-center gap-3 border-4 border-green-300 rounded-xl" 
                          onClick={() => {
                            // For auto-detected items, use their weight/unit as starting point
                            if (item.hasQuantity) {
                              handleWeightChange(item.name, item.weight?.toString() || "");
                              handleUnitChange(item.name, item.unit);
                              // Mark as no longer auto-detected so user can edit
                              const updatedItems = [...parsedItems];
                              const itemIndex = updatedItems.findIndex(i => i.name === item.name);
                              if (itemIndex !== -1) {
                                updatedItems[itemIndex].hasQuantity = false;
                                setParsedItems(updatedItems);
                              }
                            }
                            // For non-auto-detected items, just focus on the input field
                            else if (!itemWeights[item.name]) {
                              // Set a default value if none exists
                              handleWeightChange(item.name, "1");
                            }
                          }}
                        >
                          <span style={{ fontSize: '1.5rem' }}>✏️</span>
                          <span>EDIT QUANTITY/SIZE</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={calculateAllNutrition}
                disabled={
                  isCalculating ||
                  parsedItems.some(
                    (item) => !item.hasQuantity && !itemWeights[item.name]
                  )
                }
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 h-10 sm:h-9"
              >
                {isCalculating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span className="text-sm">Calculating...</span>
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    <span className="text-sm">Add All to Meal</span>
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={onCancel}
                className="w-full sm:w-auto h-10 sm:h-9"
              >
                <X className="mr-2 h-4 w-4" />
                <span className="text-sm">Cancel</span>
              </Button>
            </div>
          </>
        )}

        {hasParsed && parsedItems.length === 0 && (
          <div className="text-center text-muted-foreground py-6">
            <p className="text-sm">
              No food items found in the description. Please try rephrasing.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

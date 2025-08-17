import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Target, TrendingUp, Clock, Search, Plus, RotateCcw, Utensils, User, BarChart3, Calendar, HelpCircle, Home, Scale, Brain, Camera, LogOut, LogIn, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigation } from '@/components/Navigation';
import { VisualizeSection } from '@/components/VisualizeSection';
import { HistorySection } from '@/components/HistorySection';
import { HelpSection } from '@/components/HelpSection';
import { WeightCalculator } from '@/components/WeightCalculator';
import { FoodParser } from '@/components/FoodParser';
import { ImageFoodRecognition } from '@/components/ImageFoodRecognition';
import { EnhancedOpenAIService } from '@/services/enhancedOpenAIService';
import { useAuth } from '@/hooks/useAuth';
import { SupabaseDataService, DatabaseMeal } from '@/services/supabaseDataService';
import { useNavigate } from 'react-router-dom';

interface Meal {
  id: number;
  name: string;
  calories: number;
  protein: number;
  type: string;
  weight?: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  aiEnhanced?: boolean;
  quantity?: number;
  originalQuantity?: number;
  isEdited?: boolean;
}

const Index = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Local state for non-authenticated users
  const [isWelcome, setIsWelcome] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [userName, setUserName] = useState('');
  const [tempUserName, setTempUserName] = useState('');
  
  // Nutrition state
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(150);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [proteinConsumed, setProteinConsumed] = useState(0);
  const [goalType, setGoalType] = useState<'bulk' | 'cut'>('bulk');
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  
  // UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [isMobile, setIsMobile] = useState(false);
  const [selectedFoodName, setSelectedFoodName] = useState<string>('');
  const [showWeightCalculator, setShowWeightCalculator] = useState(false);
  const [showFoodParser, setShowFoodParser] = useState(false);
  const [showImageRecognition, setShowImageRecognition] = useState(false);
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [showMealEditor, setShowMealEditor] = useState(false);
  const [editingSearchItem, setEditingSearchItem] = useState<any>(null);
  const [editingSearchItemIndex, setEditingSearchItemIndex] = useState<number | null>(null);
  const [showItemEditor, setShowItemEditor] = useState(false);
  const [editQuantity, setEditQuantity] = useState<number>(1);
  const [editUnit, setEditUnit] = useState<string>('');
  const [editSize, setEditSize] = useState<string>('');
  
  // Services
  const dataService = new SupabaseDataService();
  const enhancedOpenaiService = new EnhancedOpenAIService(import.meta.env.VITE_OPENAI_API_KEY);

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load data based on auth status
  useEffect(() => {
    if (authLoading) return;
    
    if (user) {
      // User is authenticated - load from database
      loadUserData();
    } else {
      // User is not authenticated - check localStorage for guest mode
      const savedData = localStorage.getItem('calorieBuddyData');
      if (savedData) {
        const data = JSON.parse(savedData);
        setIsWelcome(false);
        setIsOnboarding(false);
        setUserName(data.userName || '');
        setCalorieGoal(data.calorieGoal || 2000);
        setProteinGoal(data.proteinGoal || 150);
        setCaloriesConsumed(data.caloriesConsumed || 0);
        setProteinConsumed(data.proteinConsumed || 0);
        setGoalType(data.goalType || 'bulk');
        setTodayMeals(data.todayMeals || []);
        setHistoricalData(data.historicalData || []);
      }
    }
  }, [user, authLoading]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      // Load user goals
      const goals = await dataService.getUserGoals();
      if (goals) {
        setCalorieGoal(goals.calorie_goal);
        setProteinGoal(goals.protein_goal);
      }
      
      // Load today's meals
      const meals = await dataService.getMeals();
      const todayMeals = meals.filter(meal => {
        const mealDate = new Date(meal.created_at).toDateString();
        const today = new Date().toDateString();
        return mealDate === today;
      });
      
      // Convert database meals to local format
      const convertedMeals: Meal[] = todayMeals.map(meal => ({
        id: parseInt(meal.id.slice(-8), 16), // Convert UUID to number for compatibility
        name: meal.name,
        calories: meal.calories,
        protein: meal.protein,
        type: meal.meal_type,
        carbs: meal.carbs,
        fat: meal.fat,
        fiber: meal.fiber,
        aiEnhanced: true
      }));
      
      setTodayMeals(convertedMeals);
      
      // Calculate consumed values
      const totalCalories = convertedMeals.reduce((sum, meal) => sum + meal.calories, 0);
      const totalProtein = convertedMeals.reduce((sum, meal) => sum + meal.protein, 0);
      setCaloriesConsumed(totalCalories);
      setProteinConsumed(totalProtein);
      
      // Load historical data
      const stats = await dataService.getDailyMealStats(7);
      setHistoricalData(stats);
      
      // User is authenticated, so skip welcome/onboarding
      setIsWelcome(false);
      setIsOnboarding(false);
      setUserName(user.email?.split('@')[0] || 'User');
      
    } catch (error) {
      console.error('Error loading user data:', error);
      toast({
        title: "Error loading data",
        description: "There was an issue loading your data. Please try again.",
        variant: "destructive",
      });
    }
  };

  // Save data to localStorage for non-authenticated users only
  useEffect(() => {
    if (!user && !isWelcome && !isOnboarding && userName) {
      const today = new Date().toLocaleDateString();
      
      // Update historical data
      const updatedHistoricalData = [...historicalData];
      const todayIndex = updatedHistoricalData.findIndex(day => day.date === today);
      
      const todayData = {
        date: today,
        calories: caloriesConsumed,
        protein: proteinConsumed,
        mealsCount: todayMeals.length
      };

      if (todayIndex >= 0) {
        updatedHistoricalData[todayIndex] = todayData;
      } else {
        updatedHistoricalData.push(todayData);
      }

      const dataToSave = {
        userName,
        calorieGoal,
        proteinGoal,
        caloriesConsumed,
        proteinConsumed,
        goalType,
        todayMeals,
        historicalData: updatedHistoricalData
      };
      localStorage.setItem('calorieBuddyData', JSON.stringify(dataToSave));
      setHistoricalData(updatedHistoricalData);
    }
  }, [user, calorieGoal, proteinGoal, caloriesConsumed, proteinConsumed, todayMeals, isWelcome, isOnboarding, userName]);

  const showCalorieConsumptionAlert = (consumedCalories: number, consumedProtein: number, totalCalories: number) => {
    const remainingCalories = calorieGoal - totalCalories;
    
    let title = "";
    let description = "";
    
    if (totalCalories > calorieGoal * 1.2) {
      title = "⚠️ High Calorie Intake!";
      description = `You've consumed ${consumedCalories} calories (${consumedProtein}g protein). You're ${Math.abs(remainingCalories)} calories over your daily goal.`;
    } else if (totalCalories > calorieGoal) {
      title = "🎯 Goal Exceeded";
      description = `You've consumed ${consumedCalories} calories (${consumedProtein}g protein). You're ${Math.abs(remainingCalories)} calories over your goal.`;
    } else {
      title = "✅ Meal Added Successfully!";
      description = `You've consumed ${consumedCalories} calories (${consumedProtein}g protein). ${remainingCalories} calories remaining for today.`;
    }

    toast({
      title,
      description,
    });
  };

  const handleQuickSuggestionClick = async (suggestion: string) => {
    const term = suggestion.trim();
    if (!term) return;

    setSearchTerm(term);
    setIsAddingMeal(true);
    setIsSearching(true);
    try {
      const result = await enhancedOpenaiService.parseAndEstimateNutrition(term);
      setSearchResults(result);
      toast({
        title: "Food analyzed successfully!",
        description: `Found ${result.items.length} item(s) with ${result.total_calories} total calories`,
      });
    } catch (error) {
      console.error('Error analyzing quick suggestion:', error);
      toast({
        title: "Analysis failed",
        description: "Please try again or use manual entry",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleFoodSearch = async () => {
    if (!searchTerm.trim()) return;

    setIsSearching(true);
    try {
      const result = await enhancedOpenaiService.parseAndEstimateNutrition(searchTerm);
      setSearchResults(result);
      
      toast({
        title: "Food analyzed successfully!",
        description: `Found ${result.items.length} item(s) with ${result.total_calories} total calories`,
      });
    } catch (error) {
      console.error('Error searching for food:', error);
      toast({
        title: "Search failed",
        description: "Please try again or use manual entry",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleWeightCalculated = async (data: {
    calories: number;
    protein: number;
    weight: number;
    unit?: string;
    carbs?: number;
    fat?: number;
    fiber?: number;
    aiEnhanced: boolean;
  }) => {
    const unit = data.unit || 'g';
    const newMeal: Meal = {
      id: Date.now(),
      name: `${selectedFoodName} (${data.weight}${unit})`,
      calories: data.calories,
      protein: data.protein,
      type: selectedMealType,
      weight: data.weight,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber,
      aiEnhanced: data.aiEnhanced
    };

    // Save to database if user is authenticated
    if (user) {
      try {
        await dataService.addMeal({
          name: newMeal.name,
          calories: newMeal.calories,
          protein: newMeal.protein,
          meal_type: newMeal.type,
          carbs: newMeal.carbs,
          fat: newMeal.fat,
          fiber: newMeal.fiber,
        });
      } catch (error) {
        console.error('Error saving meal:', error);
        toast({
          title: "Error saving meal",
          description: "There was an issue saving your meal. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    setTodayMeals(prev => [...prev, newMeal]);
    setCaloriesConsumed(prev => prev + data.calories);
    setProteinConsumed(prev => prev + data.protein);
    setShowWeightCalculator(false);
    setSelectedFoodName('');
    setSearchTerm('');

    showCalorieConsumptionAlert(data.calories, data.protein, caloriesConsumed + data.calories);
  };

  const handleMultipleItemsCalculated = async (items: any[]) => {
    const totalCalories = items.reduce((sum, item) => sum + item.calories, 0);
    const totalProtein = items.reduce((sum, item) => sum + item.protein, 0);
    
    // Save to database if user is authenticated
    if (user) {
      try {
        for (const item of items) {
          await dataService.addMeal({
            name: item.name,
            calories: item.calories,
            protein: item.protein,
            meal_type: item.type,
            carbs: item.carbs,
            fat: item.fat,
            fiber: item.fiber,
          });
        }
      } catch (error) {
        console.error('Error saving meals:', error);
        toast({
          title: "Error saving meals",
          description: "There was an issue saving your meals. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    
    setTodayMeals(prev => [...prev, ...items]);
    setCaloriesConsumed(prev => prev + totalCalories);
    setProteinConsumed(prev => prev + totalProtein);
    setShowFoodParser(false);
    setSearchTerm('');

    showCalorieConsumptionAlert(totalCalories, totalProtein, caloriesConsumed + totalCalories);
  };

  const handleAddSearchItem = async (item: any, index: number = 0) => {
    const newMeal: Meal = {
      id: Date.now() + index, // Add index to prevent duplicate IDs
      name: `${item.name} (${item.quantity} ${item.unit})`,
      calories: item.estimated_calories,
      protein: item.protein || 0,
      type: selectedMealType,
      carbs: item.carbs || 0,
      fat: item.fat || 0,
      fiber: item.fiber || 0,
      aiEnhanced: true,
      quantity: item.quantity,
      originalQuantity: item.quantity
    };

    // Save to database if user is authenticated
    if (user) {
      try {
        await dataService.addMeal({
          name: newMeal.name,
          calories: newMeal.calories,
          protein: newMeal.protein,
          meal_type: newMeal.type,
          carbs: newMeal.carbs,
          fat: newMeal.fat,
          fiber: newMeal.fiber,
        });
      } catch (error) {
        console.error('Error saving meal:', error);
        toast({
          title: "Error saving meal",
          description: "There was an issue saving your meal. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    setTodayMeals(prev => [...prev, newMeal]);
    setCaloriesConsumed(prev => prev + item.estimated_calories);
    setProteinConsumed(prev => prev + (item.protein || 0));

    toast({
      title: "Meal added successfully!",
      description: `Added ${item.name} (${item.estimated_calories} calories, ${item.protein || 0}g protein)`,
    });
  };

  const handleEditMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setShowMealEditor(true);
  };

  const handleSaveEditedMeal = async (updatedMeal: Meal) => {
    // Update in database if user is authenticated
    if (user) {
      try {
        await dataService.updateMeal(updatedMeal.id.toString(), {
          name: updatedMeal.name,
          calories: updatedMeal.calories,
          protein: updatedMeal.protein,
          meal_type: updatedMeal.type,
          carbs: updatedMeal.carbs,
          fat: updatedMeal.fat,
          fiber: updatedMeal.fiber,
        });
      } catch (error) {
        console.error('Error updating meal:', error);
        toast({
          title: "Error updating meal",
          description: "There was an issue updating your meal. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }

    // Update local state
    const updatedMeals = todayMeals.map(meal => 
      meal.id === updatedMeal.id ? { ...updatedMeal, isEdited: true } : meal
    );
    setTodayMeals(updatedMeals);

    // Recalculate totals
    const newCaloriesConsumed = updatedMeals.reduce((sum, meal) => sum + meal.calories, 0);
    const newProteinConsumed = updatedMeals.reduce((sum, meal) => sum + meal.protein, 0);
    setCaloriesConsumed(newCaloriesConsumed);
    setProteinConsumed(newProteinConsumed);

    setShowMealEditor(false);
    setEditingMeal(null);

    toast({
      title: "Meal updated successfully!",
      description: `Updated ${updatedMeal.name}`,
    });
  };

  const handleImageFoodDetected = (foodDescription: string) => {
    setSearchTerm(foodDescription);
    setShowImageRecognition(false);
    handleFoodSearch();
  };

  const handleWelcomeNext = () => {
    if (tempUserName.trim()) {
      setUserName(tempUserName.trim());
      setIsWelcome(false);
      setIsOnboarding(true);
    }
  };

  const handleOnboardingComplete = async () => {
    // Save goals to database if user is authenticated
    if (user) {
      try {
        await dataService.updateUserGoals(calorieGoal, proteinGoal);
      } catch (error) {
        console.error('Error saving goals:', error);
      }
    }
    setIsOnboarding(false);
  };

  const handleQuickAdd = (mealType: string) => {
    setSelectedMealType(mealType);
    setIsAddingMeal(true);
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      // Clear local state
      setIsWelcome(true);
      setIsOnboarding(false);
      setUserName('');
      setCalorieGoal(2000);
      setProteinGoal(150);
      setCaloriesConsumed(0);
      setProteinConsumed(0);
      setTodayMeals([]);
      setHistoricalData([]);
      localStorage.removeItem('calorieBuddyData');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const resetData = () => {
    localStorage.removeItem('calorieBuddyData');
    setIsWelcome(true);
    setIsOnboarding(false);
    setUserName('');
    setTempUserName('');
    setCalorieGoal(2000);
    setProteinGoal(150);
    setCaloriesConsumed(0);
    setProteinConsumed(0);
    setGoalType('bulk');
    setTodayMeals([]);
    setHistoricalData([]);
    setCurrentView('dashboard');
    setShowResetDialog(false);
  };

  const quickSuggestions = [
    'Rice and Dal', 'Roti with Sabzi', 'Chicken Curry', 'Paneer Tikka', 'Biryani',
    'Naan', 'Samosa', 'Kachori', 'Chole Bhature', 'Dosa', 'Idli', 'Uttapam',
    'Burger', 'Pizza', 'Pasta', 'Sandwich', 'Salad', 'Fruits', 'Nuts', 'Yogurt'
  ];

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background to-secondary/20 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Welcome Screen (for non-authenticated users)
  if (isWelcome && !user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md text-center animate-fade-in bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl">
          <CardHeader className="space-y-4">
            <div className="text-6xl animate-bounce">🍎</div>
            <div>
              <CardTitle className="text-3xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                CalorieBuddy
              </CardTitle>
              <p className="text-muted-foreground mt-2">Your AI-powered nutrition tracking companion</p>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground text-left block">
                  What's your name?
                </label>
                <Input
                  placeholder="Enter your name"
                  value={tempUserName}
                  onChange={(e) => setTempUserName(e.target.value)}
                  className="text-center bg-background/50 border-primary/20"
                />
              </div>
              
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Target className="h-4 w-4 text-primary" />
                  Track calories & protein
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Brain className="h-4 w-4 text-secondary" />
                  AI-powered nutrition analysis
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Scale className="h-4 w-4 text-accent" />
                  Dynamic weight-based calculations
                </div>
              </div>
            </div>
            <Button 
              onClick={handleWelcomeNext} 
              className="w-full text-lg py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 shadow-lg hover:shadow-xl transition-all duration-300"
              disabled={!tempUserName.trim()}
            >
              Get Started
              <Sparkles className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Onboarding Screen
  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/20 via-background to-secondary/20 flex items-center justify-center p-4">
        <Card className="w-full max-w-md animate-fade-in bg-card/80 backdrop-blur-sm border-primary/20 shadow-2xl">
          <CardHeader className="text-center">
            <div className="text-4xl mb-4">🎯</div>
            <CardTitle className="text-2xl font-bold text-center text-primary">
              Welcome, {userName}! 👋
            </CardTitle>
            <p className="text-center text-muted-foreground">
              Let's set your daily nutrition goals
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Daily Calorie Goal
                </label>
                <Input
                  type="number"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(Number(e.target.value))}
                  className="text-center bg-background/50 border-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">Recommended: 1500-2500 calories</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Daily Protein Goal (grams)
                </label>
                <Input
                  type="number"
                  value={proteinGoal}
                  onChange={(e) => setProteinGoal(Number(e.target.value))}
                  className="text-center bg-background/50 border-primary/20"
                />
                <p className="text-xs text-muted-foreground mt-1">Recommended: 0.8-2g per kg body weight</p>
              </div>
              
              <div>
                <label className="text-sm font-medium text-foreground mb-2 block">
                  Fitness Goal
                </label>
                <Select value={goalType} onValueChange={(value: 'bulk' | 'cut') => setGoalType(value)}>
                  <SelectTrigger className="bg-background/50 border-primary/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bulk">🏋️ Bulk (Gain Weight)</SelectItem>
                    <SelectItem value="cut">✂️ Cut (Lose Weight)</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">
                  {goalType === 'bulk' ? 'Focus on eating above your calorie goal' : 'Focus on staying below your calorie goal'}
                </p>
              </div>
            </div>
            
            <Button 
              onClick={handleOnboardingComplete} 
              className="w-full text-lg py-6 bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90"
            >
              Start Tracking
              <Target className="ml-2 h-5 w-5" />
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Main Dashboard
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/30">
      <div className="container mx-auto px-3 sm:px-4 md:px-6 max-w-6xl">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-4 sm:mb-6 pt-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-foreground flex items-center gap-2 truncate">
              <User className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-primary flex-shrink-0" />
              <span className="truncate">Hey, {userName}! 👋</span>
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground mt-1">
              {user ? 'Your nutrition journey is being tracked!' : 'Tracking in guest mode - Sign in to save progress'}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {user ? (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSignOut}
                className="flex items-center gap-2"
              >
                <LogOut className="h-4 w-4" />
                Sign Out
              </Button>
            ) : (
              <Button 
                variant="default" 
                size="sm" 
                onClick={() => navigate('/auth')}
                className="flex items-center gap-2"
              >
                <LogIn className="h-4 w-4" />
                Sign In
              </Button>
            )}
          </div>
        </div>

        {/* Navigation */}
        <Navigation 
          currentView={currentView} 
          setCurrentView={setCurrentView} 
          isMobile={isMobile}
        />

        {/* Render Current View */}
        {currentView === 'dashboard' && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mb-6 sm:mb-8">
              {/* Goal Type */}
              <Card className="bg-gradient-to-br from-purple-500/10 to-purple-500/5 border-purple-500/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
                    <Scale className="h-3 w-3 sm:h-4 sm:w-4" />
                    Fitness Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xl sm:text-2xl">{goalType === 'bulk' ? '🏋️' : '✂️'}</span>
                      <span className="text-base sm:text-lg font-bold text-purple-600 dark:text-purple-400 capitalize">{goalType}</span>
                    </div>
                    <Select value={goalType} onValueChange={(value: 'bulk' | 'cut') => setGoalType(value)}>
                      <SelectTrigger className="h-7 sm:h-8 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bulk">🏋️ Bulk</SelectItem>
                        <SelectItem value="cut">✂️ Cut</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Calorie Progress */}
              <Card className={`bg-gradient-to-br shadow-lg hover:shadow-xl transition-all duration-300 ${
                (goalType === 'bulk' && caloriesConsumed < calorieGoal) || 
                (goalType === 'cut' && caloriesConsumed > calorieGoal)
                  ? 'from-red-500/10 to-red-500/5 border-red-500/20' 
                  : 'from-primary/10 to-primary/5 border-primary/20'
              }`}>
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
                    <Target className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Daily Calorie Goal</span>
                    <span className="sm:hidden">Calories</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className={`text-2xl sm:text-3xl font-bold ${
                        (goalType === 'bulk' && caloriesConsumed < calorieGoal) || 
                        (goalType === 'cut' && caloriesConsumed > calorieGoal)
                          ? 'text-red-600' 
                          : 'text-primary'
                      }`}>{caloriesConsumed.toFixed(0)}</span>
                      <span className="text-sm sm:text-lg text-foreground">/ {calorieGoal}</span>
                    </div>
                    <Progress 
                      value={(caloriesConsumed / calorieGoal) * 100} 
                      className="h-2 sm:h-3"
                    />
                    <p className={`text-xs sm:text-sm ${
                      (goalType === 'bulk' && caloriesConsumed < calorieGoal) || 
                      (goalType === 'cut' && caloriesConsumed > calorieGoal)
                        ? 'text-red-600 font-semibold' 
                        : 'text-foreground/80'
                    }`}>
                      {((caloriesConsumed / calorieGoal) * 100).toFixed(1)}% of goal
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Protein Progress */}
              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
                    <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
                    Protein Goal
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-bold text-secondary">{proteinConsumed.toFixed(1)}g</span>
                      <span className="text-sm sm:text-lg text-foreground">/ {proteinGoal}g</span>
                    </div>
                    <Progress 
                      value={(proteinConsumed / proteinGoal) * 100} 
                      className="h-2 sm:h-3"
                    />
                    <p className="text-xs sm:text-sm text-foreground/80">
                      {((proteinConsumed / proteinGoal) * 100).toFixed(1)}% of goal
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Meals */}
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-2 sm:pb-3">
                  <CardTitle className="text-xs sm:text-sm font-medium text-foreground flex items-center gap-2">
                    <Utensils className="h-3 w-3 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Today's Meals</span>
                    <span className="sm:hidden">Meals</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="space-y-2 sm:space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-2xl sm:text-3xl font-bold text-accent">{todayMeals.length}</span>
                      <span className="text-sm sm:text-lg text-foreground">meals</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(todayMeals.length, 6) }).map((_, index) => (
                        <div key={index} className="w-2 h-2 sm:w-3 sm:h-3 bg-accent rounded-full animate-pulse" />
                      ))}
                    </div>
                    <p className="text-xs sm:text-sm text-foreground/80">
                      {todayMeals.length === 0 ? 'No meals yet' : 
                       todayMeals.length === 1 ? '1 meal logged' : 
                       `${todayMeals.length} meals logged`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recent Meals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 pb-20 md:pb-6">
              {/* Quick Add Meal */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Plus className="h-5 w-5 text-primary" />
                    Quick Add Meal
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      variant="outline"
                      onClick={() => handleQuickAdd('breakfast')}
                      className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-primary/10 border-primary/20 text-foreground"
                    >
                      <span className="text-2xl">🌅</span>
                      <span className="text-sm">Breakfast</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleQuickAdd('lunch')}
                      className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-primary/10 border-primary/20 text-foreground"
                    >
                      <span className="text-2xl">☀️</span>
                      <span className="text-sm">Lunch</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleQuickAdd('dinner')}
                      className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-primary/10 border-primary/20 text-foreground"
                    >
                      <span className="text-2xl">🌙</span>
                      <span className="text-sm">Dinner</span>
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => handleQuickAdd('snack')}
                      className="h-auto py-3 flex flex-col items-center gap-2 hover:bg-primary/10 border-primary/20 text-foreground"
                    >
                      <span className="text-2xl">🍪</span>
                      <span className="text-sm">Snack</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Recent Meals */}
              <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-foreground">
                    <Clock className="h-5 w-5 text-secondary" />
                    Recent Meals
                  </CardTitle>
                  {!user && (
                    <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                      <DialogTrigger asChild>
                        <Button variant="outline" size="sm" className="hover:bg-destructive/10 text-foreground">
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Reset
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="bg-card border-border">
                        <DialogHeader>
                          <DialogTitle className="text-foreground">Reset All Data</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-foreground/80">
                            Are you sure you want to reset all your data? This will clear your goals, meals, and progress.
                          </p>
                          <div className="flex gap-3 justify-end">
                            <Button variant="outline" onClick={() => setShowResetDialog(false)}>
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={resetData}>
                              Reset Everything
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {todayMeals.length === 0 ? (
                      <div className="text-center py-8 text-foreground/60">
                        <Utensils className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p>No meals logged today</p>
                        <p className="text-xs">Add your first meal to get started!</p>
                      </div>
                    ) : (
                      todayMeals.map((meal, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-background/80 rounded-lg border border-border/30"
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-lg">
                              {meal.type === 'breakfast' ? '🌅' : 
                               meal.type === 'lunch' ? '☀️' : 
                               meal.type === 'dinner' ? '🌙' : '🍪'}
                            </span>
                            <div>
                              <div className="flex items-center gap-2">
                                <p className="font-medium text-sm text-foreground">{meal.name}</p>
                                {meal.aiEnhanced && (
                                  <Badge variant="secondary" className="text-xs px-1 py-0">
                                    <Brain className="h-3 w-3 mr-1" />
                                    AI
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-foreground/60 capitalize">{meal.type}</p>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="text-right">
                              <p className="text-sm font-medium text-foreground">{meal.calories} cal</p>
                              <p className="text-xs text-foreground/60">{meal.protein}g protein</p>
                              {meal.weight && (
                                <p className="text-xs text-foreground/40">{meal.weight}g</p>
                              )}
                              {meal.isEdited && (
                                <Badge variant="outline" className="text-xs mt-1">Edited</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {currentView === 'visualize' && (
          <VisualizeSection
            caloriesConsumed={caloriesConsumed}
            proteinConsumed={proteinConsumed}
            calorieGoal={calorieGoal}
            proteinGoal={proteinGoal}
            meals={todayMeals}
            historicalData={historicalData}
            isAuthenticated={!!user}
          />
        )}

        {currentView === 'history' && (
          <HistorySection historicalData={historicalData} />
        )}

        {currentView === 'help' && (
          <HelpSection />
        )}

        {/* AI-Powered Food Search Modal */}
        <Dialog open={isAddingMeal} onOpenChange={setIsAddingMeal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Brain className="h-5 w-5 text-primary" />
                Add Food to {selectedMealType}
                <Badge variant="default" className="ml-2 bg-primary text-primary-foreground">
                  AI-Powered
                </Badge>
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Type any food item and our AI will calculate accurate nutrition data
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="relative">
                <Input
                  placeholder="Write food items with quantity for accurate results (e.g., '2 rotis with dal', '1 cup chai with sugar')"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleFoodSearch()}
                  className="mb-4 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground pr-32"
                />
                <div className="absolute right-1 top-1 flex gap-1">
                  <Button 
                    onClick={() => {
                      setShowImageRecognition(true);
                      setIsAddingMeal(false);
                    }}
                    size="sm"
                    variant="outline"
                    className="h-8 border-primary/20 hover:bg-primary/10"
                    title="Take a photo to detect food"
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                  <Button 
                    onClick={handleFoodSearch}
                    size="sm"
                    className="h-8"
                    disabled={!searchTerm.trim() || isSearching}
                  >
                    {isSearching ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white mr-1"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <Search className="h-4 w-4 mr-1" />
                        Search
                      </>
                    )}
                  </Button>
                </div>
              </div>

              {/* Search Results */}
              {searchResults && (
                <div className="mb-6 p-4 bg-muted/30 rounded-lg border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-foreground">Nutrition Analysis</h3>
                    <Badge variant="secondary" className="text-xs">
                      {searchResults.confidence > 0.8 ? 'High Confidence' : 
                       searchResults.confidence > 0.6 ? 'Medium Confidence' : 'Low Confidence'}
                    </Badge>
                  </div>
                  
                  <div className="space-y-3">
                    {searchResults.items.map((item: any, index: number) => (
                      <div key={index} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-3 bg-background/50 rounded-lg border border-border/30">
                        <div className="flex-1">
                          <div className="font-medium text-foreground capitalize">
                            {item.name} ({item.quantity} {item.unit}{item.size ? `, ${item.size}` : ''})
                          </div>
                          <div className="text-sm text-muted-foreground mt-1">
                            {item.estimated_calories} cal • {item.protein || 0}g protein • {item.carbs || 0}g carbs • {item.fat || 0}g fat
                          </div>
                        </div>
                        <div className="flex items-center gap-2 sm:ml-3 w-full sm:w-auto justify-end sm:justify-start">
                          <Button
                            onClick={() => {
                              setEditingSearchItem({ ...item, __originalQuantity: item.quantity || 1 });
                              setEditingSearchItemIndex(index);
                              setEditQuantity(item.quantity || 1);
                              setEditUnit(item.unit || 'quantity');
                              setEditSize(item.size || '');
                              setShowItemEditor(true);
                            }}
                            size="sm"
                            variant="secondary"
                            className="min-w-[84px]"
                            title="Edit quantity/size"
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            onClick={() => handleAddSearchItem(item)}
                            size="sm"
                          >
                            <Plus className="h-4 w-4 mr-1" />
                            Add
                          </Button>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-2 border-t border-border/30">
                      <div className="flex justify-between items-center">
                        <span className="font-semibold text-foreground">Total:</span>
                        <span className="font-bold text-primary">{searchResults.total_calories} calories</span>
                      </div>
                    </div>
                    
                    <div className="flex gap-2 pt-2">
                      <Button
                        onClick={() => {
                          searchResults.items.forEach((item: any, idx: number) => handleAddSearchItem(item, idx));
                          setSearchResults(null);
                          setSearchTerm('');
                          setIsAddingMeal(false);
                        }}
                        variant="default"
                        size="sm"
                        className="flex-1"
                      >
                        Add All Items
                      </Button>
                      <Button
                        onClick={() => {
                          setSearchResults(null);
                          setSearchTerm('');
                        }}
                        variant="outline"
                        size="sm"
                      >
                        Clear
                      </Button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Quick Suggestions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Quick Suggestions:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => handleQuickSuggestionClick(suggestion)}
                      className="justify-start text-left hover:bg-primary/5 border-border/50 text-foreground text-xs"
                    >
                      {suggestion}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="text-center text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                <Brain className="h-5 w-5 mx-auto mb-2 text-primary" />
                Our AI can analyze any food combination and provide accurate nutrition data.
                Just type what you're eating and press Enter or click Search!
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Weight Calculator Modal */}
        <Dialog open={showWeightCalculator} onOpenChange={setShowWeightCalculator}>
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Scale className="h-5 w-5" />
                Calculate Nutrition
              </DialogTitle>
            </DialogHeader>
            {selectedFoodName && (
              <WeightCalculator
                foodName={selectedFoodName}
                baseCalories={0}
                baseProtein={0}
                onCalculated={handleWeightCalculated}
                onCancel={() => {
                  setShowWeightCalculator(false);
                  setSelectedFoodName('');
                  setIsAddingMeal(true);
                }}
              />
            )}
          </DialogContent>
        </Dialog>

        {/* Food Parser Modal */}
        <Dialog open={showFoodParser} onOpenChange={setShowFoodParser}>
          <DialogContent className="max-w-4xl bg-card border-border">
            <FoodParser
              foodDescription={searchTerm}
              onItemsCalculated={handleMultipleItemsCalculated}
              onCancel={() => {
                setShowFoodParser(false);
                setSearchTerm('');
                setIsAddingMeal(true);
              }}
              selectedMealType={selectedMealType}
            />
          </DialogContent>
        </Dialog>

        {/* Item Editor Modal (for search result items) */}
        <Dialog open={showItemEditor} onOpenChange={setShowItemEditor}>
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Edit className="h-5 w-5" />
                Edit Item
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Adjust quantity, unit, or size. Nutrition scales automatically.
              </p>
            </DialogHeader>
            {editingSearchItem && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Food Item</label>
                  <Input value={editingSearchItem.name} disabled className="bg-muted/50" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Quantity</label>
                    <div className="flex items-center gap-2">
                      <Button
                        onClick={() => setEditQuantity((q) => Math.max(0.1, parseFloat((q - 0.1).toFixed(1))))}
                        size="sm"
                        variant="outline"
                      >
                        -
                      </Button>
                      <Input
                        type="number"
                        step="0.1"
                        min="0.1"
                        value={editQuantity}
                        onChange={(e) => setEditQuantity(Math.max(0.1, parseFloat(e.target.value) || 1))}
                        className="text-center"
                      />
                      <Button
                        onClick={() => setEditQuantity((q) => parseFloat((q + 0.1).toFixed(1)))}
                        size="sm"
                        variant="outline"
                      >
                        +
                      </Button>
                    </div>
                  </div>

                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Unit</label>
                    <Select value={editUnit} onValueChange={setEditUnit}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select unit" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {(() => {
                          const baseUnit = editingSearchItem.unit || 'quantity';
                          const allUnits = Array.from(new Set([
                            baseUnit,
                            'quantity',
                            'grams',
                            'ml',
                            'cup',
                            'teaspoon',
                            'tablespoon',
                            'slice',
                            'can',
                            'bottle',
                            'piece',
                            'size',
                          ].filter(Boolean)));
                          return allUnits.map((u) => (
                            <SelectItem key={u} value={u}>{u}</SelectItem>
                          ));
                        })()}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Optional Size Selector for items like pizza, burger, etc. */}
                {(/pizza|burger|sandwich/i.test(editingSearchItem.name) || editUnit === 'size') && (
                  <div>
                    <label className="text-sm font-medium text-foreground mb-2 block">Size</label>
                    <Select value={editSize || 'medium'} onValueChange={setEditSize}>
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue placeholder="Select size" />
                      </SelectTrigger>
                      <SelectContent className="bg-card border-border">
                        {['small', 'medium', 'large'].map((s) => (
                          <SelectItem key={s} value={s}>{s}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* Intelligent Suggestions */}
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">Quick Suggestions</label>
                  <div className="flex flex-wrap gap-2">
                    {(() => {
                      const suggestions: Array<{ label: string; qty: number; unit?: string; size?: string }> = [];
                      const unit = (editingSearchItem.unit || '').toLowerCase();
                      const name = (editingSearchItem.name || '').toLowerCase();
                      // Can/bottle drinks
                      if (unit === 'can' || /coke|pepsi|sprite|soda|cola/.test(name)) {
                        [2,3,4].forEach((n) => suggestions.push({ label: `${n} can`, qty: n, unit: 'can' }));
                      }
                      // Pizza sizes
                      if (/pizza/.test(name)) {
                        ['small','medium','large'].forEach((s) => suggestions.push({ label: `1 ${s} pizza`, qty: 1, unit: 'size', size: s }));
                        ['small','medium','large'].forEach((s) => suggestions.push({ label: `2 ${s} pizza`, qty: 2, unit: 'size', size: s }));
                      }
                      // Default multiples
                      if (suggestions.length === 0) {
                        [1,2,3].forEach((n) => suggestions.push({ label: `${n} ${unit || 'qty'}`, qty: n, unit: unit || 'quantity' }));
                      }
                      return suggestions.map((s, idx) => (
                        <Button
                          key={idx}
                          size="sm"
                          variant="outline"
                          className="text-xs"
                          onClick={() => {
                            setEditQuantity(s.qty);
                            if (s.unit) setEditUnit(s.unit);
                            if (s.size) setEditSize(s.size);
                          }}
                        >
                          {s.label}
                        </Button>
                      ));
                    })()}
                  </div>
                </div>

                {/* Preview of recalculated nutrition */}
                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Updated Nutrition (preview)</h4>
                  {(() => {
                    const originalQty = (editingSearchItem as any).__originalQuantity || editingSearchItem.quantity || 1;
                    // Apply simple size multipliers for pizza-like items
                    const sizeMultiplierMap: Record<string, number> = { small: 1, medium: 1.5, large: 2 };
                    const originalSize = (editingSearchItem.size || 'medium').toLowerCase();
                    const newSize = (editSize || originalSize).toLowerCase();
                    const sizeMultiplier = /pizza|burger|sandwich/i.test(editingSearchItem.name) || editUnit === 'size'
                      ? (sizeMultiplierMap[newSize] || 1) / (sizeMultiplierMap[originalSize] || 1)
                      : 1;

                    const ratio = (editQuantity / originalQty) * sizeMultiplier;
                    const cal = Math.max(1, Math.round((editingSearchItem.estimated_calories || 0) * ratio));
                    const protein = Math.max(0, Math.round((editingSearchItem.protein || 0) * ratio));
                    const carbs = Math.max(0, Math.round((editingSearchItem.carbs || 0) * ratio));
                    const fat = Math.max(0, Math.round((editingSearchItem.fat || 0) * ratio));
                    return (
                      <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>Calories: <span className="font-medium">{cal}</span></div>
                        <div>Protein: <span className="font-medium">{protein}g</span></div>
                        <div>Carbs: <span className="font-medium">{carbs}g</span></div>
                        <div>Fat: <span className="font-medium">{fat}g</span></div>
                      </div>
                    );
                  })()}
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => {
                      if (editingSearchItemIndex == null || !searchResults) return;
                      const idx = editingSearchItemIndex as number;
                      const originalQty = (editingSearchItem as any).__originalQuantity || editingSearchItem.quantity || 1;
                      const sizeMultiplierMap: Record<string, number> = { small: 1, medium: 1.5, large: 2 };
                      const originalSize = (editingSearchItem.size || 'medium').toLowerCase();
                      const newSize = (editSize || originalSize).toLowerCase();
                      const sizeMultiplier = /pizza|burger|sandwich/i.test(editingSearchItem.name) || editUnit === 'size'
                        ? (sizeMultiplierMap[newSize] || 1) / (sizeMultiplierMap[originalSize] || 1)
                        : 1;
                      const ratio = (editQuantity / originalQty) * sizeMultiplier;
                      const updatedItem = {
                        ...editingSearchItem,
                        quantity: editQuantity,
                        unit: editUnit,
                        size: editSize || editingSearchItem.size,
                        estimated_calories: Math.max(1, Math.round((editingSearchItem.estimated_calories || 0) * ratio)),
                        protein: Math.max(0, Math.round((editingSearchItem.protein || 0) * ratio)),
                        carbs: Math.max(0, Math.round((editingSearchItem.carbs || 0) * ratio)),
                        fat: Math.max(0, Math.round((editingSearchItem.fat || 0) * ratio)),
                      } as any;
                      const newItems = [...searchResults.items];
                      newItems[idx] = updatedItem;
                      const newTotal = newItems.reduce((sum: number, it: any) => sum + (it.estimated_calories || 0), 0);
                      setSearchResults({ ...searchResults, items: newItems, total_calories: Math.round(newTotal) });
                      setShowItemEditor(false);
                      setEditingSearchItem(null);
                      setEditingSearchItemIndex(null);
                    }}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => {
                      setShowItemEditor(false);
                      setEditingSearchItem(null);
                      setEditingSearchItemIndex(null);
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Image Recognition Modal */}
        <Dialog open={showImageRecognition} onOpenChange={setShowImageRecognition}>
          <DialogContent className="max-w-4xl bg-card border-border">
            <ImageFoodRecognition
              onFoodDetected={handleImageFoodDetected}
              onCancel={() => {
                setShowImageRecognition(false);
                setIsAddingMeal(true);
              }}
            />
          </DialogContent>
        </Dialog>

        {/* Meal Editor Modal */}
        <Dialog open={showMealEditor} onOpenChange={setShowMealEditor}>
          <DialogContent className="max-w-md bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Plus className="h-5 w-5 rotate-45 text-primary" />
                Edit Meal
              </DialogTitle>
              <p className="text-sm text-muted-foreground">
                Modify the quantity and nutrition will be recalculated
              </p>
            </DialogHeader>
            {editingMeal && (
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Food Item
                  </label>
                  <Input
                    value={editingMeal.name}
                    disabled
                    className="bg-muted/50"
                  />
                </div>
                
                <div>
                  <label className="text-sm font-medium text-foreground mb-2 block">
                    Quantity Multiplier
                  </label>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => {
                        const newQuantity = Math.max(0.1, (editingMeal.quantity || 1) - 0.1);
                        const multiplier = newQuantity / (editingMeal.originalQuantity || editingMeal.quantity || 1);
                        setEditingMeal({
                          ...editingMeal,
                          quantity: newQuantity,
                          calories: Math.round((editingMeal.calories / (editingMeal.quantity || 1)) * newQuantity),
                          protein: Math.round((editingMeal.protein / (editingMeal.quantity || 1)) * newQuantity),
                          carbs: editingMeal.carbs ? Math.round((editingMeal.carbs / (editingMeal.quantity || 1)) * newQuantity) : undefined,
                          fat: editingMeal.fat ? Math.round((editingMeal.fat / (editingMeal.quantity || 1)) * newQuantity) : undefined,
                          fiber: editingMeal.fiber ? Math.round((editingMeal.fiber / (editingMeal.quantity || 1)) * newQuantity) : undefined,
                        });
                      }}
                      size="sm"
                      variant="outline"
                    >
                      -
                    </Button>
                    <Input
                      type="number"
                      step="0.1"
                      min="0.1"
                      value={editingMeal.quantity || 1}
                      onChange={(e) => {
                        const newQuantity = parseFloat(e.target.value) || 1;
                        const originalQuantity = editingMeal.originalQuantity || editingMeal.quantity || 1;
                        const originalCalories = editingMeal.calories / (editingMeal.quantity || 1) * originalQuantity;
                        const originalProtein = editingMeal.protein / (editingMeal.quantity || 1) * originalQuantity;
                        
                        setEditingMeal({
                          ...editingMeal,
                          quantity: newQuantity,
                          calories: Math.round((originalCalories / originalQuantity) * newQuantity),
                          protein: Math.round((originalProtein / originalQuantity) * newQuantity),
                          carbs: editingMeal.carbs ? Math.round((editingMeal.carbs / (editingMeal.quantity || 1)) * newQuantity) : undefined,
                          fat: editingMeal.fat ? Math.round((editingMeal.fat / (editingMeal.quantity || 1)) * newQuantity) : undefined,
                          fiber: editingMeal.fiber ? Math.round((editingMeal.fiber / (editingMeal.quantity || 1)) * newQuantity) : undefined,
                        });
                      }}
                      className="text-center"
                    />
                    <Button
                      onClick={() => {
                        const newQuantity = (editingMeal.quantity || 1) + 0.1;
                        const multiplier = newQuantity / (editingMeal.originalQuantity || editingMeal.quantity || 1);
                        setEditingMeal({
                          ...editingMeal,
                          quantity: newQuantity,
                          calories: Math.round((editingMeal.calories / (editingMeal.quantity || 1)) * newQuantity),
                          protein: Math.round((editingMeal.protein / (editingMeal.quantity || 1)) * newQuantity),
                          carbs: editingMeal.carbs ? Math.round((editingMeal.carbs / (editingMeal.quantity || 1)) * newQuantity) : undefined,
                          fat: editingMeal.fat ? Math.round((editingMeal.fat / (editingMeal.quantity || 1)) * newQuantity) : undefined,
                          fiber: editingMeal.fiber ? Math.round((editingMeal.fiber / (editingMeal.quantity || 1)) * newQuantity) : undefined,
                        });
                      }}
                      size="sm"
                      variant="outline"
                    >
                      +
                    </Button>
                  </div>
                </div>

                <div className="p-3 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-foreground mb-2">Updated Nutrition</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>Calories: <span className="font-medium">{editingMeal.calories}</span></div>
                    <div>Protein: <span className="font-medium">{editingMeal.protein}g</span></div>
                    {editingMeal.carbs && <div>Carbs: <span className="font-medium">{editingMeal.carbs}g</span></div>}
                    {editingMeal.fat && <div>Fat: <span className="font-medium">{editingMeal.fat}g</span></div>}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleSaveEditedMeal(editingMeal)}
                    className="flex-1"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => {
                      setShowMealEditor(false);
                      setEditingMeal(null);
                    }}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
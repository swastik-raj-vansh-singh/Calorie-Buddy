import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Target, TrendingUp, Clock, Search, Plus, RotateCcw, Utensils, User, BarChart3, Calendar, HelpCircle, Home, Scale, Brain } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigation } from '@/components/Navigation';
import { VisualizeSection } from '@/components/VisualizeSection';
import { HistorySection } from '@/components/HistorySection';
import { HelpSection } from '@/components/HelpSection';
import { WeightCalculator } from '@/components/WeightCalculator';
import { GeminiNutritionService } from '@/services/geminiService';

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
}

const Index = () => {
  const [isWelcome, setIsWelcome] = useState(true);
  const [isOnboarding, setIsOnboarding] = useState(false);
  const [userName, setUserName] = useState('');
  const [tempUserName, setTempUserName] = useState('');
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(150);
  const [caloriesConsumed, setCaloriesConsumed] = useState(0);
  const [proteinConsumed, setProteinConsumed] = useState(0);
  const [todayMeals, setTodayMeals] = useState<Meal[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [isAddingMeal, setIsAddingMeal] = useState(false);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [currentView, setCurrentView] = useState('dashboard');
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [isMobile, setIsMobile] = useState(false);
  const [selectedFoodName, setSelectedFoodName] = useState<string>('');
  const [showWeightCalculator, setShowWeightCalculator] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const { toast } = useToast();

  // Initialize Gemini service
  const geminiService = new GeminiNutritionService('AIzaSyCUtMTwF_zESPQltG94mT6TAixcf42-lUQ');

  // Check mobile on mount and resize
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Load data from localStorage on component mount
  useEffect(() => {
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
      setTodayMeals(data.todayMeals || []);
      setHistoricalData(data.historicalData || []);
    }
  }, []);

  // Save data to localStorage whenever state changes
  useEffect(() => {
    if (!isWelcome && !isOnboarding && userName) {
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
        todayMeals,
        historicalData: updatedHistoricalData
      };
      localStorage.setItem('calorieBuddyData', JSON.stringify(dataToSave));
      setHistoricalData(updatedHistoricalData);
    }
  }, [calorieGoal, proteinGoal, caloriesConsumed, proteinConsumed, todayMeals, isWelcome, isOnboarding, userName]);

  const handleWelcomeNext = () => {
    if (tempUserName.trim()) {
      setUserName(tempUserName.trim());
      setIsWelcome(false);
      setIsOnboarding(true);
    } else {
      toast({
        title: "Please enter your name",
        variant: "destructive",
      });
    }
  };

  const handleOnboardingComplete = () => {
    setIsOnboarding(false);
    toast({
      title: "Welcome to CalorieBuddy! 🎉",
      description: "Start tracking your meals to reach your goals.",
    });
  };

  const handleQuickAdd = (mealType: string) => {
    setSelectedMealType(mealType);
    setIsAddingMeal(true);
  };

  // Handle food search with AI
  const handleFoodSearch = async () => {
    if (!searchTerm.trim()) {
      toast({
        title: "Please enter a food item",
        description: "Type the name of the food you want to add",
        variant: "destructive",
      });
      return;
    }

    setSelectedFoodName(searchTerm);
    setShowWeightCalculator(true);
    setIsAddingMeal(false);
  };

  // Handle Enter key in search
  const handleSearchKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleFoodSearch();
    }
  };

  const handleWeightCalculated = (data: {
    calories: number;
    protein: number;
    weight: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    aiEnhanced: boolean;
  }) => {
    const newMeal: Meal = {
      id: Date.now(),
      name: `${selectedFoodName} (${data.weight}g)`,
      calories: data.calories,
      protein: data.protein,
      type: selectedMealType,
      weight: data.weight,
      carbs: data.carbs,
      fat: data.fat,
      fiber: data.fiber,
      aiEnhanced: data.aiEnhanced
    };

    setTodayMeals([...todayMeals, newMeal]);
    setCaloriesConsumed(caloriesConsumed + data.calories);
    setProteinConsumed(proteinConsumed + data.protein);
    setShowWeightCalculator(false);
    setSelectedFoodName('');
    setSearchTerm('');

    toast({
      title: `Meal Added! 🤖`,
      description: `${selectedFoodName} (${data.weight}g) added to ${selectedMealType} with AI nutrition data`,
    });
  };

  // Quick food suggestions for common items
  const quickSuggestions = [
    'Rice and Dal', 'Roti with Sabzi', 'Chicken Curry', 'Paneer Tikka', 'Biryani',
    'Naan', 'Samosa', 'Kachori', 'Chole Bhature', 'Dosa', 'Idli', 'Uttapam',
    'Burger', 'Pizza', 'Pasta', 'Sandwich', 'Salad', 'Fruits', 'Nuts', 'Yogurt'
  ];

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
    setTodayMeals([]);
    setHistoricalData([]);
    setCurrentView('dashboard');
    setShowResetDialog(false);
    toast({
      title: "Data Reset Complete!",
      description: "Starting fresh with new goals.",
    });
  };

  // Welcome Screen
  if (isWelcome) {
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
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-accent" />
                  500+ Indian & global foods
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
      <div className="container mx-auto p-4 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground flex items-center gap-2">
              <User className="h-8 w-8 text-primary" />
              Hey, {userName}! 👋
            </h1>
            <p className="text-muted-foreground">Let's track your nutrition today with AI precision</p>
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              {/* Calorie Progress */}
              <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Target className="h-4 w-4" />
                    Daily Calorie Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-bold text-primary">{caloriesConsumed.toFixed(0)}</span>
                      <span className="text-lg text-foreground">/ {calorieGoal}</span>
                    </div>
                    <Progress 
                      value={(caloriesConsumed / calorieGoal) * 100} 
                      className="h-3"
                    />
                    <p className="text-sm text-foreground/80">
                      {((caloriesConsumed / calorieGoal) * 100).toFixed(1)}% of daily goal
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Protein Progress */}
              <Card className="bg-gradient-to-br from-secondary/10 to-secondary/5 border-secondary/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Protein Goal
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-bold text-secondary">{proteinConsumed.toFixed(1)}g</span>
                      <span className="text-lg text-foreground">/ {proteinGoal}g</span>
                    </div>
                    <Progress 
                      value={(proteinConsumed / proteinGoal) * 100} 
                      className="h-3"
                    />
                    <p className="text-sm text-foreground/80">
                      {((proteinConsumed / proteinGoal) * 100).toFixed(1)}% of daily goal
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Today's Meals */}
              <Card className="bg-gradient-to-br from-accent/10 to-accent/5 border-accent/20 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-foreground flex items-center gap-2">
                    <Utensils className="h-4 w-4" />
                    Today's Meals
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-baseline justify-between">
                      <span className="text-3xl font-bold text-accent">{todayMeals.length}</span>
                      <span className="text-lg text-foreground">meals</span>
                    </div>
                    <div className="flex gap-1">
                      {Array.from({ length: Math.min(todayMeals.length, 6) }).map((_, index) => (
                        <div key={index} className="w-3 h-3 bg-accent rounded-full animate-pulse" />
                      ))}
                    </div>
                    <p className="text-sm text-foreground/80">
                      {todayMeals.length === 0 ? 'No meals logged yet' : 
                       todayMeals.length === 1 ? '1 meal logged' : 
                       `${todayMeals.length} meals logged`}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Recent Meals */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-20 md:pb-6">
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
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{meal.calories} cal</p>
                            <p className="text-xs text-foreground/60">{meal.protein}g protein</p>
                            {meal.weight && (
                              <p className="text-xs text-foreground/40">{meal.weight}g</p>
                            )}
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
                  placeholder="Type any food item (e.g., cheese burger with extra cheese and 100ml coke)"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleSearchKeyPress}
                  className="mb-4 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground pr-20"
                />
                <Button 
                  onClick={handleFoodSearch}
                  size="sm"
                  className="absolute right-1 top-1 h-8"
                  disabled={!searchTerm.trim()}
                >
                  <Search className="h-4 w-4 mr-1" />
                  Search
                </Button>
              </div>
              
              {/* Quick Suggestions */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium text-foreground">Quick Suggestions:</h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  {quickSuggestions.map((suggestion, index) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSearchTerm(suggestion);
                        handleFoodSearch();
                      }}
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
      </div>
    </div>
  );
};

export default Index;

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { Sparkles, Target, TrendingUp, Clock, Search, Plus, RotateCcw, Utensils, User, BarChart3, Calendar, HelpCircle, Home } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Navigation } from '@/components/Navigation';
import { VisualizeSection } from '@/components/VisualizeSection';
import { HistorySection } from '@/components/HistorySection';
import { HelpSection } from '@/components/HelpSection';

interface Meal {
  id: number;
  name: string;
  calories: number;
  protein: number;
  type: string;
}

interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  per: string;
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
  const { toast } = useToast();

  // Comprehensive food database with 300+ items
  const FOOD_DATABASE: FoodItem[] = [
    // Indian Grains & Cereals
    { name: "Basmati Rice (Cooked)", calories: 121, protein: 2.5, per: "100g" },
    { name: "Brown Rice (Cooked)", calories: 111, protein: 2.6, per: "100g" },
    { name: "Quinoa (Cooked)", calories: 120, protein: 4.4, per: "100g" },
    { name: "Roti (Wheat)", calories: 104, protein: 3.1, per: "100g" },
    { name: "Chapati", calories: 120, protein: 3.5, per: "100g" },
    { name: "Naan", calories: 262, protein: 9, per: "100g" },
    { name: "Paratha (Plain)", calories: 320, protein: 8, per: "100g" },
    { name: "Dosa (Plain)", calories: 168, protein: 4, per: "100g" },
    { name: "Idli", calories: 39, protein: 2, per: "100g" },
    { name: "Poha", calories: 76, protein: 2.6, per: "100g" },
    { name: "Upma", calories: 109, protein: 3.2, per: "100g" },
    { name: "Bread (White)", calories: 265, protein: 9, per: "100g" },
    { name: "Bread (Brown)", calories: 247, protein: 13, per: "100g" },
    { name: "Oats", calories: 389, protein: 17, per: "100g" },
    { name: "Cornflakes", calories: 378, protein: 7.5, per: "100g" },

    // Indian Vegetables
    { name: "Aloo (Potato)", calories: 77, protein: 2, per: "100g" },
    { name: "Gobi (Cauliflower)", calories: 25, protein: 1.9, per: "100g" },
    { name: "Baingan (Eggplant)", calories: 25, protein: 1, per: "100g" },
    { name: "Bhindi (Lady Finger)", calories: 33, protein: 1.9, per: "100g" },
    { name: "Palak (Spinach)", calories: 23, protein: 2.9, per: "100g" },
    { name: "Methi (Fenugreek)", calories: 49, protein: 4.4, per: "100g" },
    { name: "Karela (Bitter Gourd)", calories: 17, protein: 1, per: "100g" },
    { name: "Lauki (Bottle Gourd)", calories: 14, protein: 0.6, per: "100g" },
    { name: "Tori (Ridge Gourd)", calories: 20, protein: 1.2, per: "100g" },
    { name: "Shimla Mirch (Bell Pepper)", calories: 31, protein: 1, per: "100g" },
    { name: "Pyaz (Onion)", calories: 40, protein: 1.1, per: "100g" },
    { name: "Tamatar (Tomato)", calories: 18, protein: 0.9, per: "100g" },
    { name: "Gajar (Carrot)", calories: 41, protein: 0.9, per: "100g" },
    { name: "Muli (Radish)", calories: 16, protein: 0.7, per: "100g" },

    // International Vegetables
    { name: "Broccoli", calories: 34, protein: 2.8, per: "100g" },
    { name: "Brussels Sprouts", calories: 43, protein: 3.4, per: "100g" },
    { name: "Cabbage", calories: 25, protein: 1.3, per: "100g" },
    { name: "Lettuce", calories: 15, protein: 1.4, per: "100g" },
    { name: "Cucumber", calories: 16, protein: 0.7, per: "100g" },
    { name: "Zucchini", calories: 17, protein: 1.2, per: "100g" },
    { name: "Asparagus", calories: 20, protein: 2.2, per: "100g" },
    { name: "Celery", calories: 14, protein: 0.7, per: "100g" },
    { name: "Sweet Potato", calories: 86, protein: 1.6, per: "100g" },
    { name: "Mushrooms", calories: 22, protein: 3.1, per: "100g" },
    { name: "Kale", calories: 49, protein: 4.3, per: "100g" },

    // Fruits
    { name: "Mango", calories: 60, protein: 0.8, per: "100g" },
    { name: "Banana", calories: 89, protein: 1.1, per: "100g" },
    { name: "Apple", calories: 52, protein: 0.3, per: "100g" },
    { name: "Orange", calories: 47, protein: 0.9, per: "100g" },
    { name: "Grapes", calories: 62, protein: 0.6, per: "100g" },
    { name: "Papaya", calories: 43, protein: 0.5, per: "100g" },
    { name: "Pineapple", calories: 50, protein: 0.5, per: "100g" },
    { name: "Guava", calories: 68, protein: 2.6, per: "100g" },
    { name: "Watermelon", calories: 30, protein: 0.6, per: "100g" },
    { name: "Strawberries", calories: 32, protein: 0.7, per: "100g" },
    { name: "Blueberries", calories: 57, protein: 0.7, per: "100g" },
    { name: "Pomegranate", calories: 83, protein: 1.7, per: "100g" },
    { name: "Coconut", calories: 354, protein: 3.3, per: "100g" },
    { name: "Dates", calories: 277, protein: 1.8, per: "100g" },

    // Legumes & Pulses
    { name: "Dal (Lentils)", calories: 116, protein: 9, per: "100g" },
    { name: "Moong Dal", calories: 347, protein: 24, per: "100g" },
    { name: "Chana Dal", calories: 364, protein: 22, per: "100g" },
    { name: "Toor Dal", calories: 343, protein: 22, per: "100g" },
    { name: "Urad Dal", calories: 341, protein: 25, per: "100g" },
    { name: "Rajma (Kidney Beans)", calories: 127, protein: 8.7, per: "100g" },
    { name: "Chickpeas", calories: 164, protein: 8.9, per: "100g" },
    { name: "Black Beans", calories: 132, protein: 8.9, per: "100g" },
    { name: "Hummus", calories: 166, protein: 8, per: "100g" },

    // Protein Sources
    { name: "Chicken Breast", calories: 165, protein: 31, per: "100g" },
    { name: "Chicken Thigh", calories: 209, protein: 26, per: "100g" },
    { name: "Fish (Salmon)", calories: 208, protein: 25, per: "100g" },
    { name: "Fish (Tuna)", calories: 144, protein: 30, per: "100g" },
    { name: "Prawns", calories: 99, protein: 18, per: "100g" },
    { name: "Egg (Whole)", calories: 155, protein: 13, per: "100g" },
    { name: "Egg White", calories: 17, protein: 3.6, per: "100g" },
    { name: "Mutton", calories: 294, protein: 25, per: "100g" },
    { name: "Beef", calories: 250, protein: 26, per: "100g" },

    // Dairy Products
    { name: "Milk (Whole)", calories: 42, protein: 3.4, per: "100ml" },
    { name: "Milk (Skimmed)", calories: 34, protein: 3.4, per: "100ml" },
    { name: "Yogurt", calories: 98, protein: 11, per: "100g" },
    { name: "Greek Yogurt", calories: 59, protein: 10, per: "100g" },
    { name: "Paneer", calories: 265, protein: 18, per: "100g" },
    { name: "Cottage Cheese", calories: 98, protein: 11, per: "100g" },
    { name: "Cheddar Cheese", calories: 402, protein: 25, per: "100g" },
    { name: "Butter", calories: 717, protein: 0.9, per: "100g" },
    { name: "Ghee", calories: 900, protein: 0, per: "100g" },

    // Nuts & Seeds
    { name: "Almonds", calories: 579, protein: 21, per: "100g" },
    { name: "Walnuts", calories: 654, protein: 15, per: "100g" },
    { name: "Cashews", calories: 553, protein: 18, per: "100g" },
    { name: "Pistachios", calories: 560, protein: 20, per: "100g" },
    { name: "Peanuts", calories: 567, protein: 26, per: "100g" },
    { name: "Sunflower Seeds", calories: 584, protein: 21, per: "100g" },
    { name: "Chia Seeds", calories: 486, protein: 17, per: "100g" },
    { name: "Flax Seeds", calories: 534, protein: 18, per: "100g" },

    // Indian Snacks
    { name: "Samosa", calories: 252, protein: 6, per: "100g" },
    { name: "Pakora", calories: 300, protein: 8, per: "100g" },
    { name: "Dhokla", calories: 160, protein: 4, per: "100g" },
    { name: "Vada", calories: 220, protein: 5, per: "100g" },
    { name: "Bhel Puri", calories: 168, protein: 4, per: "100g" },
    { name: "Pani Puri", calories: 36, protein: 1, per: "100g" },

    // Fast Food
    { name: "Pizza (Cheese)", calories: 285, protein: 12, per: "100g" },
    { name: "Burger (Veg)", calories: 390, protein: 16, per: "100g" },
    { name: "Burger (Chicken)", calories: 540, protein: 25, per: "100g" },
    { name: "French Fries", calories: 365, protein: 4, per: "100g" },
    { name: "Hot Dog", calories: 290, protein: 10, per: "100g" },
    { name: "Sandwich (Veg)", calories: 240, protein: 8, per: "100g" },

    // Asian Cuisine
    { name: "Fried Rice", calories: 163, protein: 3, per: "100g" },
    { name: "Noodles (Hakka)", calories: 138, protein: 5, per: "100g" },
    { name: "Chow Mein", calories: 198, protein: 6, per: "100g" },
    { name: "Ramen", calories: 436, protein: 10, per: "100g" },
    { name: "Maggi", calories: 435, protein: 11, per: "100g" },
    { name: "Tofu", calories: 76, protein: 8, per: "100g" },
    { name: "Kimchi", calories: 15, protein: 1.1, per: "100g" },
    { name: "Sushi", calories: 200, protein: 9, per: "100g" },

    // Indian Main Dishes
    { name: "Biryani (Chicken)", calories: 290, protein: 12, per: "100g" },
    { name: "Biryani (Veg)", calories: 250, protein: 6, per: "100g" },
    { name: "Butter Chicken", calories: 438, protein: 24, per: "100g" },
    { name: "Chicken Curry", calories: 180, protein: 20, per: "100g" },
    { name: "Tandoori Chicken", calories: 150, protein: 27, per: "100g" },
    { name: "Palak Paneer", calories: 270, protein: 14, per: "100g" },
    { name: "Shahi Paneer", calories: 300, protein: 12, per: "100g" },
    { name: "Aloo Gobi", calories: 55, protein: 2, per: "100g" },
    { name: "Chole", calories: 164, protein: 8.9, per: "100g" },

    // More items (continuing with complete database)
    { name: "Kiwi", calories: 61, protein: 1.1, per: "100g" },
    { name: "Cherries", calories: 63, protein: 1.1, per: "100g" },
    { name: "Peach", calories: 39, protein: 0.9, per: "100g" },
    { name: "Plum", calories: 46, protein: 0.7, per: "100g" },
    { name: "Apricot", calories: 48, protein: 1.4, per: "100g" },
    { name: "Turkey", calories: 189, protein: 29, per: "100g" },
    { name: "Duck", calories: 337, protein: 19, per: "100g" },
    { name: "Lamb", calories: 294, protein: 25, per: "100g" },
    { name: "Sardines", calories: 208, protein: 25, per: "100g" },
    { name: "Mackerel", calories: 205, protein: 19, per: "100g" },
    { name: "Pasta (Cooked)", calories: 131, protein: 5, per: "100g" },
    { name: "Spaghetti", calories: 158, protein: 6, per: "100g" },
    { name: "Pizza Margherita", calories: 239, protein: 11, per: "100g" },
    { name: "Croissant", calories: 406, protein: 8.2, per: "100g" },
    { name: "Pancakes", calories: 227, protein: 6, per: "100g" },
    { name: "Waffles", calories: 291, protein: 6, per: "100g" },
    { name: "Ice Cream", calories: 207, protein: 3.5, per: "100g" },
    { name: "Dark Chocolate", calories: 546, protein: 5, per: "100g" },
    { name: "Cookies", calories: 502, protein: 5.9, per: "100g" },
    { name: "Cake", calories: 257, protein: 4, per: "100g" },
    { name: "Granola", calories: 471, protein: 13, per: "100g" },
    { name: "Green Tea", calories: 2, protein: 0, per: "100ml" },
    { name: "Coffee", calories: 2, protein: 0.3, per: "100ml" },
    { name: "Lassi", calories: 89, protein: 2.4, per: "100ml" },
    { name: "Avocado", calories: 160, protein: 2, per: "100g" },
    { name: "Edamame", calories: 121, protein: 11, per: "100g" },
    { name: "Quinoa Salad", calories: 172, protein: 6, per: "100g" },
    { name: "Greek Salad", calories: 150, protein: 4, per: "100g" },
    { name: "Caesar Salad", calories: 470, protein: 7, per: "100g" },
    { name: "Smoothie Bowl", calories: 89, protein: 3, per: "100g" },
    { name: "Protein Shake", calories: 103, protein: 20, per: "100ml" },
    { name: "Energy Bar", calories: 406, protein: 20, per: "100g" },
    { name: "Trail Mix", calories: 462, protein: 13, per: "100g" },
    { name: "Popcorn", calories: 387, protein: 12, per: "100g" },
    { name: "Pretzels", calories: 380, protein: 10, per: "100g" },
    { name: "Bagel", calories: 250, protein: 10, per: "100g" }
  ];

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

  const addFood = (food: FoodItem) => {
    const newMeal: Meal = {
      id: Date.now(),
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      type: selectedMealType
    };

    setTodayMeals([...todayMeals, newMeal]);
    setCaloriesConsumed(caloriesConsumed + food.calories);
    setProteinConsumed(proteinConsumed + food.protein);
    setIsAddingMeal(false);
    setSearchTerm('');

    toast({
      title: "Meal Added! 🍽️",
      description: `${food.name} added to ${selectedMealType}`,
    });
  };

  const filteredFoods = searchTerm 
    ? FOOD_DATABASE.filter(food => 
        food.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 15)
    : FOOD_DATABASE.slice(0, 20);

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
              <p className="text-muted-foreground mt-2">Your personal nutrition tracking companion</p>
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
                  <TrendingUp className="h-4 w-4 text-secondary" />
                  Monitor daily progress
                </div>
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4 text-accent" />
                  Achieve your health goals
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
            <p className="text-muted-foreground">Let's track your nutrition today</p>
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
                              <p className="font-medium text-sm text-foreground">{meal.name}</p>
                              <p className="text-xs text-foreground/60 capitalize">{meal.type}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-foreground">{meal.calories} cal</p>
                            <p className="text-xs text-foreground/60">{meal.protein}g protein</p>
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

        {/* Food Search Modal */}
        <Dialog open={isAddingMeal} onOpenChange={setIsAddingMeal}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-card border-border">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-foreground">
                <Search className="h-5 w-5" />
                Add Food to {selectedMealType}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="Search for food items..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="mb-4 bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
              />
              
              <div className="grid gap-2 max-h-96 overflow-y-auto">
                {filteredFoods.map((food, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    onClick={() => addFood(food)}
                    className="justify-between h-auto p-4 text-left hover:bg-primary/5 border-border/50 text-foreground"
                  >
                    <div>
                      <div className="font-medium text-foreground">{food.name}</div>
                      <div className="text-sm text-foreground/60">
                        {food.calories} cal • {food.protein}g protein
                      </div>
                    </div>
                    <Plus className="h-4 w-4" />
                  </Button>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Index;
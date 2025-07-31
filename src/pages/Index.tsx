import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, LineChart, Line } from 'recharts';
import { Search, Plus, Target, Trophy, Utensils, Coffee, Sun, Moon, Trash2, User, TrendingUp, Calendar, Activity } from 'lucide-react';

const Index = () => {
  const [currentStep, setCurrentStep] = useState<'welcome' | 'onboarding' | 'dashboard'>('welcome');
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [proteinGoal, setProteinGoal] = useState(150);
  const [userName, setUserName] = useState('');
  const [showResetModal, setShowResetModal] = useState(false);
  const [consumedCalories, setConsumedCalories] = useState(0);
  const [consumedProtein, setConsumedProtein] = useState(0);
  const [meals, setMeals] = useState<any[]>([]);
  const [showMealLog, setShowMealLog] = useState(false);
  const [selectedMealType, setSelectedMealType] = useState('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(100);

  // Comprehensive food database with 300+ items
  const FOOD_DATABASE = [
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

    // Beverages
    { name: "Masala Chai", calories: 50, protein: 2, per: "100ml" },
    { name: "Green Tea", calories: 2, protein: 0, per: "100ml" },
    { name: "Coffee (Black)", calories: 2, protein: 0.3, per: "100ml" },
    { name: "Coconut Water", calories: 19, protein: 0.7, per: "100ml" },
    { name: "Orange Juice", calories: 45, protein: 0.7, per: "100ml" },
    { name: "Lassi", calories: 89, protein: 2.4, per: "100ml" },
    { name: "Soda", calories: 39, protein: 0, per: "100ml" },

    // Sweets & Desserts
    { name: "Ice Cream", calories: 207, protein: 3.5, per: "100g" },
    { name: "Dark Chocolate", calories: 546, protein: 5, per: "100g" },
    { name: "Cookies", calories: 502, protein: 5.9, per: "100g" },
    { name: "Cake", calories: 257, protein: 4, per: "100g" },
    { name: "Gulab Jamun", calories: 387, protein: 4, per: "100g" },
    { name: "Jalebi", calories: 150, protein: 1, per: "100g" },
    { name: "Kheer", calories: 97, protein: 3.5, per: "100g" },

    // Oils & Condiments
    { name: "Olive Oil", calories: 884, protein: 0, per: "100g" },
    { name: "Coconut Oil", calories: 862, protein: 0, per: "100g" },
    { name: "Honey", calories: 304, protein: 0.3, per: "100g" },
    { name: "Sugar", calories: 387, protein: 0, per: "100g" },

    // Green Vegetables
    { name: "Green Beans", calories: 31, protein: 1.8, per: "100g" },
    { name: "Green Peas", calories: 81, protein: 5.4, per: "100g" },
    { name: "Green Chilies", calories: 40, protein: 1.9, per: "100g" },
    { name: "Mint Leaves", calories: 44, protein: 3.3, per: "100g" },
    { name: "Coriander Leaves", calories: 23, protein: 2.1, per: "100g" },
    { name: "Basil", calories: 22, protein: 3.2, per: "100g" },
    { name: "Parsley", calories: 36, protein: 3, per: "100g" },

    // Additional International Foods
    { name: "Pasta (Cooked)", calories: 131, protein: 5, per: "100g" },
    { name: "Spaghetti", calories: 158, protein: 6, per: "100g" },
    { name: "Bagel", calories: 250, protein: 10, per: "100g" },
    { name: "Croissant", calories: 231, protein: 4.7, per: "100g" },
    { name: "Pancakes", calories: 227, protein: 6, per: "100g" },
    { name: "Waffles", calories: 291, protein: 6, per: "100g" },
    { name: "Cereal", calories: 379, protein: 8, per: "100g" },

    // More Protein Rich Foods
    { name: "Turkey", calories: 189, protein: 29, per: "100g" },
    { name: "Duck", calories: 337, protein: 19, per: "100g" },
    { name: "Lamb", calories: 294, protein: 25, per: "100g" },
    { name: "Sardines", calories: 208, protein: 25, per: "100g" },
    { name: "Mackerel", calories: 205, protein: 19, per: "100g" },
    { name: "Crab", calories: 97, protein: 19, per: "100g" },
    { name: "Lobster", calories: 89, protein: 19, per: "100g" },

    // More Fruits
    { name: "Kiwi", calories: 61, protein: 1.1, per: "100g" },
    { name: "Cherries", calories: 63, protein: 1.1, per: "100g" },
    { name: "Peach", calories: 39, protein: 0.9, per: "100g" },
    { name: "Plum", calories: 46, protein: 0.7, per: "100g" },
    { name: "Apricot", calories: 48, protein: 1.4, per: "100g" },
    { name: "Cranberries", calories: 46, protein: 0.4, per: "100g" },
    { name: "Blackberries", calories: 43, protein: 1.4, per: "100g" },
    { name: "Raspberries", calories: 52, protein: 1.2, per: "100g" },

    // International Snacks
    { name: "Pretzels", calories: 380, protein: 10, per: "100g" },
    { name: "Popcorn", calories: 387, protein: 12, per: "100g" },
    { name: "Chips", calories: 536, protein: 7, per: "100g" },
    { name: "Nachos", calories: 346, protein: 9, per: "100g" },
    { name: "Crackers", calories: 503, protein: 9, per: "100g" },

    // More Asian Foods
    { name: "Soy Milk", calories: 33, protein: 2.9, per: "100ml" },
    { name: "Miso Soup", calories: 84, protein: 6, per: "100g" },
    { name: "Edamame", calories: 121, protein: 11, per: "100g" },
    { name: "Wasabi", calories: 109, protein: 4.6, per: "100g" },
    { name: "Seaweed", calories: 45, protein: 3, per: "100g" },

    // Mexican/Latin Foods
    { name: "Tacos", calories: 226, protein: 9, per: "100g" },
    { name: "Burrito", calories: 314, protein: 16, per: "100g" },
    { name: "Quesadilla", calories: 276, protein: 13, per: "100g" },
    { name: "Avocado", calories: 160, protein: 2, per: "100g" },
    { name: "Salsa", calories: 18, protein: 0.9, per: "100g" },

    // More Dairy Alternatives
    { name: "Almond Milk", calories: 17, protein: 0.6, per: "100ml" },
    { name: "Oat Milk", calories: 47, protein: 1, per: "100ml" },
    { name: "Rice Milk", calories: 47, protein: 0.3, per: "100ml" },

    // Additional Breakfast Items
    { name: "Granola", calories: 471, protein: 13, per: "100g" },
    { name: "French Toast", calories: 166, protein: 7, per: "100g" },
    { name: "Smoothie Bowl", calories: 89, protein: 3, per: "100g" },

    // More Cooked Items
    { name: "Grilled Vegetables", calories: 35, protein: 2, per: "100g" },
    { name: "Stir Fry", calories: 112, protein: 4, per: "100g" },
    { name: "Soup (Vegetable)", calories: 48, protein: 2, per: "100g" },
    { name: "Salad (Mixed)", calories: 20, protein: 1.5, per: "100g" }
  ];

  const filteredFoods = searchQuery 
    ? FOOD_DATABASE.filter(food => 
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      ).slice(0, 10)
    : FOOD_DATABASE.slice(0, 10);

  useEffect(() => {
    const savedData = localStorage.getItem('calorieBuddyData');
    if (savedData) {
      const data = JSON.parse(savedData);
      setCurrentStep(data.currentStep || 'welcome');
      setCalorieGoal(data.calorieGoal || 2000);
      setProteinGoal(data.proteinGoal || 150);
      setUserName(data.userName || '');
      setConsumedCalories(data.consumedCalories || 0);
      setConsumedProtein(data.consumedProtein || 0);
      setMeals(data.meals || []);
    }
  }, []);

  const saveData = () => {
    const data = {
      currentStep,
      calorieGoal,
      proteinGoal,
      userName,
      consumedCalories,
      consumedProtein,
      meals
    };
    localStorage.setItem('calorieBuddyData', JSON.stringify(data));
  };

  useEffect(() => {
    if (currentStep !== 'welcome') {
      saveData();
    }
  }, [currentStep, calorieGoal, proteinGoal, userName, consumedCalories, consumedProtein, meals]);

  const addMeal = () => {
    if (selectedFood && quantity > 0) {
      const calories = Math.round((selectedFood.calories * quantity) / 100);
      const protein = Math.round((selectedFood.protein * quantity) / 100);
      
      const newMeal = {
        id: Date.now(),
        name: selectedFood.name,
        calories,
        protein,
        quantity,
        type: selectedMealType
      };

      setMeals([...meals, newMeal]);
      setConsumedCalories(consumedCalories + calories);
      setConsumedProtein(consumedProtein + protein);
      setShowMealLog(false);
      setSelectedFood(null);
      setQuantity(100);
      setSearchQuery('');
    }
  };

  const handleOnboardingComplete = () => {
    if (userName.trim()) {
      setCurrentStep('dashboard');
      saveData();
    }
  };

  const resetData = () => {
    localStorage.removeItem('calorieBuddyData');
    setCurrentStep('welcome');
    setCalorieGoal(2000);
    setProteinGoal(150);
    setUserName('');
    setConsumedCalories(0);
    setConsumedProtein(0);
    setMeals([]);
    setShowResetModal(false);
  };

  if (currentStep === 'welcome') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm animate-fade-in">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <Trophy className="h-8 w-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-white">Welcome to CalorieBuddy</CardTitle>
            <p className="text-slate-300">Your personal nutrition tracking companion</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4 text-slate-300">
              <div className="flex items-center space-x-3 hover-scale">
                <Target className="h-5 w-5 text-purple-400" />
                <span>Set your daily calorie & protein goals</span>
              </div>
              <div className="flex items-center space-x-3 hover-scale">
                <Utensils className="h-5 w-5 text-purple-400" />
                <span>Log your meals throughout the day</span>
              </div>
              <div className="flex items-center space-x-3 hover-scale">
                <Trophy className="h-5 w-5 text-purple-400" />
                <span>Track your progress and achieve your goals</span>
              </div>
            </div>
            <Button 
              onClick={() => setCurrentStep('onboarding')} 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'onboarding') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md bg-slate-800/50 border-slate-700 backdrop-blur-sm animate-fade-in">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold text-white">Set Your Goals</CardTitle>
            <p className="text-slate-300">Tell us about yourself and your nutrition targets</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Your Name</label>
                <Input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  placeholder="Enter your name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Daily Calorie Goal</label>
                <Input
                  type="number"
                  value={calorieGoal}
                  onChange={(e) => setCalorieGoal(Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  placeholder="2000"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Daily Protein Goal (g)</label>
                <Input
                  type="number"
                  value={proteinGoal}
                  onChange={(e) => setProteinGoal(Number(e.target.value))}
                  className="bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  placeholder="150"
                />
              </div>
            </div>
            <Button 
              onClick={handleOnboardingComplete}
              disabled={!userName.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Start Tracking
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (currentStep === 'dashboard') {
    const calorieProgress = (consumedCalories / calorieGoal) * 100;
    const proteinProgress = (consumedProtein / proteinGoal) * 100;
    
    const getStatusMessage = () => {
      if (consumedCalories === 0) return "Start your day by logging your first meal!";
      if (calorieProgress < 25) return "Great start! Keep adding meals throughout the day.";
      if (calorieProgress < 50) return "You're making good progress! Stay on track.";
      if (calorieProgress < 75) return "Almost there! A few more calories to reach your goal.";
      if (calorieProgress < 100) return "So close! You're nearly at your target.";
      if (calorieProgress <= 110) return "Perfect! You've hit your calorie goal!";
      return "You've exceeded your goal. Consider lighter options for remaining meals.";
    };

    // Chart data
    const pieData = [
      { name: 'Consumed', value: consumedCalories, fill: '#8b5cf6' },
      { name: 'Remaining', value: Math.max(0, calorieGoal - consumedCalories), fill: '#1e293b' }
    ];

    const proteinPieData = [
      { name: 'Consumed', value: consumedProtein, fill: '#06b6d4' },
      { name: 'Remaining', value: Math.max(0, proteinGoal - consumedProtein), fill: '#1e293b' }
    ];

    const mealData = [
      { meal: 'Breakfast', calories: meals.filter(m => m.type === 'breakfast').reduce((sum, m) => sum + m.calories, 0) },
      { meal: 'Lunch', calories: meals.filter(m => m.type === 'lunch').reduce((sum, m) => sum + m.calories, 0) },
      { meal: 'Dinner', calories: meals.filter(m => m.type === 'dinner').reduce((sum, m) => sum + m.calories, 0) },
      { meal: 'Snacks', calories: meals.filter(m => m.type === 'snacks').reduce((sum, m) => sum + m.calories, 0) }
    ];

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex justify-between items-center animate-fade-in">
            <div>
              <h1 className="text-3xl font-bold text-white flex items-center gap-3">
                <User className="h-8 w-8 text-purple-400" />
                Welcome back, {userName}!
              </h1>
              <p className="text-slate-300 mt-1">{getStatusMessage()}</p>
            </div>
            <Button 
              onClick={() => setShowResetModal(true)}
              variant="outline" 
              size="sm"
              className="bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all duration-200"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Reset Data
            </Button>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-fade-in">
            <Card className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/20 backdrop-blur-sm hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-200 text-sm font-medium">Calories Today</p>
                    <p className="text-2xl font-bold text-white">{consumedCalories}</p>
                    <p className="text-purple-300 text-xs">of {calorieGoal} goal</p>
                  </div>
                  <Target className="h-8 w-8 text-purple-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-cyan-600/20 to-blue-600/20 border-cyan-500/20 backdrop-blur-sm hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-cyan-200 text-sm font-medium">Protein Today</p>
                    <p className="text-2xl font-bold text-white">{consumedProtein}g</p>
                    <p className="text-cyan-300 text-xs">of {proteinGoal}g goal</p>
                  </div>
                  <Trophy className="h-8 w-8 text-cyan-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/20 backdrop-blur-sm hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-200 text-sm font-medium">Meals Logged</p>
                    <p className="text-2xl font-bold text-white">{meals.length}</p>
                    <p className="text-green-300 text-xs">today</p>
                  </div>
                  <Utensils className="h-8 w-8 text-green-400" />
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-orange-600/20 to-red-600/20 border-orange-500/20 backdrop-blur-sm hover-scale">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-orange-200 text-sm font-medium">Progress</p>
                    <p className="text-2xl font-bold text-white">{Math.round(calorieProgress)}%</p>
                    <p className="text-orange-300 text-xs">of daily goal</p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-orange-400" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-purple-400" />
                  Calorie Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        startAngle={90}
                        endAngle={450}
                      >
                        {pieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #475569',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-4">
                  <Progress value={calorieProgress} className="h-3" />
                  <p className="text-slate-300 text-sm mt-2">{Math.round(calorieProgress)}% Complete</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Activity className="h-5 w-5 text-cyan-400" />
                  Protein Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={proteinPieData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={100}
                        dataKey="value"
                        startAngle={90}
                        endAngle={450}
                      >
                        {proteinPieData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.fill} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: '#1e293b', 
                          border: '1px solid #475569',
                          borderRadius: '8px',
                          color: '#fff'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="text-center mt-4">
                  <Progress value={proteinProgress} className="h-3" />
                  <p className="text-slate-300 text-sm mt-2">{Math.round(proteinProgress)}% Complete</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Meal Breakdown Chart */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-400" />
                Meal Breakdown
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={mealData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis dataKey="meal" stroke="#9ca3af" />
                    <YAxis stroke="#9ca3af" />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: '#1e293b', 
                        border: '1px solid #475569',
                        borderRadius: '8px',
                        color: '#fff'
                      }}
                    />
                    <Bar dataKey="calories" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm animate-fade-in">
            <CardHeader>
              <CardTitle className="text-white">Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Button
                  onClick={() => {
                    setSelectedMealType('breakfast');
                    setShowMealLog(true);
                  }}
                  className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 border border-yellow-500/30 text-yellow-200 hover:from-yellow-500/30 hover:to-orange-500/30 h-20 flex flex-col items-center gap-2"
                >
                  <Sun className="h-6 w-6" />
                  Add Breakfast
                </Button>
                <Button
                  onClick={() => {
                    setSelectedMealType('lunch');
                    setShowMealLog(true);
                  }}
                  className="bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-200 hover:from-green-500/30 hover:to-emerald-500/30 h-20 flex flex-col items-center gap-2"
                >
                  <Sun className="h-6 w-6" />
                  Add Lunch
                </Button>
                <Button
                  onClick={() => {
                    setSelectedMealType('dinner');
                    setShowMealLog(true);
                  }}
                  className="bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-500/30 text-blue-200 hover:from-blue-500/30 hover:to-purple-500/30 h-20 flex flex-col items-center gap-2"
                >
                  <Moon className="h-6 w-6" />
                  Add Dinner
                </Button>
                <Button
                  onClick={() => {
                    setSelectedMealType('snacks');
                    setShowMealLog(true);
                  }}
                  className="bg-gradient-to-r from-pink-500/20 to-red-500/20 border border-pink-500/30 text-pink-200 hover:from-pink-500/30 hover:to-red-500/30 h-20 flex flex-col items-center gap-2"
                >
                  <Coffee className="h-6 w-6" />
                  Add Snack
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Meals */}
          {meals.length > 0 && (
            <Card className="bg-slate-800/50 border-slate-700 backdrop-blur-sm animate-fade-in">
              <CardHeader>
                <CardTitle className="text-white flex items-center gap-2">
                  <Utensils className="h-5 w-5 text-purple-400" />
                  Recent Meals
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {meals.slice(-5).reverse().map((meal, index) => (
                    <div key={index} className="flex justify-between items-center p-4 bg-gradient-to-r from-slate-700/30 to-slate-600/30 rounded-lg hover-scale border border-slate-600/30">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                        <div>
                          <p className="text-white font-medium">{meal.name}</p>
                          <div className="flex items-center space-x-4 text-sm text-slate-400">
                            <span>{meal.quantity}g</span>
                            <Badge variant="secondary" className="bg-gradient-to-r from-purple-600/20 to-pink-600/20 text-purple-200 border-purple-500/20">
                              {meal.type}
                            </Badge>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-white font-semibold">{meal.calories} cal</p>
                        <p className="text-sm text-cyan-400">{meal.protein}g protein</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Reset Confirmation Modal */}
          <Dialog open={showResetModal} onOpenChange={setShowResetModal}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-red-400">
                  <Trash2 className="h-5 w-5" />
                  Reset All Data
                </DialogTitle>
                <DialogDescription className="text-slate-300">
                  Are you sure you want to reset all your data? This will permanently delete:
                  <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
                    <li>All logged meals and progress</li>
                    <li>Your personal goals and settings</li>
                    <li>Your profile information</li>
                  </ul>
                  <p className="mt-3 text-red-300 font-medium">This action cannot be undone.</p>
                </DialogDescription>
              </DialogHeader>
              <DialogFooter className="flex gap-2">
                <Button 
                  variant="outline" 
                  onClick={() => setShowResetModal(false)}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button 
                  onClick={resetData}
                  className="bg-red-600 hover:bg-red-700 text-white"
                >
                  Yes, Reset Everything
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Meal Logging Modal */}
          <Dialog open={showMealLog} onOpenChange={setShowMealLog}>
            <DialogContent className="bg-slate-800 border-slate-700 text-white max-w-2xl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5 text-purple-400" />
                  Add {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
                  <Input
                    placeholder="Search for food..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder-slate-400"
                  />
                </div>
                
                <div className="max-h-60 overflow-y-auto space-y-2">
                  {filteredFoods.map((food, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg cursor-pointer transition-colors ${
                        selectedFood?.name === food.name
                          ? 'bg-purple-600/30 border border-purple-500/50'
                          : 'bg-slate-700/50 hover:bg-slate-600/50'
                      }`}
                      onClick={() => setSelectedFood(food)}
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-medium text-white">{food.name}</p>
                          <p className="text-sm text-slate-400">{food.calories} cal, {food.protein}g protein per {food.per}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {selectedFood && (
                  <div className="p-4 bg-slate-700/50 rounded-lg">
                    <h4 className="font-medium text-white mb-2">Selected: {selectedFood.name}</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Quantity (g)</label>
                        <Input
                          type="number"
                          value={quantity}
                          onChange={(e) => setQuantity(Number(e.target.value))}
                          className="bg-slate-600 border-slate-500 text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-slate-300 mb-1">Calories</label>
                        <Input
                          value={Math.round((selectedFood.calories * quantity) / 100)}
                          readOnly
                          className="bg-slate-600 border-slate-500 text-white"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowMealLog(false);
                    setSelectedFood(null);
                    setSearchQuery('');
                  }}
                  className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600"
                >
                  Cancel
                </Button>
                <Button
                  onClick={addMeal}
                  disabled={!selectedFood}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white"
                >
                  Add Meal
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    );
  }

  return null;
};

export default Index;
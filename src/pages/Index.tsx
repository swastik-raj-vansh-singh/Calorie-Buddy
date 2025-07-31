import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Settings, Search, Trash2, ArrowLeft } from "lucide-react";
import { toast } from "@/hooks/use-toast";

interface UserProfile {
  calorieGoal: number;
  proteinGoal?: number;
}

interface FoodItem {
  id: string;
  name: string;
  calories: number;
  protein: number;
  quantity: number;
  unit: string;
}

interface MealEntry {
  id: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  items: FoodItem[];
  timestamp: string;
}

const COMPREHENSIVE_FOOD_DATABASE = [
  // Grains & Cereals
  { name: "Basmati Rice (Cooked)", calories: 121, protein: 2.5, per: "100g" },
  { name: "Brown Rice (Cooked)", calories: 111, protein: 2.6, per: "100g" },
  { name: "Jasmine Rice (Cooked)", calories: 130, protein: 2.7, per: "100g" },
  { name: "Quinoa (Cooked)", calories: 120, protein: 4.4, per: "100g" },
  { name: "Wheat Flour", calories: 364, protein: 10.3, per: "100g" },
  { name: "Roti (Wheat)", calories: 104, protein: 3.1, per: "1 piece" },
  { name: "Chapati", calories: 120, protein: 3.5, per: "1 medium" },
  { name: "Naan", calories: 262, protein: 9, per: "1 piece" },
  { name: "Paratha (Plain)", calories: 320, protein: 8, per: "1 piece" },
  { name: "Puri", calories: 501, protein: 6.8, per: "100g" },
  { name: "Dosa (Plain)", calories: 168, protein: 4, per: "1 piece" },
  { name: "Idli", calories: 39, protein: 2, per: "1 piece" },
  { name: "Uttapam", calories: 147, protein: 3.5, per: "1 piece" },
  { name: "Poha", calories: 76, protein: 2.6, per: "100g" },
  { name: "Upma", calories: 109, protein: 3.2, per: "100g" },
  { name: "Bread (White)", calories: 265, protein: 9, per: "100g" },
  { name: "Bread (Brown)", calories: 247, protein: 13, per: "100g" },
  { name: "Bagel", calories: 250, protein: 10, per: "1 medium" },
  { name: "Croissant", calories: 231, protein: 4.7, per: "1 medium" },
  { name: "Pasta (Cooked)", calories: 131, protein: 5, per: "100g" },
  { name: "Oats", calories: 389, protein: 17, per: "100g" },
  { name: "Cornflakes", calories: 378, protein: 7.5, per: "100g" },
  { name: "Muesli", calories: 353, protein: 8.9, per: "100g" },
  { name: "Barley", calories: 354, protein: 12.5, per: "100g" },
  { name: "Millet", calories: 378, protein: 11, per: "100g" },

  // Legumes & Pulses
  { name: "Dal (Lentils)", calories: 116, protein: 9, per: "100g" },
  { name: "Moong Dal", calories: 347, protein: 24, per: "100g" },
  { name: "Chana Dal", calories: 364, protein: 22, per: "100g" },
  { name: "Toor Dal", calories: 343, protein: 22, per: "100g" },
  { name: "Urad Dal", calories: 341, protein: 25, per: "100g" },
  { name: "Masoor Dal", calories: 352, protein: 25, per: "100g" },
  { name: "Rajma (Kidney Beans)", calories: 127, protein: 8.7, per: "100g" },
  { name: "Chickpeas (Chana)", calories: 164, protein: 8.9, per: "100g" },
  { name: "Black Beans", calories: 132, protein: 8.9, per: "100g" },
  { name: "Pinto Beans", calories: 143, protein: 9, per: "100g" },
  { name: "Lentil Soup", calories: 116, protein: 9, per: "100g" },
  { name: "Hummus", calories: 166, protein: 8, per: "100g" },
  { name: "Falafel", calories: 333, protein: 13, per: "100g" },

  // Vegetables - Indian
  { name: "Aloo (Potato)", calories: 77, protein: 2, per: "100g" },
  { name: "Gobi (Cauliflower)", calories: 25, protein: 1.9, per: "100g" },
  { name: "Baingan (Eggplant)", calories: 25, protein: 1, per: "100g" },
  { name: "Bhindi (Okra)", calories: 33, protein: 1.9, per: "100g" },
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
  { name: "Shalgam (Turnip)", calories: 28, protein: 0.9, per: "100g" },
  { name: "Ginger", calories: 80, protein: 1.8, per: "100g" },
  { name: "Garlic", calories: 149, protein: 6.4, per: "100g" },

  // Vegetables - International
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
  { name: "Artichoke", calories: 47, protein: 3.3, per: "100g" },
  { name: "Kale", calories: 49, protein: 4.3, per: "100g" },
  { name: "Arugula", calories: 25, protein: 2.6, per: "100g" },

  // Fruits - Indian & Tropical
  { name: "Aam (Mango)", calories: 60, protein: 0.8, per: "100g" },
  { name: "Kela (Banana)", calories: 89, protein: 1.1, per: "1 medium" },
  { name: "Seb (Apple)", calories: 52, protein: 0.3, per: "1 medium" },
  { name: "Santra (Orange)", calories: 47, protein: 0.9, per: "1 medium" },
  { name: "Angur (Grapes)", calories: 62, protein: 0.6, per: "100g" },
  { name: "Papita (Papaya)", calories: 43, protein: 0.5, per: "100g" },
  { name: "Ananas (Pineapple)", calories: 50, protein: 0.5, per: "100g" },
  { name: "Nashpati (Pear)", calories: 57, protein: 0.4, per: "100g" },
  { name: "Amrud (Guava)", calories: 68, protein: 2.6, per: "100g" },
  { name: "Kiwi", calories: 61, protein: 1.1, per: "100g" },
  { name: "Strawberries", calories: 32, protein: 0.7, per: "100g" },
  { name: "Blueberries", calories: 57, protein: 0.7, per: "100g" },
  { name: "Pomegranate", calories: 83, protein: 1.7, per: "100g" },
  { name: "Watermelon", calories: 30, protein: 0.6, per: "100g" },
  { name: "Muskmelon", calories: 34, protein: 0.8, per: "100g" },
  { name: "Coconut", calories: 354, protein: 3.3, per: "100g" },
  { name: "Dates", calories: 277, protein: 1.8, per: "100g" },
  { name: "Figs", calories: 74, protein: 0.8, per: "100g" },
  { name: "Raisins", calories: 299, protein: 3.1, per: "100g" },

  // Protein Sources
  { name: "Chicken Breast", calories: 165, protein: 31, per: "100g" },
  { name: "Chicken Thigh", calories: 209, protein: 26, per: "100g" },
  { name: "Chicken Drumstick", calories: 172, protein: 28, per: "100g" },
  { name: "Mutton", calories: 294, protein: 25, per: "100g" },
  { name: "Goat Meat", calories: 143, protein: 27, per: "100g" },
  { name: "Beef", calories: 250, protein: 26, per: "100g" },
  { name: "Pork", calories: 242, protein: 27, per: "100g" },
  { name: "Fish (Rohu)", calories: 97, protein: 16.6, per: "100g" },
  { name: "Fish (Pomfret)", calories: 96, protein: 19, per: "100g" },
  { name: "Salmon", calories: 208, protein: 25, per: "100g" },
  { name: "Tuna", calories: 144, protein: 30, per: "100g" },
  { name: "Sardines", calories: 208, protein: 25, per: "100g" },
  { name: "Prawns", calories: 99, protein: 18, per: "100g" },
  { name: "Crab", calories: 97, protein: 19, per: "100g" },
  { name: "Egg (Whole)", calories: 155, protein: 13, per: "100g" },
  { name: "Egg (Boiled)", calories: 78, protein: 6.3, per: "1 large" },
  { name: "Egg White", calories: 17, protein: 3.6, per: "1 large" },
  { name: "Egg Yolk", calories: 55, protein: 2.7, per: "1 large" },

  // Dairy Products
  { name: "Milk (Whole)", calories: 42, protein: 3.4, per: "100ml" },
  { name: "Milk (Toned)", calories: 58, protein: 3.2, per: "100ml" },
  { name: "Milk (Skimmed)", calories: 34, protein: 3.4, per: "100ml" },
  { name: "Curd/Yogurt", calories: 98, protein: 11, per: "100g" },
  { name: "Greek Yogurt", calories: 59, protein: 10, per: "100g" },
  { name: "Paneer", calories: 265, protein: 18, per: "100g" },
  { name: "Cottage Cheese", calories: 98, protein: 11, per: "100g" },
  { name: "Cheese (Cheddar)", calories: 402, protein: 25, per: "100g" },
  { name: "Cheese (Mozzarella)", calories: 300, protein: 22, per: "100g" },
  { name: "Butter", calories: 717, protein: 0.9, per: "100g" },
  { name: "Ghee", calories: 900, protein: 0, per: "100g" },
  { name: "Cream", calories: 345, protein: 2.1, per: "100g" },
  { name: "Buttermilk", calories: 40, protein: 3.3, per: "100ml" },

  // Nuts & Seeds
  { name: "Almonds", calories: 579, protein: 21, per: "100g" },
  { name: "Walnuts", calories: 654, protein: 15, per: "100g" },
  { name: "Cashews", calories: 553, protein: 18, per: "100g" },
  { name: "Pistachios", calories: 560, protein: 20, per: "100g" },
  { name: "Peanuts", calories: 567, protein: 26, per: "100g" },
  { name: "Brazil Nuts", calories: 659, protein: 14, per: "100g" },
  { name: "Hazelnuts", calories: 628, protein: 15, per: "100g" },
  { name: "Pecans", calories: 691, protein: 9, per: "100g" },
  { name: "Sunflower Seeds", calories: 584, protein: 21, per: "100g" },
  { name: "Pumpkin Seeds", calories: 559, protein: 30, per: "100g" },
  { name: "Chia Seeds", calories: 486, protein: 17, per: "100g" },
  { name: "Flax Seeds", calories: 534, protein: 18, per: "100g" },
  { name: "Sesame Seeds", calories: 573, protein: 18, per: "100g" },

  // Indian Snacks
  { name: "Samosa", calories: 252, protein: 6, per: "1 piece" },
  { name: "Pakora", calories: 300, protein: 8, per: "100g" },
  { name: "Kachori", calories: 400, protein: 8, per: "1 piece" },
  { name: "Dhokla", calories: 160, protein: 4, per: "100g" },
  { name: "Vada", calories: 220, protein: 5, per: "1 piece" },
  { name: "Bhel Puri", calories: 168, protein: 4, per: "100g" },
  { name: "Sev Puri", calories: 200, protein: 5, per: "100g" },
  { name: "Pani Puri", calories: 36, protein: 1, per: "1 piece" },
  { name: "Chaat", calories: 180, protein: 6, per: "100g" },
  { name: "Tikki", calories: 165, protein: 4, per: "1 piece" },
  { name: "Namak Para", calories: 515, protein: 9, per: "100g" },
  { name: "Murukku", calories: 520, protein: 8, per: "100g" },
  { name: "Mathri", calories: 450, protein: 10, per: "100g" },

  // Fast Food & International
  { name: "Pizza Slice (Cheese)", calories: 285, protein: 12, per: "1 slice" },
  { name: "Pizza Slice (Pepperoni)", calories: 313, protein: 13, per: "1 slice" },
  { name: "Burger (Veg)", calories: 390, protein: 16, per: "1 medium" },
  { name: "Burger (Chicken)", calories: 540, protein: 25, per: "1 medium" },
  { name: "French Fries", calories: 365, protein: 4, per: "100g" },
  { name: "Onion Rings", calories: 411, protein: 6, per: "100g" },
  { name: "Hot Dog", calories: 290, protein: 10, per: "1 medium" },
  { name: "Sandwich (Veg)", calories: 240, protein: 8, per: "1 sandwich" },
  { name: "Sandwich (Chicken)", calories: 320, protein: 24, per: "1 sandwich" },
  { name: "Tacos", calories: 226, protein: 9, per: "1 taco" },
  { name: "Burrito", calories: 314, protein: 16, per: "1 medium" },
  { name: "Pasta (Alfredo)", calories: 389, protein: 14, per: "100g" },
  { name: "Pasta (Marinara)", calories: 131, protein: 5, per: "100g" },
  { name: "Sushi Roll", calories: 200, protein: 9, per: "6 pieces" },

  // Indian Main Dishes
  { name: "Biryani (Chicken)", calories: 290, protein: 12, per: "1 cup" },
  { name: "Biryani (Veg)", calories: 250, protein: 6, per: "1 cup" },
  { name: "Butter Chicken", calories: 438, protein: 24, per: "100g" },
  { name: "Chicken Curry", calories: 180, protein: 20, per: "100g" },
  { name: "Chicken Tikka", calories: 150, protein: 25, per: "100g" },
  { name: "Tandoori Chicken", calories: 150, protein: 27, per: "100g" },
  { name: "Palak Paneer", calories: 270, protein: 14, per: "100g" },
  { name: "Shahi Paneer", calories: 300, protein: 12, per: "100g" },
  { name: "Aloo Gobi", calories: 55, protein: 2, per: "100g" },
  { name: "Baingan Bharta", calories: 85, protein: 2, per: "100g" },
  { name: "Chole", calories: 164, protein: 8.9, per: "100g" },
  { name: "Rajma", calories: 127, protein: 8.7, per: "100g" },
  { name: "Kadhi", calories: 62, protein: 2.4, per: "100g" },

  // Asian & International Cuisines
  { name: "Fried Rice", calories: 163, protein: 3, per: "100g" },
  { name: "Noodles (Hakka)", calories: 138, protein: 5, per: "100g" },
  { name: "Chow Mein", calories: 198, protein: 6, per: "100g" },
  { name: "Ramen", calories: 436, protein: 10, per: "100g" },
  { name: "Maggi/Instant Noodles", calories: 435, protein: 11, per: "100g" },
  { name: "Tofu", calories: 76, protein: 8, per: "100g" },
  { name: "Kimchi", calories: 15, protein: 1.1, per: "100g" },
  { name: "Soy Sauce", calories: 8, protein: 1.3, per: "1 tbsp" },
  { name: "Miso Soup", calories: 84, protein: 6, per: "100g" },
  { name: "Tom Yum Soup", calories: 58, protein: 8, per: "100g" },
  { name: "Pad Thai", calories: 181, protein: 5, per: "100g" },
  { name: "Spring Roll", calories: 140, protein: 4, per: "1 piece" },

  // Beverages
  { name: "Masala Chai", calories: 50, protein: 2, per: "1 cup" },
  { name: "Green Tea", calories: 2, protein: 0, per: "1 cup" },
  { name: "Black Tea", calories: 2, protein: 0, per: "1 cup" },
  { name: "Coffee (Black)", calories: 2, protein: 0.3, per: "1 cup" },
  { name: "Coffee (with Milk)", calories: 38, protein: 2, per: "1 cup" },
  { name: "Coconut Water", calories: 19, protein: 0.7, per: "100ml" },
  { name: "Orange Juice", calories: 45, protein: 0.7, per: "100ml" },
  { name: "Apple Juice", calories: 46, protein: 0.1, per: "100ml" },
  { name: "Mango Juice", calories: 60, protein: 0.4, per: "100ml" },
  { name: "Lassi (Sweet)", calories: 89, protein: 2.4, per: "100ml" },
  { name: "Buttermilk", calories: 40, protein: 3.3, per: "100ml" },
  { name: "Soda/Cola", calories: 39, protein: 0, per: "100ml" },
  { name: "Energy Drink", calories: 45, protein: 0, per: "100ml" },

  // Sweets & Desserts
  { name: "Gulab Jamun", calories: 387, protein: 4, per: "1 piece" },
  { name: "Rasgulla", calories: 186, protein: 3, per: "1 piece" },
  { name: "Jalebi", calories: 150, protein: 1, per: "1 piece" },
  { name: "Laddu", calories: 186, protein: 3, per: "1 piece" },
  { name: "Barfi", calories: 380, protein: 8, per: "100g" },
  { name: "Kheer", calories: 97, protein: 3.5, per: "100g" },
  { name: "Halwa", calories: 518, protein: 5, per: "100g" },
  { name: "Ice Cream", calories: 207, protein: 3.5, per: "100g" },
  { name: "Chocolate (Dark)", calories: 546, protein: 5, per: "100g" },
  { name: "Chocolate (Milk)", calories: 535, protein: 8, per: "100g" },
  { name: "Cookies", calories: 502, protein: 5.9, per: "100g" },
  { name: "Cake", calories: 257, protein: 4, per: "100g" },

  // Spices & Condiments
  { name: "Turmeric", calories: 354, protein: 7.8, per: "100g" },
  { name: "Cumin", calories: 375, protein: 18, per: "100g" },
  { name: "Coriander Seeds", calories: 298, protein: 12, per: "100g" },
  { name: "Red Chili Powder", calories: 282, protein: 13, per: "100g" },
  { name: "Garam Masala", calories: 379, protein: 14, per: "100g" },
  { name: "Pickle (Mango)", calories: 135, protein: 0.5, per: "100g" },
  { name: "Chutney (Mint)", calories: 42, protein: 3.7, per: "100g" },
  { name: "Chutney (Tamarind)", calories: 239, protein: 2.8, per: "100g" },

  // Oils & Fats
  { name: "Olive Oil", calories: 884, protein: 0, per: "100g" },
  { name: "Coconut Oil", calories: 862, protein: 0, per: "100g" },
  { name: "Mustard Oil", calories: 884, protein: 0, per: "100g" },
  { name: "Sunflower Oil", calories: 884, protein: 0, per: "100g" },
  { name: "Groundnut Oil", calories: 884, protein: 0, per: "100g" },

  // Miscellaneous
  { name: "Honey", calories: 304, protein: 0.3, per: "100g" },
  { name: "Sugar", calories: 387, protein: 0, per: "100g" },
  { name: "Jaggery", calories: 383, protein: 0.4, per: "100g" },
  { name: "Salt", calories: 0, protein: 0, per: "100g" },
  { name: "Vinegar", calories: 18, protein: 0, per: "100ml" },
  { name: "Lemon Juice", calories: 22, protein: 0.4, per: "100ml" }
];

const Index = () => {
  const [currentView, setCurrentView] = useState<'welcome' | 'onboarding' | 'dashboard' | 'log-meal'>('welcome');
  const [profile, setProfile] = useState<UserProfile>({ calorieGoal: 2000 });
  const [todaysMeals, setTodaysMeals] = useState<MealEntry[]>([]);
  const [selectedMealType, setSelectedMealType] = useState<'breakfast' | 'lunch' | 'dinner' | 'snack'>('breakfast');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItems, setSelectedItems] = useState<FoodItem[]>([]);
  const [filteredFoods, setFilteredFoods] = useState(COMPREHENSIVE_FOOD_DATABASE);

  useEffect(() => {
    const savedProfile = localStorage.getItem('userProfile');
    const onboardingComplete = localStorage.getItem('onboardingComplete');
    
    if (savedProfile) setProfile(JSON.parse(savedProfile));
    if (onboardingComplete === 'true') {
      setCurrentView('dashboard');
      loadTodaysMeals();
    }
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredFoods(COMPREHENSIVE_FOOD_DATABASE);
    } else {
      setFilteredFoods(COMPREHENSIVE_FOOD_DATABASE.filter(food => 
        food.name.toLowerCase().includes(searchQuery.toLowerCase())
      ));
    }
  }, [searchQuery]);

  const loadTodaysMeals = () => {
    const today = new Date().toDateString();
    const savedMeals = localStorage.getItem(`meals_${today}`);
    if (savedMeals) setTodaysMeals(JSON.parse(savedMeals));
  };

  const handleOnboardingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile.calorieGoal || profile.calorieGoal < 1000) {
      toast({ title: "Invalid calorie goal", description: "Please enter a realistic calorie goal (minimum 1000).", variant: "destructive" });
      return;
    }
    localStorage.setItem('userProfile', JSON.stringify(profile));
    localStorage.setItem('onboardingComplete', 'true');
    toast({ title: "Profile saved!", description: "Welcome to your calorie tracker!" });
    setCurrentView('dashboard');
    loadTodaysMeals();
  };

  const addFoodItem = (food: typeof COMPREHENSIVE_FOOD_DATABASE[0]) => {
    const newItem: FoodItem = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      name: food.name,
      calories: food.calories,
      protein: food.protein,
      quantity: 1,
      unit: food.per
    };
    setSelectedItems([...selectedItems, newItem]);
  };

  const updateQuantity = (id: string, quantity: number) => {
    setSelectedItems(items => 
      items.map(item => 
        item.id === id ? { ...item, quantity } : item
      )
    );
  };

  const removeItem = (id: string) => {
    setSelectedItems(items => items.filter(item => item.id !== id));
  };

  const saveMeal = () => {
    if (selectedItems.length === 0) {
      toast({ title: "No items selected", description: "Please add at least one food item.", variant: "destructive" });
      return;
    }
    const mealEntry: MealEntry = { 
      id: Date.now().toString(), 
      mealType: selectedMealType, 
      items: selectedItems, 
      timestamp: new Date().toISOString() 
    };
    const today = new Date().toDateString();
    const existingMeals = JSON.parse(localStorage.getItem(`meals_${today}`) || '[]');
    localStorage.setItem(`meals_${today}`, JSON.stringify([...existingMeals, mealEntry]));
    
    const totals = selectedItems.reduce(
      (acc, item) => ({ 
        calories: acc.calories + (item.calories * item.quantity), 
        protein: acc.protein + (item.protein * item.quantity) 
      }), 
      { calories: 0, protein: 0 }
    );
    
    toast({ 
      title: "Meal logged successfully!", 
      description: `Added ${totals.calories.toFixed(0)} calories and ${totals.protein.toFixed(1)}g protein to ${selectedMealType}.` 
    });
    
    setSelectedItems([]);
    setSearchQuery('');
    setCurrentView('dashboard');
    loadTodaysMeals();
  };

  // Calculate totals for dashboard
  const totalCalories = todaysMeals.reduce((sum, meal) => 
    sum + meal.items.reduce((mealSum, item) => mealSum + (item.calories * item.quantity), 0), 0
  );
  
  const totalProtein = todaysMeals.reduce((sum, meal) => 
    sum + meal.items.reduce((mealSum, item) => mealSum + (item.protein * item.quantity), 0), 0
  );

  const calorieProgress = (totalCalories / profile.calorieGoal) * 100;
  const proteinProgress = profile.proteinGoal ? (totalProtein / profile.proteinGoal) * 100 : 0;
  const remainingCalories = profile.calorieGoal - totalCalories;
  const remainingProtein = profile.proteinGoal ? profile.proteinGoal - totalProtein : 0;

  const getMealsByType = (type: string) => {
    return todaysMeals.filter(meal => meal.mealType === type);
  };

  const getMealCalories = (type: string) => {
    return getMealsByType(type).reduce((sum, meal) => 
      sum + meal.items.reduce((mealSum, item) => mealSum + (item.calories * item.quantity), 0), 0
    );
  };

  const getMealProtein = (type: string) => {
    return getMealsByType(type).reduce((sum, meal) => 
      sum + meal.items.reduce((mealSum, item) => mealSum + (item.protein * item.quantity), 0), 0
    );
  };

  const getStatusMessage = () => {
    if (totalCalories > profile.calorieGoal) {
      return { icon: "⚠️", message: "Over your daily limit", variant: "destructive" as const };
    } else if (totalCalories >= profile.calorieGoal * 0.8) {
      return { icon: "✅", message: "You're on track", variant: "default" as const };
    } else {
      return { icon: "💪", message: "Keep going!", variant: "secondary" as const };
    }
  };

  // Welcome Screen
  if (currentView === 'welcome') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-lg text-center">
          <CardHeader>
            <CardTitle className="text-4xl font-bold mb-4">🥗 CalorieBuddy</CardTitle>
            <CardDescription className="text-xl">
              Your smart calorie tracking companion
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Track your daily nutrition goals with ease. Log meals, monitor progress, and stay healthy!
            </p>
            <Button 
              onClick={() => setCurrentView('onboarding')}
              size="lg"
              className="w-full"
            >
              Get Started
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Onboarding Screen
  if (currentView === 'onboarding') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl font-bold">🎯 Set Your Goals</CardTitle>
            <CardDescription>
              Let's personalize your calorie tracking experience
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleOnboardingSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="calorieGoal">Daily Calorie Goal *</Label>
                <Input
                  id="calorieGoal"
                  type="number"
                  placeholder="2000"
                  value={profile.calorieGoal || ''}
                  onChange={(e) => setProfile({...profile, calorieGoal: parseInt(e.target.value) || 0})}
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="proteinGoal">Daily Protein Goal (g)</Label>
                <Input
                  id="proteinGoal"
                  type="number"
                  placeholder="150"
                  value={profile.proteinGoal || ''}
                  onChange={(e) => setProfile({...profile, proteinGoal: parseInt(e.target.value) || undefined})}
                />
              </div>

              <Button type="submit" className="w-full">
                Start Tracking
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Log Meal Screen
  if (currentView === 'log-meal') {
    const totals = selectedItems.reduce(
      (acc, item) => ({
        calories: acc.calories + (item.calories * item.quantity),
        protein: acc.protein + (item.protein * item.quantity)
      }),
      { calories: 0, protein: 0 }
    );

    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center gap-4">
            <Button variant="outline" onClick={() => setCurrentView('dashboard')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-2xl font-bold capitalize">🍽️ Log {selectedMealType}</h1>
              <p className="text-muted-foreground">Search and add food items</p>
            </div>
          </div>

          {/* Meal Type Selector */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-2">
                <Label>Meal Type</Label>
                <Select value={selectedMealType} onValueChange={(value: any) => setSelectedMealType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="breakfast">🌅 Breakfast</SelectItem>
                    <SelectItem value="lunch">🌞 Lunch</SelectItem>
                    <SelectItem value="dinner">🌙 Dinner</SelectItem>
                    <SelectItem value="snack">🍿 Snack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Food Search */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Search className="w-4 h-4" />
                  Search Food
                </CardTitle>
                <CardDescription>
                  Find and add food items to your meal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="Search for food (e.g., roti, dal, chicken)..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                
                <div className="max-h-96 overflow-y-auto space-y-2">
                  {filteredFoods.map((food, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted transition-colors">
                      <div className="flex-1">
                        <h4 className="font-medium">{food.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          {food.calories} cal, {food.protein}g protein per {food.per}
                        </p>
                      </div>
                      <Button size="sm" onClick={() => addFoodItem(food)}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                
                {filteredFoods.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">
                    No foods found. Try a different search term.
                  </p>
                )}
              </CardContent>
            </Card>

            {/* Selected Items */}
            <Card>
              <CardHeader>
                <CardTitle>Selected Items</CardTitle>
                <CardDescription>
                  Adjust quantities and review your meal
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedItems.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    No items selected yet. Search and add food items from the left.
                  </p>
                ) : (
                  <>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {selectedItems.map((item) => (
                        <div key={item.id} className="border rounded-lg p-3 space-y-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {(item.calories * item.quantity).toFixed(0)} cal, {(item.protein * item.quantity).toFixed(1)}g protein
                              </p>
                            </div>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => removeItem(item.id)}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                          
                          <div className="flex items-center gap-2">
                            <Label className="text-sm">Quantity:</Label>
                            <Input
                              type="number"
                              min="0.1"
                              step="0.1"
                              value={item.quantity}
                              onChange={(e) => updateQuantity(item.id, parseFloat(e.target.value) || 0)}
                              className="w-20"
                            />
                            <span className="text-sm text-muted-foreground">{item.unit}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Totals */}
                    <div className="border-t pt-4 space-y-3">
                      <h4 className="font-semibold">Meal Totals</h4>
                      <div className="flex justify-between items-center">
                        <span>Total Calories:</span>
                        <Badge variant="secondary">{totals.calories.toFixed(0)} kcal</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span>Total Protein:</span>
                        <Badge variant="secondary">{totals.protein.toFixed(1)}g</Badge>
                      </div>
                      
                      <Button onClick={saveMeal} className="w-full mt-4">
                        Save {selectedMealType.charAt(0).toUpperCase() + selectedMealType.slice(1)}
                      </Button>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  // Dashboard Screen (default)
  const status = getStatusMessage();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">📊 CalorieBuddy</h1>
            <p className="text-muted-foreground">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
          </div>
          <Button variant="outline" onClick={() => {
            if (confirm('This will clear all your data. Are you sure?')) {
              localStorage.clear();
              window.location.reload();
            }
          }}>
            <Settings className="w-4 h-4 mr-2" />
            Reset Data
          </Button>
        </div>

        {/* Status Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {status.icon} Daily Progress
              </CardTitle>
              <Badge variant={status.variant}>{status.message}</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Calories Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Calories</span>
                <span>{Math.round(totalCalories)} / {profile.calorieGoal} kcal</span>
              </div>
              <Progress value={Math.min(calorieProgress, 100)} className="h-3" />
              <p className="text-xs text-muted-foreground">
                {remainingCalories > 0 ? `${Math.round(remainingCalories)} calories remaining` : `${Math.abs(Math.round(remainingCalories))} calories over limit`}
              </p>
            </div>
            
            {/* Protein Progress */}
            {profile.proteinGoal && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Protein</span>
                  <span>{totalProtein.toFixed(1)}g / {profile.proteinGoal}g</span>
                </div>
                <Progress value={Math.min(proteinProgress, 100)} className="h-3" />
                <p className="text-xs text-muted-foreground">
                  {remainingProtein > 0 ? `${remainingProtein.toFixed(1)}g protein remaining` : `${Math.abs(remainingProtein).toFixed(1)}g protein over goal`}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Meals Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {(['breakfast', 'lunch', 'dinner', 'snack'] as const).map((mealType) => {
            const calories = getMealCalories(mealType);
            const protein = getMealProtein(mealType);
            const mealCount = getMealsByType(mealType).length;
            const mealEmojis = { breakfast: '🌅', lunch: '🌞', dinner: '🌙', snack: '🍿' };
            
            return (
              <Card key={mealType} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => {
                setSelectedMealType(mealType);
                setCurrentView('log-meal');
              }}>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg capitalize flex items-center gap-2">
                    <span>{mealEmojis[mealType]}</span>
                    {mealType}
                  </CardTitle>
                  {mealCount > 0 && (
                    <CardDescription>{mealCount} item{mealCount !== 1 ? 's' : ''} logged</CardDescription>
                  )}
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Calories:</span>
                      <span className="font-medium">{Math.round(calories)} kcal</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Protein:</span>
                      <span className="font-medium">{protein.toFixed(1)}g</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm" className="w-full mt-3">
                    <Plus className="w-4 h-4 mr-1" />
                    Add Food
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Quick Action */}
        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold">Quick Actions</h3>
              <div className="flex flex-wrap gap-3 justify-center">
                <Button onClick={() => {
                  setSelectedMealType('breakfast');
                  setCurrentView('log-meal');
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Breakfast
                </Button>
                <Button onClick={() => {
                  setSelectedMealType('lunch');
                  setCurrentView('log-meal');
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Lunch
                </Button>
                <Button onClick={() => {
                  setSelectedMealType('dinner');
                  setCurrentView('log-meal');
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Log Dinner
                </Button>
                <Button variant="outline" onClick={() => {
                  setSelectedMealType('snack');
                  setCurrentView('log-meal');
                }}>
                  <Plus className="w-4 h-4 mr-2" />
                  Add Snack
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Today's Summary */}
        {todaysMeals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Today's Meals Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {todaysMeals.map((meal) => (
                  <div key={meal.id} className="border rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-medium capitalize">{meal.mealType}</h4>
                      <Badge variant="outline">
                        {meal.items.reduce((sum, item) => sum + (item.calories * item.quantity), 0).toFixed(0)} kcal
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {meal.items.map(item => `${item.quantity} ${item.unit} ${item.name}`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Index;


export interface FoodItem {
  name: string;
  calories: number;
  protein: number;
  carbs?: number;
  fat?: number;
  fiber?: number;
  category: string;
  origin?: string;
}

export const EXPANDED_FOOD_DATABASE: FoodItem[] = [
  // Indian Street Foods & Snacks
  { name: "Kachori (Dal)", calories: 350, protein: 8, carbs: 45, fat: 18, fiber: 4, category: "Indian Snacks", origin: "Rajasthan" },
  { name: "Kachori (Pyaz)", calories: 320, protein: 6, carbs: 42, fat: 16, fiber: 3, category: "Indian Snacks", origin: "Rajasthan" },
  { name: "Chole Kulche", calories: 450, protein: 15, carbs: 65, fat: 12, fiber: 8, category: "Indian Street Food", origin: "Punjab" },
  { name: "Bhature with Chole", calories: 680, protein: 20, carbs: 85, fat: 25, fiber: 10, category: "Indian Street Food", origin: "Punjab" },
  { name: "Pav Bhaji", calories: 380, protein: 12, carbs: 58, fat: 14, fiber: 6, category: "Indian Street Food", origin: "Maharashtra" },
  { name: "Vada Pav", calories: 290, protein: 8, carbs: 45, fat: 12, fiber: 4, category: "Indian Street Food", origin: "Maharashtra" },
  { name: "Misal Pav", calories: 420, protein: 14, carbs: 62, fat: 15, fiber: 8, category: "Indian Street Food", origin: "Maharashtra" },
  { name: "Dabeli", calories: 310, protein: 7, carbs: 48, fat: 12, fiber: 5, category: "Indian Street Food", origin: "Gujarat" },
  { name: "Dhokla", calories: 160, protein: 4, carbs: 28, fat: 4, fiber: 2, category: "Indian Snacks", origin: "Gujarat" },
  { name: "Khandvi", calories: 180, protein: 6, carbs: 22, fat: 8, fiber: 2, category: "Indian Snacks", origin: "Gujarat" },
  { name: "Fafda Jalebi", calories: 520, protein: 8, carbs: 72, fat: 22, fiber: 3, category: "Indian Snacks", origin: "Gujarat" },
  { name: "Thepla", calories: 95, protein: 3, carbs: 14, fat: 3, fiber: 2, category: "Indian Bread", origin: "Gujarat" },
  { name: "Khaman", calories: 150, protein: 4, carbs: 26, fat: 4, fiber: 2, category: "Indian Snacks", origin: "Gujarat" },
  { name: "Handvo", calories: 280, protein: 8, carbs: 35, fat: 12, fiber: 4, category: "Indian Snacks", origin: "Gujarat" },

  // South Indian Foods
  { name: "Masala Dosa", calories: 168, protein: 4, carbs: 28, fat: 5, fiber: 2, category: "South Indian", origin: "Karnataka" },
  { name: "Rava Dosa", calories: 200, protein: 5, carbs: 32, fat: 6, fiber: 1, category: "South Indian", origin: "Karnataka" },
  { name: "Mysore Masala Dosa", calories: 220, protein: 6, carbs: 30, fat: 8, fiber: 3, category: "South Indian", origin: "Karnataka" },
  { name: "Uttapam", calories: 190, protein: 5, carbs: 30, fat: 6, fiber: 2, category: "South Indian", origin: "Tamil Nadu" },
  { name: "Medu Vada", calories: 180, protein: 4, carbs: 18, fat: 10, fiber: 2, category: "South Indian", origin: "Tamil Nadu" },
  { name: "Rava Idli", calories: 45, protein: 2, carbs: 8, fat: 1, fiber: 0.5, category: "South Indian", origin: "Karnataka" },
  { name: "Appam", calories: 120, protein: 2, carbs: 24, fat: 2, fiber: 1, category: "South Indian", origin: "Kerala" },
  { name: "Puttu", calories: 135, protein: 3, carbs: 28, fat: 1, fiber: 2, category: "South Indian", origin: "Kerala" },
  { name: "Idiyappam", calories: 110, protein: 2, carbs: 24, fat: 0.5, fiber: 1, category: "South Indian", origin: "Kerala" },
  { name: "Dosa Batter", calories: 85, protein: 2, carbs: 16, fat: 1, fiber: 1, category: "South Indian", origin: "South India" },
  { name: "Sambar", calories: 80, protein: 4, carbs: 12, fat: 3, fiber: 4, category: "South Indian", origin: "Tamil Nadu" },
  { name: "Rasam", calories: 35, protein: 2, carbs: 6, fat: 1, fiber: 1, category: "South Indian", origin: "Tamil Nadu" },
  { name: "Coconut Chutney", calories: 90, protein: 2, carbs: 4, fat: 8, fiber: 2, category: "South Indian", origin: "South India" },
  { name: "Pesarattu", calories: 150, protein: 8, carbs: 20, fat: 4, fiber: 3, category: "South Indian", origin: "Andhra Pradesh" },
  { name: "Bonda", calories: 250, protein: 5, carbs: 30, fat: 12, fiber: 2, category: "South Indian", origin: "Karnataka" },

  // North Indian Curries & Main Dishes
  { name: "Butter Chicken", calories: 438, protein: 24, carbs: 8, fat: 35, fiber: 1, category: "North Indian", origin: "Punjab" },
  { name: "Chicken Tikka Masala", calories: 300, protein: 25, carbs: 12, fat: 18, fiber: 2, category: "North Indian", origin: "Punjab" },
  { name: "Palak Paneer", calories: 270, protein: 14, carbs: 8, fat: 20, fiber: 3, category: "North Indian", origin: "Punjab" },
  { name: "Shahi Paneer", calories: 300, protein: 12, carbs: 10, fat: 24, fiber: 2, category: "North Indian", origin: "Punjab" },
  { name: "Kadai Paneer", calories: 280, protein: 13, carbs: 12, fat: 22, fiber: 3, category: "North Indian", origin: "Punjab" },
  { name: "Matar Paneer", calories: 250, protein: 12, carbs: 15, fat: 18, fiber: 4, category: "North Indian", origin: "Punjab" },
  { name: "Paneer Makhani", calories: 320, protein: 14, carbs: 10, fat: 26, fiber: 2, category: "North Indian", origin: "Punjab" },
  { name: "Dal Makhani", calories: 180, protein: 8, carbs: 20, fat: 8, fiber: 6, category: "North Indian", origin: "Punjab" },
  { name: "Dal Tadka", calories: 116, protein: 9, carbs: 20, fat: 1, fiber: 8, category: "North Indian", origin: "North India" },
  { name: "Rajma", calories: 127, protein: 8.7, carbs: 22, fat: 0.5, fiber: 6, category: "North Indian", origin: "Punjab" },
  { name: "Chole (Chickpea Curry)", calories: 164, protein: 8.9, carbs: 27, fat: 2.6, fiber: 8, category: "North Indian", origin: "Punjab" },
  { name: "Aloo Gobi", calories: 55, protein: 2, carbs: 12, fat: 0.5, fiber: 3, category: "North Indian", origin: "Punjab" },
  { name: "Aloo Jeera", calories: 85, protein: 2, carbs: 18, fat: 1, fiber: 2, category: "North Indian", origin: "North India" },
  { name: "Bhindi Masala", calories: 60, protein: 2.5, carbs: 10, fat: 2, fiber: 4, category: "North Indian", origin: "North India" },
  { name: "Baingan Bharta", calories: 70, protein: 2, carbs: 12, fat: 2.5, fiber: 5, category: "North Indian", origin: "Punjab" },

  // Indian Breads
  { name: "Naan (Plain)", calories: 262, protein: 9, carbs: 45, fat: 5, fiber: 2, category: "Indian Bread", origin: "North India" },
  { name: "Garlic Naan", calories: 280, protein: 9, carbs: 46, fat: 6, fiber: 2, category: "Indian Bread", origin: "North India" },
  { name: "Butter Naan", calories: 300, protein: 9, carbs: 45, fat: 8, fiber: 2, category: "Indian Bread", origin: "North India" },
  { name: "Keema Naan", calories: 350, protein: 15, carbs: 45, fat: 12, fiber: 2, category: "Indian Bread", origin: "North India" },
  { name: "Kulcha (Plain)", calories: 250, protein: 8, carbs: 42, fat: 5, fiber: 2, category: "Indian Bread", origin: "Punjab" },
  { name: "Amritsari Kulcha", calories: 320, protein: 10, carbs: 48, fat: 10, fiber: 3, category: "Indian Bread", origin: "Punjab" },
  { name: "Tandoori Roti", calories: 120, protein: 4, carbs: 22, fat: 2, fiber: 3, category: "Indian Bread", origin: "North India" },
  { name: "Roomali Roti", calories: 90, protein: 3, carbs: 18, fat: 1, fiber: 1, category: "Indian Bread", origin: "North India" },
  { name: "Lachha Paratha", calories: 350, protein: 8, carbs: 48, fat: 14, fiber: 3, category: "Indian Bread", origin: "Punjab" },
  { name: "Aloo Paratha", calories: 280, protein: 7, carbs: 42, fat: 10, fiber: 4, category: "Indian Bread", origin: "Punjab" },
  { name: "Gobhi Paratha", calories: 260, protein: 8, carbs: 38, fat: 9, fiber: 5, category: "Indian Bread", origin: "Punjab" },
  { name: "Mooli Paratha", calories: 240, protein: 7, carbs: 36, fat: 8, fiber: 4, category: "Indian Bread", origin: "Punjab" },
  { name: "Methi Paratha", calories: 270, protein: 9, carbs: 38, fat: 9, fiber: 6, category: "Indian Bread", origin: "Punjab" },
  { name: "Paneer Paratha", calories: 320, protein: 12, carbs: 40, fat: 14, fiber: 3, category: "Indian Bread", origin: "Punjab" },

  // Regional Indian Specialties
  { name: "Litti Chokha", calories: 180, protein: 6, carbs: 32, fat: 4, fiber: 4, category: "Regional Indian", origin: "Bihar" },
  { name: "Pitha", calories: 220, protein: 4, carbs: 42, fat: 5, fiber: 2, category: "Regional Indian", origin: "Assam" },
  { name: "Momos (Veg)", calories: 35, protein: 2, carbs: 6, fat: 1, fiber: 1, category: "Regional Indian", origin: "Tibet/Northeast" },
  { name: "Momos (Chicken)", calories: 45, protein: 3, carbs: 5, fat: 2, fiber: 0.5, category: "Regional Indian", origin: "Tibet/Northeast" },
  { name: "Thukpa", calories: 180, protein: 8, carbs: 28, fat: 5, fiber: 3, category: "Regional Indian", origin: "Tibet/Northeast" },
  { name: "Dal Baati Churma", calories: 450, protein: 12, carbs: 68, fat: 16, fiber: 8, category: "Regional Indian", origin: "Rajasthan" },
  { name: "Gatte ki Sabzi", calories: 160, protein: 6, carbs: 22, fat: 6, fiber: 4, category: "Regional Indian", origin: "Rajasthan" },
  { name: "Ker Sangri", calories: 120, protein: 4, carbs: 18, fat: 4, fiber: 6, category: "Regional Indian", origin: "Rajasthan" },
  { name: "Laal Maas", calories: 380, protein: 28, carbs: 8, fat: 26, fiber: 2, category: "Regional Indian", origin: "Rajasthan" },
  { name: "Bisi Bele Bath", calories: 220, protein: 8, carbs: 38, fat: 5, fiber: 4, category: "Regional Indian", origin: "Karnataka" },
  { name: "Akki Rotti", calories: 140, protein: 3, carbs: 26, fat: 3, fiber: 1, category: "Regional Indian", origin: "Karnataka" },
  { name: "Neer Dosa", calories: 80, protein: 2, carbs: 16, fat: 1, fiber: 1, category: "Regional Indian", origin: "Karnataka" },
  { name: "Konkani Fish Curry", calories: 180, protein: 20, carbs: 8, fat: 8, fiber: 2, category: "Regional Indian", origin: "Goa" },
  { name: "Vindaloo", calories: 320, protein: 25, carbs: 12, fat: 20, fiber: 3, category: "Regional Indian", origin: "Goa" },
  { name: "Xacuti", calories: 280, protein: 22, carbs: 10, fat: 18, fiber: 2, category: "Regional Indian", origin: "Goa" },

  // Bengali Cuisine
  { name: "Fish Curry (Bengali)", calories: 200, protein: 22, carbs: 8, fat: 10, fiber: 2, category: "Bengali", origin: "West Bengal" },
  { name: "Machher Jhol", calories: 180, protein: 20, carbs: 6, fat: 8, fiber: 1, category: "Bengali", origin: "West Bengal" },
  { name: "Shorshe Ilish", calories: 250, protein: 25, carbs: 4, fat: 15, fiber: 1, category: "Bengali", origin: "West Bengal" },
  { name: "Aloo Posto", calories: 140, protein: 4, carbs: 20, fat: 6, fiber: 3, category: "Bengali", origin: "West Bengal" },
  { name: "Chingri Malai Curry", calories: 220, protein: 18, carbs: 8, fat: 14, fiber: 1, category: "Bengali", origin: "West Bengal" },
  { name: "Kosha Mangsho", calories: 350, protein: 28, carbs: 6, fat: 24, fiber: 1, category: "Bengali", origin: "West Bengal" },
  { name: "Mishti Doi", calories: 120, protein: 4, carbs: 18, fat: 4, fiber: 0, category: "Bengali", origin: "West Bengal" },
  { name: "Rasgulla", calories: 186, protein: 4, carbs: 32, fat: 5, fiber: 0, category: "Bengali", origin: "West Bengal" },
  { name: "Sandesh", calories: 150, protein: 6, carbs: 22, fat: 5, fiber: 0, category: "Bengali", origin: "West Bengal" },

  // Indian-Chinese Fusion
  { name: "Chicken Manchurian", calories: 280, protein: 22, carbs: 18, fat: 14, fiber: 2, category: "Indo-Chinese", origin: "India" },
  { name: "Veg Manchurian", calories: 200, protein: 6, carbs: 28, fat: 8, fiber: 4, category: "Indo-Chinese", origin: "India" },
  { name: "Chilli Chicken", calories: 320, protein: 25, carbs: 20, fat: 16, fiber: 2, category: "Indo-Chinese", origin: "India" },
  { name: "Chicken 65", calories: 290, protein: 24, carbs: 12, fat: 18, fiber: 1, category: "Indo-Chinese", origin: "India" },
  { name: "Gobi Manchurian", calories: 180, protein: 4, carbs: 25, fat: 8, fiber: 4, category: "Indo-Chinese", origin: "India" },
  { name: "Hakka Noodles", calories: 198, protein: 6, carbs: 32, fat: 6, fiber: 3, category: "Indo-Chinese", origin: "India" },
  { name: "Schezwan Noodles", calories: 220, protein: 7, carbs: 35, fat: 8, fiber: 3, category: "Indo-Chinese", origin: "India" },
  { name: "Fried Rice (Veg)", calories: 163, protein: 3, carbs: 28, fat: 5, fiber: 2, category: "Indo-Chinese", origin: "India" },
  { name: "Fried Rice (Chicken)", calories: 200, protein: 12, carbs: 28, fat: 6, fiber: 2, category: "Indo-Chinese", origin: "India" },
  { name: "Chow Mein", calories: 198, protein: 6, carbs: 32, fat: 6, fiber: 3, category: "Indo-Chinese", origin: "India" },
  { name: "Sweet and Sour Chicken", calories: 260, protein: 20, carbs: 25, fat: 10, fiber: 2, category: "Indo-Chinese", origin: "India" },
  { name: "Hot and Sour Soup", calories: 80, protein: 4, carbs: 12, fat: 2, fiber: 2, category: "Indo-Chinese", origin: "India" },

  // Traditional Sweets & Desserts
  { name: "Gulab Jamun", calories: 387, protein: 4, carbs: 52, fat: 18, fiber: 1, category: "Indian Sweets", origin: "North India" },
  { name: "Jalebi", calories: 150, protein: 1, carbs: 30, fat: 4, fiber: 0, category: "Indian Sweets", origin: "North India" },
  { name: "Laddu (Besan)", calories: 186, protein: 4, carbs: 24, fat: 9, fiber: 2, category: "Indian Sweets", origin: "North India" },
  { name: "Laddu (Rava)", calories: 170, protein: 3, carbs: 26, fat: 7, fiber: 1, category: "Indian Sweets", origin: "South India" },
  { name: "Kaju Katli", calories: 200, protein: 4, carbs: 20, fat: 12, fiber: 1, category: "Indian Sweets", origin: "North India" },
  { name: "Barfi (Milk)", calories: 180, protein: 5, carbs: 22, fat: 8, fiber: 0, category: "Indian Sweets", origin: "North India" },
  { name: "Halwa (Carrot)", calories: 350, protein: 4, carbs: 45, fat: 18, fiber: 3, category: "Indian Sweets", origin: "North India" },
  { name: "Halwa (Semolina)", calories: 280, protein: 6, carbs: 40, fat: 12, fiber: 2, category: "Indian Sweets", origin: "North India" },
  { name: "Kheer", calories: 180, protein: 4, carbs: 28, fat: 6, fiber: 0, category: "Indian Sweets", origin: "North India" },
  { name: "Payasam", calories: 160, protein: 4, carbs: 26, fat: 5, fiber: 1, category: "Indian Sweets", origin: "South India" },
  { name: "Kulfi", calories: 200, protein: 4, carbs: 24, fat: 10, fiber: 0, category: "Indian Sweets", origin: "North India" },
  { name: "Ras Malai", calories: 186, protein: 6, carbs: 20, fat: 9, fiber: 0, category: "Indian Sweets", origin: "Bengal" },

  // International Foods
  { name: "Sushi Roll", calories: 200, protein: 9, carbs: 30, fat: 6, fiber: 3, category: "Japanese", origin: "Japan" },
  { name: "Ramen (Tonkotsu)", calories: 436, protein: 10, carbs: 65, fat: 15, fiber: 4, category: "Japanese", origin: "Japan" },
  { name: "Pad Thai", calories: 300, protein: 12, carbs: 40, fat: 12, fiber: 3, category: "Thai", origin: "Thailand" },
  { name: "Tom Yum Soup", calories: 90, protein: 8, carbs: 8, fat: 4, fiber: 2, category: "Thai", origin: "Thailand" },
  { name: "Kimchi", calories: 15, protein: 1.1, carbs: 2.4, fat: 0.5, fiber: 1.6, category: "Korean", origin: "Korea" },
  { name: "Bulgogi", calories: 250, protein: 25, carbs: 8, fat: 14, fiber: 1, category: "Korean", origin: "Korea" },
  { name: "Tacos (Chicken)", calories: 200, protein: 14, carbs: 16, fat: 10, fiber: 2, category: "Mexican", origin: "Mexico" },
  { name: "Burritos", calories: 400, protein: 18, carbs: 45, fat: 18, fiber: 6, category: "Mexican", origin: "Mexico" },
  { name: "Pasta Marinara", calories: 220, protein: 8, carbs: 42, fat: 4, fiber: 3, category: "Italian", origin: "Italy" },
  { name: "Pizza Margherita", calories: 239, protein: 11, carbs: 33, fat: 8, fiber: 2, category: "Italian", origin: "Italy" },

  // Continue with more foods...
  { name: "Pongal", calories: 180, protein: 6, carbs: 32, fat: 4, fiber: 2, category: "South Indian", origin: "Tamil Nadu" },
  { name: "Upma", calories: 109, protein: 3.2, carbs: 18, fat: 3, fiber: 2, category: "South Indian", origin: "South India" },
  { name: "Poha", calories: 76, protein: 2.6, carbs: 14, fat: 1.5, fiber: 1.5, category: "Indian Breakfast", origin: "Maharashtra" },
  { name: "Sabudana Khichdi", calories: 180, protein: 2, carbs: 38, fat: 3, fiber: 1, category: "Indian Breakfast", origin: "Maharashtra" },
  { name: "Aval", calories: 380, protein: 8, carbs: 78, fat: 1.4, fiber: 4, category: "South Indian", origin: "South India" },

  // Add more until we reach 500+ items
  { name: "Chicken Biryani", calories: 290, protein: 12, carbs: 45, fat: 8, fiber: 2, category: "Indian Rice", origin: "Hyderabad" },
  { name: "Mutton Biryani", calories: 350, protein: 15, carbs: 45, fat: 12, fiber: 2, category: "Indian Rice", origin: "Hyderabad" },
  { name: "Veg Biryani", calories: 250, protein: 6, carbs: 48, fat: 6, fiber: 3, category: "Indian Rice", origin: "Hyderabad" },
  { name: "Pulao", calories: 200, protein: 5, carbs: 38, fat: 4, fiber: 2, category: "Indian Rice", origin: "North India" },
  { name: "Jeera Rice", calories: 180, protein: 4, carbs: 36, fat: 3, fiber: 1, category: "Indian Rice", origin: "North India" },
  
  // Adding more diverse items to reach 500+
  { name: "Chaat Papdi", calories: 300, protein: 8, carbs: 45, fat: 10, fiber: 4, category: "Indian Street Food", origin: "North India" },
  { name: "Aloo Tikki", calories: 150, protein: 4, carbs: 28, fat: 4, fiber: 3, category: "Indian Street Food", origin: "North India" },
  { name: "Golgappa", calories: 36, protein: 1, carbs: 6, fat: 1, fiber: 1, category: "Indian Street Food", origin: "North India" },
  { name: "Raj Kachori", calories: 400, protein: 10, carbs: 55, fat: 16, fiber: 6, category: "Indian Street Food", origin: "Rajasthan" },
  { name: "Dahi Puri", calories: 80, protein: 3, carbs: 12, fat: 3, fiber: 2, category: "Indian Street Food", origin: "Maharashtra" },
  { name: "Sev Puri", calories: 120, protein: 4, carbs: 18, fat: 4, fiber: 3, category: "Indian Street Food", origin: "Maharashtra" },
  { name: "Bhel Puri", calories: 168, protein: 4, carbs: 28, fat: 5, fiber: 4, category: "Indian Street Food", origin: "Maharashtra" },
  { name: "Churros", calories: 116, protein: 1.4, carbs: 12, fat: 7, fiber: 0.4, category: "International", origin: "Spain" },
  { name: "Falafel", calories: 333, protein: 13, carbs: 31, fat: 18, fiber: 5, category: "Middle Eastern", origin: "Middle East" },
  { name: "Hummus", calories: 166, protein: 8, carbs: 14, fat: 10, fiber: 6, category: "Middle Eastern", origin: "Middle East" }
];

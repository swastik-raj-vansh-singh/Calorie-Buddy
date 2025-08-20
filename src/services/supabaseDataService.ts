import { supabase } from '@/integrations/supabase/client';

export interface DatabaseMeal {
  id: string;
  user_id: string;
  name: string;
  calories: number;
  protein: number;
  meal_type: string;
  carbs?: number;
  fat?: number;
  fiber?: number;
  sugar?: number;
  sodium?: number;
  created_at: string;
  updated_at: string;
}

export interface UserGoals {
  id: string;
  user_id: string;
  calorie_goal: number;
  protein_goal: number;
  created_at: string;
  updated_at: string;
}

export interface UserProfile {
  id: string;
  user_id: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export class SupabaseDataService {
  // Meals
  async getMeals(): Promise<DatabaseMeal[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  }

  async addMeal(meal: Omit<DatabaseMeal, 'id' | 'user_id' | 'created_at' | 'updated_at'>): Promise<DatabaseMeal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('meals')
      .insert({
        ...meal,
        user_id: user.id
      })
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  async deleteMeal(mealId: string): Promise<void> {
    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('id', mealId);
    
    if (error) throw error;
  }

  async updateMeal(mealId: string, meal: Partial<Omit<DatabaseMeal, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<DatabaseMeal> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('meals')
      .update({
        ...meal,
        updated_at: new Date().toISOString()
      })
      .eq('id', mealId)
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  // Add: Clear all meals for the current user (used by reset functionality)
  async clearAllMeals(): Promise<void> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { error } = await supabase
      .from('meals')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
  }

  // Goals
  async getUserGoals(): Promise<UserGoals | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('daily_goals')
      .select('*')
      .eq('user_id', user.id)
      .order('updated_at', { ascending: false })
      .limit(1);
    
    if (error) throw error;
    const row = (data && data.length > 0) ? data[0] : null;
    return row as any;
  }

  async updateUserGoals(calorieGoal: number, proteinGoal: number): Promise<UserGoals> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    // Use upsert to avoid race conditions and UNIQUE(user_id) conflicts
    const { data, error } = await supabase
      .from('daily_goals')
      .upsert(
        {
          user_id: user.id,
          calorie_goal: calorieGoal,
          protein_goal: proteinGoal,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id' }
      )
      .select()
      .single();

    if (error) throw error;
    return data as any;
  }

  // Profile
  async getUserProfile(): Promise<UserProfile | null> {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .single();
    
    if (error && (error as any).code !== 'PGRST116') throw error;
    return data as any;
  }

  async updateUserProfile(displayName: string): Promise<UserProfile> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: user.id,
        display_name: displayName
      })
      .select()
      .single();
    
    if (error) throw error;
    return data as any;
  }

  // Analytics
  async getDailyMealStats(days: number = 7): Promise<any[]> {
    const { data, error } = await supabase
      .from('meals')
      .select('calories, protein, created_at')
      .gte('created_at', new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString())
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Group by date
    const groupedData = (data || []).reduce((acc: any, meal) => {
      const date = new Date(meal.created_at).toDateString();
      if (!acc[date]) {
        acc[date] = { date, calories: 0, protein: 0, meals: 0 };
      }
      acc[date].calories += meal.calories;
      acc[date].protein += meal.protein;
      acc[date].meals += 1;
      return acc;
    }, {});
    
    return Object.values(groupedData);
  }
}
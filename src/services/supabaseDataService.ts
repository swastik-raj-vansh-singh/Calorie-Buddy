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
    // Helper: tracking day starts at 4 AM local time
    const TRACKING_RESET_HOUR = 4;
    const getTrackingDayStartFor = (d: Date): Date => {
      const base = new Date(d);
      const startOfDay = new Date(base);
      startOfDay.setHours(0, 0, 0, 0);
      const fourAm = new Date(startOfDay);
      fourAm.setHours(TRACKING_RESET_HOUR, 0, 0, 0);
      if (base < fourAm) {
        const prev = new Date(startOfDay);
        prev.setDate(prev.getDate() - 1);
        prev.setHours(TRACKING_RESET_HOUR, 0, 0, 0);
        return prev;
      }
      const cur = new Date(startOfDay);
      cur.setHours(TRACKING_RESET_HOUR, 0, 0, 0);
      return cur;
    };

    // Fetch meals since the start of the desired window aligned to the tracking day
    const now = new Date();
    const currentStart = getTrackingDayStartFor(now);
    const windowStart = new Date(currentStart);
    windowStart.setDate(windowStart.getDate() - (days - 1));

    const { data, error } = await supabase
      .from('meals')
      .select('calories, protein, created_at')
      .gte('created_at', windowStart.toISOString())
      .order('created_at', { ascending: true });
    
    if (error) throw error;
    
    // Group by tracking day (4 AM boundary) and sort by day start
    const groupedMap: Record<string, { date: string; calories: number; protein: number; meals: number; _ts: number }> = {};
    for (const meal of data || []) {
      const created = new Date(meal.created_at);
      const dayStart = getTrackingDayStartFor(created);
      const key = dayStart.toISOString().slice(0, 10); // YYYY-MM-DD key
      if (!groupedMap[key]) {
        groupedMap[key] = {
          date: dayStart.toLocaleDateString(),
          calories: 0,
          protein: 0,
          meals: 0,
          _ts: dayStart.getTime(),
        };
      }
      groupedMap[key].calories += meal.calories;
      groupedMap[key].protein += meal.protein;
      groupedMap[key].meals += 1;
    }

    return Object.values(groupedMap)
      .sort((a, b) => a._ts - b._ts)
      .map(({ _ts, ...rest }) => rest);
  }
}
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Calendar, TrendingUp, TrendingDown, RotateCcw } from 'lucide-react';

interface HistorySectionProps {
  historicalData: any[];
  isAuthenticated?: boolean;
  onReset?: () => void;
}

export const HistorySection: React.FC<HistorySectionProps> = ({ historicalData, isAuthenticated = false, onReset }) => {
  const sortedData = [...historicalData].reverse(); // Most recent first

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">📅 Your Progress History</h2>
        <p className="text-muted-foreground">Track your daily nutrition over time</p>

        {isAuthenticated && (
          <div className="mt-4">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="destructive" size="sm" className="inline-flex items-center gap-2">
                  <RotateCcw className="h-4 w-4" />
                  Reset tracking
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Reset Tracking</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will remove all your logged meals and progress history and start fresh from today. Your account stays signed in.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onReset && onReset()}>Confirm reset</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </div>

      {sortedData.length === 0 ? (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No History Yet</h3>
            <p className="text-muted-foreground">
              Start tracking your meals to see your progress history here.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {sortedData.map((day, index) => {
            const calorieProgress = (day.calories / 2000) * 100; // Assuming 2000 cal goal
            const proteinProgress = (day.protein / 150) * 100; // Assuming 150g protein goal
            
            const isCalorieGoalMet = calorieProgress >= 100;
            const isProteinGoalMet = proteinProgress >= 100;

            return (
              <Card key={day.date} className="bg-card/50 backdrop-blur-sm border-border/50">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-foreground flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      {day.date}
                      {index === 0 && <Badge variant="secondary">Today</Badge>}
                      {index === 1 && <Badge variant="outline">Yesterday</Badge>}
                    </CardTitle>
                    <div className="flex gap-2">
                      {isCalorieGoalMet && (
                        <Badge variant="default" className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Cal Goal
                        </Badge>
                      )}
                      {isProteinGoalMet && (
                        <Badge variant="secondary" className="flex items-center gap-1">
                          <TrendingUp className="h-3 w-3" />
                          Protein Goal
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Calories */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground">Calories</span>
                        <span className="text-sm text-muted-foreground">
                          {day.calories.toFixed(0)} cal
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-primary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(calorieProgress, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {calorieProgress.toFixed(1)}% of goal
                      </span>
                    </div>

                    {/* Protein */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground">Protein</span>
                        <span className="text-sm text-muted-foreground">
                          {day.protein.toFixed(1)}g
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className="bg-secondary h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(proteinProgress, 100)}%` }}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {proteinProgress.toFixed(1)}% of goal
                      </span>
                    </div>

                    {/* Meals Count */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium text-foreground">Meals Logged</span>
                        <span className="text-sm text-muted-foreground">
                          {day.mealsCount || 0} meals
                        </span>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: Math.min(day.mealsCount || 0, 6) }).map((_, i) => (
                          <div key={i} className="w-2 h-2 bg-accent rounded-full" />
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
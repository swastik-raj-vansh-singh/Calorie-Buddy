import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line } from 'recharts';

interface VisualizeSectionProps {
  caloriesConsumed: number;
  proteinConsumed: number;
  calorieGoal: number;
  proteinGoal: number;
  meals: any[];
  historicalData: any[];
}

export const VisualizeSection: React.FC<VisualizeSectionProps> = ({
  caloriesConsumed,
  proteinConsumed,
  calorieGoal,
  proteinGoal,
  meals,
  historicalData
}) => {
  const progressData = [
    {
      name: 'Calories',
      consumed: caloriesConsumed,
      goal: calorieGoal,
      percentage: (caloriesConsumed / calorieGoal) * 100
    },
    {
      name: 'Protein',
      consumed: proteinConsumed,
      goal: proteinGoal,
      percentage: (proteinConsumed / proteinGoal) * 100
    }
  ];

  const mealBreakdown = meals.reduce((acc, meal) => {
    const existing = acc.find(item => item.name === meal.type);
    if (existing) {
      existing.calories += meal.calories;
    } else {
      acc.push({ name: meal.type, calories: meal.calories });
    }
    return acc;
  }, []);

  const pieColors = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

  const chartConfig = {
    calories: {
      label: "Calories",
      color: "hsl(var(--primary))",
    },
    protein: {
      label: "Protein",
      color: "hsl(var(--secondary))",
    },
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">📊 Visualize Your Day</h2>
        <p className="text-sm md:text-base text-muted-foreground">Track your nutrition progress with detailed analytics</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Progress Charts */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm md:text-base text-foreground flex items-center gap-2">
              🎯 Daily Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                    width={30}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="consumed" 
                    fill="hsl(var(--primary))" 
                    radius={[4, 4, 0, 0]}
                    name="Consumed"
                  />
                  <Bar 
                    dataKey="goal" 
                    fill="hsl(var(--muted))" 
                    radius={[4, 4, 0, 0]}
                    name="Goal"
                    opacity={0.3}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Meal Breakdown Pie Chart */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm md:text-base text-foreground flex items-center gap-2">
              🍽️ Meal Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={mealBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="calories"
                  >
                    {mealBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-1 md:gap-2">
              {mealBreakdown.map((entry, index) => (
                <div key={entry.name} className="flex items-center gap-2">
                  <div 
                    className="w-3 h-3 rounded-full flex-shrink-0" 
                    style={{ backgroundColor: pieColors[index % pieColors.length] }}
                  />
                  <span className="text-xs md:text-sm text-foreground truncate">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Trend */}
        {historicalData.length > 1 && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 col-span-1 lg:col-span-2">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm md:text-base text-foreground flex items-center gap-2">
                📈 Weekly Trend
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <ChartContainer config={chartConfig} className="h-[250px] md:h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={historicalData.slice(-7)} margin={{ top: 5, right: 5, left: 5, bottom: 5 }}>
                    <XAxis 
                      dataKey="date" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: 'hsl(var(--foreground))', fontSize: 10 }}
                      width={30}
                    />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="calories" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--primary))', strokeWidth: 1, r: 3 }}
                      name="Calories"
                    />
                    <Line 
                      type="monotone" 
                      dataKey="protein" 
                      stroke="hsl(var(--secondary))" 
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 1, r: 3 }}
                      name="Protein"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
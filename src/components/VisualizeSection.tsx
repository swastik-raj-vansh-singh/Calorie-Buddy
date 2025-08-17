import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, ResponsiveContainer, LineChart, Line, Area, AreaChart } from 'recharts';
import { TrendingUp, TrendingDown, Calendar, Users, Target, Zap, Utensils } from 'lucide-react';

interface VisualizeSectionProps {
  caloriesConsumed: number;
  proteinConsumed: number;
  calorieGoal: number;
  proteinGoal: number;
  meals: any[];
  historicalData: any[];
  isAuthenticated?: boolean;
}

export const VisualizeSection: React.FC<VisualizeSectionProps> = ({
  caloriesConsumed,
  proteinConsumed,
  calorieGoal,
  proteinGoal,
  meals,
  historicalData,
  isAuthenticated = false
}) => {
  const [chartPeriod, setChartPeriod] = useState<'7d' | '14d' | '30d'>('7d');
  const [activeChart, setActiveChart] = useState<'line' | 'area'>('line');
  
  // Calculate trends for authenticated users
  const calculateTrend = (data: any[], key: string) => {
    if (data.length < 2) return 0;
    const recent = data.slice(-3).reduce((sum, item) => sum + (item[key] || 0), 0) / 3;
    const previous = data.slice(-6, -3).reduce((sum, item) => sum + (item[key] || 0), 0) / 3;
    return previous > 0 ? ((recent - previous) / previous) * 100 : 0;
  };

  const caloriesTrend = isAuthenticated ? calculateTrend(historicalData, 'calories') : 0;
  const proteinTrend = isAuthenticated ? calculateTrend(historicalData, 'protein') : 0;

  const progressData = [
    {
      name: 'Calories',
      consumed: caloriesConsumed,
      goal: calorieGoal,
      percentage: (caloriesConsumed / calorieGoal) * 100,
      remaining: Math.max(0, calorieGoal - caloriesConsumed)
    },
    {
      name: 'Protein',
      consumed: proteinConsumed,
      goal: proteinGoal,
      percentage: (proteinConsumed / proteinGoal) * 100,
      remaining: Math.max(0, proteinGoal - proteinConsumed)
    }
  ];

  const mealBreakdown = meals.reduce((acc, meal) => {
    const existing = acc.find(item => item.name === meal.type);
    if (existing) {
      existing.calories += meal.calories;
      existing.protein += meal.protein;
    } else {
      acc.push({ 
        name: meal.type, 
        calories: meal.calories,
        protein: meal.protein,
        count: 1
      });
    }
    return acc;
  }, []);

  const pieColors = [
    'hsl(var(--primary))', 
    'hsl(var(--secondary))', 
    'hsl(var(--accent))', 
    'hsl(var(--chart-1))',
    'hsl(var(--chart-2))',
    'hsl(var(--chart-3))'
  ];

  const chartConfig = {
    calories: {
      label: "Calories",
      color: "hsl(var(--primary))",
    },
    protein: {
      label: "Protein (g)",
      color: "hsl(var(--secondary))",
    },
    goal: {
      label: "Goal",
      color: "hsl(var(--muted))",
    },
  };

  // Filter historical data based on selected period
  const getFilteredData = () => {
    const days = chartPeriod === '7d' ? 7 : chartPeriod === '14d' ? 14 : 30;
    return historicalData.slice(-days);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="text-center mb-8">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">📊 Visualize Your Progress</h2>
        <p className="text-sm md:text-base text-muted-foreground">Track your nutrition journey with interactive analytics</p>
        {isAuthenticated && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            <Badge variant="secondary" className="flex items-center gap-1">
              <TrendingUp className="h-3 w-3" />
              Calories {caloriesTrend > 0 ? '+' : ''}{caloriesTrend.toFixed(1)}%
            </Badge>
            <Badge variant="secondary" className="flex items-center gap-1">
              <Target className="h-3 w-3" />
              Protein {proteinTrend > 0 ? '+' : ''}{proteinTrend.toFixed(1)}%
            </Badge>
          </div>
        )}
      </div>

      {/* Stats Cards for authenticated users */}
      {isAuthenticated && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
          <Card className="bg-gradient-to-r from-primary/10 to-primary/20 border-primary/20">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Zap className="h-4 w-4 text-primary" />
                <span className="text-xs md:text-sm font-medium text-primary">Today's Calories</span>
              </div>
              <div className="text-lg md:text-xl font-bold text-foreground">{caloriesConsumed}</div>
              <div className="text-xs text-muted-foreground">of {calorieGoal} goal</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-secondary/10 to-secondary/20 border-secondary/20">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Target className="h-4 w-4 text-secondary" />
                <span className="text-xs md:text-sm font-medium text-secondary">Protein</span>
              </div>
              <div className="text-lg md:text-xl font-bold text-foreground">{proteinConsumed}g</div>
              <div className="text-xs text-muted-foreground">of {proteinGoal}g goal</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-accent/10 to-accent/20 border-accent/20">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Calendar className="h-4 w-4 text-accent" />
                <span className="text-xs md:text-sm font-medium text-accent">Tracking Days</span>
              </div>
              <div className="text-lg md:text-xl font-bold text-foreground">{historicalData.length}</div>
              <div className="text-xs text-muted-foreground">total days</div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-chart-1/10 to-chart-1/20 border-chart-1/20">
            <CardContent className="p-3 md:p-4 text-center">
              <div className="flex items-center justify-center gap-2 mb-1">
                <Users className="h-4 w-4 text-chart-1" />
                <span className="text-xs md:text-sm font-medium text-chart-1">Meals Today</span>
              </div>
              <div className="text-lg md:text-xl font-bold text-foreground">{meals.length}</div>
              <div className="text-xs text-muted-foreground">logged</div>
            </CardContent>
          </Card>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6">
        {/* Enhanced Progress Charts */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm md:text-base text-foreground flex items-center gap-2">
              🎯 Daily Progress
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            <ChartContainer config={chartConfig} className="h-[280px] md:h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={progressData} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }}
                    width={30}
                  />
                  <ChartTooltip 
                    content={({ active, payload, label }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                            <p className="font-medium text-foreground">{label}</p>
                            <p className="text-primary text-sm">
                              Consumed: {data.consumed} {String(label).toLowerCase() === 'protein' ? 'g' : ''}
                            </p>
                            <p className="text-muted-foreground text-sm">
                              Goal: {data.goal} {String(label).toLowerCase() === 'protein' ? 'g' : ''}
                            </p>
                            <p className="text-accent text-sm">
                              Remaining: {data.remaining} {String(label).toLowerCase() === 'protein' ? 'g' : ''}
                            </p>
                            <p className="text-secondary text-sm">
                              Progress: {data.percentage.toFixed(1)}%
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar 
                    dataKey="consumed" 
                    fill="hsl(var(--primary))" 
                    radius={[6, 6, 0, 0]}
                    name="Consumed"
                  />
                  <Bar 
                    dataKey="goal" 
                    fill="hsl(var(--muted))" 
                    radius={[6, 6, 0, 0]}
                    name="Goal"
                    opacity={0.3}
                  />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* Enhanced Meal Breakdown */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm md:text-base text-foreground flex items-center gap-2">
              🍽️ Meal Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="px-3 md:px-6">
            {mealBreakdown.length > 0 ? (
              <>
                <ChartContainer config={chartConfig} className="h-[240px] md:h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={mealBreakdown}
                        cx="50%"
                        cy="50%"
                        innerRadius={30}
                        outerRadius={70}
                        paddingAngle={6}
                        dataKey="calories"
                      >
                        {mealBreakdown.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={pieColors[index % pieColors.length]}
                            stroke="hsl(var(--background))"
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <ChartTooltip 
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            const data = payload[0].payload;
                            return (
                              <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                                <p className="font-medium text-foreground capitalize">{data.name}</p>
                                <p className="text-primary text-sm">Calories: {data.calories}</p>
                                <p className="text-secondary text-sm">Protein: {data.protein}g</p>
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartContainer>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {mealBreakdown.map((entry, index) => (
                    <div key={entry.name} className="flex items-center gap-3 p-2 rounded-lg bg-muted/30">
                      <div 
                        className="w-4 h-4 rounded-full flex-shrink-0 border-2 border-background" 
                        style={{ backgroundColor: pieColors[index % pieColors.length] }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-foreground capitalize truncate block">{entry.name}</span>
                        <span className="text-xs text-muted-foreground">{entry.calories} cal • {entry.protein}g protein</span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-center">
                <div className="text-muted-foreground">
                  <Utensils className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="text-sm">No meals logged yet</p>
                  <p className="text-xs">Add your first meal to see the breakdown</p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Historical Trend - Only for authenticated users */}
        {isAuthenticated && historicalData.length > 1 && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 shadow-lg col-span-1 lg:col-span-2">
            <CardHeader className="pb-3 space-y-3">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                <CardTitle className="text-sm md:text-base text-foreground flex items-center gap-2">
                  📈 Nutrition Trends
                </CardTitle>
                <div className="flex gap-2">
                  <div className="flex bg-muted/50 rounded-lg p-1">
                    {(['7d', '14d', '30d'] as const).map((period) => (
                      <Button
                        key={period}
                        variant={chartPeriod === period ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setChartPeriod(period)}
                        className="h-7 px-2 text-xs"
                      >
                        {period}
                      </Button>
                    ))}
                  </div>
                  <div className="flex bg-muted/50 rounded-lg p-1">
                    {(['line', 'area'] as const).map((type) => (
                      <Button
                        key={type}
                        variant={activeChart === type ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setActiveChart(type)}
                        className="h-7 px-2 text-xs capitalize"
                      >
                        {type}
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
              <ChartContainer config={chartConfig} className="h-[300px] md:h-[350px] w-full overflow-hidden">
                <ResponsiveContainer width="100%" height="100%">
                  {activeChart === 'line' ? (
                    <LineChart data={getFilteredData()} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
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
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }}
                        width={25}
                      />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                                <p className="font-medium text-foreground mb-2">{label}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} className="text-sm flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    {entry.name}: {entry.value}{entry.name === 'Protein' ? 'g' : ''}
                                  </p>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="calories" 
                        stroke="hsl(var(--primary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                        name="Calories"
                      />
                      <Line 
                        type="monotone" 
                        dataKey="protein" 
                        stroke="hsl(var(--secondary))" 
                        strokeWidth={3}
                        dot={{ fill: 'hsl(var(--secondary))', strokeWidth: 2, r: 4 }}
                        activeDot={{ r: 6, stroke: 'hsl(var(--secondary))', strokeWidth: 2 }}
                        name="Protein"
                      />
                    </LineChart>
                  ) : (
                    <AreaChart data={getFilteredData()} margin={{ top: 20, right: 10, left: 0, bottom: 20 }}>
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
                        tick={{ fill: 'hsl(var(--foreground))', fontSize: 9 }}
                        width={25}
                      />
                      <ChartTooltip 
                        content={({ active, payload, label }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-card border border-border rounded-lg shadow-lg p-3">
                                <p className="font-medium text-foreground mb-2">{label}</p>
                                {payload.map((entry, index) => (
                                  <p key={index} className="text-sm flex items-center gap-2">
                                    <div 
                                      className="w-3 h-3 rounded-full" 
                                      style={{ backgroundColor: entry.color }}
                                    />
                                    {entry.name}: {entry.value}{entry.name === 'Protein' ? 'g' : ''}
                                  </p>
                                ))}
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Area
                        type="monotone"
                        dataKey="calories"
                        stackId="1"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        name="Calories"
                      />
                      <Area
                        type="monotone"
                        dataKey="protein"
                        stackId="2"
                        stroke="hsl(var(--secondary))"
                        fill="hsl(var(--secondary))"
                        fillOpacity={0.3}
                        strokeWidth={2}
                        name="Protein"
                      />
                    </AreaChart>
                  )}
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Message for non-authenticated users */}
        {!isAuthenticated && (
          <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20 col-span-1 lg:col-span-2">
            <CardContent className="p-8 text-center">
              <div className="max-w-md mx-auto space-y-4">
                <div className="text-4xl">📊</div>
                <h3 className="text-lg font-semibold text-foreground">Unlock Advanced Analytics</h3>
                <p className="text-muted-foreground text-sm">
                  Sign in to access detailed nutrition trends, historical data, and personalized insights
                </p>
                <Badge variant="outline" className="text-xs">
                  Track your progress over time with interactive charts
                </Badge>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
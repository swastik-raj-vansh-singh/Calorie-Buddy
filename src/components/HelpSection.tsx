import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { HelpCircle, Send, MessageSquare, Plus } from 'lucide-react';

export const HelpSection: React.FC = () => {
  const [foodName, setFoodName] = useState('');
  const [comment, setComment] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const { toast } = useToast();

  const handleSubmitFood = () => {
    if (!foodName.trim()) {
      toast({
        title: "Please enter a food name",
        variant: "destructive",
      });
      return;
    }

    // Save to localStorage for now (in real app, would send to backend)
    const existingSuggestions = JSON.parse(localStorage.getItem('foodSuggestions') || '[]');
    const newSuggestions = [...existingSuggestions, {
      food: foodName,
      comment: comment,
      date: new Date().toLocaleDateString()
    }];
    localStorage.setItem('foodSuggestions', JSON.stringify(newSuggestions));
    setSuggestions(newSuggestions);

    toast({
      title: "Thank you!",
      description: "Your food suggestion has been submitted.",
    });

    setFoodName('');
    setComment('');
  };

  React.useEffect(() => {
    const saved = JSON.parse(localStorage.getItem('foodSuggestions') || '[]');
    setSuggestions(saved);
  }, []);

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-foreground mb-2">🤝 Help & Suggestions</h2>
        <p className="text-muted-foreground">Help us improve by suggesting missing foods or sharing feedback</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Submit Food Suggestion */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Suggest a Food Item
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Food Name *
              </label>
              <Input
                placeholder="e.g., Quinoa Salad, Masala Dosa, etc."
                value={foodName}
                onChange={(e) => setFoodName(e.target.value)}
                className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Additional Details (Optional)
              </label>
              <Textarea
                placeholder="Any specific details about calories, protein, or preparation..."
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground min-h-[100px]"
              />
            </div>
            <Button 
              onClick={handleSubmitFood} 
              className="w-full"
              disabled={!foodName.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              Submit Suggestion
            </Button>
          </CardContent>
        </Card>

        {/* FAQ & Tips */}
        <Card className="bg-card/50 backdrop-blur-sm border-border/50">
          <CardHeader>
            <CardTitle className="text-foreground flex items-center gap-2">
              <HelpCircle className="h-5 w-5" />
              Frequently Asked Questions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">
                  How accurate are the calorie counts?
                </h4>
                <p className="text-muted-foreground text-sm">
                  Our database uses standard nutritional values. Actual values may vary based on preparation and portion sizes.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">
                  Can I edit my daily goals?
                </h4>
                <p className="text-muted-foreground text-sm">
                  Yes! Use the reset button in the dashboard to set new calorie and protein goals.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">
                  What if I can't find a food item?
                </h4>
                <p className="text-muted-foreground text-sm">
                  Use the suggestion form to let us know what's missing. We regularly update our database.
                </p>
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-sm mb-1">
                  How do I track multiple servings?
                </h4>
                <p className="text-muted-foreground text-sm">
                  Simply add the same food item multiple times, or estimate the total calories for your portion.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Suggestions */}
        {suggestions.length > 0 && (
          <Card className="bg-card/50 backdrop-blur-sm border-border/50 md:col-span-2">
            <CardHeader>
              <CardTitle className="text-foreground flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                Your Recent Suggestions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {suggestions.slice(-5).reverse().map((suggestion, index) => (
                  <div key={index} className="border border-border/50 rounded-lg p-3 bg-background/30">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold text-foreground">{suggestion.food}</h4>
                      <span className="text-xs text-muted-foreground">{suggestion.date}</span>
                    </div>
                    {suggestion.comment && (
                      <p className="text-sm text-muted-foreground">{suggestion.comment}</p>
                    )}
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
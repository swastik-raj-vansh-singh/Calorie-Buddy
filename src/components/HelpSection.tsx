import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle, Send, MessageSquare, Plus } from 'lucide-react';

interface Suggestion {
  food: string;
  comment: string;
  date: string;
}

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

    // Prepare email content
    const emailSubject = `Food Suggestion: ${foodName}`;
    const emailBody = `Hi,

I would like to suggest adding "${foodName}" to the CalorieBuddy food database.

${comment ? `Additional details: ${comment}` : ''}

Date: ${new Date().toLocaleDateString()}

Best regards,
A CalorieBuddy user`;

    // Copy to clipboard as fallback
    const emailContent = `To: swastikrajvanshsingh0@gmail.com
Subject: ${emailSubject}

${emailBody}`;

    navigator.clipboard.writeText(emailContent).then(() => {
      toast({
        title: "Email content copied!",
        description: "Email details copied to clipboard. You can paste this into your email app.",
      });
    }).catch(() => {
      toast({
        title: "Manual email required",
        description: "Please manually send an email to swastikrajvanshsingh0@gmail.com with your suggestion.",
      });
    });

    // Try mailto as secondary option
    const mailtoLink = `mailto:swastikrajvanshsingh0@gmail.com?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;
    window.open(mailtoLink, '_blank');

    // Save to localStorage for tracking
    const existingSuggestions = JSON.parse(localStorage.getItem('foodSuggestions') || '[]');
    const newSuggestions = [...existingSuggestions, {
      food: foodName,
      comment: comment,
      date: new Date().toLocaleDateString()
    }];
    localStorage.setItem('foodSuggestions', JSON.stringify(newSuggestions));
    setSuggestions(newSuggestions);

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

      {/* Recent Suggestions - Moved to top */}
      {suggestions.length > 0 && (
        <Card className="bg-card/50 backdrop-blur-sm border-border/50 mb-6">
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
              Send Suggestion
            </Button>
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p><strong>Steps to send:</strong></p>
              <p>1. Click button to copy email content</p>
              <p>2. Open your email app (Gmail, Outlook, etc.)</p>
              <p>3. Paste and send to: <strong>swastikrajvanshsingh0@gmail.com</strong></p>
            </div>
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
      </div>
    </div>
  );
};
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useToast } from '@/hooks/use-toast';
import { HelpCircle, Send, Plus, Utensils, Target, Camera, Scale, Timer } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
export const HelpSection: React.FC = () => {
  const [foodName, setFoodName] = useState('');
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const {
    toast
  } = useToast();
  const handleSubmitFood = async () => {
    if (!foodName.trim()) {
      toast({
        title: "Please enter a food name",
        variant: "destructive"
      });
      return;
    }
    setIsSubmitting(true);
    try {
      const {
        data,
        error
      } = await supabase.functions.invoke('send-suggestion-email', {
        body: {
          foodName: foodName.trim(),
          comment: comment.trim() || undefined
        }
      });
      if (error) {
        throw error;
      }
      toast({
        title: "✅ Suggestion sent successfully!",
        description: "Thank you! Your food suggestion has been emailed to swastikrajvanshsingh0@gmail.com"
      });
      setFoodName('');
      setComment('');
    } catch (error: any) {
      console.error('Error sending suggestion:', error);
      toast({
        title: "Failed to send suggestion",
        description: "Please try again or contact support if the issue persists.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  return <div className="space-y-6 pb-20 md:pb-6">
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
              <Input placeholder="e.g., Quinoa Salad, Masala Dosa, etc." value={foodName} onChange={e => setFoodName(e.target.value)} className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground" />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Additional Details (Optional)
              </label>
              <Textarea placeholder="Any specific details about calories, protein, or preparation..." value={comment} onChange={e => setComment(e.target.value)} className="bg-background/50 border-border/50 text-foreground placeholder:text-muted-foreground min-h-[100px]" />
            </div>
            <Button onClick={handleSubmitFood} className="w-full" disabled={!foodName.trim() || isSubmitting}>
              <Send className="h-4 w-4 mr-2" />
              {isSubmitting ? "Sending..." : "Send Suggestion"}
            </Button>
            <div className="text-xs text-muted-foreground text-center space-y-1">
              <p>Email is sent to swastikrajvanshsingh0@gmail.com</p>
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
          <CardContent>
            <Accordion type="single" collapsible className="w-full space-y-2">
              <AccordionItem value="accuracy" className="border border-border/30 rounded-lg px-4 bg-gradient-to-r from-primary/5 to-secondary/5">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-primary" />
                    How accurate are the calorie counts? 🎯
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3">
                  Our AI-powered system uses comprehensive nutritional databases and smart portion estimation. While very accurate, actual values may vary based on cooking methods and specific brands. We're constantly improving accuracy with your feedback!
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="goals" className="border border-border/30 rounded-lg px-4 bg-gradient-to-r from-secondary/5 to-primary/5">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Scale className="h-4 w-4 text-secondary" />
                    Can I customize my daily goals? ⚖️
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3">
                  Absolutely! Click the reset button in your dashboard to set personalized calorie and protein goals based on your fitness objectives, activity level, and dietary preferences.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="missing-food" className="border border-border/30 rounded-lg px-4 bg-gradient-to-r from-accent/5 to-primary/5">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Utensils className="h-4 w-4 text-accent" />
                    What if I can't find a food item? 🍽️
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3">
                  Use our AI food recognition 📸 or the suggestion form! Our database includes thousands of foods, and we regularly add new items based on user requests. You can also describe the food in natural language.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="portions" className="border border-border/30 rounded-lg px-4 bg-gradient-to-r from-primary/5 to-accent/5">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-primary" />
                    How do I track multiple servings? 🥄
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3">
                  Simply adjust the quantity or weight when adding foods! You can say "3 rotis" or "2 cups of rice" - our smart parser understands natural quantities and measurements.
                </AccordionContent>
              </AccordionItem>

              <AccordionItem value="camera" className="border border-border/30 rounded-lg px-4 bg-gradient-to-r from-secondary/5 to-accent/5">
                <AccordionTrigger className="text-sm font-medium hover:no-underline py-3">
                  <div className="flex items-center gap-2">
                    <Camera className="h-4 w-4 text-secondary" />
                    How does food photo recognition work? 📱
                  </div>
                </AccordionTrigger>
                <AccordionContent className="text-sm text-muted-foreground pb-3">
                  Just snap a photo of your meal! Our AI analyzes the image to identify food items and estimate portions. It works best with clear, well-lit photos. The rear camera is automatically selected for better quality.
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </div>
    </div>;
};
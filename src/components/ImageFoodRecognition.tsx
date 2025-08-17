import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Camera, Upload, Loader2, X, CheckCircle } from 'lucide-react';

interface ImageFoodRecognitionProps {
  onFoodDetected: (foodDescription: string) => void;
  onCancel: () => void;
}

export const ImageFoodRecognition: React.FC<ImageFoodRecognitionProps> = ({
  onFoodDetected,
  onCancel
}) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const { toast } = useToast();

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { 
          facingMode: { exact: 'environment' }, // Force rear camera
          width: { ideal: 1920, min: 1280 },
          height: { ideal: 1080, min: 720 }
        }
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        setStream(mediaStream);
        setIsCameraOpen(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Camera Error",
        description: "Could not access camera. Please try uploading an image instead.",
        variant: "destructive"
      });
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    setIsCameraOpen(false);
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const video = videoRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0);
        const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageDataUrl);
        stopCamera();
        processImage(imageDataUrl);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        toast({
          title: "File too large",
          description: "Please choose an image smaller than 5MB",
          variant: "destructive"
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target?.result as string;
        setCapturedImage(imageDataUrl);
        processImage(imageDataUrl);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageDataUrl: string) => {
    setIsProcessing(true);
    
    try {
      // Convert image to base64 for Gemini API
      const base64Image = imageDataUrl.split(',')[1];
      
      const prompt = `
      You are a food calorie estimation expert. Analyze this image of food carefully.
      
      Identify all food items present in the image and provide:
      - The name of each food item
      - Estimated portion size or quantity
      - If multiple items are present, list them separately
      
      Return a natural description like: "grilled chicken breast (150g), steamed rice (100g), mixed vegetables (80g)" or "large cheese pizza slice (120g), coca cola (330ml)"
      
      Be specific about quantities and types of food. If you see condiments or sauces, include them too.
      Focus on accuracy - this will be used for precise calorie tracking.
      `;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-pro:generateContent?key=AIzaSyC9TTXCJFHUeRyhW8inLdQ42Fpw1amm1Go`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: prompt
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const foodDescription = data.candidates[0].content.parts[0].text;
      
      toast({
        title: "Food detected! 📸",
        description: "AI has analyzed your image successfully",
      });
      
      // Pass the detected food description to the parent component
      onFoodDetected(foodDescription.trim());
      
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        title: "Processing failed",
        description: "Could not analyze the image. Please try again or upload a different image.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    setIsProcessing(false);
    startCamera();
  };

  return (
    <Card className="w-full max-w-2xl mx-auto bg-card/95 backdrop-blur-sm border-primary/20 shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          📸 Food Recognition
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Take a photo or upload an image to detect food items automatically
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        {!isCameraOpen && !capturedImage && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button
              onClick={startCamera}
              className="h-32 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/20 to-primary/10 border-2 border-dashed border-primary/30 hover:border-primary/50 hover:bg-primary/20"
              variant="outline"
            >
              <Camera className="h-8 w-8 text-primary" />
              <span className="text-sm font-medium">Take Photo</span>
            </Button>
            
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="h-32 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-secondary/20 to-secondary/10 border-2 border-dashed border-secondary/30 hover:border-secondary/50 hover:bg-secondary/20"
              variant="outline"
            >
              <Upload className="h-8 w-8 text-secondary" />
              <span className="text-sm font-medium">Upload Image</span>
            </Button>
          </div>
        )}

        {isCameraOpen && (
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-64 object-cover"
              />
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-4">
                <Button
                  onClick={capturePhoto}
                  size="lg"
                  className="bg-white text-black hover:bg-gray-100"
                >
                  <Camera className="h-5 w-5" />
                </Button>
                <Button
                  onClick={stopCamera}
                  size="lg"
                  variant="outline"
                  className="bg-red-500 text-white border-red-500 hover:bg-red-600"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        )}

        {capturedImage && (
          <div className="space-y-4">
            <div className="relative">
              <img
                src={capturedImage}
                alt="Captured food"
                className="w-full h-64 object-cover rounded-lg border border-border"
              />
              
              {isProcessing && (
                <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                  <div className="bg-white rounded-lg p-4 flex items-center gap-3">
                    <Loader2 className="h-5 w-5 animate-spin text-primary" />
                    <span className="text-sm font-medium">Analyzing food...</span>
                  </div>
                </div>
              )}
            </div>
            
            {!isProcessing && (
              <div className="flex gap-3">
                <Button
                  onClick={retakePhoto}
                  variant="outline"
                  className="flex-1"
                >
                  <Camera className="mr-2 h-4 w-4" />
                  Retake Photo
                </Button>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                  className="flex-1"
                >
                  <Upload className="mr-2 h-4 w-4" />
                  Upload Different
                </Button>
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel}>
            <X className="mr-2 h-4 w-4" />
            Cancel
          </Button>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          onChange={handleFileUpload}
          className="hidden"
        />
        
        <canvas ref={canvasRef} className="hidden" />
      </CardContent>
    </Card>
  );
};
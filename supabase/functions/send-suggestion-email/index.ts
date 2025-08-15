import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface SuggestionEmailRequest {
  foodName: string;
  comment?: string;
  userEmail?: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { foodName, comment, userEmail }: SuggestionEmailRequest = await req.json();

    if (!foodName?.trim()) {
      return new Response(
        JSON.stringify({ error: "Food name is required" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    const currentDate = new Date().toLocaleDateString();
    
    const emailResponse = await resend.emails.send({
      from: "CalorieBuddy <onboarding@resend.dev>",
      to: ["swastikrajvanshsingh0@gmail.com"],
      subject: `Food Suggestion: ${foodName}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #333; border-bottom: 2px solid #f0f0f0; padding-bottom: 10px;">
            🍎 New Food Suggestion from CalorieBuddy
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #2563eb; margin-top: 0;">Suggested Food Item:</h3>
            <p style="font-size: 18px; font-weight: bold; color: #333; margin: 10px 0;">
              ${foodName}
            </p>
            
            ${comment ? `
              <h4 style="color: #333; margin-top: 20px;">Additional Details:</h4>
              <p style="color: #666; line-height: 1.6; margin: 10px 0;">
                ${comment}
              </p>
            ` : ''}
          </div>
          
          <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 20px;">
            <p style="color: #888; font-size: 14px; margin: 5px 0;">
              <strong>Date:</strong> ${currentDate}
            </p>
            ${userEmail ? `
              <p style="color: #888; font-size: 14px; margin: 5px 0;">
                <strong>User Email:</strong> ${userEmail}
              </p>
            ` : ''}
            <p style="color: #888; font-size: 14px; margin: 5px 0;">
              <strong>Source:</strong> CalorieBuddy App - Help Section
            </p>
          </div>
          
          <div style="margin-top: 30px; padding: 15px; background-color: #e7f3ff; border-radius: 6px;">
            <p style="color: #0066cc; font-size: 14px; margin: 0;">
              💡 <strong>Next Steps:</strong> Review this suggestion and consider adding "${foodName}" to the food database if appropriate.
            </p>
          </div>
        </div>
      `,
    });

    console.log("Food suggestion email sent successfully:", emailResponse);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Suggestion sent successfully!",
        emailId: emailResponse.data?.id 
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          ...corsHeaders,
        },
      }
    );
  } catch (error: any) {
    console.error("Error in send-suggestion-email function:", error);
    return new Response(
      JSON.stringify({ 
        error: "Failed to send suggestion",
        details: error.message 
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
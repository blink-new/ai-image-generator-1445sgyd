
// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/deploy_node_server

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

// CORS headers for browser compatibility
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
}

interface ReplicateRequest {
  apiKey: string;
  model: string;
  input: Record<string, any>;
}

interface ReplicateResponse {
  success: boolean;
  data?: any;
  error?: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders })
  }

  try {
    // Parse the request body
    const { apiKey, model, input } = await req.json() as ReplicateRequest

    if (!apiKey) {
      throw new Error("API key is required")
    }

    if (!model) {
      throw new Error("Model is required")
    }

    // Extract model name and version
    const [modelName, modelVersion] = model.split(':')
    
    if (!modelName || !modelVersion) {
      throw new Error("Invalid model format. Expected 'model:version'")
    }

    // Make the request to Replicate API
    const response = await fetch(`https://api.replicate.com/v1/predictions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Token ${apiKey}`,
      },
      body: JSON.stringify({
        version: modelVersion,
        input: input,
      }),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || "Failed to create prediction")
    }

    // Get the prediction ID
    const prediction = await response.json()
    const predictionId = prediction.id

    // Poll for the prediction result
    let result = prediction
    while (result.status !== "succeeded" && result.status !== "failed") {
      // Wait for a second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Get the prediction status
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          "Authorization": `Token ${apiKey}`,
        },
      })
      
      if (!statusResponse.ok) {
        const errorData = await statusResponse.json()
        throw new Error(errorData.detail || "Failed to get prediction status")
      }
      
      result = await statusResponse.json()
    }

    if (result.status === "failed") {
      throw new Error(result.error || "Prediction failed")
    }

    // Return the prediction result
    const responseBody: ReplicateResponse = {
      success: true,
      data: result.output,
    }

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    })
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    console.error(`Error: ${errorMessage}`)

    const responseBody: ReplicateResponse = {
      success: false,
      error: errorMessage,
    }

    return new Response(JSON.stringify(responseBody), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
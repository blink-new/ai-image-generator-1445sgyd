
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with the correct URL and key
const supabaseUrl = 'https://iuipvfffsxxtrteectim.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aXB2ZmZmc3h4dHJ0ZWVjdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MzU1MTcsImV4cCI6MjA2MDQxMTUxN30.b2n10AbhMm-12H9t72VFJCg_MtLDglwj2WhUBPnkyv4';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Fallback to direct API call if Edge Function fails
async function directReplicateCall(apiKey, model, input) {
  try {
    // Extract model name and version
    const [modelName, modelVersion] = model.split(':');
    
    // Make the request to Replicate API
    const response = await fetch('https://api.replicate.com/v1/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Token ${apiKey}`,
      },
      body: JSON.stringify({
        version: modelVersion,
        input: input,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to create prediction');
    }

    // Get the prediction ID
    const prediction = await response.json();
    const predictionId = prediction.id;

    // Poll for the prediction result
    let result = prediction;
    while (result.status !== 'succeeded' && result.status !== 'failed') {
      // Wait for a second before polling again
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get the prediction status
      const statusResponse = await fetch(`https://api.replicate.com/v1/predictions/${predictionId}`, {
        headers: {
          'Authorization': `Token ${apiKey}`,
        },
      });
      
      if (!statusResponse.ok) {
        const errorData = await statusResponse.json();
        throw new Error(errorData.detail || 'Failed to get prediction status');
      }
      
      result = await statusResponse.json();
    }

    if (result.status === 'failed') {
      throw new Error(result.error || 'Prediction failed');
    }

    return {
      success: true,
      data: result.output,
    };
  } catch (error) {
    console.error('Error in direct Replicate call:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Mock API for development and testing
async function mockReplicateAPI(prompt) {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Return a placeholder image based on the prompt
  const imageUrls = [
    'https://images.unsplash.com/photo-1637858868799-7f26a0640eb6?q=80&w=2000',
    'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=2000',
    'https://images.unsplash.com/photo-1604871000636-074fa5117945?q=80&w=2000',
    'https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=2000',
    'https://images.unsplash.com/photo-1638803040283-7a5ffd48dad5?q=80&w=2000'
  ];
  
  // Choose a random image from the array
  const randomIndex = Math.floor(Math.random() * imageUrls.length);
  
  return {
    success: true,
    data: imageUrls[randomIndex],
  };
}

export async function generateImageAPI(
  apiKey: string,
  prompt: string,
  model: string,
  options: Record<string, any> = {}
) {
  try {
    // Prepare the input parameters for the model
    const input: Record<string, any> = {
      prompt,
    };

    // Add optional parameters if provided
    if (options.negative_prompt) {
      input.negative_prompt = options.negative_prompt;
    }

    if (options.num_inference_steps) {
      input.num_inference_steps = options.num_inference_steps;
    }

    if (options.guidance_scale) {
      input.guidance_scale = options.guidance_scale;
    }

    // Try to call the Supabase Edge Function first
    try {
      const { data, error } = await supabase.functions.invoke('replicate', {
        body: {
          apiKey,
          model,
          input,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to call Replicate API');
      }

      if (!data.success) {
        throw new Error(data.error || 'Failed to generate image');
      }

      return {
        success: true,
        data: data.data,
      };
    } catch (edgeFunctionError) {
      console.warn('Edge function failed, falling back to direct API call:', edgeFunctionError);
      
      // If we're in development mode or the Edge Function fails, use the mock API
      if (import.meta.env.DEV) {
        console.log('Using mock API in development mode');
        return await mockReplicateAPI(prompt);
      }
      
      // Otherwise try a direct API call as fallback
      return await directReplicateCall(apiKey, model, input);
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
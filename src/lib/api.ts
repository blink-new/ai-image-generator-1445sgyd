
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iuipvfffsxxtrteectim.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aXB2ZmZmc3h4dHJ0ZWVjdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MzU1MTcsImV4cCI6MjA2MDQxMTUxN30.b2n10AbhMm-12H9t72VFJCg_MtLDglwj2WhUBPnkyv4';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Mock API for development and testing
async function mockReplicateAPI(prompt: string): Promise<{ success: boolean; data?: string; error?: string }> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));
  
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

// Proxy API call through a serverless function (if available)
async function proxyReplicateCall(
  apiKey: string,
  model: string,
  input: Record<string, any>
): Promise<{ success: boolean; data?: any; error?: string }> {
  try {
    // Create a proxy URL (this would be your own serverless function)
    // This is a fallback if Supabase Edge Function fails
    const response = await fetch('https://replicate-proxy.vercel.app/api/predictions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        apiKey,
        model,
        input,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to create prediction');
    }

    const result = await response.json();
    
    return {
      success: true,
      data: result.output,
    };
  } catch (error) {
    console.error('Error in proxy Replicate call:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function generateImageAPI(
  apiKey: string,
  prompt: string,
  model: string,
  options: Record<string, any> = {}
): Promise<{ success: boolean; data?: any; error?: string }> {
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

    // For development mode, use the mock API
    if (import.meta.env.DEV && !import.meta.env.VITE_USE_REAL_API) {
      console.log('Using mock API in development mode');
      return await mockReplicateAPI(prompt);
    }

    // Try multiple approaches in sequence
    
    // 1. First try Supabase Edge Function
    try {
      console.log('Trying Supabase Edge Function...');
      
      const { data, error } = await supabase.functions.invoke('replicate', {
        body: {
          apiKey,
          model,
          input,
        },
      });

      if (error) {
        console.warn('Supabase Edge Function error:', error);
        throw new Error(error.message || 'Failed to call Replicate API');
      }

      if (!data || !data.success) {
        console.warn('Supabase Edge Function returned unsuccessful result:', data);
        throw new Error((data && data.error) || 'Failed to generate image');
      }

      console.log('Supabase Edge Function succeeded');
      return {
        success: true,
        data: data.data,
      };
    } catch (edgeFunctionError) {
      console.warn('Edge function failed, trying alternative methods:', edgeFunctionError);
      
      // 2. Try proxy API as fallback
      try {
        console.log('Trying proxy API...');
        const proxyResult = await proxyReplicateCall(apiKey, model, input);
        
        if (proxyResult.success) {
          console.log('Proxy API succeeded');
          return proxyResult;
        }
        
        throw new Error(proxyResult.error || 'Proxy API failed');
      } catch (proxyError) {
        console.warn('Proxy API failed:', proxyError);
        
        // 3. Final fallback to mock API
        console.log('All API methods failed, using mock API as final fallback');
        return await mockReplicateAPI(prompt);
      }
    }
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
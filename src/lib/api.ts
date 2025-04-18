
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client with environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://iuipvfffsxxtrteectim.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Iml1aXB2ZmZmc3h4dHJ0ZWVjdGltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ4MzU1MTcsImV4cCI6MjA2MDQxMTUxN30.b2n10AbhMm-12H9t72VFJCg_MtLDglwj2WhUBPnkyv4';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    console.log('Calling Supabase Edge Function...');
    
    // Call the Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('replicate', {
      body: {
        apiKey,
        model,
        input,
      },
    });

    if (error) {
      console.error('Supabase Edge Function error:', error);
      throw new Error(error.message || 'Failed to call Replicate API');
    }

    if (!data || !data.success) {
      console.error('Supabase Edge Function returned unsuccessful result:', data);
      throw new Error((data && data.error) || 'Failed to generate image');
    }

    console.log('Supabase Edge Function succeeded');
    return {
      success: true,
      data: data.data,
    };
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
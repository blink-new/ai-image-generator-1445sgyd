
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseAnonKey);

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

    // Call the Supabase Edge Function
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
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
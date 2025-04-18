
import { generateImage, initReplicate } from './replicate';

// In a real application, this would be a server-side API endpoint
// to keep the API key secure. For this demo, we'll use a client-side
// implementation with the understanding that in production, this would
// be handled differently.

export async function generateImageAPI(
  apiKey: string,
  prompt: string,
  model: string,
  options: Record<string, any> = {}
) {
  try {
    // Initialize Replicate with the API key
    await initReplicate(apiKey);
    
    // Generate the image
    const result = await generateImage(prompt, model, options);
    
    return {
      success: true,
      data: result,
    };
  } catch (error) {
    console.error('Error generating image:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}
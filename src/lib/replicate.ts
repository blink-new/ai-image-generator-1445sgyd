
import Replicate from 'replicate';

// This is a placeholder for the actual API key
// In a real implementation, this would be stored in an environment variable
// and accessed through a server-side API to keep it secure
let replicate: Replicate | null = null;

export async function initReplicate(apiKey: string) {
  replicate = new Replicate({
    auth: apiKey,
  });
  return replicate;
}

export async function generateImage(
  prompt: string,
  model: string = "stability-ai/sdxl",
  options: Record<string, any> = {}
) {
  if (!replicate) {
    throw new Error("Replicate not initialized. Call initReplicate first.");
  }

  // Default parameters for the model
  const defaultParams = {
    prompt,
    negative_prompt: options.negative_prompt || "",
    num_inference_steps: options.num_inference_steps || 30,
    guidance_scale: options.guidance_scale || 7.5,
  };

  // Run the model
  const output = await replicate.run(model, {
    input: defaultParams,
  });

  return output;
}

export function getReplicateInstance() {
  return replicate;
}

import Replicate from 'replicate';

let replicate: Replicate | null = null;

export async function initReplicate(apiKey: string) {
  replicate = new Replicate({
    auth: apiKey,
  });
  return replicate;
}

export async function generateImage(
  prompt: string,
  model: string = "stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
  options: Record<string, any> = {}
) {
  if (!replicate) {
    throw new Error("Replicate not initialized. Call initReplicate first.");
  }

  // Extract model name and version
  const [modelName, modelVersion] = model.split(':');

  // Default parameters for the model
  const defaultParams: Record<string, any> = {
    prompt,
  };

  // Add optional parameters if provided
  if (options.negative_prompt) {
    defaultParams.negative_prompt = options.negative_prompt;
  }

  if (options.num_inference_steps) {
    defaultParams.num_inference_steps = options.num_inference_steps;
  }

  if (options.guidance_scale) {
    defaultParams.guidance_scale = options.guidance_scale;
  }

  // Run the model
  const output = await replicate.run(`${modelName}:${modelVersion}`, {
    input: defaultParams,
  });

  return output;
}

export function getReplicateInstance() {
  return replicate;
}
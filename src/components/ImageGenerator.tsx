
import { useState, useEffect } from "react"
import { Loader2, Download, ImageIcon, RefreshCw, Settings, Trash2, Sparkles, Wand2 } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Slider } from "./ui/slider"
import { useToast } from "../hooks/use-toast"
import { cn } from "../lib/utils"
import { ApiKeyDialog } from "./ApiKeyDialog"
import { generateImageAPI } from "../lib/api"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "./ui/alert-dialog"
import { motion, AnimatePresence } from "framer-motion"

// Define the models available in Replicate
const MODELS = [
  {
    id: "stability-ai/sdxl:c221b2b8ef527988fb59bf24a8b97c4561f1c671f73bd389f866bfb27c061316",
    name: "Stable Diffusion XL",
    description: "State-of-the-art image generation model"
  },
  {
    id: "stability-ai/stable-diffusion:ac732df83cea7fff18b8472768c88ad041fa750ff7682a21affe81863cbe77e4",
    name: "Stable Diffusion",
    description: "Fast and efficient image generation"
  },
  {
    id: "prompthero/openjourney:9936c2001faa2194a261c01381f90e65261879985476014a0a37a334593a05eb",
    name: "OpenJourney",
    description: "Midjourney-like style images"
  }
]

// Sample prompts to help users get started
const SAMPLE_PROMPTS = [
  "A serene Japanese garden with cherry blossoms, 4k, detailed",
  "Cyberpunk cityscape at night with neon lights and flying cars",
  "A magical forest with glowing mushrooms and fairy lights",
  "An astronaut riding a horse on Mars, photorealistic",
  "A cozy cabin in the mountains during winter, snow falling"
]

type GeneratedImage = {
  url: string;
  prompt: string;
  timestamp: number;
}

export function ImageGenerator() {
  const { toast } = useToast()
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [model, setModel] = useState(MODELS[0].id)
  const [numInferenceSteps, setNumInferenceSteps] = useState(30)
  const [guidanceScale, setGuidanceScale] = useState(7.5)
  const [loading, setLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<GeneratedImage[]>([])
  const [apiKey, setApiKey] = useState<string>("")
  const [showApiKeyDialog, setShowApiKeyDialog] = useState(false)
  const [showSamplePrompts, setShowSamplePrompts] = useState(false)

  // Load API key and generated images from localStorage on component mount
  useEffect(() => {
    const storedApiKey = localStorage.getItem("replicate-api-key")
    if (storedApiKey) {
      setApiKey(storedApiKey)
    } else {
      setShowApiKeyDialog(true)
    }

    const storedImages = localStorage.getItem("generated-images")
    if (storedImages) {
      try {
        setGeneratedImages(JSON.parse(storedImages))
      } catch (e) {
        console.error("Failed to parse stored images:", e)
      }
    }
  }, [])

  // Save generated images to localStorage when they change
  useEffect(() => {
    if (generatedImages.length > 0) {
      localStorage.setItem("generated-images", JSON.stringify(generatedImages))
    }
  }, [generatedImages])

  const handleSaveApiKey = (key: string) => {
    setApiKey(key)
    localStorage.setItem("replicate-api-key", key)
    toast({
      title: "API Key Saved",
      description: "Your Replicate API key has been saved",
    })
  }

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to generate an image",
        variant: "destructive"
      })
      return
    }

    if (!apiKey) {
      setShowApiKeyDialog(true)
      return
    }

    setLoading(true)

    try {
      const result = await generateImageAPI(apiKey, prompt, model, {
        negative_prompt: negativePrompt,
        num_inference_steps: numInferenceSteps,
        guidance_scale: guidanceScale,
      })

      if (!result.success) {
        throw new Error(result.error || "Failed to generate image")
      }

      // Replicate typically returns an array of image URLs
      const imageUrl = Array.isArray(result.data) ? result.data[0] : result.data

      if (!imageUrl) {
        throw new Error("No image URL returned from API")
      }

      setGeneratedImage(imageUrl)
      
      const newImage: GeneratedImage = {
        url: imageUrl,
        prompt,
        timestamp: Date.now()
      }
      
      setGeneratedImages(prev => [newImage, ...prev].slice(0, 20)) // Keep only the last 20 images
      
      toast({
        title: "Image generated!",
        description: "Your image has been successfully generated",
      })
    } catch (error) {
      console.error("Error generating image:", error)
      
      // Check if it's an API key error
      const errorMessage = error instanceof Error ? error.message : "Unknown error"
      
      if (errorMessage.includes("API key") || errorMessage.includes("auth") || errorMessage.includes("unauthorized")) {
        toast({
          title: "API Key Error",
          description: "Your Replicate API key appears to be invalid. Please update it.",
          variant: "destructive"
        })
        setShowApiKeyDialog(true)
      } else {
        toast({
          title: "Generation failed",
          description: errorMessage,
          variant: "destructive"
        })
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return
    
    // Create a temporary link element
    const link = document.createElement("a")
    link.href = generatedImage
    link.download = `ai-generated-${Date.now()}.png`
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    
    toast({
      title: "Download started",
      description: "Your image is being downloaded",
    })
  }

  const clearHistory = () => {
    setGeneratedImages([])
    localStorage.removeItem("generated-images")
    toast({
      title: "History cleared",
      description: "Your generation history has been cleared",
    })
  }

  const useSamplePrompt = (samplePrompt: string) => {
    setPrompt(samplePrompt)
    setShowSamplePrompts(false)
    toast({
      title: "Prompt applied",
      description: "Sample prompt has been applied",
    })
  }

  const getRandomPrompt = () => {
    const randomIndex = Math.floor(Math.random() * SAMPLE_PROMPTS.length)
    setPrompt(SAMPLE_PROMPTS[randomIndex])
    toast({
      title: "Random prompt applied",
      description: "Try generating with this creative prompt!",
    })
  }

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <Card className="lg:col-span-2 border border-purple-500/20 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-t-lg">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-400" />
                  Generate Image
                </CardTitle>
                <CardDescription>
                  Create stunning AI-generated images with a text prompt
                </CardDescription>
              </div>
              <Button 
                variant="outline" 
                size="icon"
                onClick={() => setShowApiKeyDialog(true)}
                title="Configure API Key"
                className="border-purple-500/30 hover:bg-purple-500/10"
              >
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4 pt-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="prompt">Prompt</Label>
                <div className="flex items-center gap-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-xs text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                    onClick={() => setShowSamplePrompts(!showSamplePrompts)}
                  >
                    Sample Prompts
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-purple-400 hover:text-purple-300 hover:bg-purple-500/10"
                    onClick={getRandomPrompt}
                    title="Random Prompt"
                  >
                    <Wand2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="relative">
                <Textarea
                  id="prompt"
                  placeholder="A beautiful sunset over a mountain lake, 4k, detailed"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  className="min-h-24 resize-none focus-visible:ring-purple-500"
                />
                <AnimatePresence>
                  {showSamplePrompts && (
                    <motion.div 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      transition={{ duration: 0.2 }}
                      className="absolute z-10 mt-1 w-full bg-card border border-purple-500/20 rounded-md shadow-lg overflow-hidden"
                    >
                      <div className="p-1">
                        {SAMPLE_PROMPTS.map((samplePrompt, index) => (
                          <button
                            key={index}
                            className="w-full text-left px-3 py-2 text-sm hover:bg-purple-500/10 rounded transition-colors"
                            onClick={() => useSamplePrompt(samplePrompt)}
                          >
                            {samplePrompt}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
            
            <Tabs defaultValue="basic">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="basic">Basic</TabsTrigger>
                <TabsTrigger value="advanced">Advanced</TabsTrigger>
              </TabsList>
              <TabsContent value="basic" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={model} onValueChange={setModel}>
                    <SelectTrigger id="model" className="focus-visible:ring-purple-500">
                      <SelectValue placeholder="Select a model" />
                    </SelectTrigger>
                    <SelectContent>
                      {MODELS.map((m) => (
                        <SelectItem key={m.id} value={m.id}>
                          <div className="flex flex-col">
                            <span>{m.name}</span>
                            <span className="text-xs text-muted-foreground">{m.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </TabsContent>
              <TabsContent value="advanced" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="negative-prompt">Negative Prompt</Label>
                  <Textarea
                    id="negative-prompt"
                    placeholder="Low quality, blurry, distorted"
                    value={negativePrompt}
                    onChange={(e) => setNegativePrompt(e.target.value)}
                    className="resize-none focus-visible:ring-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="inference-steps">Inference Steps: {numInferenceSteps}</Label>
                  </div>
                  <Slider
                    id="inference-steps"
                    min={10}
                    max={50}
                    step={1}
                    value={[numInferenceSteps]}
                    onValueChange={(value) => setNumInferenceSteps(value[0])}
                    className="[&>span:first-child]:bg-purple-500"
                  />
                </div>
                
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <Label htmlFor="guidance-scale">Guidance Scale: {guidanceScale.toFixed(1)}</Label>
                  </div>
                  <Slider
                    id="guidance-scale"
                    min={1}
                    max={20}
                    step={0.1}
                    value={[guidanceScale]}
                    onValueChange={(value) => setGuidanceScale(value[0])}
                    className="[&>span:first-child]:bg-purple-500"
                  />
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button 
              variant="outline" 
              onClick={() => setPrompt("")}
              className="border-purple-500/30 hover:bg-purple-500/10"
            >
              Clear
            </Button>
            <Button 
              onClick={handleGenerate} 
              disabled={loading || !prompt}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300 shadow-md hover:shadow-lg"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Generate
                </>
              )}
            </Button>
          </CardFooter>
        </Card>
        
        <div className="space-y-8">
          <Card className="overflow-hidden border border-purple-500/20">
            <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-t-lg">
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5 text-purple-400" />
                Generated Image
              </CardTitle>
              <CardDescription>
                Your AI-generated masterpiece
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6">
              <motion.div 
                className={cn(
                  "aspect-square rounded-md flex items-center justify-center overflow-hidden bg-secondary/30 border border-purple-500/20",
                  loading && "animate-pulse"
                )}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                {generatedImage ? (
                  <motion.img 
                    src={generatedImage} 
                    alt="Generated" 
                    className="w-full h-full object-cover"
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                  />
                ) : (
                  <div className="text-muted-foreground flex flex-col items-center">
                    <ImageIcon className="h-10 w-10 mb-2 text-purple-500/50" />
                    <span>{loading ? "Generating..." : "No image generated yet"}</span>
                  </div>
                )}
              </motion.div>
            </CardContent>
            {generatedImage && (
              <CardFooter>
                <Button 
                  variant="secondary" 
                  className="w-full hover:bg-purple-500/10" 
                  onClick={handleDownload}
                >
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </CardFooter>
            )}
          </Card>
          
          {generatedImages.length > 0 && (
            <Card className="border border-purple-500/20">
              <CardHeader className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 rounded-t-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-purple-400" />
                      Recent Images
                    </CardTitle>
                    <CardDescription>
                      Your generation history
                    </CardDescription>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="icon"
                        className="border-purple-500/30 hover:bg-purple-500/10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Clear History</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to clear your generation history? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={clearHistory}>
                          Clear
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 gap-3">
                  {generatedImages.slice(0, 6).map((img, i) => (
                    <motion.div 
                      key={i} 
                      className="aspect-square rounded-md overflow-hidden relative group border border-purple-500/20"
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: i * 0.1 }}
                    >
                      <img 
                        src={img.url} 
                        alt={`Generated ${i}`} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform cursor-pointer"
                        onClick={() => setGeneratedImage(img.url)}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2">
                        <p className="text-white text-xs line-clamp-2">{img.prompt}</p>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      <ApiKeyDialog 
        open={showApiKeyDialog} 
        onOpenChange={setShowApiKeyDialog}
        onSubmit={handleSaveApiKey}
      />
    </>
  )
}

import { useState } from "react"
import { Loader2, Download, ImageIcon, RefreshCw } from "lucide-react"
import { Button } from "./ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./ui/card"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { Textarea } from "./ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select"
import { Slider } from "./ui/slider"
import { useToast } from "../hooks/use-toast"
import { cn } from "../lib/utils"

// Define the models available in Replicate
const MODELS = [
  {
    id: "stability-ai/sdxl",
    name: "Stable Diffusion XL",
    description: "State-of-the-art image generation model"
  },
  {
    id: "stability-ai/stable-diffusion",
    name: "Stable Diffusion",
    description: "Fast and efficient image generation"
  },
  {
    id: "prompthero/openjourney",
    name: "OpenJourney",
    description: "Midjourney-like style images"
  }
]

export function ImageGenerator() {
  const { toast } = useToast()
  const [prompt, setPrompt] = useState("")
  const [negativePrompt, setNegativePrompt] = useState("")
  const [model, setModel] = useState(MODELS[0].id)
  const [numInferenceSteps, setNumInferenceSteps] = useState(30)
  const [guidanceScale, setGuidanceScale] = useState(7.5)
  const [loading, setLoading] = useState(false)
  const [generatedImage, setGeneratedImage] = useState<string | null>(null)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])

  const handleGenerate = async () => {
    if (!prompt) {
      toast({
        title: "Prompt required",
        description: "Please enter a prompt to generate an image",
        variant: "destructive"
      })
      return
    }

    setLoading(true)
    setGeneratedImage(null)

    try {
      // This is a placeholder for the actual API call
      // In a real implementation, we would call the Replicate API here
      // For now, we'll simulate a delay and use a placeholder image
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Placeholder image URL - in real implementation this would come from Replicate
      const imageUrl = "https://images.unsplash.com/photo-1637858868799-7f26a0640eb6?q=80&w=2000"
      setGeneratedImage(imageUrl)
      setGeneratedImages(prev => [imageUrl, ...prev])
      
      toast({
        title: "Image generated!",
        description: "Your image has been successfully generated",
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error generating your image",
        variant: "destructive"
      })
      console.error("Error generating image:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleDownload = () => {
    if (!generatedImage) return
    
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

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Generate Image</CardTitle>
          <CardDescription>
            Create stunning AI-generated images with a text prompt
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prompt">Prompt</Label>
            <Textarea
              id="prompt"
              placeholder="A beautiful sunset over a mountain lake, 4k, detailed"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-24 resize-none"
            />
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
                  <SelectTrigger id="model">
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
                  className="resize-none"
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
                />
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="guidance-scale">Guidance Scale: {guidanceScale}</Label>
                </div>
                <Slider
                  id="guidance-scale"
                  min={1}
                  max={20}
                  step={0.1}
                  value={[guidanceScale]}
                  onValueChange={(value) => setGuidanceScale(value[0])}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => setPrompt("")}>
            Clear
          </Button>
          <Button onClick={handleGenerate} disabled={loading || !prompt}>
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
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle>Generated Image</CardTitle>
            <CardDescription>
              Your AI-generated masterpiece
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className={cn(
              "aspect-square rounded-md flex items-center justify-center overflow-hidden bg-secondary/30",
              loading && "animate-pulse"
            )}>
              {generatedImage ? (
                <img 
                  src={generatedImage} 
                  alt="Generated" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="text-muted-foreground flex flex-col items-center">
                  <ImageIcon className="h-10 w-10 mb-2" />
                  <span>{loading ? "Generating..." : "No image generated yet"}</span>
                </div>
              )}
            </div>
          </CardContent>
          {generatedImage && (
            <CardFooter>
              <Button 
                variant="secondary" 
                className="w-full" 
                onClick={handleDownload}
              >
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
            </CardFooter>
          )}
        </Card>
        
        {generatedImages.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Recent Images</CardTitle>
              <CardDescription>
                Your generation history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {generatedImages.slice(0, 4).map((img, i) => (
                  <div 
                    key={i} 
                    className="aspect-square rounded-md overflow-hidden"
                  >
                    <img 
                      src={img} 
                      alt={`Generated ${i}`} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform cursor-pointer"
                      onClick={() => setGeneratedImage(img)}
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
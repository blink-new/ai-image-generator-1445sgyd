
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { KeyIcon, EyeIcon, EyeOffIcon, ExternalLinkIcon, InfoIcon } from "lucide-react"
import { motion } from "framer-motion"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs"
import { Alert, AlertDescription } from "./ui/alert"

interface ApiKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (apiKey: string) => void
}

export function ApiKeyDialog({ open, onOpenChange, onSubmit }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  const [activeTab, setActiveTab] = useState("api-key")
  
  // Load existing API key if available
  useEffect(() => {
    if (open) {
      const storedApiKey = localStorage.getItem("replicate-api-key")
      if (storedApiKey) {
        setApiKey(storedApiKey)
      }
    }
  }, [open])
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (apiKey.trim()) {
      onSubmit(apiKey.trim())
      onOpenChange(false)
    }
  }

  const useDemoKey = () => {
    // This is just a placeholder - in a real app, you might have a demo key
    setApiKey("r8_demo_key")
    onSubmit("r8_demo_key")
    onOpenChange(false)
  }
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <KeyIcon className="h-5 w-5 text-purple-400" />
            Replicate API Key
          </DialogTitle>
          <DialogDescription>
            You need a Replicate API key to generate images.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-2">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="api-key">API Key</TabsTrigger>
            <TabsTrigger value="help">Get Started</TabsTrigger>
          </TabsList>
          
          <TabsContent value="api-key" className="space-y-4 pt-4">
            <form onSubmit={handleSubmit}>
              <div className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="api-key">Enter your Replicate API Key</Label>
                  <div className="flex items-center gap-2">
                    <KeyIcon className="h-4 w-4 text-muted-foreground" />
                    <div className="relative flex-1">
                      <Input
                        id="api-key"
                        type={showApiKey ? "text" : "password"}
                        placeholder="r8_..."
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="pr-10 focus-visible:ring-purple-500"
                        autoComplete="off"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                size="icon"
                        className="absolute right-0 top-0 h-full px-3 hover:bg-transparent"
                        onClick={() => setShowApiKey(!showApiKey)}
                      >
                        {showApiKey ? (
                          <EyeOffIcon className="h-4 w-4" />
                        ) : (
                          <EyeIcon className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showApiKey ? "Hide API key" : "Show API key"}
                        </span>
                      </Button>
                    </div>
                  </div>
                  <motion.p 
                    className="text-xs text-muted-foreground"
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                  >
                    Your API key is stored locally in your browser and never sent to our servers.
                  </motion.p>
                </div>
              </div>
              
              <div className="mt-6 flex flex-col gap-3">
                <Button 
                  type="submit" 
                  disabled={!apiKey.trim()}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300"
                >
                  Save API Key
                </Button>
                
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-muted-foreground/20" />
                  </div>
                  <div className="relative flex justify-center text-xs">
                    <span className="bg-background px-2 text-muted-foreground">
                      Or try the app
                    </span>
                  </div>
                </div>
                
                <Button 
                  type="button"
                  variant="outline"
                  className="w-full border-purple-500/30 hover:bg-purple-500/10"
                  onClick={useDemoKey}
                >
                  Use Demo Mode
                </Button>
              </div>
            </form>
          </TabsContent>
          
          <TabsContent value="help" className="space-y-4 pt-4">
            <Alert className="bg-purple-500/5 border-purple-500/20">
              <InfoIcon className="h-4 w-4 text-purple-500" />
              <AlertDescription className="text-sm">
                In demo mode, you'll see placeholder images instead of real AI-generated images.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-4">
              <h3 className="font-medium">How to get a Replicate API key:</h3>
              <ol className="list-decimal list-inside space-y-2 text-sm">
                <li>
                  <a 
                    href="https://replicate.com/signin" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline underline-offset-4 inline-flex items-center gap-1"
                  >
                    Sign up for Replicate
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </li>
                <li>
                  <a 
                    href="https://replicate.com/account/api-tokens" 
                    target="_blank" 
                    rel="noreferrer"
                    className="text-purple-400 hover:text-purple-300 underline underline-offset-4 inline-flex items-center gap-1"
                  >
                    Go to API tokens page
                    <ExternalLinkIcon className="h-3 w-3" />
                  </a>
                </li>
                <li>Copy your API token</li>
                <li>Paste it in the API Key field</li>
              </ol>
              
              <p className="text-sm text-muted-foreground mt-4">
                Replicate offers free credits for new users, which you can use to generate images with this app.
              </p>
            </div>
            
            <Button 
              type="button"
              className="w-full mt-4 bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300"
              onClick={() => setActiveTab("api-key")}
            >
              Back to API Key
            </Button>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
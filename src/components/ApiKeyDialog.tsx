
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { KeyIcon, EyeIcon, EyeOffIcon, ExternalLinkIcon } from "lucide-react"
import { motion } from "framer-motion"

interface ApiKeyDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (apiKey: string) => void
}

export function ApiKeyDialog({ open, onOpenChange, onSubmit }: ApiKeyDialogProps) {
  const [apiKey, setApiKey] = useState("")
  const [showApiKey, setShowApiKey] = useState(false)
  
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
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md border border-purple-500/20">
        <DialogHeader>
          <DialogTitle className="text-xl flex items-center gap-2">
            <KeyIcon className="h-5 w-5 text-purple-400" />
            Replicate API Key
          </DialogTitle>
          <DialogDescription>
            You need a Replicate API key to generate images. Get one at{" "}
            <a 
              href="https://replicate.com/account/api-tokens" 
              target="_blank" 
              rel="noreferrer"
              className="text-purple-400 hover:text-purple-300 underline underline-offset-4 inline-flex items-center gap-1"
            >
              replicate.com
              <ExternalLinkIcon className="h-3 w-3" />
            </a>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="api-key">API Key</Label>
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
          <DialogFooter>
            <Button 
              type="submit" 
              disabled={!apiKey.trim()}
              className="bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 transition-all duration-300"
            >
              Save API Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
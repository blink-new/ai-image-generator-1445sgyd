
import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog"
import { Button } from "./ui/button"
import { Input } from "./ui/input"
import { Label } from "./ui/label"
import { KeyIcon, EyeIcon, EyeOffIcon } from "lucide-react"

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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Replicate API Key</DialogTitle>
          <DialogDescription>
            You need a Replicate API key to generate images. Get one at{" "}
            <a 
              href="https://replicate.com/account/api-tokens" 
              target="_blank" 
              rel="noreferrer"
              className="underline underline-offset-4 hover:text-primary"
            >
              replicate.com
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
                    className="pr-10"
                    autoComplete="off"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
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
              <p className="text-xs text-muted-foreground">
                Your API key is stored locally in your browser and never sent to our servers.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button type="submit" disabled={!apiKey.trim()}>
              Save API Key
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
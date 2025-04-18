
import { MoonIcon, SunIcon, ImageIcon } from "lucide-react"
import { Button } from "./ui/button"
import { useTheme } from "./ThemeProvider"

export function Header() {
  const { theme, setTheme } = useTheme()
  
  return (
    <header className="border-b border-border/40 backdrop-blur-sm bg-background/80 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-gradient-to-br from-purple-600 to-blue-500 rounded-md">
            <ImageIcon className="h-5 w-5 text-white" />
          </div>
          <h1 className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-400 text-transparent bg-clip-text">
            AI Image Generator
          </h1>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          className="hover:bg-purple-500/10"
        >
          {theme === "dark" ? (
            <SunIcon className="h-5 w-5" />
          ) : (
            <MoonIcon className="h-5 w-5" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </div>
    </header>
  )
}
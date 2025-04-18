
import { useState } from 'react'
import { ImageGenerator } from './components/ImageGenerator'
import { Header } from './components/Header'
import { ThemeProvider } from './components/ThemeProvider'
import { Toaster } from './components/ui/toaster'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ai-image-generator-theme">
      <div className="min-h-screen bg-gradient-to-b from-background to-background/80 flex flex-col">
        <Header />
        <main className="flex-1 container mx-auto px-4 py-8">
          <ImageGenerator />
        </main>
        <footer className="py-6 border-t border-border/40">
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>Built with <a href="https://replicate.com" target="_blank" rel="noreferrer" className="underline underline-offset-4 hover:text-primary">Replicate API</a> • {new Date().getFullYear()}</p>
          </div>
        </footer>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App
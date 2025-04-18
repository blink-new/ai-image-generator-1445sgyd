
import { useState } from 'react'
import { ImageGenerator } from './components/ImageGenerator'
import { Header } from './components/Header'
import { ThemeProvider } from './components/ThemeProvider'
import { Toaster } from './components/ui/toaster'
import { motion } from 'framer-motion'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="ai-image-generator-theme">
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-background/90 flex flex-col">
        <Header />
        <motion.main 
          className="flex-1 container mx-auto px-4 py-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <ImageGenerator />
        </motion.main>
        <motion.footer 
          className="py-6 border-t border-border/40"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
        >
          <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
            <p>Built with <a href="https://replicate.com" target="_blank" rel="noreferrer" className="text-purple-400 hover:text-purple-300 transition-colors">Replicate API</a> • {new Date().getFullYear()}</p>
          </div>
        </motion.footer>
        <Toaster />
      </div>
    </ThemeProvider>
  )
}

export default App
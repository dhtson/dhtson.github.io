"use client"

import { Button } from "@/components/ui/button"
import { Github, Linkedin, Mail } from "@/components/icons"
import { useState, useEffect } from "react"

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
interface BlogHeaderProps {
  // No props needed anymore
}

export function BlogHeader({}: BlogHeaderProps) {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // const scrollToTop = () => {
  //   window.scrollTo({ top: 0, behavior: "smooth" })
  // }

  const scrollToBlogs = () => {
    // Navigate to blogs page
    window.location.href = "/blogs"
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  return (
    <header className={`fixed top-0 left-0 right-0 z-[100] border-b border-border/20 transition-all duration-300 ${
      isScrolled 
        ? 'py-4 backdrop-blur-xl bg-background/95 shadow-lg' 
        : 'py-6 backdrop-blur-md bg-background/80'
    }`}>
      <div className="container mx-auto px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-8">
            <h1
              className="text-3xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent cursor-pointer hover:scale-105 transition-all duration-300"
              onClick={() => window.location.href = '/'}
            >
              Harshfeudal
            </h1>
            <nav className="hidden md:flex space-x-8">
              <span
                className="text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                onClick={() => window.location.href = '/'}
              >
                Home
              </span>
              <span
                className="text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                onClick={() => window.location.href = '/resume'}
              >
                Resume
              </span>
              <span
                className="text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer font-medium relative after:absolute after:bottom-0 after:left-0 after:w-0 after:h-0.5 after:bg-primary after:transition-all after:duration-300 hover:after:w-full"
                onClick={scrollToBlogs}
              >
                Blogs
              </span>
            </nav>
          </div>

          <div className="flex items-center space-x-3">
            {/* Desktop Social Icons */}
            <div className="hidden sm:flex space-x-2">
              <Button 
                variant="ghost" 
                size="icon" 
                className="premium-hover rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300"
                title="Visit my GitHub profile"
                onClick={() => window.open('https://github.com/harshfeudal', '_blank')}
              >
                <Github className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="premium-hover rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition-all duration-300"
                title="Connect with me on LinkedIn"
                onClick={() => window.open('https://www.linkedin.com/in/dhtson/', '_blank')}
              >
                <Linkedin className="h-5 w-5" />
              </Button>
              <Button 
                variant="ghost" 
                size="icon" 
                className="premium-hover rounded-xl hover:bg-green-500/10 hover:text-green-500 transition-all duration-300"
                title="Send me an email"
                onClick={() => window.open('mailto:harshfeudal@gmail.com', '_blank')}
              >
                <Mail className="h-5 w-5" />
              </Button>
            </div>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={toggleMobileMenu}
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden mt-4 pb-4 border-t border-border/20">
            <nav className="flex flex-col space-y-4 pt-4">
              <span
                className="text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer font-medium py-2"
                onClick={() => {
                  window.location.href = '/'
                  setIsMobileMenuOpen(false)
                }}
              >
                Home
              </span>
              <span
                className="text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer font-medium py-2"
                onClick={() => {
                  window.location.href = '/resume'
                  setIsMobileMenuOpen(false)
                }}
              >
                Resume
              </span>
              <span
                className="text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer font-medium py-2"
                onClick={() => {
                  scrollToBlogs()
                  setIsMobileMenuOpen(false)
                }}
              >
                Blogs
              </span>
              
              {/* Mobile Social Icons */}
              <div className="flex space-x-4 pt-4 border-t border-border/20">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="premium-hover rounded-xl hover:bg-primary/10 hover:text-primary transition-all duration-300"
                  title="Visit my GitHub profile"
                  onClick={() => window.open('https://github.com/harshfeudal', '_blank')}
                >
                  <Github className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="premium-hover rounded-xl hover:bg-blue-500/10 hover:text-blue-500 transition-all duration-300"
                  title="Connect with me on LinkedIn"
                  onClick={() => window.open('https://www.linkedin.com/in/dhtson/', '_blank')}
                >
                  <Linkedin className="h-5 w-5" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="premium-hover rounded-xl hover:bg-green-500/10 hover:text-green-500 transition-all duration-300"
                  title="Send me an email"
                  onClick={() => window.open('mailto:harshfeudal@gmail.com', '_blank')}
                >
                  <Mail className="h-5 w-5" />
                </Button>
              </div>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

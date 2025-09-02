import { BlogHeader } from "@/components/blog-header"
import { ScrollToTop } from "@/components/scroll-to-top"
import { ResumeRenderer } from "@/components/resume-renderer"
import { getResume } from "@/lib/resume"
import { notFound } from "next/navigation"

export default function ResumePage() {
  const resume = getResume()
  
  if (!resume) {
    notFound()
  }

  return (
    <div className="bg-background relative overflow-hidden">
      <BlogHeader />
      <main className="container mx-auto px-6 py-12 max-w-4xl relative pt-24">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-foreground via-primary to-accent bg-clip-text text-transparent mb-6 text-balance animate-slideInUp">
            Resume
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-primary to-accent mx-auto rounded-full mb-8"></div>
        </div>

        <div className="animate-slideInUp" style={{ animationDelay: "0.2s" }}>
          {/* Header */}
          <div className="text-center mb-12 border-b border-border/20 pb-8">
            <h1 className="text-4xl font-bold mb-4 text-foreground">{resume.name}</h1>
            <p className="text-xl text-muted-foreground mb-4">{resume.title}</p>
            {Object.keys(resume.contacts).length > 0 && (
              <div className="flex flex-wrap justify-center gap-4 text-muted-foreground">
                {Object.entries(resume.contacts).map(([key, value], index) => (
                  <div key={key} className="flex items-center gap-4">
                    {index > 0 && <span>•</span>}
                    {key === 'email' ? (
                      <a href={`mailto:${value}`} className="text-primary hover:underline">
                        {value}
                      </a>
                    ) : key === 'github' || key === 'linkedin' || key === 'website' ? (
                      <a href={value} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                        {value}
                      </a>
                    ) : (
                      <span>{value}</span>
                    )}
                  </div>
                ))}
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              Last updated: {new Date(resume.lastUpdated).toLocaleDateString()}
            </p>
          </div>

          {/* Resume Content */}
          <ResumeRenderer content={resume.content} />
        </div>
      </main>
      <ScrollToTop />
    </div>
  )
}

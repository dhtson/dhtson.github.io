"use client"

import { useState, useEffect } from "react"

interface ClientDateProps {
  dateString: string
  className?: string
}

export function ClientDate({ dateString, className }: ClientDateProps) {
  const [formattedDate, setFormattedDate] = useState("")

  useEffect(() => {
    const date = new Date(dateString)
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ]
    
    const day = date.getDate()
    const month = months[date.getMonth()]
    const year = date.getFullYear()
    
    setFormattedDate(`${month} ${day}, ${year}`)
  }, [dateString])

  // Return a placeholder while hydrating to avoid hydration mismatch
  if (!formattedDate) {
    return <span className={className}>Loading...</span>
  }

  return <span className={className}>{formattedDate}</span>
}

"use client"

import { useState, useEffect } from "react"

interface ClientDateProps {
  dateString: string
  className?: string
  ordinal?: boolean
}

function getOrdinalSuffix(day: number): string {
  if (day >= 11 && day <= 13) return "th"
  switch (day % 10) {
    case 1: return "st"
    case 2: return "nd"
    case 3: return "rd"
    default: return "th"
  }
}

export function ClientDate({ dateString, className, ordinal = false }: ClientDateProps) {
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
    
    const displayDay = ordinal ? `${day}${getOrdinalSuffix(day)}` : String(day)
    setFormattedDate(`${month} ${displayDay}, ${year}`)
  }, [dateString, ordinal])

  // Return a placeholder while hydrating to avoid hydration mismatch
  if (!formattedDate) {
    return <span className={className}>Loading...</span>
  }

  return <span className={className}>{formattedDate}</span>
}

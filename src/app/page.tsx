import HomeClient from "./home-client"
import { getAllPosts } from "@/lib/blog"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Harshfeudal Personal Porfolio",
  description: "Welcome to Harshfeudal's personal blog. Discover insights on cybersecurity, CTF writeups, machine learning challenges, and the journey of a Computer Science student at Vietnamese German University.",
  openGraph: {
    title: "Harshfeudal - Personal Blog",
    description: "Welcome to my personal space where I share cybersecurity insights, CTF writeups, and academic experiences.",
    type: "website",
  },
}

export default function HomePage() {
  const posts = getAllPosts()
  return <HomeClient blogPosts={posts} />
}

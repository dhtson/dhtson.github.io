import HomeClient from "./home-client"
import { getAllPosts } from "@/lib/blog"

export default function HomePage() {
  const posts = getAllPosts()
  return <HomeClient blogPosts={posts} />
}

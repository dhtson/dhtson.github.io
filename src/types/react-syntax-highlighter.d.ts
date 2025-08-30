declare module "react-syntax-highlighter" {
  // Minimal type to satisfy TS in our usage
  export const Prism: React.ComponentType<{
    language?: string
    style?: Record<string, unknown>
    customStyle?: React.CSSProperties
    PreTag?: string
    CodeTag?: string
    className?: string
    wrapLongLines?: boolean
    children: string
  }>
}

declare module "react-syntax-highlighter/dist/esm/styles/prism/one-dark" {
  const style: Record<string, unknown>
  export default style
}

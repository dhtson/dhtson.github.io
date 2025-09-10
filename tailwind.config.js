/** Tailwind config added to safelist arbitrary color utility classes produced by custom code highlighter. */
const tailwindConfig = {
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './content/**/*.{md,mdx}',
    './public/**/*.html'
  ],
  safelist: [
    // VSCode-like palette arbitrary color classes used in markdown-renderer
    'text-[#6A9955]', // comments
    'text-[#CE9178]', // strings
    'text-[#569CD6]', // keywords / tags
    'text-[#4EC9B0]', // types / decorators / variables
    'text-[#DCDCAA]', // functions / attributes
    'text-[#B5CEA8]', // numbers
    'text-[#C586C0]', // preprocessor / pragmas / purple accents
    'text-[#9CDCFE]', // json keys / variables
    'text-[#D16969]', // regex
    'font-bold',
    'italic'
  ],
  theme: {
    extend: {}
  },
  plugins: []
}

export default tailwindConfig

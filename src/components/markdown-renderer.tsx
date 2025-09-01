"use client"
import React, { useState } from "react"
import ReactMarkdown from "react-markdown"
import remarkMath from "remark-math"
import rehypeKatex from "rehype-katex"
import rehypeRaw from "rehype-raw"
import Image from "next/image"
// No syntax highlighting; render plain code blocks for reliability.

type Props = {
  content: string
  baseImagePath?: string // e.g. `/blogs/my-post`
  showImageCaptions?: boolean
}

export const MarkdownRenderer: React.FC<Props> = ({ content, baseImagePath, showImageCaptions = false }) => {
  // Custom syntax highlighter
  const highlightCode = (code: string, language: string): React.ReactNode => {
    const normalizedLang = language.toLowerCase()
    
    // Language aliases
    const langMap: { [key: string]: string } = {
      'py': 'python',
      'js': 'javascript',
      'ts': 'typescript',
      'jsx': 'javascript',
      'tsx': 'typescript',
      'sh': 'bash',
      'shell': 'bash',
      'rs': 'rust',
      'c++': 'cpp',
      'cxx': 'cpp',
      'cc': 'cpp',
      'dockerfile': 'docker',
      'ex': 'elixir',
      'exs': 'elixir',
      'kt': 'kotlin',
      'kts': 'kotlin',
      'rb': 'ruby',
      'php': 'php',
      'go': 'golang',
      'java': 'java',
      'cs': 'csharp',
      'swift': 'swift',
      'scala': 'scala',
      'r': 'r',
      'sql': 'sql',
      'xml': 'xml',
      'yaml': 'yaml',
      'yml': 'yaml',
      'toml': 'toml',
      'ini': 'ini',
      'md': 'markdown',
      'markdown': 'markdown',
    }
    
    const lang = langMap[normalizedLang] || normalizedLang
    
    if (lang === 'python') {
      return highlightPython(code)
    } else if (lang === 'javascript') {
      return highlightJavaScript(code)
    } else if (lang === 'typescript') {
      return highlightTypeScript(code)
    } else if (lang === 'html') {
      return highlightHTML(code)
    } else if (lang === 'css') {
      return highlightCSS(code)
    } else if (lang === 'json') {
      return highlightJSON(code)
    } else if (lang === 'bash') {
      return highlightBash(code)
    } else if (lang === 'rust') {
      return highlightRust(code)
    } else if (lang === 'cpp' || lang === 'c') {
      return highlightCpp(code)
    } else if (lang === 'elixir') {
      return highlightElixir(code)
    } else if (lang === 'docker') {
      return highlightDocker(code)
    } else if (lang === 'java') {
      return highlightJava(code)
    } else if (lang === 'golang') {
      return highlightGo(code)
    } else if (lang === 'php') {
      return highlightPhp(code)
    } else if (lang === 'ruby') {
      return highlightRuby(code)
    } else if (lang === 'csharp') {
      return highlightCsharp(code)
    } else if (lang === 'kotlin') {
      return highlightKotlin(code)
    } else if (lang === 'swift') {
      return highlightSwift(code)
    } else if (lang === 'scala') {
      return highlightScala(code)
    } else if (lang === 'sql') {
      return highlightSQL(code)
    } else if (lang === 'yaml') {
      return highlightYaml(code)
    } else if (lang === 'xml') {
      return highlightXml(code)
    } else if (lang === 'markdown') {
      return highlightMarkdown(code)
    } else {
      return <span style={{ color: '#D4D4D4' }}>{code}</span> // VS Code default text color
    }
  }

  const highlightPython = (code: string): React.ReactNode => {
    const keywords = /\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|pass|break|continue|and|or|not|in|is|lambda|async|await|global|nonlocal|assert|del|raise|True|False|None)\b/g
    const strings = /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g
    const comments = /#.*$/gm
    const numbers = /\b\d+\.?\d*\b/g
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
    const decorators = /@[a-zA-Z_][a-zA-Z0-9_]*/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' }, // VS Code comment green
      { pattern: strings, className: 'text-[#CE9178]' }, // VS Code string orange
      { pattern: keywords, className: 'text-[#569CD6]' }, // VS Code keyword blue
      { pattern: decorators, className: 'text-[#4EC9B0]' }, // VS Code decorator cyan
      { pattern: functions, className: 'text-[#DCDCAA]' }, // VS Code function yellow
      { pattern: numbers, className: 'text-[#B5CEA8]' }, // VS Code number light green
    ])
  }

  const highlightJavaScript = (code: string): React.ReactNode => {
    const keywords = /\b(function|const|let|var|if|else|for|while|do|switch|case|default|try|catch|finally|return|break|continue|class|extends|import|export|from|async|await|typeof|instanceof|new|this|super|static|get|set|true|false|null|undefined)\b/g
    const strings = /(["'`])((?:(?!\1)[^\\]|\\.)*)(\1)/g
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm
    const numbers = /\b\d+\.?\d*\b/g
    const functions = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' }, // VS Code comment green
      { pattern: strings, className: 'text-[#CE9178]' }, // VS Code string orange
      { pattern: keywords, className: 'text-[#569CD6]' }, // VS Code keyword blue
      { pattern: functions, className: 'text-[#DCDCAA]' }, // VS Code function yellow
      { pattern: numbers, className: 'text-[#B5CEA8]' }, // VS Code number light green
    ])
  }

  const highlightTypeScript = (code: string): React.ReactNode => {
    const keywords = /\b(function|const|let|var|if|else|for|while|do|switch|case|default|try|catch|finally|return|break|continue|class|extends|import|export|from|async|await|typeof|instanceof|new|this|super|static|get|set|true|false|null|undefined|interface|type|enum|namespace|module|declare|public|private|protected|readonly|abstract)\b/g
    const strings = /(["'`])((?:(?!\1)[^\\]|\\.)*)(\1)/g
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm
    const numbers = /\b\d+\.?\d*\b/g
    const functions = /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g
    const types = /:\s*([A-Z][a-zA-Z0-9_]*)/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' }, // VS Code comment green
      { pattern: strings, className: 'text-[#CE9178]' }, // VS Code string orange
      { pattern: keywords, className: 'text-[#569CD6]' }, // VS Code keyword blue
      { pattern: types, className: 'text-[#4EC9B0]' }, // VS Code type cyan
      { pattern: functions, className: 'text-[#DCDCAA]' }, // VS Code function yellow
      { pattern: numbers, className: 'text-[#B5CEA8]' }, // VS Code number light green
    ])
  }

  const highlightHTML = (code: string): React.ReactNode => {
    const tags = /<\/?[a-zA-Z][a-zA-Z0-9]*[^>]*>/g
    const attributes = /\s([a-zA-Z-]+)=("[^"]*"|'[^']*')/g
    const comments = /<!--[\s\S]*?-->/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' }, // VS Code comment green
      { pattern: tags, className: 'text-[#569CD6]' }, // VS Code tag blue
      { pattern: attributes, className: 'text-[#92C5F8]' }, // VS Code attribute light blue
    ])
  }

  const highlightCSS = (code: string): React.ReactNode => {
    const selectors = /[.#]?[a-zA-Z][a-zA-Z0-9-_]*(?=\s*{)/g
    const properties = /([a-zA-Z-]+)(?=\s*:)/g
    const values = /:([^;{}]+)/g
    const comments = /\/\*[\s\S]*?\*\//g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' }, // VS Code comment green
      { pattern: selectors, className: 'text-[#D7BA7D]' }, // VS Code selector yellow-tan
      { pattern: properties, className: 'text-[#92C5F8]' }, // VS Code property light blue
      { pattern: values, className: 'text-[#CE9178]' }, // VS Code value orange
    ])
  }

  const highlightJSON = (code: string): React.ReactNode => {
    const strings = /"[^"]*"/g
    const numbers = /\b\d+\.?\d*\b/g
    const booleans = /\b(true|false|null)\b/g
    const keys = /"[^"]*"(?=\s*:)/g
    
    return tokenizeCode(code, [
      { pattern: keys, className: 'text-[#9CDCFE]' }, // VS Code JSON key light blue
      { pattern: strings, className: 'text-[#CE9178]' }, // VS Code string orange
      { pattern: booleans, className: 'text-[#569CD6]' }, // VS Code boolean blue
      { pattern: numbers, className: 'text-[#B5CEA8]' }, // VS Code number light green
    ])
  }

  const highlightBash = (code: string): React.ReactNode => {
    const commands = /\b(ls|cd|mkdir|rm|cp|mv|cat|grep|sed|awk|find|chmod|chown|ps|kill|top|sudo|apt|yum|npm|yarn|git|docker|kubectl)\b/g
    const flags = /-{1,2}[a-zA-Z0-9-]+/g
    const strings = /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g
    const comments = /#.*$/gm
    const variables = /\$[a-zA-Z_][a-zA-Z0-9_]*/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' }, // VS Code comment green
      { pattern: strings, className: 'text-[#CE9178]' }, // VS Code string orange
      { pattern: commands, className: 'text-[#569CD6]' }, // VS Code command blue
      { pattern: flags, className: 'text-[#DCDCAA]' }, // VS Code flag yellow
      { pattern: variables, className: 'text-[#4EC9B0]' }, // VS Code variable cyan
    ])
  }

  const highlightRust = (code: string): React.ReactNode => {
    const keywords = /\b(fn|let|mut|const|static|struct|enum|impl|trait|use|mod|pub|crate|super|self|Self|as|if|else|match|while|for|loop|break|continue|return|yield|async|await|unsafe|where|type|move|ref|in|extern|dyn|true|false)\b/g
    const types = /\b(i8|i16|i32|i64|i128|isize|u8|u16|u32|u64|u128|usize|f32|f64|bool|char|str|String|Vec|Option|Result|Box|Rc|Arc|HashMap|HashSet)\b/g
    const strings = /(r#*"[^"]*"#*|"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')/g
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm
    const numbers = /\b\d+\.?\d*(?:_[uf](?:8|16|32|64|128|size))?\b/g
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
    const macros = /\b([a-zA-Z_][a-zA-Z0-9_]*!)/g
    const attributes = /#\[[^\]]*\]/g
    const lifetimes = /'[a-zA-Z_][a-zA-Z0-9_]*/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' }, // VS Code comment green
      { pattern: strings, className: 'text-[#CE9178]' }, // VS Code string orange
      { pattern: keywords, className: 'text-[#569CD6]' }, // VS Code keyword blue
      { pattern: types, className: 'text-[#4EC9B0]' }, // VS Code type cyan
      { pattern: attributes, className: 'text-[#DCDCAA]' }, // VS Code attribute yellow
      { pattern: macros, className: 'text-[#DCDCAA]' }, // VS Code macro yellow
      { pattern: lifetimes, className: 'text-[#4EC9B0]' }, // VS Code lifetime cyan
      { pattern: functions, className: 'text-[#DCDCAA]' }, // VS Code function yellow
      { pattern: numbers, className: 'text-[#B5CEA8]' }, // VS Code number light green
    ])
  }

  const highlightCpp = (code: string): React.ReactNode => {
    const keywords = /\b(auto|break|case|char|const|continue|default|do|double|else|enum|extern|float|for|goto|if|inline|int|long|register|return|short|signed|sizeof|static|struct|switch|typedef|union|unsigned|void|volatile|while|class|private|protected|public|virtual|namespace|using|template|typename|operator|new|delete|this|friend|explicit|mutable|constexpr|nullptr|override|final|noexcept|static_assert|decltype|alignof|alignas|thread_local|consteval|constinit|co_await|co_yield|co_return|concept|requires)\b/g
    const types = /\b(bool|char|int|float|double|void|wchar_t|char8_t|char16_t|char32_t|size_t|ptrdiff_t|nullptr_t|std::string|std::vector|std::map|std::set|std::unique_ptr|std::shared_ptr|std::weak_ptr)\b/g
    const strings = /(R"[^(]*\([^)]*\)[^"]*"|"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')/g
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm
    const numbers = /\b\d+\.?\d*[fFlLuU]*\b/g
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
    const preprocessor = /#\s*[a-zA-Z_][a-zA-Z0-9_]*\b/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' },
      { pattern: strings, className: 'text-[#CE9178]' },
      { pattern: preprocessor, className: 'text-[#C586C0]' },
      { pattern: keywords, className: 'text-[#569CD6]' },
      { pattern: types, className: 'text-[#4EC9B0]' },
      { pattern: functions, className: 'text-[#DCDCAA]' },
      { pattern: numbers, className: 'text-[#B5CEA8]' },
    ])
  }

  const highlightElixir = (code: string): React.ReactNode => {
    const keywords = /\b(defmodule|def|defp|defmacro|defstruct|defprotocol|defimpl|do|end|if|unless|cond|case|when|for|with|try|catch|rescue|after|else|fn|receive|send|spawn|import|alias|require|use|quote|unquote|super|true|false|nil|and|or|not|in|when)\b/g
    const atoms = /:[a-zA-Z_][a-zA-Z0-9_]*[?!]?/g
    const strings = /("""[\s\S]*?"""|"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')/g
    const comments = /#.*$/gm
    const numbers = /\b\d+\.?\d*\b/g
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*[?!]?)\s*(?=\()/g
    const modules = /\b[A-Z][a-zA-Z0-9_]*(?:\.[A-Z][a-zA-Z0-9_]*)*\b/g
    const variables = /@[a-zA-Z_][a-zA-Z0-9_]*/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' },
      { pattern: strings, className: 'text-[#CE9178]' },
      { pattern: keywords, className: 'text-[#569CD6]' },
      { pattern: atoms, className: 'text-[#4EC9B0]' },
      { pattern: modules, className: 'text-[#4EC9B0]' },
      { pattern: variables, className: 'text-[#9CDCFE]' },
      { pattern: functions, className: 'text-[#DCDCAA]' },
      { pattern: numbers, className: 'text-[#B5CEA8]' },
    ])
  }

  const highlightDocker = (code: string): React.ReactNode => {
    const instructions = /^\s*(FROM|RUN|CMD|LABEL|MAINTAINER|EXPOSE|ENV|ADD|COPY|ENTRYPOINT|VOLUME|USER|WORKDIR|ARG|ONBUILD|STOPSIGNAL|HEALTHCHECK|SHELL)\b/gm
    const strings = /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g
    const comments = /#.*$/gm
    const variables = /\$\{?[a-zA-Z_][a-zA-Z0-9_]*\}?/g
    const flags = /--[a-zA-Z0-9-]+/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' },
      { pattern: strings, className: 'text-[#CE9178]' },
      { pattern: instructions, className: 'text-[#569CD6]' },
      { pattern: flags, className: 'text-[#DCDCAA]' },
      { pattern: variables, className: 'text-[#4EC9B0]' },
    ])
  }

  const highlightJava = (code: string): React.ReactNode => {
    const keywords = /\b(abstract|assert|boolean|break|byte|case|catch|char|class|const|continue|default|do|double|else|enum|extends|final|finally|float|for|goto|if|implements|import|instanceof|int|interface|long|native|new|package|private|protected|public|return|short|static|strictfp|super|switch|synchronized|this|throw|throws|transient|try|void|volatile|while|true|false|null)\b/g
    const types = /\b([A-Z][a-zA-Z0-9_]*|String|Object|List|Map|Set|ArrayList|HashMap|HashSet|Optional|Stream)\b/g
    const strings = /("""[\s\S]*?"""|"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')/g
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm
    const numbers = /\b\d+\.?\d*[fFdDlL]?\b/g
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
    const annotations = /@[a-zA-Z_][a-zA-Z0-9_]*/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' },
      { pattern: strings, className: 'text-[#CE9178]' },
      { pattern: annotations, className: 'text-[#DCDCAA]' },
      { pattern: keywords, className: 'text-[#569CD6]' },
      { pattern: types, className: 'text-[#4EC9B0]' },
      { pattern: functions, className: 'text-[#DCDCAA]' },
      { pattern: numbers, className: 'text-[#B5CEA8]' },
    ])
  }

  const highlightGo = (code: string): React.ReactNode => {
    const keywords = /\b(break|case|chan|const|continue|default|defer|else|fallthrough|for|func|go|goto|if|import|interface|map|package|range|return|select|struct|switch|type|var|true|false|nil|iota)\b/g
    const types = /\b(bool|byte|complex64|complex128|error|float32|float64|int|int8|int16|int32|int64|rune|string|uint|uint8|uint16|uint32|uint64|uintptr)\b/g
    const strings = /(```[\s\S]*?```|`[^`]*`|"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')/g
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm
    const numbers = /\b\d+\.?\d*[i]?\b/g
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' },
      { pattern: strings, className: 'text-[#CE9178]' },
      { pattern: keywords, className: 'text-[#569CD6]' },
      { pattern: types, className: 'text-[#4EC9B0]' },
      { pattern: functions, className: 'text-[#DCDCAA]' },
      { pattern: numbers, className: 'text-[#B5CEA8]' },
    ])
  }

  const highlightPhp = (code: string): React.ReactNode => {
    const keywords = /\b(abstract|and|array|as|break|callable|case|catch|class|clone|const|continue|declare|default|die|do|echo|else|elseif|empty|enddeclare|endfor|endforeach|endif|endswitch|endwhile|eval|exit|extends|final|finally|for|foreach|function|global|goto|if|implements|include|include_once|instanceof|insteadof|interface|isset|list|namespace|new|or|print|private|protected|public|require|require_once|return|static|switch|throw|trait|try|unset|use|var|while|xor|yield|true|false|null)\b/g
    const variables = /\$[a-zA-Z_][a-zA-Z0-9_]*/g
    const strings = /("""[\s\S]*?"""|"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')/g
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/|#.*$)/gm
    const numbers = /\b\d+\.?\d*\b/g
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' },
      { pattern: strings, className: 'text-[#CE9178]' },
      { pattern: keywords, className: 'text-[#569CD6]' },
      { pattern: variables, className: 'text-[#9CDCFE]' },
      { pattern: functions, className: 'text-[#DCDCAA]' },
      { pattern: numbers, className: 'text-[#B5CEA8]' },
    ])
  }

  const highlightRuby = (code: string): React.ReactNode => {
    const keywords = /\b(alias|and|begin|break|case|class|def|defined|do|else|elsif|end|ensure|false|for|if|in|module|next|nil|not|or|redo|rescue|retry|return|self|super|then|true|undef|unless|until|when|while|yield|require|include|extend|attr_reader|attr_writer|attr_accessor)\b/g
    const symbols = /:[a-zA-Z_][a-zA-Z0-9_]*[?!]?/g
    const strings = /("""[\s\S]*?"""|"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*'|%[qQrwWxiI]?[^a-zA-Z0-9\s][^]*?[^a-zA-Z0-9\s])/g
    const comments = /#.*$/gm
    const numbers = /\b\d+\.?\d*\b/g
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*[?!]?)\s*(?=\()/g
    const variables = /@@?[a-zA-Z_][a-zA-Z0-9_]*/g
    const constants = /\b[A-Z][A-Z0-9_]*\b/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' },
      { pattern: strings, className: 'text-[#CE9178]' },
      { pattern: keywords, className: 'text-[#569CD6]' },
      { pattern: symbols, className: 'text-[#4EC9B0]' },
      { pattern: constants, className: 'text-[#4EC9B0]' },
      { pattern: variables, className: 'text-[#9CDCFE]' },
      { pattern: functions, className: 'text-[#DCDCAA]' },
      { pattern: numbers, className: 'text-[#B5CEA8]' },
    ])
  }

  const highlightCsharp = (code: string): React.ReactNode => {
    const keywords = /\b(abstract|as|base|bool|break|byte|case|catch|char|checked|class|const|continue|decimal|default|delegate|do|double|else|enum|event|explicit|extern|false|finally|fixed|float|for|foreach|goto|if|implicit|in|int|interface|internal|is|lock|long|namespace|new|null|object|operator|out|override|params|private|protected|public|readonly|ref|return|sbyte|sealed|short|sizeof|stackalloc|static|string|struct|switch|this|throw|true|try|typeof|uint|ulong|unchecked|unsafe|ushort|using|virtual|void|volatile|while|add|alias|ascending|async|await|by|descending|dynamic|equals|from|get|global|group|into|join|let|nameof|on|orderby|partial|remove|select|set|value|var|when|where|yield)\b/g
    const types = /\b(bool|byte|sbyte|char|decimal|double|float|int|uint|long|ulong|object|short|ushort|string|var|void|dynamic|String|Object|List|Dictionary|Array|IEnumerable|Task|Func|Action)\b/g
    const strings = /(@"(?:[^"]|"")*"|"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')/g
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm
    const numbers = /\b\d+\.?\d*[fFdDmM]?\b/g
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
    const attributes = /\[[^\]]*\]/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' },
      { pattern: strings, className: 'text-[#CE9178]' },
      { pattern: attributes, className: 'text-[#DCDCAA]' },
      { pattern: keywords, className: 'text-[#569CD6]' },
      { pattern: types, className: 'text-[#4EC9B0]' },
      { pattern: functions, className: 'text-[#DCDCAA]' },
      { pattern: numbers, className: 'text-[#B5CEA8]' },
    ])
  }

  const highlightKotlin = (code: string): React.ReactNode => {
    const keywords = /\b(abstract|actual|annotation|as|break|by|catch|class|companion|const|constructor|continue|crossinline|data|do|dynamic|else|enum|expect|external|false|field|file|final|finally|for|fun|get|if|import|in|infix|init|inline|inner|interface|internal|is|lateinit|noinline|null|object|open|operator|out|override|package|param|private|property|protected|public|receiver|reified|return|sealed|set|setparam|super|suspend|tailrec|this|throw|true|try|typealias|typeof|val|var|vararg|when|where|while)\b/g
    const types = /\b(Any|Boolean|Byte|Char|Double|Float|Int|Long|Nothing|Short|String|Unit|Array|List|Map|Set|MutableList|MutableMap|MutableSet)\b/g
    const strings = /("""[\s\S]*?"""|"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')/g
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm
    const numbers = /\b\d+\.?\d*[fFlL]?\b/g
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
    const annotations = /@[a-zA-Z_][a-zA-Z0-9_]*/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' },
      { pattern: strings, className: 'text-[#CE9178]' },
      { pattern: annotations, className: 'text-[#DCDCAA]' },
      { pattern: keywords, className: 'text-[#569CD6]' },
      { pattern: types, className: 'text-[#4EC9B0]' },
      { pattern: functions, className: 'text-[#DCDCAA]' },
      { pattern: numbers, className: 'text-[#B5CEA8]' },
    ])
  }

  const highlightSwift = (code: string): React.ReactNode => {
    const keywords = /\b(associatedtype|class|deinit|enum|extension|fileprivate|func|import|init|inout|internal|let|open|operator|private|protocol|public|static|struct|subscript|typealias|var|break|case|continue|default|defer|do|else|fallthrough|for|guard|if|in|repeat|return|switch|where|while|as|catch|false|is|nil|rethrows|super|self|Self|throw|throws|true|try|associativity|convenience|dynamic|didSet|final|get|infix|indirect|lazy|left|mutating|none|nonmutating|optional|override|postfix|precedence|prefix|Protocol|required|right|set|Type|unowned|weak|willSet)\b/g
    const types = /\b(Any|AnyObject|AnyClass|Bool|Character|Double|Float|Int|String|Void|Array|Dictionary|Set|Optional)\b/g
    const strings = /("""[\s\S]*?"""|"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')/g
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm
    const numbers = /\b\d+\.?\d*\b/g
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
    const attributes = /@[a-zA-Z_][a-zA-Z0-9_]*/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' },
      { pattern: strings, className: 'text-[#CE9178]' },
      { pattern: attributes, className: 'text-[#DCDCAA]' },
      { pattern: keywords, className: 'text-[#569CD6]' },
      { pattern: types, className: 'text-[#4EC9B0]' },
      { pattern: functions, className: 'text-[#DCDCAA]' },
      { pattern: numbers, className: 'text-[#B5CEA8]' },
    ])
  }

  const highlightScala = (code: string): React.ReactNode => {
    const keywords = /\b(abstract|case|catch|class|def|do|else|extends|false|final|finally|for|forSome|if|implicit|import|lazy|match|new|null|object|override|package|private|protected|return|sealed|super|this|throw|trait|try|true|type|val|var|while|with|yield)\b/g
    const types = /\b(Any|AnyRef|AnyVal|Boolean|Byte|Char|Double|Float|Int|Long|Nothing|Null|Short|String|Unit|List|Array|Map|Set|Option|Some|None|Either|Left|Right|Future|Try|Success|Failure)\b/g
    const strings = /("""[\s\S]*?"""|"(?:[^"\\\\]|\\\\.)*"|'(?:[^'\\\\]|\\\\.)*')/g
    const comments = /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm
    const numbers = /\b\d+\.?\d*[fFlLdD]?\b/g
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
    const annotations = /@[a-zA-Z_][a-zA-Z0-9_]*/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' },
      { pattern: strings, className: 'text-[#CE9178]' },
      { pattern: annotations, className: 'text-[#DCDCAA]' },
      { pattern: keywords, className: 'text-[#569CD6]' },
      { pattern: types, className: 'text-[#4EC9B0]' },
      { pattern: functions, className: 'text-[#DCDCAA]' },
      { pattern: numbers, className: 'text-[#B5CEA8]' },
    ])
  }

  const highlightSQL = (code: string): React.ReactNode => {
    const keywords = /\b(SELECT|FROM|WHERE|JOIN|INNER|LEFT|RIGHT|FULL|OUTER|ON|GROUP|BY|ORDER|HAVING|INSERT|INTO|VALUES|UPDATE|SET|DELETE|CREATE|TABLE|DATABASE|INDEX|VIEW|PROCEDURE|FUNCTION|TRIGGER|ALTER|DROP|TRUNCATE|UNION|ALL|DISTINCT|AS|ASC|DESC|LIMIT|OFFSET|CASE|WHEN|THEN|ELSE|END|IF|EXISTS|NOT|NULL|IS|AND|OR|IN|BETWEEN|LIKE|ILIKE|PRIMARY|KEY|FOREIGN|REFERENCES|UNIQUE|CHECK|DEFAULT|AUTO_INCREMENT|IDENTITY|SERIAL)\b/gi
    const types = /\b(VARCHAR|CHAR|TEXT|INT|INTEGER|BIGINT|SMALLINT|TINYINT|DECIMAL|NUMERIC|FLOAT|DOUBLE|REAL|DATE|TIME|TIMESTAMP|DATETIME|BOOLEAN|BOOL|BINARY|VARBINARY|BLOB|CLOB|JSON|XML|UUID)\b/gi
    const strings = /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g
    const comments = /(--.*$|\/\*[\s\S]*?\*\/)/gm
    const numbers = /\b\d+\.?\d*\b/g
    const functions = /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' },
      { pattern: strings, className: 'text-[#CE9178]' },
      { pattern: keywords, className: 'text-[#569CD6]' },
      { pattern: types, className: 'text-[#4EC9B0]' },
      { pattern: functions, className: 'text-[#DCDCAA]' },
      { pattern: numbers, className: 'text-[#B5CEA8]' },
    ])
  }

  const highlightYaml = (code: string): React.ReactNode => {
    const keys = /^(\s*)([a-zA-Z_][a-zA-Z0-9_-]*)\s*:/gm
    const strings = /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g
    const comments = /#.*$/gm
    const numbers = /\b\d+\.?\d*\b/g
    const booleans = /\b(true|false|yes|no|on|off|null|~)\b/g
    const indicators = /^(\s*)(-|\||\>)/gm
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' },
      { pattern: strings, className: 'text-[#CE9178]' },
      { pattern: keys, className: 'text-[#9CDCFE]' },
      { pattern: indicators, className: 'text-[#569CD6]' },
      { pattern: booleans, className: 'text-[#569CD6]' },
      { pattern: numbers, className: 'text-[#B5CEA8]' },
    ])
  }

  const highlightXml = (code: string): React.ReactNode => {
    const tags = /<\/?[a-zA-Z_][\w:-]*(?:\s[^>]*)?\/?>/g
    const attributes = /\s([a-zA-Z_][\w:-]*)\s*=/g
    const strings = /(["'])((?:(?!\1)[^\\]|\\.)*)(\1)/g
    const comments = /<!--[\s\S]*?-->/g
    const cdata = /<!\[CDATA\[[\s\S]*?\]\]>/g
    
    return tokenizeCode(code, [
      { pattern: comments, className: 'text-[#6A9955]' },
      { pattern: cdata, className: 'text-[#CE9178]' },
      { pattern: strings, className: 'text-[#CE9178]' },
      { pattern: tags, className: 'text-[#569CD6]' },
      { pattern: attributes, className: 'text-[#9CDCFE]' },
    ])
  }

  const highlightMarkdown = (code: string): React.ReactNode => {
    const headers = /^#{1,6}\s+.*$/gm
    const bold = /\*\*[^*]+\*\*|\b__[^_]+__\b/g
    const italic = /\*[^*]+\*|\b_[^_]+_\b/g
    const code_inline = /`[^`]+`/g
    const links = /\[([^\]]+)\]\(([^)]+)\)/g
    const lists = /^(\s*)[-*+]\s+/gm
    const blockquotes = /^>\s+.*$/gm
    
    return tokenizeCode(code, [
      { pattern: headers, className: 'text-[#569CD6]' },
      { pattern: bold, className: 'text-[#DCDCAA] font-bold' },
      { pattern: italic, className: 'text-[#DCDCAA] italic' },
      { pattern: code_inline, className: 'text-[#CE9178]' },
      { pattern: links, className: 'text-[#4EC9B0]' },
      { pattern: lists, className: 'text-[#569CD6]' },
      { pattern: blockquotes, className: 'text-[#6A9955]' },
    ])
  }

  const tokenizeCode = (code: string, rules: { pattern: RegExp; className: string }[]): React.ReactNode => {
    const tokens: { start: number; end: number; className: string; match: string }[] = []
    
    rules.forEach(rule => {
      let match
      while ((match = rule.pattern.exec(code)) !== null) {
        tokens.push({
          start: match.index,
          end: match.index + match[0].length,
          className: rule.className,
          match: match[0]
        })
        if (!rule.pattern.global) break
      }
    })
    
    // Sort tokens by start position
    tokens.sort((a, b) => a.start - b.start)
    
    // Remove overlapping tokens (keep the first one)
    const filteredTokens = tokens.filter((token, index) => {
      return !tokens.slice(0, index).some(prevToken => 
        token.start < prevToken.end && token.end > prevToken.start
      )
    })
    
    const result: React.ReactNode[] = []
    let lastIndex = 0
    
    filteredTokens.forEach((token, index) => {
      // Add text before token
      if (token.start > lastIndex) {
        result.push(
          <span key={`text-${index}`} style={{ color: '#D4D4D4' }}>
            {code.slice(lastIndex, token.start)}
          </span>
        )
      }
      
      // Add highlighted token
      result.push(
        <span key={`token-${index}`} className={token.className}>
          {token.match}
        </span>
      )
      
      lastIndex = token.end
    })
    
    // Add remaining text
    if (lastIndex < code.length) {
      result.push(
        <span key="text-end" style={{ color: '#D4D4D4' }}>
          {code.slice(lastIndex)}
        </span>
      )
    }
    
    return <>{result}</>
  }

  // Get display name for language
  const getLanguageDisplayName = (lang: string): string => {
    const displayNames: { [key: string]: string } = {
      'python': 'Python',
      'py': 'Python',
      'javascript': 'JavaScript',
      'js': 'JavaScript',
      'typescript': 'TypeScript',
      'ts': 'TypeScript',
      'jsx': 'React',
      'tsx': 'React',
      'html': 'HTML',
      'css': 'CSS',
      'json': 'JSON',
      'bash': 'Bash',
      'sh': 'Shell',
      'shell': 'Shell',
      'sql': 'SQL',
      'xml': 'XML',
      'yaml': 'YAML',
      'yml': 'YAML',
      'markdown': 'Markdown',
      'md': 'Markdown',
    }
    
    return displayNames[lang.toLowerCase()] || lang.toUpperCase()
  }

  // Pre block with Copy button and language tag; separate component to satisfy hooks rule
  const PreBlock: React.FC<React.HTMLAttributes<HTMLPreElement> & { language?: string }> = (props) => {
    const { children, className, language, ...rest } = props
    const preRef = React.useRef<HTMLPreElement>(null)
    const [copied, setCopied] = useState(false)

    const onCopy = async () => {
      if (preRef.current) {
        const codeElement = preRef.current.querySelector('code');
        const codeText = codeElement ? codeElement.innerText : '';
        try {
          await navigator.clipboard.writeText(codeText.replace(/\n$/, ''))
          setCopied(true)
          setTimeout(() => setCopied(false), 1500)
        } catch (err) {
          console.error('Failed to copy text: ', err)
        }
      }
    }

    return (
      <div className="relative my-6">
        {language && (
          <div className="absolute left-3 top-3 z-10 px-2 py-1 text-xs rounded-md bg-muted/80 text-muted-foreground font-medium">
            {getLanguageDisplayName(language)}
          </div>
        )}
        <button
          type="button"
          onClick={onCopy}
          className="absolute right-3 top-3 z-10 inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md border border-border bg-card/80 hover:bg-card hover:border-border/80 transition-all duration-200 cursor-pointer hover:shadow-sm text-foreground"
          title="Copy code"
        >
          {copied ? 'Copied' : 'Copy'}
        </button>
        <pre {...rest} ref={preRef} className={"rounded-xl p-6 pt-12 border border-border shadow-lg overflow-x-auto bg-transparent" + (className ? ` ${className}` : '')}>
          {children}
        </pre>
      </div>
    )
  }

  return (
    <div className="prose prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[[rehypeKatex, { strict: "ignore", throwOnError: false }], rehypeRaw]}
        components={{
          img: (props) => {
            const { src, alt, style, width, height } = props as unknown as { 
              src?: string; 
              alt?: string; 
              style?: React.CSSProperties | string;
              width?: string | number;
              height?: string | number;
            }
            if (!src) return null
            let resolved: string
            if (baseImagePath) {
              if (src.startsWith("/blogs/")) {
                // If a baseImagePath is provided, rewrite blog-rooted paths against it
                const rest = src.replace(/^\/blogs\/[^/]+\/?/, "")
                resolved = `${baseImagePath}/${rest}`
              } else if (src.startsWith("/")) {
                resolved = src
              } else {
                resolved = `${baseImagePath}/${src.replace(/^\.\//, "")}`
              }
            } else {
              // Without a baseImagePath, treat relative paths as public-rooted
              if (src.startsWith("/")) {
                resolved = src
              } else {
                resolved = "/" + src.replace(/^\.\//, "")
              }
            }

            // Parse style object or string for Next/Image compatibility
            let imageStyle: React.CSSProperties = {}
            let imageWidth = 1200
            let imageHeight = 630
            
            if (style) {
              if (typeof style === 'string') {
                // Parse inline style string
                const styleObj: Record<string, string> = {}
                style.split(';').forEach(rule => {
                  const [prop, value] = rule.split(':').map(s => s.trim())
                  if (prop && value) {
                    const camelProp = prop.replace(/-([a-z])/g, (_, letter) => letter.toUpperCase())
                    styleObj[camelProp] = value
                  }
                })
                imageStyle = styleObj as React.CSSProperties
              } else {
                imageStyle = style
              }
            }

            // Handle explicit width/height props
            if (width) imageWidth = typeof width === 'string' ? parseInt(width) || 1200 : width
            if (height) imageHeight = typeof height === 'string' ? parseInt(height) || 630 : height

            return (
              <span className="block my-6">
                <Image 
                  src={resolved} 
                  alt={alt || ""} 
                  width={imageWidth} 
                  height={imageHeight} 
                  className="rounded-lg" 
                  style={imageStyle}
                />
                {showImageCaptions && alt && (
                  <span className="block text-center text-sm text-muted-foreground mt-2">{alt}</span>
                )}
              </span>
            )
          },
          a: ({ href, children }: { href?: string; children?: React.ReactNode }) => (
            <a
              href={href}
              className="text-primary hover:text-primary/80 underline underline-offset-4"
              target={href && href.startsWith("http") ? "_blank" : undefined}
              rel={href && href.startsWith("http") ? "noopener noreferrer" : undefined}
            >
              {children}
            </a>
          ),
          pre: (props) => {
            const { children } = props
            // Try to extract language from code element
            let language = ''
            if (React.isValidElement(children)) {
              const codeProps = children.props as { className?: string }
              if (codeProps?.className) {
                const match = /language-(\w+)/.exec(codeProps.className || '')
                language = match ? match[1] : ''
              }
            }
            return <PreBlock {...props} language={language} />
          },
          code: ({ inline, className, children }: { inline?: boolean; className?: string; children?: React.ReactNode }) => {
            if (inline) {
              return <code className="px-1 text-sm font-mono text-primary">{String(children)}</code>;
            }
            
            // Extract language from className (e.g., "language-python" -> "python")
            const match = /language-(\w+)/.exec(className || '')
            const language = match ? match[1] : ''
            const codeString = String(children).replace(/\n$/, '')
            
            if (language) {
              return (
                <code className={`${className} text-sm font-medium`} style={{ fontSize: '0.9rem', fontWeight: '500' }}>
                  {highlightCode(codeString, language)}
                </code>
              )
            }
            
            // For block code without language, render normally
            return (
              <code className={`${className} text-sm font-medium`} style={{ fontSize: '0.9rem', color: '#D4D4D4', fontWeight: '500' }}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { Highlighter, Eye } from 'lucide-react'
import { useId } from 'react'

interface HighlightableTextProps {
  children: React.ReactNode;
  presetHighlights?: string[];
}

export default function HighlightableText({ children, presetHighlights = [] }: HighlightableTextProps) {
  const [isHighlighting, setIsHighlighting] = useState(false)
  const uniqueId = useId()

  const handleHighlight = () => {
    const selection = window.getSelection()
    if (!selection || selection.rangeCount === 0) return

    const range = selection.getRangeAt(0)
    const selectedText = range.toString().trim()
    
    if (selectedText) {
      try {
        const span = document.createElement('span')
        span.className = 'bg-yellow-200/70 mix-blend-multiply'
        range.surroundContents(span)
      } catch (error) {
        const newRange = document.createRange()
        newRange.setStart(range.startContainer, range.startOffset)
        newRange.setEnd(range.endContainer, range.endOffset)
        const span = document.createElement('span')
        span.className = 'bg-yellow-200/70 mix-blend-multiply'
        newRange.surroundContents(span)
      }
      selection.removeAllRanges()
    }
  }

  const clearHighlights = () => {
    const container = document.getElementById(`highlightable-content-${uniqueId}`)
    if (!container) return

    container.innerHTML = container.innerHTML.replace(
      /<span class="bg-yellow-200\/70 mix-blend-multiply">(.*?)<\/span>/g,
      '$1'
    )
  }

  useEffect(() => {
    const container = document.getElementById(`highlightable-content-${uniqueId}`)
    if (!container || !presetHighlights.length) return

    const text = container.innerHTML
    let highlightedText = text

    presetHighlights
      .sort((a, b) => b.length - a.length)
      .forEach(highlight => {
        const regex = new RegExp(`(${highlight})`, 'gi')
        highlightedText = highlightedText.replace(
          regex,
          '<span class="bg-yellow-200/70 mix-blend-multiply">$1</span>'
        )
      })

    container.innerHTML = highlightedText
  }, []) // Only run once on mount

  return (
    <div className="relative p-6 my-4 bg-white border border-gray-400 rounded-lg">
      <div className="absolute top-2 right-2 flex gap-2">
        <button
          className="p-2 rounded-full bg-red-100 text-red-500 hover:bg-red-200 transition-colors"
          onClick={clearHighlights}
          aria-label="Clear highlights"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M19 19H5V5h14v14z" />
            <path d="M3 3l18 18" />
          </svg>
        </button>
        <button
          className={`p-2 rounded-full transition-colors ${
            isHighlighting 
              ? 'bg-yellow-200 text-yellow-700' 
              : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
          }`}
          onClick={() => setIsHighlighting(!isHighlighting)}
          aria-label="Toggle highlighter"
        >
          <Highlighter size={20} />
        </button>
      </div>
      
      <div 
        id={`highlightable-content-${uniqueId}`}
        className={`mt-8 ${isHighlighting ? 'selection:bg-yellow-200' : ''}`}
        onMouseUp={() => {
          if (isHighlighting) {
            handleHighlight()
          }
        }}
      >
        {children}
      </div>
    </div>
  )
} 
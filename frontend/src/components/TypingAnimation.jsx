import React, { useState, useEffect, useRef } from 'react'

export default function TypingAnimation({ text, speed = 15, onComplete }) {
  const [displayedText, setDisplayedText] = useState('')
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const timeoutRef = useRef(null)

  useEffect(() => {
    if (currentIndex < text.length) {
      // Calculate dynamic speed based on character type
      let charSpeed = speed
      const currentChar = text[currentIndex]
      
      // Slower for punctuation to feel more natural
      if (['.', '!', '?'].includes(currentChar)) {
        charSpeed = speed * 15
      } else if ([',', ';', ':'].includes(currentChar)) {
        charSpeed = speed * 8
      } else if (currentChar === '\n') {
        charSpeed = speed * 10
      }

      timeoutRef.current = setTimeout(() => {
        setDisplayedText(prev => prev + text[currentIndex])
        setCurrentIndex(prev => prev + 1)
      }, charSpeed)

      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current)
        }
      }
    } else if (currentIndex === text.length && !isComplete) {
      setIsComplete(true)
      if (onComplete) {
        // Small delay before calling onComplete
        timeoutRef.current = setTimeout(() => {
          onComplete()
        }, 300)
      }
    }
  }, [currentIndex, text, speed, onComplete, isComplete])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  return (
    <span className="inline">
      {displayedText}
      {currentIndex < text.length && (
        <span className="inline-block w-0.5 h-4 bg-primary-400 ml-0.5 animate-blink" 
              style={{ animation: 'blink 1s step-end infinite' }} />
      )}
    </span>
  )
}

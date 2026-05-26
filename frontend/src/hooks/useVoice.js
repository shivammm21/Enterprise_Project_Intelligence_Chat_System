import { useState, useEffect, useRef, useCallback } from 'react'

/**
 * useVoice — wraps Web Speech API for both STT and TTS.
 *
 * STT  (speech-to-text):  startListening / stopListening
 * TTS  (text-to-speech):  speak / stopSpeaking
 */
export function useVoice({ onTranscript, onFinalTranscript, onError } = {}) {
  // ── STT state ──────────────────────────────────────────────────────────────
  const [isListening, setIsListening] = useState(false)
  const [interimText, setInterimText]  = useState('')   // live partial transcript
  const recognitionRef = useRef(null)

  // ── TTS state ──────────────────────────────────────────────────────────────
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speakingMsgId, setSpeakingMsgId] = useState(null)

  // ── Browser support flags ──────────────────────────────────────────────────
  const sttSupported = typeof window !== 'undefined' &&
    ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)

  const ttsSupported = typeof window !== 'undefined' &&
    'speechSynthesis' in window

  // ── STT: initialise recognition once ──────────────────────────────────────
  useEffect(() => {
    if (!sttSupported) return

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition
    const recognition = new SR()
    recognition.continuous      = false   // stop after first pause
    recognition.interimResults  = true    // show live partial results
    recognition.lang            = 'en-US'
    recognition.maxAlternatives = 1

    recognition.onresult = (e) => {
      let interim = ''
      let final   = ''
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript
        if (e.results[i].isFinal) final += t
        else interim += t
      }
      setInterimText(interim)
      if (final) {
        onTranscript?.(final.trim())
        onFinalTranscript?.(final.trim())  // caller can use this to auto-send
        setInterimText('')
      }
    }

    recognition.onerror = (e) => {
      // 'no-speech' is not really an error — user just didn't say anything
      if (e.error !== 'no-speech') {
        onError?.(e.error)
      }
      setIsListening(false)
      setInterimText('')
    }

    recognition.onend = () => {
      setIsListening(false)
      setInterimText('')
    }

    recognitionRef.current = recognition

    return () => {
      recognition.abort()
    }
  }, [sttSupported]) // eslint-disable-line react-hooks/exhaustive-deps

  const startListening = useCallback(() => {
    if (!sttSupported || isListening) return
    try {
      recognitionRef.current?.start()
      setIsListening(true)
      setInterimText('')
    } catch {
      // already started — ignore
    }
  }, [sttSupported, isListening])

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    setIsListening(false)
    setInterimText('')
  }, [])

  // ── TTS ────────────────────────────────────────────────────────────────────
  const speak = useCallback((text, msgId) => {
    if (!ttsSupported) return
    window.speechSynthesis.cancel()           // stop any current speech

    // Strip markdown syntax so it reads naturally
    const clean = text
      .replace(/#{1,6}\s/g, '')              // headings
      .replace(/\*\*(.*?)\*\*/g, '$1')       // bold
      .replace(/\*(.*?)\*/g, '$1')           // italic
      .replace(/`{1,3}[^`]*`{1,3}/g, '')    // code
      .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1') // links
      .replace(/^\s*[-*+]\s/gm, '')          // list bullets
      .replace(/\n{2,}/g, '. ')              // paragraph breaks → pause
      .trim()

    const utterance = new SpeechSynthesisUtterance(clean)
    utterance.rate   = 1.0
    utterance.pitch  = 1.0
    utterance.volume = 1.0

    // Prefer a natural-sounding English voice if available
    const voices = window.speechSynthesis.getVoices()
    const preferred = voices.find(
      (v) => v.lang.startsWith('en') && v.localService
    ) || voices.find((v) => v.lang.startsWith('en'))
    if (preferred) utterance.voice = preferred

    utterance.onstart = () => { setIsSpeaking(true);  setSpeakingMsgId(msgId) }
    utterance.onend   = () => { setIsSpeaking(false); setSpeakingMsgId(null)  }
    utterance.onerror = () => { setIsSpeaking(false); setSpeakingMsgId(null)  }

    window.speechSynthesis.speak(utterance)
  }, [ttsSupported])

  const stopSpeaking = useCallback(() => {
    window.speechSynthesis?.cancel()
    setIsSpeaking(false)
    setSpeakingMsgId(null)
  }, [])

  // Stop speaking when component unmounts
  useEffect(() => () => window.speechSynthesis?.cancel(), [])

  return {
    // STT
    sttSupported,
    isListening,
    interimText,
    startListening,
    stopListening,
    // TTS
    ttsSupported,
    isSpeaking,
    speakingMsgId,
    speak,
    stopSpeaking,
  }
}

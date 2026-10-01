import { useEffect, useRef, useState } from 'react'

interface MessageInputProps {
  disabled: boolean
  onSend: (text: string) => Promise<void>
}

export function MessageInput({ disabled, onSend }: MessageInputProps) {
  const [value, setValue] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const textareaRef = useRef<HTMLTextAreaElement | null>(null)

  useEffect(() => {
    textareaRef.current?.focus()
  }, [disabled])

  const submit = async () => {
    const text = value.trim()
    if (!text || disabled || sending) return

    setSending(true)
    setError(null)
    try {
      await onSend(text)
      setValue('')
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось отправить сообщение.')
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="composer">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => setValue(event.target.value.slice(0, 4000))}
        onKeyDown={(event) => {
          if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault()
            void submit()
          }
        }}
        placeholder="Напишите сообщение…"
        rows={1}
        disabled={disabled || sending}
        aria-label="Текст сообщения"
      />
      {error ? <div className="composer-error">{error}</div> : null}
      <div className="composer-footer">
        <span>{value.length}/4000</span>
        <button
          type="button"
          className="send-button"
          disabled={disabled || sending || !value.trim()}
          onClick={() => void submit()}
          aria-label="Отправить сообщение"
        >
          {sending ? '…' : '➤'}
        </button>
      </div>
    </div>
  )
}

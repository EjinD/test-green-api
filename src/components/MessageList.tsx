import { useEffect, useRef } from 'react'
import type { ChatMessage } from '../types/chat'

interface MessageListProps {
  messages: ChatMessage[]
}

export function MessageList({ messages }: MessageListProps) {
  const endRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }, [messages])

  if (messages.length === 0) {
    return (
      <div className="message-list empty-state">
        <div className="empty-icon">M</div>
        <strong>Сообщений пока нет</strong>
        <span>Отправьте первое сообщение и начните диалог.</span>
      </div>
    )
  }

  return (
    <div className="message-list">
      <div className="conversation-date">Сегодня</div>
      {messages.map((message) => (
        <article
          className={`message-row ${message.direction === 'outgoing' ? 'message-row-outgoing' : ''}`}
          key={message.id}
        >
          <div className={`message-bubble ${message.direction === 'outgoing' ? 'message-bubble-outgoing' : ''}`}>
            <div className="message-text">{message.text}</div>
            <div className="message-meta">
              <time dateTime={new Date(message.timestamp).toISOString()}>
                {new Intl.DateTimeFormat('ru-RU', {
                  hour: '2-digit',
                  minute: '2-digit',
                }).format(message.timestamp)}
              </time>
              {message.direction === 'outgoing' ? <span aria-label="Отправлено">✓</span> : null}
            </div>
          </div>
        </article>
      ))}
      <div ref={endRef} />
    </div>
  )
}

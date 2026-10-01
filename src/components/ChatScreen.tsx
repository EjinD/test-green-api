import type { ChatMessage, ActiveChat } from '../types/chat'
import whatsappLogo from '../assets/whatsapp.svg'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

interface ChatScreenProps {
  chat: ActiveChat
  messages: ChatMessage[]
  connected: boolean
  onSend: (text: string) => Promise<void>
  onBack: () => void
  onLogout: () => void
  error: string | null
}

export function ChatScreen({ chat, messages, connected, onSend, onBack, onLogout, error }: ChatScreenProps) {
  return (
    <main className="chat-shell">
      <section className="chat-window">
        <header className="chat-header">
          <button className="icon-button" type="button" onClick={onBack} aria-label="Назад">
            ←
          </button>
          <img className="avatar avatar-main" src={whatsappLogo} alt="WhatsApp" />
          <div className="chat-heading">
            <strong>{formatPhone(chat.phone)}</strong>
            <span>
              <i className={`status-dot ${connected ? 'status-dot-online' : ''}`} />
              {connected ? 'получение сообщений активно' : 'соединение остановлено'}
            </span>
          </div>
          <button className="logout-button" type="button" onClick={onLogout}>
            Выйти
          </button>
        </header>

        {error ? <div className="error-banner">{error}</div> : null}

        <MessageList messages={messages} />
        <MessageInput disabled={!connected} onSend={onSend} />
      </section>
    </main>
  )
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 11 && digits.startsWith('7')) {
    return `+7 ${digits.slice(1, 4)} ${digits.slice(4, 7)}-${digits.slice(7, 9)}-${digits.slice(9)}`
  }
  if (digits.length === 12 && digits.startsWith('375')) {
    return `+375 ${digits.slice(3, 5)} ${digits.slice(5, 8)}-${digits.slice(8, 10)}-${digits.slice(10)}`
  }
  return digits ? `+${digits}` : phone
}

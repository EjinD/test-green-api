import { useCallback, useMemo, useState } from 'react'
import { AuthForm } from './components/AuthForm'
import { ChatScreen } from './components/ChatScreen'
import { NewChatForm } from './components/NewChatForm'
import { useNotifications } from './hooks/useNotifications'
import { createGreenApi, normalizeApiUrl, normalizePhone } from './services/greenApi'
import type { ActiveChat, ChatMessage } from './types/chat'
import type { GreenApiConfig } from './types/greenApi'
import './styles.css'
import whatsappLogo from './assets/whatsapp.svg'

const DEFAULT_API_URL = import.meta.env.VITE_GREEN_API_URL || 'https://api.green-api.com'

export default function App() {
  const [credentials, setCredentials] = useState<GreenApiConfig | null>(null)
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null)
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [authLoading, setAuthLoading] = useState(false)
  const [chatLoading, setChatLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const api = useMemo(() => (credentials ? createGreenApi(credentials) : null), [credentials])

  const handleIncomingMessage = useCallback((message: ChatMessage) => {
    setMessages((current) => {
      if (current.some((item) => item.id === message.id)) return current
      return [...current, message].sort((a, b) => a.timestamp - b.timestamp)
    })
  }, [])

  const handleNotificationError = useCallback((message: string) => {
    setError(message)
  }, [])

  const notifications = useNotifications({
    api,
    activeChatId: activeChat?.chatId ?? null,
    phoneChatId: activeChat?.phoneChatId ?? null,
    onMessage: handleIncomingMessage,
    onError: handleNotificationError,
  })

  const handleAuth = async (values: { apiUrl: string; idInstance: string; apiTokenInstance: string }) => {
    setError(null)
    setAuthLoading(true)

    const config: GreenApiConfig = {
      apiUrl: normalizeApiUrl(values.apiUrl),
      idInstance: values.idInstance.trim(),
      apiTokenInstance: values.apiTokenInstance.trim(),
    }

    try {
      const nextApi = createGreenApi(config)
      const state = await nextApi.getInstanceState()

      if (state.stateInstance !== 'authorized') {
        throw new Error(`Инстанс не авторизован. Текущее состояние: ${state.stateInstance}.`)
      }

      setCredentials(config)
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось подключиться к GREEN-API.')
    } finally {
      setAuthLoading(false)
    }
  }

  const handleCreateChat = async (rawPhone: string) => {
    if (!api) return

    setError(null)
    setChatLoading(true)

    try {
      const phone = normalizePhone(rawPhone)
      if (!/^\d{11,16}$/.test(phone)) {
        throw new Error('Введите номер WhatsApp в международном формате: от 11 до 16 цифр, например 79991234567.')
      }

      const response = await api.checkWhatsapp(Number(phone))
      if (!response.existsWhatsapp || !response.chatId) {
        throw new Error('На этом номере не найден аккаунт WhatsApp.')
      }

      setActiveChat({
        phone,
        chatId: response.chatId,
        phoneChatId: `${phone}@c.us`,
      })
      setMessages([])
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : 'Не удалось создать чат.')
    } finally {
      setChatLoading(false)
    }
  }

  const handleSend = async (text: string) => {
    if (!api || !activeChat) return

    setError(null)

    const optimisticId = `local-${Date.now()}-${Math.random().toString(16).slice(2)}`
    const optimisticMessage: ChatMessage = {
      id: optimisticId,
      text,
      direction: 'outgoing',
      timestamp: Date.now(),
      status: 'sending',
    }

    setMessages((current) => [...current, optimisticMessage])

    try {
      const response = await api.sendMessage(activeChat.chatId, text)
      setMessages((current) =>
        current.map((message) =>
          message.id === optimisticId
            ? { ...message, id: response.idMessage || optimisticId, status: 'sent' }
            : message,
        ),
      )
    } catch (requestError) {
      setMessages((current) => current.filter((message) => message.id !== optimisticId))
      throw requestError instanceof Error ? requestError : new Error('Не удалось отправить сообщение.')
    }
  }

  const handleLogout = () => {
    notifications.stop()
    setCredentials(null)
    setActiveChat(null)
    setMessages([])
    setError(null)
  }

  const handleBack = () => {
    notifications.stop()
    setActiveChat(null)
    setMessages([])
    setError(null)
  }

  if (!credentials) {
    return (
      <>
        {error ? <div className="global-toast global-toast-error">{error}</div> : null}
        <AuthForm defaultApiUrl={DEFAULT_API_URL} loading={authLoading} onSubmit={handleAuth} />
      </>
    )
  }

  if (!activeChat) {
    return (
      <main className="workspace-page">
        <header className="workspace-header">
          <div className="workspace-brand">
            <img className="brand-mark brand-mark-small" src={whatsappLogo} alt="WhatsApp" />
            <div>
              <strong>WhatsApp Chat</strong>
              <span>GREEN-API</span>
            </div>
          </div>
          <button className="logout-button" type="button" onClick={handleLogout}>
            Выйти
          </button>
        </header>
        <div className="workspace-content">
          <NewChatForm loading={chatLoading} onSubmit={(phone) => void handleCreateChat(phone)} />
          {error ? <div className="error-banner standalone-error">{error}</div> : null}
        </div>
      </main>
    )
  }

  return (
    <>
      <ChatScreen
        chat={activeChat}
        messages={messages}
        connected={notifications.isListening}
        onSend={handleSend}
        onBack={handleBack}
        onLogout={handleLogout}
        error={error}
      />
    </>
  )
}

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ChatMessage } from '../types/chat'
import type { IncomingNotification } from '../types/greenApi'

interface NotificationApi {
  receiveNotification: (receiveTimeout?: number) => Promise<{
    receiptId: number
    body: IncomingNotification
  } | null>
  deleteNotification: (receiptId: number) => Promise<{ result: boolean; reason?: string }>
}

interface UseNotificationsOptions {
  api: NotificationApi | null
  activeChatId: string | null
  phoneChatId: string | null
  onMessage: (message: ChatMessage) => void
  onError: (message: string) => void
}

export function useNotifications({ api, activeChatId, phoneChatId, onMessage, onError }: UseNotificationsOptions) {
  const [isListening, setIsListening] = useState(false)
  const stoppedRef = useRef(true)
  const apiRef = useRef(api)
  const chatIdRef = useRef(activeChatId)
  const phoneChatIdRef = useRef(phoneChatId)
  const onMessageRef = useRef(onMessage)
  const onErrorRef = useRef(onError)

  useEffect(() => {
    apiRef.current = api
    chatIdRef.current = activeChatId
    phoneChatIdRef.current = phoneChatId
    onMessageRef.current = onMessage
    onErrorRef.current = onError
  }, [api, activeChatId, phoneChatId, onMessage, onError])

  const start = useCallback(() => {
    stoppedRef.current = false
    setIsListening(true)
  }, [])

  const stop = useCallback(() => {
    stoppedRef.current = true
    setIsListening(false)
  }, [])


  useEffect(() => {
    if (!api || !activeChatId) {
      stop()
      return
    }

    start()

    const run = async () => {
      while (!stoppedRef.current && apiRef.current) {
        try {
          const notification = await apiRef.current.receiveNotification(5)


          if (stoppedRef.current) break
          if (!notification) continue



          const { receiptId, body } = notification
          const senderChatId = body.senderData?.chatId

    console.log("[CHAT CHECK]", {
    senderChatId,
    currentChatId: chatIdRef.current
})

          const isIncomingText =
            body.typeWebhook === 'incomingMessageReceived' &&
            body.messageData?.typeMessage === 'textMessage'

          const isCurrentChat =
            senderChatId === chatIdRef.current ||
            senderChatId === phoneChatIdRef.current

          if (isIncomingText && isCurrentChat) {
            const text = body.messageData?.textMessageData?.textMessage?.trim()
            if (text) {
              console.log("[USE NOTIFICATIONS] sending message to App", {
              text,
              senderChatId,
              activeChatId: chatIdRef.current
          })
              onMessageRef.current({
                id: body.idMessage ?? `incoming-${receiptId}`,
                text,
                direction: 'incoming',
                timestamp: body.timestamp ? body.timestamp * 1000 : Date.now(),
                status: 'sent',
              })
            }
          }

          await apiRef.current.deleteNotification(receiptId)
        } catch (error) {
          if (stoppedRef.current) break
          onErrorRef.current(error instanceof Error ? error.message : 'Ошибка получения уведомлений.')
          await new Promise((resolve) => setTimeout(resolve, 2500))
        }
      }
    }

    void run()

    return () => {
      stoppedRef.current = true
      setIsListening(false)
    }
  }, [api, activeChatId, phoneChatId, start, stop])

  return { isListening, stop, start }
}

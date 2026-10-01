export type MessageDirection = 'incoming' | 'outgoing'

export interface ChatMessage {
  id: string
  text: string
  direction: MessageDirection
  timestamp: number
  status?: 'sending' | 'sent'
}

export interface ActiveChat {
  phone: string
  chatId: string
  phoneChatId: string
}

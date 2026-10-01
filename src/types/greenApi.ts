export interface GreenApiConfig {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export interface CheckWhatsappResponse {
  existsWhatsapp: boolean
  chatId: string
  fromCache?: boolean
  status?: boolean
  reason?: string
}

export interface SendMessageResponse {
  idMessage: string
}

export interface ReceiveNotificationResponse {
  receiptId: number
  body: IncomingNotification
}

export interface IncomingNotification {
  typeWebhook: string
  timestamp?: number
  idMessage?: string
  senderData?: {
    chatId?: string
    chatName?: string
    sender?: string
    senderName?: string
    senderContactName?: string
    senderPhoneNumber?: number
  }
  messageData?: {
    typeMessage?: string
    textMessageData?: {
      textMessage?: string
    }
    extendedTextMessageData?: {
      text?: string
    }
    quotedMessage?: {
      textMessage?: string
    }
  }
}

export interface InstanceStateResponse {
  stateInstance: string
}

export interface AccountSettingsResponse {
  stateInstance?: string
  phone?: string
  avatar?: string
}

import type {
  InstanceStateResponse,
  CheckWhatsappResponse,
  GreenApiConfig,
  ReceiveNotificationResponse,
  SendMessageResponse,
} from '../types/greenApi'

const DEFAULT_API_URL = 'https://api.green-api.com'

function normalizeBaseUrl(value?: string): string {
  const url = (value?.trim() || DEFAULT_API_URL).replace(/\/$/, '')
  return url
}

export function createGreenApi(config: GreenApiConfig) {
  const baseUrl = normalizeBaseUrl(config.apiUrl)
  const prefix = `${baseUrl}/waInstance${encodeURIComponent(config.idInstance)}`
  const authSuffix = `/${encodeURIComponent(config.apiTokenInstance)}`

  async function request<T>(path: string, init?: RequestInit): Promise<T> {
    let response: Response

    try {
      response = await fetch(`${prefix}${path}${authSuffix}`, {
        ...init,
        headers: {
          Accept: 'application/json',
          ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
          ...init?.headers,
        },
      })
    } catch {
      throw new Error('Не удалось подключиться к GREEN-API. Проверьте API URL, сеть или инстанс.')
    }

    const text = await response.text()
    let data: unknown = undefined

    if (text) {
      try {
        data = JSON.parse(text)
      } catch {
        data = text
      }
    }

    if (!response.ok) {
      const reason = getApiError(data) || `HTTP ${response.status}`
      throw new Error(reason)
    }

    return data as T
  }

  return {
    async getInstanceState(): Promise<InstanceStateResponse> {
      return request<InstanceStateResponse>('/getStateInstance', { method: 'GET' })
    },


    async checkWhatsapp(phoneNumber: number): Promise<CheckWhatsappResponse> {
      return request<CheckWhatsappResponse>('/checkWhatsapp', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber }),
      })
    },

    async sendMessage(chatId: string, message: string): Promise<SendMessageResponse> {
      return request<SendMessageResponse>('/sendMessage', {
        method: 'POST',
        body: JSON.stringify({ chatId, message }),
      })
    },

    async receiveNotification(receiveTimeout = 5): Promise<ReceiveNotificationResponse | null> {
      let response: Response

      try {
        response = await fetch(
          `${prefix}/receiveNotification${authSuffix}?receiveTimeout=${receiveTimeout}`,
          { method: 'GET', headers: { Accept: 'application/json' } },
        )
      } catch {
        throw new Error('Соединение с GREEN-API прервано во время получения сообщения.')
      }

      if (!response.ok) {
        const text = await response.text()
        let data: unknown = text
        try {
          data = JSON.parse(text)
        } catch {
        }
        throw new Error(getApiError(data) || `HTTP ${response.status}`)
      }

      const text = await response.text()
      if (!text) return null

      try {
        const data = JSON.parse(text) as Partial<ReceiveNotificationResponse>
        if (!data.receiptId || !data.body) return null
        return data as ReceiveNotificationResponse
      } catch {
        return null
      }
    },

    async deleteNotification(receiptId: number): Promise<{ result: boolean; reason?: string }> {
      const url = `${prefix}/deleteNotification${authSuffix}/${encodeURIComponent(String(receiptId))}`
      let response: Response

      try {
        response = await fetch(url, {
          method: 'DELETE',
          headers: { Accept: 'application/json' },
        })
      } catch {
        throw new Error('Не удалось удалить уведомление GREEN-API.')
      }

      const text = await response.text()
      let data: unknown = undefined

      if (text) {
        try {
          data = JSON.parse(text)
        } catch {
          data = text
        }
      }

      if (!response.ok) {
        throw new Error(getApiError(data) || `HTTP ${response.status}`)
      }

      return data as { result: boolean; reason?: string }
    },
  }
}

function getApiError(data: unknown): string | null {
  if (!data) return null
  if (typeof data === 'string') return data || null
  if (typeof data !== 'object') return null

  const record = data as Record<string, unknown>
  const candidates = [record.message, record.reason, record.error, record.errorMessage]
  const value = candidates.find((item): item is string => typeof item === 'string' && item.length > 0)
  return value ?? null
}

export function normalizeApiUrl(value: string): string {
  return normalizeBaseUrl(value)
}

export function normalizePhone(input: string): string {
  const trimmed = input.trim()
  const digits = trimmed.replace(/\D/g, '')

  if (digits.length === 10 && digits.startsWith('9')) {
    return `7${digits}`
  }

  return digits
}

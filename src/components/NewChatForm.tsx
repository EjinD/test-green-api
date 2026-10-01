import { useState } from 'react'

interface NewChatFormProps {
  loading: boolean
  onSubmit: (phone: string) => void
}

export function NewChatForm({ loading, onSubmit }: NewChatFormProps) {
  const [phone, setPhone] = useState('')

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit(phone)
  }

  return (
    <section className="chat-card new-chat-card">
      <div className="chat-card-icon">+</div>
      <p className="eyebrow">НОВЫЙ ЧАТ</p>
      <h2>Начать переписку</h2>
      <p className="muted-text">
        Укажите номер получателя в международном формате. Приложение проверит наличие аккаунта WhatsApp и получит chatId.
      </p>
      <form onSubmit={handleSubmit} className="new-chat-form">
        <input
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
          placeholder="+7 999 123-45-67"
          inputMode="tel"
          autoComplete="tel"
          required
        />
        <button className="primary-button" type="submit" disabled={loading}>
          {loading ? 'Проверка…' : 'Открыть чат'}
        </button>
      </form>
    </section>
  )
}

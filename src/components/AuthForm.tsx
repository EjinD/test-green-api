import { useState } from 'react'
import whatsappLogo from '../assets/whatsapp.svg'

interface AuthFormProps {
  defaultApiUrl: string
  loading: boolean
  onSubmit: (values: { apiUrl: string; idInstance: string; apiTokenInstance: string }) => void
}

export function AuthForm({ defaultApiUrl, loading, onSubmit }: AuthFormProps) {
  const [apiUrl, setApiUrl] = useState(defaultApiUrl)
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [showAdvanced, setShowAdvanced] = useState(false)

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    onSubmit({ apiUrl, idInstance, apiTokenInstance })
  }

  return (
    <main className="auth-page">
      <section className="auth-card">
        <img className="brand-mark" src={whatsappLogo} alt="WhatsApp" />
        <p className="eyebrow">GREEN-API · WHATSAPP</p>
        <h1>WhatsApp Chat</h1>
        <p className="auth-description">
          Введите данные инстанса GREEN-API, чтобы отправлять и получать текстовые сообщения WhatsApp.
        </p>

        <form onSubmit={handleSubmit} className="form-stack">
          <label className="field">
            <span>Instance ID</span>
            <input
              value={idInstance}
              onChange={(event) => setIdInstance(event.target.value)}
              placeholder="3100000000"
              autoComplete="off"
              required
              inputMode="numeric"
            />
          </label>

          <label className="field">
            <span>API Token Instance</span>
            <input
              type="password"
              value={apiTokenInstance}
              onChange={(event) => setApiTokenInstance(event.target.value)}
              placeholder="Введите токен"
              autoComplete="off"
              required
            />
          </label>

          <button
            type="button"
            className="link-button"
            onClick={() => setShowAdvanced((current) => !current)}
          >
            {showAdvanced ? 'Скрыть дополнительные настройки' : 'Дополнительные настройки'}
          </button>

          {showAdvanced && (
            <label className="field">
              <span>API URL</span>
              <input
                value={apiUrl}
                onChange={(event) => setApiUrl(event.target.value)}
                placeholder="https://api.green-api.com"
                autoComplete="off"
              />
            </label>
          )}

          <button className="primary-button" type="submit" disabled={loading}>
            {loading ? <span className="button-spinner" /> : null}
            {loading ? 'Подключение…' : 'Войти'}
          </button>
        </form>

        <p className="security-note">
          Токен используется только в браузере для запросов к GREEN-API и не отправляется на сторонний сервер приложения.
        </p>
      </section>
    </main>
  )
}

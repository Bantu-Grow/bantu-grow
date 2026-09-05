import { beforeEach, describe, expect, it, vi } from 'vitest'

const { exec, run, all, sendMail } = vi.hoisted(() => ({ exec: vi.fn(), run: vi.fn(), all: vi.fn(), sendMail: vi.fn() }))
vi.mock('server-only', () => ({}))
vi.mock('@/lib/db', () => ({ getDb: vi.fn(async () => ({ exec, run, all })) }))
vi.mock('nodemailer', () => ({ default: { createTransport: vi.fn(() => ({ sendMail })) } }))

import { sendEmail } from '../send'

describe('sendEmail', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    all.mockResolvedValue([
      { name: 'id' }, { name: 'kind' }, { name: 'recipient' }, { name: 'subject' },
      { name: 'reference_id' }, { name: 'status' }, { name: 'provider_message_id' },
      { name: 'error_message' }, { name: 'attempts' }, { name: 'text_body' },
      { name: 'html_body' }, { name: 'created_at' }, { name: 'sent_at' },
    ])
    Object.assign(process.env, { SMTP_HOST: 'smtp.example.com', SMTP_USER: 'user', SMTP_PASSWORD: 'pass', EMAIL_FROM: 'BantuGrow <mail@example.com>' })
  })

  it('sends and records successful delivery', async () => {
    sendMail.mockResolvedValue({ messageId: 'message-1' })
    await expect(sendEmail({ to: 'a@example.com', subject: 'Hi', text: 'Hi', html: '<p>Hi</p>', kind: 'invoice' })).resolves.toMatchObject({ status: 'sent', messageId: 'message-1' })
    expect(exec).toHaveBeenCalledOnce()
    expect(run).toHaveBeenCalledTimes(2)
  })

  it('records delivery failure and rethrows', async () => {
    sendMail.mockRejectedValue(new Error('SMTP unavailable'))
    await expect(sendEmail({ to: 'a@example.com', subject: 'Hi', text: 'Hi', html: '<p>Hi</p>', kind: 'invoice' })).rejects.toThrow('SMTP unavailable')
    expect(run).toHaveBeenCalledTimes(2)
    expect(run.mock.calls[1]).toContainEqual(['failed', 'SMTP unavailable', expect.any(String)])
  })
})

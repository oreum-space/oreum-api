import { Types } from 'mongoose'
import { createTransport } from 'nodemailer'

if (!process.env.SMTP_HOST) throw new Error('SMTP_HOST required!')
if (!process.env.SMTP_PORT) throw new Error('SMTP_PORT required!')
if (!process.env.SMTP_USER) throw new Error('SMTP_USER required!')
if (!process.env.SMTP_PASS) throw new Error('SMTP_PASS required!')

export default class MailService {
  static transporter = createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  } as any)

  static async sendActivation (to: string, id: Types.ObjectId, confirmation: string) {
    const href = `https://account.oreum.space/activate/${ id }/${ confirmation }`
    await this.transporter.sendMail({
      from: process.env.SMTP_HOST,
      to,
      subject: 'Активация аккаунта на Oreum Space',
      text: '',
      html: `
<div>
<h1>Для активации перейдите по ссылке</h1>
<a href="${ href }">${ href }</a>
</div>
`
    })
  }
}
'use server'

import { sendBusinessEmail } from '@/backend/notifications'

export type ContactFormState = {
  status: 'idle' | 'success' | 'error'
  message?: string
  fieldErrors?: Record<string, string>
}

const SUBJECTS = ['General Inquiry', 'Order Issue', 'Complaint', 'Product Question', 'Other'] as const

function isValidEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export async function submitContactForm(
  _previousState: ContactFormState,
  formData: FormData,
): Promise<ContactFormState> {
  const name = String(formData.get('name') ?? '').trim()
  const email = String(formData.get('email') ?? '').trim()
  const phone = String(formData.get('phone') ?? '').trim()
  const subject = String(formData.get('subject') ?? '').trim()
  const message = String(formData.get('message') ?? '').trim()
  const website = String(formData.get('website') ?? '').trim()

  if (website) return { status: 'success', message: 'Thanks, your message has been received.' }

  const fieldErrors: Record<string, string> = {}
  if (!name) fieldErrors.name = 'Please enter your name.'
  if (!email) fieldErrors.email = 'Please enter your email address.'
  else if (!isValidEmail(email)) fieldErrors.email = 'Please enter a valid email address.'
  if (!SUBJECTS.includes(subject as (typeof SUBJECTS)[number])) fieldErrors.subject = 'Please choose a reason.'
  if (!message) fieldErrors.message = 'Please enter a message.'

  if (Object.keys(fieldErrors).length) return { status: 'error', fieldErrors }

  const body = [
    `Name: ${name}`,
    `Email: ${email}`,
    phone ? `Phone: ${phone}` : null,
    `Reason: ${subject}`,
    '',
    message,
  ].filter(Boolean).join('\n')

  await sendBusinessEmail(`Eloria contact: ${subject}`, body)
  return { status: 'success', message: 'Thanks, your message has been received. We will get back to you soon.' }
}

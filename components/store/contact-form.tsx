'use client'

import { useActionState, useEffect, useRef, useState } from 'react'
import { submitContactForm, type ContactFormState } from '@/app/actions/contact'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

const initialState: ContactFormState = { status: 'idle' }
const subjects = ['General Inquiry', 'Order Issue', 'Complaint', 'Product Question', 'Other']

export function ContactForm() {
  const [state, formAction, pending] = useActionState(submitContactForm, initialState)
  const formRef = useRef<HTMLFormElement>(null)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    if (state.status === 'success') {
      setSubmitted(true)
      formRef.current?.reset()
      toast.success('Message received')
    }
  }, [state])

  if (submitted) {
    return (
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-6 text-center sm:p-8">
        <h3 className="font-serif text-2xl text-foreground">Thank you for reaching out</h3>
        <p className="mx-auto mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
          We&apos;ve received your message and will get back to you as soon as possible.
        </p>
        <Button type="button" variant="outline" className="mt-6" onClick={() => setSubmitted(false)}>
          Send another message
        </Button>
      </div>
    )
  }

  return (
    <form ref={formRef} action={formAction} className="flex flex-col gap-5 rounded-xl border border-border bg-card p-6 sm:p-8">
      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-name">Full name</Label>
          <Input id="contact-name" name="name" autoComplete="name" aria-invalid={!!state.fieldErrors?.name} />
          {state.fieldErrors?.name && <p className="text-xs text-destructive">{state.fieldErrors.name}</p>}
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-email">Email address</Label>
          <Input id="contact-email" name="email" type="email" autoComplete="email" aria-invalid={!!state.fieldErrors?.email} />
          {state.fieldErrors?.email && <p className="text-xs text-destructive">{state.fieldErrors.email}</p>}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-phone">Phone number <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input id="contact-phone" name="phone" type="tel" autoComplete="tel" />
        </div>
        <div className="flex flex-col gap-2">
          <Label htmlFor="contact-subject">Reason for contact</Label>
          <select id="contact-subject" name="subject" defaultValue="" aria-invalid={!!state.fieldErrors?.subject} className="h-10 rounded-md border border-input bg-background px-3 text-sm text-foreground outline-none focus:ring-2 focus:ring-ring">
            <option value="" disabled>Select a reason</option>
            {subjects.map((subject) => <option key={subject} value={subject}>{subject}</option>)}
          </select>
          {state.fieldErrors?.subject && <p className="text-xs text-destructive">{state.fieldErrors.subject}</p>}
        </div>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="contact-message">Message</Label>
        <Textarea id="contact-message" name="message" rows={6} aria-invalid={!!state.fieldErrors?.message} />
        {state.fieldErrors?.message && <p className="text-xs text-destructive">{state.fieldErrors.message}</p>}
      </div>

      <input name="website" tabIndex={-1} autoComplete="off" className="sr-only" aria-hidden="true" />
      {state.status === 'error' && !state.fieldErrors && <p role="alert" className="text-sm text-destructive">{state.message ?? 'Something went wrong. Please try again.'}</p>}
      <Button type="submit" disabled={pending} className="w-full sm:w-fit">
        {pending ? 'Sending…' : 'Send message'}
      </Button>
    </form>
  )
}

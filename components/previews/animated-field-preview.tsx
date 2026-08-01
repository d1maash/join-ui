"use client"

import * as React from "react"
import { AtSign, User } from "lucide-react"

import { AnimatedField } from "@/registry/components/animated-field"

export default function AnimatedFieldPreview() {
  const [email, setEmail] = React.useState("")
  const [name, setName] = React.useState("Dana Whitfield")

  const touched = email.length > 0
  const valid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <AnimatedField
        label="Work email"
        type="email"
        icon={<AtSign />}
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="you@company.com"
        error={touched && !valid ? "Enter a valid email address." : undefined}
        success={valid ? "Looks good." : undefined}
        description={!touched ? "Only used for deploy notifications." : undefined}
      />

      <AnimatedField
        label="Display name"
        icon={<User />}
        value={name}
        onChange={(event) => setName(event.target.value)}
        maxLength={32}
        showCounter
      />

      <AnimatedField label="Disabled field" defaultValue="Read only" disabled />
    </div>
  )
}

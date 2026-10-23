"use client";

import { useActionState } from "react";
import { buttonPrimary, inputClass, labelClass } from "@/components/ui";
import { signIn, type LoginState } from "./actions";

export function LoginForm() {
  const [state, action, pending] = useActionState<LoginState, FormData>(signIn, {});

  return (
    <form action={action} className="space-y-5">
      {state.error && (
        <p className="rounded-md border border-danger/30 bg-danger-50 p-3 text-danger" role="alert">
          {state.error}
        </p>
      )}
      <div>
        <label htmlFor="email" className={labelClass}>
          الإيميل
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="username"
          dir="ltr"
          defaultValue={state.email}
          className={`${inputClass} text-right`}
          required
        />
      </div>
      <div>
        <label htmlFor="password" className={labelClass}>
          كلمة السر
        </label>
        <input
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          dir="ltr"
          className={`${inputClass} text-right`}
          required
        />
      </div>
      <button type="submit" disabled={pending} className={`${buttonPrimary} w-full`}>
        {pending ? "جاري الدخول..." : "دخول"}
      </button>
    </form>
  );
}

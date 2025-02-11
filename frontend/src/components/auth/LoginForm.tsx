import React from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useNavigate, useLocation } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FormField } from "@/components/FormField"
import { useToast } from "@/hooks/useToast"
import { useAuth } from "@/hooks/useAuth"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

type LoginForm = z.infer<typeof loginSchema>

export function LoginForm() {
  const navigate = useNavigate()
  const location = useLocation()
  const { addToast } = useToast()
  const { login } = useAuth()
  const from = (location.state as any)?.from?.pathname || "/dashboard"

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    try {
      await login(data)
      addToast("success", "Welcome back!", "You have successfully logged in")
      navigate(from, { replace: true })
    } catch (error) {
      addToast(
        "error",
        "Login failed",
        error instanceof Error ? error.message : "Please check your credentials and try again"
      )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <FormField
        label="Email"
        error={errors.email?.message}
        htmlFor="email"
      >
        <Input
          id="email"
          type="email"
          {...register("email")}
          className={errors.email ? "border-red-500" : ""}
          placeholder="Enter your email"
        />
      </FormField>

      <FormField
        label="Password"
        error={errors.password?.message}
        htmlFor="password"
      >
        <Input
          id="password"
          type="password"
          {...register("password")}
          className={errors.password ? "border-red-500" : ""}
          placeholder="Enter your password"
        />
      </FormField>

      <Button
        type="submit"
        className="w-full"
        disabled={isSubmitting}
      >
        {isSubmitting ? "Signing in..." : "Sign in"}
      </Button>
    </form>
  )
}

export default LoginForm 
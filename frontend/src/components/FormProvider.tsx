import React, { createContext, useContext, useReducer } from "react"

interface FormState {
  currentStep: number
  formData: Record<string, any>
  isValid: boolean
  isSubmitting: boolean
}

type FormAction =
  | { type: "SET_STEP"; payload: number }
  | { type: "UPDATE_DATA"; payload: Record<string, any> }
  | { type: "SET_VALID"; payload: boolean }
  | { type: "SET_SUBMITTING"; payload: boolean }

const FormContext = createContext<{
  state: FormState
  dispatch: React.Dispatch<FormAction>
} | null>(null)

const initialState: FormState = {
  currentStep: 1,
  formData: {},
  isValid: false,
  isSubmitting: false,
}

function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case "SET_STEP":
      return { ...state, currentStep: action.payload }
    case "UPDATE_DATA":
      return { ...state, formData: { ...state.formData, ...action.payload } }
    case "SET_VALID":
      return { ...state, isValid: action.payload }
    case "SET_SUBMITTING":
      return { ...state, isSubmitting: action.payload }
    default:
      return state
  }
}

export function FormProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(formReducer, initialState)

  return (
    <FormContext.Provider value={{ state, dispatch }}>
      {children}
    </FormContext.Provider>
  )
}

export function useForm() {
  const context = useContext(FormContext)
  if (!context) {
    throw new Error("useForm must be used within a FormProvider")
  }
  return context
} 
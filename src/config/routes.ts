/**
 * Centralized routing configuration for authentication flow
 * Provides type-safe route management
 */

export const AUTH_ROUTES = {
  // Landing page
  home: "/",

  // Individual (Individu) routes - WhatsApp based
  individu: {
    login: "/auth/individu/login",
    register: "/auth/individu/register",
  },

  // Institution (Lembaga) routes - Email based
  institution: {
    login: "/auth/institution/login",
    register: "/auth/institution/register",
  },

  // Shared routes
  activate: "/auth/activate",
  completeProfile: "/auth/complete-profile",
  forgotPassword: "/auth/forgot-password",

  // Protected routes
  dashboard: "/dashboard",
} as const

export type UserType = "individu" | "institution"
export type AuthAction = "login" | "register"

/**
 * Get authentication route based on user type and action
 */
export const getAuthRoute = (action: AuthAction, userType: UserType): string => {
  return AUTH_ROUTES[userType][action]
}

/**
 * Check if current route is auth route
 */
export const isAuthRoute = (pathname: string): boolean => {
  return pathname.startsWith("/auth/")
}
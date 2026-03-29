const ACCESS_TOKEN_KEY = 'auth_token'

export const setToken = (token: string): void => {
  localStorage.setItem(ACCESS_TOKEN_KEY, token)
}

export const getToken = (): string | null => localStorage.getItem(ACCESS_TOKEN_KEY)

export const removeToken = (): void => {
  localStorage.removeItem(ACCESS_TOKEN_KEY)
}

export const clearAuthTokens = (): void => {
  removeToken()
}

export const isLoggedIn = (): boolean => !!getToken()

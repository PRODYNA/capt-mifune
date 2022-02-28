import UserService from '../auth/UserService'
import { ENV } from '../env/Environments'
import { Configuration } from '../services'

const AXIOS_CONFIG = (): Configuration => {
  const basePath = 'http://localhost:8081'
  const apiKey = undefined
  const username = undefined
  const password = undefined
  const accessToken = UserService.isLoggedIn()
    ? UserService.getToken()
    : undefined
  const baseOptions = {
    headers: {
      Authorization: UserService.isLoggedIn()
        ? `Bearer ${UserService.getToken()}`
        : undefined,
    },
    baseURL: localStorage.getItem(ENV.API_SERVER) ?? undefined,
    timeout: 25000,
  }

  return new Configuration({
    apiKey,
    username,
    password,
    accessToken,
    basePath,
    baseOptions,
  })
}

export default AXIOS_CONFIG

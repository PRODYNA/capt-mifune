import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import UserService from './UserService'
import { ENV } from '../env/Environments'

const axiosInstance = axios.create({
  baseURL: localStorage.getItem(ENV.API_SERVER) ?? undefined,
  timeout: 25000,
})

const configure = (): void => {
  axiosInstance.interceptors.request.use((config: AxiosRequestConfig) => {
    if (UserService.isLoggedIn()) {
      const successCallback = (): Promise<AxiosRequestConfig> => {
        // eslint-disable-next-line no-param-reassign
        config.headers.Authorization = `Bearer ${UserService.getToken()}`
        return Promise.resolve(config)
      }
      UserService.updateToken(successCallback)
      return config
    }
    return config
  })
}

const getAxiosClient = (): AxiosInstance => axiosInstance

const HttpService = {
  configure,
  getAxiosClient,
}

export default HttpService

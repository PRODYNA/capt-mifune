import { useOidcAccessToken } from '@axa-fr/react-oidc-context'
import { Configuration } from '../services'
import API_BASE_PATH from './api-base-path'

function useHeader(): any {
  if (window.env.oidc.disabled) {
    return {}
  }
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { accessToken } = useOidcAccessToken()
  return {
    headers: {
      Authorization: `Bearer ${accessToken ?? undefined}`,
    },
  }
}

const AXIOS_CONFIG = (): Configuration => {
  const baseOptions = useHeader()

  const basePath = API_BASE_PATH
  const apiKey = undefined
  const username = undefined
  const password = undefined

  return new Configuration({
    apiKey,
    username,
    password,
    basePath,
    baseOptions,
  })
}

export default AXIOS_CONFIG

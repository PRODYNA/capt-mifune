declare global {
  interface Window {
    env: {
      api: {
        basePath: string
        apiBasePath: string
      }
      oidc: {
        disabled: boolean
        provider: {
          authority: string
          clientId: string
          redirectUri: string
          silentRedirectUri: string
          scope: string
          responseType: string
          responseMode: string
        }
      }
    }
  }
}

const { basePath: apiBasePath } = window.env.api
const { REACT_APP_API_URL, NODE_ENV } = process.env

const API_BASE_PATH =
  NODE_ENV === 'development' && REACT_APP_API_URL
    ? REACT_APP_API_URL
    : apiBasePath

export default API_BASE_PATH

import { AxiosRequestConfig } from 'axios'
import Keycloak from 'keycloak-js'

const kc = new (Keycloak as any)('keycloak.json')

/**
 * Initializes Keycloak instance and calls the provided callback function if successfully authenticated.
 *
 * @param onAuthenticatedCallback
 */
const initKeycloak = (onAuthenticatedCallback: () => void): void => {
  kc.init({
    onLoad: 'login-required',
  }).then(() => {
    onAuthenticatedCallback()
  })
}

const doLogin = kc.login

const doLogout = kc.logout

const getToken = (): string => kc.token

const isLoggedIn = (): boolean => !!kc.token

const updateToken = (
  successCallback: () => Promise<AxiosRequestConfig>
): void => kc.updateToken(5).then(successCallback).catch(doLogin)

const loginRequired = (): boolean =>
  // Strings should be normalized to uppercase.
  // A small group of characters, when they are converted to lowercase, cannot make a round trip.
  localStorage.getItem('LOGIN_REQUIRED')?.toUpperCase() === 'TRUE'

const UserService = {
  initKeycloak,
  doLogin,
  doLogout,
  isLoggedIn,
  getToken,
  updateToken,
  loginRequired,
}

export default UserService

import { AxiosRequestConfig } from 'axios'
import Keycloak from 'keycloak-js'

const _kc = new (Keycloak as any)('keycloak.json')

/**
 * Initializes Keycloak instance and calls the provided callback function if successfully authenticated.
 *
 * @param onAuthenticatedCallback
 */
const initKeycloak = (onAuthenticatedCallback: () => void) => {
  _kc
    .init({
      onLoad: 'login-required',
    })
    .then(() => {
      onAuthenticatedCallback()
    })
}

const doLogin = _kc.login

const doLogout = _kc.logout

const getToken = () => _kc.token

const isLoggedIn = () => !!_kc.token

const updateToken = (successCallback: () => Promise<AxiosRequestConfig>) =>
  _kc.updateToken(5).then(successCallback).catch(doLogin)

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

import { AxiosRequestConfig } from "axios";
import Keycloak from "keycloak-js";

const _kc = new (Keycloak as any)("/keycloak.json");

/**
 * Initializes Keycloak instance and calls the provided callback function if successfully authenticated.
 *
 * @param onAuthenticatedCallback
 */
const initKeycloak = (onAuthenticatedCallback: () => void) => {
  _kc
    .init({
      onLoad: "login-required",
    })
    .then(() => {
      onAuthenticatedCallback();
    });
};

const doLogin = _kc.login;

const doLogout = _kc.logout;

const getToken = () => _kc.token;

const isLoggedIn = () => !!_kc.token;

const updateToken = (successCallback: () => Promise<AxiosRequestConfig>) =>
  _kc.updateToken(5).then(successCallback).catch(doLogin);

const UserService = {
  initKeycloak,
  doLogin,
  doLogout,
  isLoggedIn,
  getToken,
  updateToken,
};

export default UserService;

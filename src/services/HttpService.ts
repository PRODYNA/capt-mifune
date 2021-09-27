import axios, { AxiosRequestConfig } from "axios";
import UserService from "./UserService";
import { ENV } from "../env/Environments";

const _axios = axios.create({
  baseURL: localStorage.getItem(ENV.API_SERVER) ?? undefined,
  timeout: 25000,
});

const configure = () => {
  _axios.interceptors.request.use((config: AxiosRequestConfig) => {
    if (UserService.isLoggedIn()) {
      const successCallback = (): Promise<AxiosRequestConfig> => {
        config.headers.Authorization = `Bearer ${UserService.getToken()}`;
        return Promise.resolve(config);
      };
      return UserService.updateToken(successCallback);
    }
  });
};

const getAxiosClient = () => _axios;

const HttpService = {
  configure,
  getAxiosClient,
};

export default HttpService;

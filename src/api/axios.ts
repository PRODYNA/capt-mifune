import axios from "axios";
import {ENV} from "../env/Environments";

export const rest = axios.create({
  baseURL: localStorage.getItem(ENV.API_SERVER) ?? undefined,
  timeout: 25000,

});

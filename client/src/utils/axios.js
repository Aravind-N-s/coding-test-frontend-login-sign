import Axios from "axios";

import { AUTH_SERVICES } from "./enum.js";

const authAxios = Axios.create({
  baseURL: AUTH_SERVICES,
  // baseURL:'/'
});

export { authAxios };

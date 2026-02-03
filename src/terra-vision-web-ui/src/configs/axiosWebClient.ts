import axios from "axios";
import {API_DOMAIN} from "./settings.ts";

export const axiosWebClient = axios.create({baseURL: API_DOMAIN})
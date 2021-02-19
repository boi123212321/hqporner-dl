import Axios, { AxiosRequestConfig } from "axios";
import cheerio from "cheerio";

export async function domFromUrl(url: string, config?: AxiosRequestConfig) {
  console.error(`Getting ${url}`);
  const { data } = await Axios.get(url, config);
  return cheerio.load(data);
}

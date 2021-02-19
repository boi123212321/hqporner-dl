import Axios from "axios";
import { domFromUrl } from "../util";
import { IVideoScraper } from "./index";
import argv from "../args";

const cookieJar: Record<string, string> = {};

export class PorntrexScraper implements IVideoScraper {
  url = "porntrex.com";

  async signin() {
    const username = process.env.PORNTREX_USERNAME!;
    console.error(`Signing in using ${username}`);
    const params = new URLSearchParams();
    params.append("username", username);
    params.append("pass", process.env.PORNTREX_PASSWORD!);
    params.append("remember_me", "1");
    params.append("action", "login");
    params.append("email_link", "https://www.porntrex.com/email/");
    params.append("format", "json");
    params.append("mode", "async");
    const res = await Axios.post(
      "https://www.porntrex.com/ajax-login/",
      params,
      {
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
      }
    );
    for (const cookie of res.headers["set-cookie"]) {
      const first = cookie.split(";")[0].trim() as string;
      const [key, value] = first.split("=");
      console.log(`Storing cookie ${key}=${value}`);
      cookieJar[key] = value;
    }
    return res;
  }

  async scrapeUrl(url: string) {
    if (!cookieJar.PHPSESSID) {
      await this.signin();
    }

    const $ = await domFromUrl(url, {
      headers: {
        Cookie: `PHPSESSID=${cookieJar.PHPSESSID}; kt_member=${cookieJar.kt_member}`,
      },
    });

    const downloadButtons = $(".download ul li a").toArray();

    const downloadUrls = downloadButtons
      .map((btn) => $(btn).attr("href"))
      .filter(Boolean) as string[];

    const fileUrl = downloadUrls.find((url) =>
      url.includes(`${argv.quality}p`)
    );

    if (!fileUrl) {
      throw new Error(`Quality ${argv.quality}p not found for ${url}`);
    }

    const urlSegments = url.split("/").filter(Boolean);
    urlSegments.pop();
    const id = urlSegments.pop()!;

    const res = await Axios.head(fileUrl);
    const size = parseInt(res.headers["content-length"]);

    return {
      id,
      name: $("title").text(),
      size,
      fileUrl,
    };
  }
}

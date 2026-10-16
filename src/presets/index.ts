import { baiduApple } from "./baidu-apple";
import { baiduSearchColumns } from "./baidu-search-columns";
import { geminiWide } from "./gemini-wide";
import { googleApple } from "./google-apple";
import { googleSearchColumns } from "./google-search-columns";
import { hackerNewsApple } from "./hacker-news-apple";
import type { Preset } from "./types";
import { wikipediaApple } from "./wikipedia-apple";

export const presets: Preset[] = [googleSearchColumns, googleApple, geminiWide, hackerNewsApple, wikipediaApple, baiduSearchColumns, baiduApple];

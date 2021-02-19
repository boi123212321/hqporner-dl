export interface IVideoScraper {
  url: string;

  scrapeUrl(
    url: string
  ): Promise<{
    id: string;
    name: string;
    fileUrl: string;
    size: number;
  }>;
}

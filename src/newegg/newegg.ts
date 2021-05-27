import * as cheerio from 'cheerio';
import got from 'got/dist/source';

export interface LotteryData {
  LotteryID: string;
  LotteryStartDate: Date;
  LotteryEndDate: Date;
  LotteryDrawDate: Date;
  SellingStartDate: Date;
  SellingEndDate: Date;
  DrawInterval: number;
  LotteryItems: Array<{
    Tag: string;
    ParentItem: {
      ItemNumber: string;
      ImageName: string;
      Title: string;
      FinalPrice: number;
    },
    ChildItem: Array<{
      ItemNumber: string;
      ItemType: string;
      ImageName: string;
      Title: string;
      FinalPrice: number;
      PCode: string;
      PCodeAmount: number;
    }>;
  }>;
}

/**
 * Get the data on the most recent NewEgg shuffle
 * @returns The data on the most recent NewEgg shuffle
 */
export const shuffle = async (): Promise<LotteryData> => {
  const response = await got('https://www.newegg.com/product-shuffle');
  const $ = cheerio.load(response.body, { xmlMode: true });

  const scripts: any = $('script:not([src])').filter((index, element: any): boolean => element.children.some((child: any) => child.data && child.data.includes('LotteryStartDate')))
  const initialState = scripts[0].children[0].data;

  const match = initialState.match(/\{.*\}/);
  const { lotteryData } = JSON.parse(match[0]);
  lotteryData.LotteryStartDate = new Date(lotteryData.LotteryStartDate);
  if (lotteryData.LotteryEndDate) {
    lotteryData.LotteryEndDate = new Date(lotteryData.LotteryEndDate);
  }
  if (lotteryData.LotteryDrawDate) {
    lotteryData.LotteryDrawDate = new Date(lotteryData.LotteryDrawDate);
  }
  if (lotteryData.SellingStartDate) {
    lotteryData.SellingStartDate = new Date(lotteryData.SellingStartDate);
  }
  if (lotteryData.SellingEndDate) {
    lotteryData.SellingEndDate = new Date(lotteryData.SellingEndDate);
  }
  return lotteryData as LotteryData;
};

// src/tools/finance/split/config/split-config.ts

export interface SplitConfig {
  readonly appName: string;
  readonly authorName: string;
  readonly url: string;
}

export const split: SplitConfig = {
  appName: 'Toolkit',
  authorName: 'Pabitra Mohan Singh',
  url: 'toolkit.pabitramohansingh.com/bill-splitter',
};
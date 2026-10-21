// src/config/site.ts

export interface SiteDetails {
  readonly name: string;
  readonly author: string;
  readonly title: string;
  readonly description: string;
  readonly domain: string;
  readonly jobTitle: string;
  readonly locale: string;
  readonly openGraphImage: string;
}

export interface SocialMediaLinks {
  readonly github: string;
  readonly linkedin: string;
  readonly x: string;
  readonly youtube: string;
  readonly instagram: string;
}

export interface SponsorLinksConfig {
  readonly page: string;
  readonly buyMeACoffee: string;
}

export const site: SiteDetails = {
  name: 'Toolkit',
  author: 'Pabitra Mohan Singh',
  title: 'Toolkit by Pabitra Mohan Singh',
  description: 'Privacy-first, browser-based tools. No uploads, no servers.',
  domain: 'https://toolkit.pabitramohansingh.com',
  jobTitle: 'Software Engineer',
  locale: 'en_US',
  openGraphImage: 'https://toolkit.pabitramohansingh.com/og-image.png',
} as const;

export const social: SocialMediaLinks = {
  github: 'https://github.com/thepabitrams',
  linkedin: 'https://www.linkedin.com/in/pabitramohansingh',
  x: 'https://x.com/thepabitrams',
  youtube: 'https://youtube.com/@thepabitrams',
  instagram: 'https://www.instagram.com/thepabitrams',
} as const;

export const sponsor: SponsorLinksConfig = {
  page: 'https://pabitramohansingh.com/sponsor',
  buyMeACoffee: 'https://buymeacoffee.com/pabitramohansingh',
} as const;
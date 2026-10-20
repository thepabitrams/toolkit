export interface SiteDetails {
  readonly name: string;
  readonly author: string;
  readonly title: string;
  readonly description: string;
  readonly domain: string;
  readonly jobTitle: string;
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
}

export const site: SiteDetails = {
  name: 'Toolkit',
  author: 'Pabitra Mohan Singh',
  title: 'Toolkit by Pabitra Mohan Singh',
  description: 'Privacy-first, browser-based tools. No uploads, no servers.',
  domain: 'https://toolkit.pabitramohansingh.com',
  jobTitle: 'Software Engineer',
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
} as const;
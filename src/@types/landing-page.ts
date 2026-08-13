export interface LandingPageOffer {
  title: string;
  subTitle: string;
  icon?: string;
}

export interface LandingPageReview {
  name: string;
  quote: string;
  rating: number;
  image?: string;
}

export interface LandingPageFAQ {
  question: string;
  answer: string;
}

export interface LandingPageFeature {
  title: string;
  subTitle?: string;
  icon?: string;
}

export interface CreateLandingPageDto {
  id?: string;
  productId: string;
  slug: string;
  title?: string;
  headline: string;
  subHeadline?: string;
  topImage: string;
  offers?: LandingPageOffer[];
  features?: LandingPageFeature[];
  reviews?: LandingPageReview[];
  faqs?: LandingPageFAQ[];
  productImages?: string[];
  videoLink?: string;
  backgroundColor?: string;
  buttonColor?: string;
  textColor?: string;
}
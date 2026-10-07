export interface Review {
  author: string;
  rating: number;
  text: string;
  /** e.g. "2 months ago" or "March 2025". */
  when: string;
  authorUrl?: string;
  photo?: string;
}

/**
 * Reviews picked from the showroom's Google Maps listing, shown in the reviews slider.
 * Copy them exactly as they appear on Google (author name, stars, text, date).
 * Live reviews from the Places API, when a key is set, are added after these without duplicates.
 *
 * Example:
 * { author: 'Reviewer name', rating: 5, when: '3 months ago', text: 'Review text as written on Google.' },
 */
export const PICKED_REVIEWS: Review[] = [
];

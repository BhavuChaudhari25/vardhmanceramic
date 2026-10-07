import { Component, DestroyRef, computed, inject, input, signal } from '@angular/core';
import { PICKED_REVIEWS, Review } from './picked-reviews';

/**
 * Google Maps JavaScript API key with the Places API (New) enabled.
 * It is visible to visitors, so restrict it to this site's domain in Google Cloud Console.
 * Leave empty to show only the picked reviews, the rating summary and links to Google.
 */
const GOOGLE_MAPS_API_KEY = '';
/** Optional Google place ID for the showroom; when empty the place is found by `query`. */
const GOOGLE_PLACE_ID = '';

let mapsLoader: Promise<void> | undefined;
function loadMaps(key: string): Promise<void> {
  return mapsLoader ??= new Promise((resolve, reject) => {
    const callback = '__vcMapsReady';
    (window as any)[callback] = () => resolve();
    const s = document.createElement('script');
    s.src = `https://maps.googleapis.com/maps/api/js?key=${encodeURIComponent(key)}&v=weekly&loading=async&callback=${callback}`;
    s.async = true;
    s.onerror = () => reject(new Error('Google Maps failed to load'));
    document.head.append(s);
  });
}

@Component({
  selector: 'app-google-reviews',
  templateUrl: './google-reviews.html',
  styleUrl: './google-reviews.css',
  host: { '(keydown.arrowleft)': 'prev()', '(keydown.arrowright)': 'next()' },
})
export class GoogleReviews {
  /** Text search used to find the showroom's Google Maps listing. */
  readonly query = input('Vardhman Ceramic Bardoli');
  /** Shown until (or instead of) live figures from Google. */
  readonly fallbackRating = input(4.4);
  readonly fallbackCount = input(37);

  readonly rating = signal<number | null>(null);
  readonly count = signal<number | null>(null);
  private readonly live = signal<Review[]>([]);
  readonly mapsUri = signal<string | null>(null);
  readonly placeId = signal(GOOGLE_PLACE_ID);
  readonly expanded = signal<Record<number, boolean>>({});

  /** Picked reviews first, then live ones from Google that aren't already picked. */
  readonly reviews = computed(() => {
    const key = (r: Review) => `${r.author}|${r.text.slice(0, 40)}`.toLowerCase();
    const seen = new Set(PICKED_REVIEWS.map(key));
    return [...PICKED_REVIEWS, ...this.live().filter(r => !seen.has(key(r)))];
  });

  /** Cards visible at once, from the viewport width. */
  readonly perView = signal(3);
  readonly current = signal(0);
  readonly paused = signal(false);
  readonly positions = computed(() => Math.max(1, this.reviews().length - this.perView() + 1));
  readonly dots = computed(() => Array.from({ length: this.positions() }, (_, i) => i));
  readonly index = computed(() => Math.min(this.current(), this.positions() - 1));
  private readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private touchX: number | null = null;

  constructor() {
    if (GOOGLE_MAPS_API_KEY) this.load().catch(err => console.warn('Google reviews unavailable:', err));

    const two = matchMedia('(max-width: 1000px)'), one = matchMedia('(max-width: 640px)');
    const fit = () => this.perView.set(one.matches ? 1 : two.matches ? 2 : 3);
    fit();
    two.addEventListener('change', fit);
    one.addEventListener('change', fit);

    const timer = setInterval(() => {
      if (this.paused() || this.reducedMotion || document.hidden) return;
      this.next();
    }, 5000);
    inject(DestroyRef).onDestroy(() => {
      clearInterval(timer);
      two.removeEventListener('change', fit);
      one.removeEventListener('change', fit);
    });
  }

  private async load() {
    await loadMaps(GOOGLE_MAPS_API_KEY);
    const { Place } = await (window as any).google.maps.importLibrary('places');
    const fields = ['id', 'rating', 'userRatingCount', 'reviews', 'googleMapsURI'];
    let place;
    if (GOOGLE_PLACE_ID) {
      place = new Place({ id: GOOGLE_PLACE_ID });
      await place.fetchFields({ fields });
    } else {
      ({ places: [place] } = await Place.searchByText({ textQuery: this.query(), fields, maxResultCount: 1 }));
      if (!place) return;
    }
    this.placeId.set(place.id);
    this.rating.set(place.rating ?? null);
    this.count.set(place.userRatingCount ?? null);
    this.mapsUri.set(place.googleMapsURI ?? null);
    this.live.set((place.reviews ?? [])
      .filter((r: any) => r.text)
      .map((r: any): Review => ({
        author: r.authorAttribution?.displayName ?? 'Google user',
        authorUrl: r.authorAttribution?.uri,
        photo: r.authorAttribution?.photoURI,
        rating: r.rating ?? 0,
        text: r.text,
        when: r.relativePublishTimeDescription ?? '',
      })));
  }

  readonly stars = (n: number) => [1, 2, 3, 4, 5].map(i => n >= i - .25 ? 'full' : n >= i - .75 ? 'half' : 'empty');

  readUrl() {
    return this.mapsUri() ?? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(this.query())}`;
  }

  writeUrl() {
    const id = this.placeId();
    return id ? `https://search.google.com/local/writereview?placeid=${id}` : this.readUrl();
  }

  toggle(i: number) {
    this.expanded.update(e => ({ ...e, [i]: !e[i] }));
  }

  go(i: number) {
    const n = this.positions();
    this.current.set((i + n) % n);
  }
  next() { this.go(this.index() + 1); }
  prev() { this.go(this.index() - 1); }

  touchStart(e: TouchEvent) { this.touchX = e.touches[0].clientX; }
  touchEnd(e: TouchEvent) {
    if (this.touchX === null) return;
    const dx = e.changedTouches[0].clientX - this.touchX;
    if (Math.abs(dx) > 40) dx < 0 ? this.next() : this.prev();
    this.touchX = null;
  }
}

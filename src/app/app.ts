import { Component, DestroyRef, inject, signal } from '@angular/core';
import { ShowroomSlider } from './showroom-slider/showroom-slider';
import { HeroCarousel } from './hero-carousel/hero-carousel';
import { QuoteForm } from './quote-form/quote-form';
import { GoogleReviews } from './google-reviews/google-reviews';

interface Collection {
  id: string; label: string; title: string; text: string; color: string;
  photo: string; alt: string; items: string[]; interests: string[];
  itemPhotos?: Record<string, ItemPhoto>;
}
/** `position` is a CSS object-position for the 3:2 frame, for photos that aren't 3:2. */
interface ItemPhoto { src: string; thumb: string; alt: string; position?: string; }
const bathPhoto = (name: string, alt: string, position?: string): ItemPhoto =>
  ({ src: `bath/${name}.jpg`, thumb: `bath/${name}-sm.jpg`, alt, position });
const finishPhoto = (name: string, alt: string): ItemPhoto =>
  ({ src: `finish/${name}.jpg`, thumb: `finish/${name}-sm.jpg`, alt });
const ceramicPhoto: ItemPhoto = {
  src: 'tiles/ceramic-wall-floor.jpg', thumb: 'tiles/ceramic-wall-floor-sm.jpg',
  alt: 'Bathroom with marble, floral, 3D wave, wood-look and geometric wall tiles over a glossy marble floor',
};

interface CatalogueRow { name: string; detail: string; }
interface Day { name: string; index: number; hours: string; }

@Component({
  selector: 'app-root',
  imports: [ShowroomSlider, HeroCarousel, QuoteForm, GoogleReviews],
  templateUrl: './app.html',
  styleUrl: './app.css',
  host: { '(document:keydown.escape)': 'viewing.set(null)' },
})
export class App {
  readonly phone = '+91 94281 97281';
  readonly phoneHref = 'tel:+919428197281';
  readonly whatsapp = '919428197281';
  readonly landline = '0261-220861';
  readonly mapsUrl = 'https://www.google.com/maps/search/?api=1&query=Vardhman+Ceramic+Bardoli';
  readonly year = new Date().getFullYear();

  readonly menuOpen = signal(false);
  readonly interests = signal<string[]>([]);
  readonly viewing = signal<ItemPhoto | null>(null);
  /** Selected item per collection id; collections with item photos start on their first item. */
  readonly selected = signal<Record<string, string>>({});
  /** Collections the visitor is hovering or focused in; these don't auto-advance. */
  readonly paused = signal<Record<string, boolean>>({});
  private readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

  readonly facts = [
    { value: '1997', label: 'Established' },
    { value: '4.4 / 5', label: 'On Google Maps (37 reviews)' },
    { value: '4.4 / 5', label: 'On Justdial (47 ratings)' },
    { value: 'Mon–Sat', label: 'About 9 AM to 8 PM' },
  ];

  readonly collections: Collection[] = [
    {
      id: 'tiles', label: 'Tiles & flooring', color: 'var(--cobalt)',
      title: 'Floors and walls in the finish you have in mind',
      text: 'Matt, glossy, marble-look or patterned. Pick from ceramic, vitrified, natural stone and digital-print tiles for living rooms, kitchens, bathrooms and outdoor spaces.',
      photo: 'showroom/3.jpg', alt: 'Grey marble-look wall tiles on display',
      items: ['Ceramic tiles', 'Floor tiles', 'Wall tiles', 'Marble tiles', 'Natural stone tiles', 'Decorative tiles', 'Digital-print tiles', 'Roofing tiles'],
      interests: ['Floor tiles', 'Wall tiles'],
      itemPhotos: {
        'Ceramic tiles': ceramicPhoto,
        'Floor tiles': ceramicPhoto,
        'Wall tiles': ceramicPhoto,
        'Marble tiles': { src: 'tiles/marble.jpg', thumb: 'tiles/marble-sm.jpg', alt: 'Living room with marble floor and wall panels, with white, beige, grey, black, brown and green marble swatches' },
        'Natural stone tiles': { src: 'tiles/natural-stone.jpg', thumb: 'tiles/natural-stone-sm.jpg', alt: 'Slate, sandstone, granite, limestone, quartzite, travertine and Kota stone tiles used in rooms and outdoors' },
        'Decorative tiles': { src: 'tiles/decorative.jpg', thumb: 'tiles/decorative-sm.jpg', alt: 'Patterned, floral, geometric, 3D, mosaic, textured, vintage and artistic decorative wall tiles' },
        'Digital-print tiles': { src: 'tiles/digital-print.jpg', thumb: 'tiles/digital-print-sm.jpg', alt: 'Floral, nature, landscape, geometric, leaf, 3D, peacock and custom digital-print wall tiles' },
        'Roofing tiles': { src: 'tiles/roofing.jpg', thumb: 'tiles/roofing-sm.jpg', alt: 'House with dark roof tiles, with clay, concrete, metal, stone-coated, ceramic, terracotta, slate and asphalt options' },
      },
    },
    {
      id: 'bath', label: 'Bathroom & sanitaryware', color: 'var(--glaze)',
      title: 'Everything a bathroom needs, chosen together',
      text: 'See basins, toilets and bathtubs set up in full bathroom displays, so you can match fittings and tiles before you buy.',
      photo: 'showroom/2.jpg', alt: 'Bathroom display with bathtub and wall-hung toilet',
      items: ['Wash basins', 'Pedestal basins', 'Half-pedestal basins', 'Toilets', 'Wall-hung toilets', 'Bathtubs', 'Bathroom fittings'],
      interests: ['Sanitaryware', 'Bathtubs'],
      itemPhotos: {
        'Wash basins': bathPhoto('wash-basin', 'White marble-pattern countertop wash basin with a gold tall basin mixer'),
        'Pedestal basins': bathPhoto('pedestal-basin', 'White pedestal wash basin with a chrome mixer against beige marble-look wall tiles', '50% 40%'),
        'Half-pedestal basins': bathPhoto('half-pedestal-basin', 'White wall-mounted half-pedestal basin with a chrome mixer', '50% 70%'),
        'Toilets': bathPhoto('toilet', 'White one-piece floor-mounted toilet with a health faucet beside it', '50% 60%'),
        'Wall-hung toilets': bathPhoto('wall-hung-toilet', 'White wall-hung toilet with a concealed cistern flush plate and health faucet'),
        'Bathtubs': bathPhoto('bathtub', 'White freestanding oval bathtub with a gold floor-standing bath mixer'),
        'Bathroom fittings': bathPhoto('fittings', 'Bathroom with labelled fittings: showers, mixers, towel rack, robe hook, flush plate, health faucet, angle valve, pillar cock, bib cock and bottle trap'),
      },
    },
    {
      id: 'other', label: 'Mirrors & countertops', color: 'var(--saffron)',
      title: 'The finishing touches',
      text: 'Mirrors, shower cubicles, table tops and marble-inlay countertops to complete the room.',
      photo: 'showroom/1.jpg', alt: 'Vanity with mirror and floral wall tiles',
      items: ['Mirrors', 'Shower cubicles', 'Table tops', 'Countertops', 'Marble-inlay table tops', 'Other home-finish materials'],
      interests: ['Mirrors', 'Countertops'],
      itemPhotos: {
        'Mirrors': finishPhoto('mirrors', 'Wall, round, oval, LED, framed, cabinet, beveled and full-length mirrors above bathroom basins'),
        'Shower cubicles': finishPhoto('shower-cubicles', 'Framed, frameless, sliding, quadrant, rectangular and walk-in glass shower cubicles'),
        'Table tops': finishPhoto('table-tops', 'Marble, granite, quartz, wooden, glass, laminate, solid surface, compact, metal, terrazzo, concrete and onyx table tops'),
        'Countertops': finishPhoto('countertops', 'Kitchen, bathroom, reception, bar, restaurant, laundry, outdoor and commercial countertops, with marble, granite, quartz, engineered stone, terrazzo, concrete, wood, stainless steel and onyx samples'),
        'Marble-inlay table tops': finishPhoto('marble-inlay', 'White marble table tops with floral, geometric, compass, leaf, border, frame and peacock inlay designs'),
        'Other home-finish materials': finishPhoto('home-finish', 'Floor and wall tiles, wooden flooring, wall panels, false ceilings, kitchens, wardrobes, doors, windows, staircases, stone, laminates, paints, glass, hardware, skirting, cladding and decking'),
      },
    },
  ];

  readonly quoteOptions = ['Floor tiles', 'Wall tiles', 'Sanitaryware', 'Bathtubs', 'Mirrors', 'Countertops', 'Shower cubicles'];

  readonly catalogue: CatalogueRow[] = [
    { name: 'Wall-hung toilet', detail: 'Dual-flush' },
    { name: 'Wash basin with pedestal', detail: 'Vitreous china' },
    { name: 'Bath tub series', detail: 'Acrylic, rectangular, 2-seat' },
    { name: 'Mirrors (15, 20, 22, 25)', detail: 'Tempered glass, glossy' },
    { name: 'Floral design marble tiles', detail: 'Natural stone, 600 × 300 mm' },
    { name: 'Marble inlay table top', detail: 'Model MTT-2023' },
  ];

  readonly days: Day[] = [
    ...['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map((name, i) => ({ name, index: i + 1, hours: '9 AM – 8 PM' })),
    { name: 'Sunday', index: 0, hours: 'Closed' },
  ];

  private readonly ist = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Kolkata' }));
  readonly today = this.ist.getDay();
  readonly isOpen = this.today !== 0 && this.ist.getHours() >= 9 && this.ist.getHours() < 20;
  readonly statusText = this.isOpen
    ? 'Open now, until 8 PM'
    : this.today === 0 ? 'Closed today, opens Monday 9 AM' : 'Closed now, opens 9 AM';

  constructor() {
    const timer = setInterval(() => {
      if (this.reducedMotion || document.hidden || this.viewing()) return;
      for (const c of this.collections) if (c.itemPhotos && !this.paused()[c.id]) this.advance(c);
    }, 4000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  pause(c: Collection, on: boolean) {
    this.paused.update(p => ({ ...p, [c.id]: on }));
  }

  private advance(c: Collection) {
    const withPhotos = c.items.filter(item => c.itemPhotos?.[item]);
    const next = withPhotos[(withPhotos.indexOf(this.selectedItem(c)!) + 1) % withPhotos.length];
    this.selectItem(c, next);
  }

  selectedItem(c: Collection) {
    return this.selected()[c.id] ?? (c.itemPhotos ? c.items[0] : undefined);
  }

  photoFor(c: Collection): ItemPhoto | undefined {
    const item = this.selectedItem(c);
    return item ? c.itemPhotos?.[item] : undefined;
  }

  selectItem(c: Collection, item: string) {
    this.selected.update(s => ({ ...s, [c.id]: item }));
  }

  enquireAbout(c: Collection) {
    this.interests.update(list => [...new Set([...list, ...c.interests])]);
  }
}

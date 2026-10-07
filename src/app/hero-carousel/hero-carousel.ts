import { Component, DestroyRef, inject, input, signal } from '@angular/core';

interface HeroSlide {
  eyebrow: string;
  title: string;
  text: string;
  cta: { label: string; href: string };
  tone: string;
  photo?: string;
  tiles?: number[];
}

@Component({
  selector: 'app-hero-carousel',
  templateUrl: './hero-carousel.html',
  styleUrl: './hero-carousel.css',
  host: { '(keydown.arrowleft)': 'prev()', '(keydown.arrowright)': 'next()' },
})
export class HeroCarousel {
  readonly statusText = input('');
  readonly isOpen = input(false);

  readonly slides: HeroSlide[] = [
    {
      eyebrow: 'Serving Bardoli since 1997',
      title: 'Tiles, bathrooms and finishes for your home.',
      text: 'Floor and wall tiles, sanitaryware, mirrors and countertops, all in one showroom.',
      cta: { label: 'View collections', href: '#collections' },
      tone: 'var(--cobalt)',
      photo: 'showroom/6.webp',
    },
    {
      eyebrow: 'Tiles & flooring',
      title: 'Floor and wall tiles in every finish.',
      text: 'Ceramic, marble, natural stone, digital-print and decorative tiles for every room.',
      cta: { label: 'View tiles', href: '#tiles' },
      tone: 'var(--glaze)',
      tiles: [3, 5, 3, 5, 4, 5, 3, 5, 3],
    },
    {
      eyebrow: 'Bathroom & sanitaryware',
      title: 'A complete bathroom, from basin to bathtub.',
      text: 'Wash basins, wall-hung toilets, bathtubs, mirrors and fittings that match.',
      cta: { label: 'View bathroom range', href: '#bath' },
      tone: '#16263A',
      tiles: [1, 6, 1, 6, 9, 6, 1, 6, 1],
    },
  ];

  readonly current = signal(0);
  readonly paused = signal(false);
  private readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private touchX: number | null = null;

  constructor() {
    const timer = setInterval(() => {
      if (!this.paused() && !this.reducedMotion && !document.hidden) this.next();
    }, 6000);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  go(i: number) { this.current.set((i + this.slides.length) % this.slides.length); }
  next() { this.go(this.current() + 1); }
  prev() { this.go(this.current() - 1); }

  touchStart(e: TouchEvent) { this.touchX = e.touches[0].clientX; }
  touchEnd(e: TouchEvent) {
    if (this.touchX === null) return;
    const dx = e.changedTouches[0].clientX - this.touchX;
    if (Math.abs(dx) > 40) dx < 0 ? this.next() : this.prev();
    this.touchX = null;
  }
}

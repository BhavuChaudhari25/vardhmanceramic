import { Component, DestroyRef, inject, signal } from '@angular/core';

interface Slide { src: string; alt: string; caption: string; }

@Component({
  selector: 'app-showroom-slider',
  templateUrl: './showroom-slider.html',
  styleUrl: './showroom-slider.css',
  host: { '(keydown.arrowleft)': 'prev()', '(keydown.arrowright)': 'next()' },
})
export class ShowroomSlider {
  readonly slides: Slide[] = [
    { src: 'showroom/inside/exterior.jpg', alt: 'Vardhman Marble & Granite showroom and stockyard from the main road', caption: 'The showroom and stockyard on the main road' },
    { src: 'showroom/inside/entrance-brands.jpg', alt: 'Showroom entrance with a wall of brand logos including Kajaria, Somany, Jaquar, Hindware and Cera', caption: 'Leading tile and sanitaryware brands under one roof' },
    { src: 'showroom/inside/tile-gallery.jpg', alt: 'Tile gallery with sample racks for wall, floor and decorative tiles', caption: 'Wall, floor and decorative tile galleries' },
    { src: 'showroom/inside/floor-overview.jpg', alt: 'Showroom floor with toilets, fittings, bathtubs, shower cubicles, mirrors, countertops and inlay table tops', caption: 'Bathware, countertops and marble-inlay table tops' },
    { src: 'showroom/inside/basins-mirrors.jpg', alt: 'Tiered display of wash basins in many shapes and colours below LED mirrors', caption: 'Wash basins and LED mirrors' },
    { src: 'showroom/inside/bathroom-display.jpg', alt: 'Bathroom display with marble-look tiles, patterned border tiles, pedestal basins and wall-hung toilets', caption: 'Complete bathroom displays' },
  ];

  readonly current = signal(0);
  readonly paused = signal(false);
  /** 0–1 share of the current slide's time used up; fills the active dot. */
  readonly progress = signal(0);
  /** Pointer position over the slider, -1 to 1 on each axis, for the parallax shift. */
  readonly mx = signal(0);
  readonly my = signal(0);
  private readonly reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  private readonly duration = 6000;
  private touchX: number | null = null;

  constructor() {
    const step = 100;
    const timer = setInterval(() => {
      if (this.paused() || this.reducedMotion || document.hidden) return;
      const p = this.progress() + step / this.duration;
      p >= 1 ? this.next() : this.progress.set(p);
    }, step);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));
  }

  go(i: number) {
    this.current.set((i + this.slides.length) % this.slides.length);
    this.progress.set(0);
  }

  point(e: MouseEvent | null) {
    if (!e || this.reducedMotion) { this.mx.set(0); this.my.set(0); return; }
    const r = (e.currentTarget as HTMLElement).getBoundingClientRect();
    this.mx.set(((e.clientX - r.left) / r.width) * 2 - 1);
    this.my.set(((e.clientY - r.top) / r.height) * 2 - 1);
  }
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

import { Component, input, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-quote-form',
  imports: [FormsModule],
  templateUrl: './quote-form.html',
  styleUrl: './quote-form.css',
})
export class QuoteForm {
  readonly whatsapp = input.required<string>();
  readonly options = input.required<string[]>();
  readonly interests = model<string[]>([]);

  readonly sent = signal(false);
  form = { name: '', phone: '', email: '', city: '', message: '' };

  toggle(option: string, checked: boolean) {
    this.interests.update(list => checked ? [...list, option] : list.filter(o => o !== option));
  }

  submit() {
    const f = this.form;
    const lines = [
      'Hello Vardhman Ceramic, I would like a quote.',
      `Name: ${f.name}`,
      `Phone: ${f.phone}`,
      f.email && `Email: ${f.email}`,
      f.city && `City: ${f.city}`,
      this.interests().length && `Interested in: ${this.interests().join(', ')}`,
      f.message && `Details: ${f.message}`,
    ].filter(Boolean);
    window.open(`https://wa.me/${this.whatsapp()}?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    this.sent.set(true);
  }
}

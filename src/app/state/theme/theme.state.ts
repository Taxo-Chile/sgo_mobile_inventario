import { Injectable, signal, computed, effect } from '@angular/core';

export type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeState {
  private static readonly STORAGE_KEY = 'sgo-theme';

  private readonly _theme = signal<Theme>(this.loadInitial());

  readonly theme = this._theme.asReadonly();
  readonly isDark = computed(() => this._theme() === 'dark');

  constructor() {
    effect(() => {
      const theme = this._theme();
      document.documentElement.classList.toggle('dark', theme === 'dark');
      try {
        localStorage.setItem(ThemeState.STORAGE_KEY, theme);
      } catch { /* localStorage not available */ }
    });
  }

  private loadInitial(): Theme {
    try {
      const stored = localStorage.getItem(ThemeState.STORAGE_KEY) as Theme | null;
      if (stored === 'dark' || stored === 'light') return stored;
    } catch { /* localStorage not available */ }
    return 'light';
  }

  async toggle(): Promise<void> {
    const next: Theme = this._theme() === 'light' ? 'dark' : 'light';
    this._theme.set(next);
  }

  async setTheme(theme: Theme): Promise<void> {
    this._theme.set(theme);
  }
}

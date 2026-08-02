import { QualityChecklist } from '@/features/quality-checklist';

import './app.css';

export function App() {
  return (
    <>
      <header className="site-header">
        <a
          className="site-header__brand"
          href="#main-content"
          aria-label="Frontend Quality Starter home"
        >
          Frontend Quality Starter
        </a>
        <span className="site-header__version">v0.1 starter</span>
      </header>

      <main className="app-shell" id="main-content">
        <section className="app-intro" aria-labelledby="page-title">
          <p className="app-intro__eyebrow">React · Vite · TypeScript</p>
          <h1 id="page-title">A frontend baseline you can verify.</h1>
          <p className="app-intro__summary">
            One focused starter with static analysis, component tests, browser checks, Storybook,
            and release automation wired into the same quality loop.
          </p>
        </section>

        <QualityChecklist />
      </main>

      <footer className="site-footer">
        <p>Built to make quality visible before release.</p>
      </footer>
    </>
  );
}

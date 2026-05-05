# FinalBoss — Crypto Backtest Engine

Open-Source-Backtest-Tool für Krypto-Trading-Strategien. Komplett im Browser, ohne Server, ohne Account.

**Live Demo:** _(nach Deployment hier eintragen, z.B. https://yourname.github.io/finalboss-backtest)_

---

## Features

### Backtest-Engine
- **71+ vorgefertigte Strategien** — Trend-Following, Mean Reversion, Breakouts, Oszillatoren, SMC, ML-basiert
- **Custom Strategy Builder** — eigene Strategien aus Indikator-Bausteinen (No-Code)
- **Realismus-Filter** — Fees, Slippage, Cooldown-Bars, Funding-Rates für Perp-Futures
- **Train/Test-Split** — automatisch zur Overfitting-Erkennung

### Validierung & Robustheit
- **Walk-Forward Analysis** — rollende Train/Test-Fenster
- **Monte Carlo (4 Methoden)** — Trade-Shuffle, Skipped-Trades, Slippage-Variation, PnL-Bootstrap mit Robustness-Score
- **Statistical Significance** — Bootstrap-Sharpe-CI (95%) + Binomial-Test für Win-Rate
- **Look-Ahead-Audit** — automatischer Code-Scan aller Strategien beim App-Start
- **Edge-Decay** — Rolling-PF/Sharpe/Win-Rate über Trade-Historie

### Optimierung
- **Multi-dimensionaler Optimizer** — Grid-Search oder Genetic Algorithm
- **Parameter-Heatmap** — 2D-Visualisierung
- **In-Sample / Out-of-Sample** Robustness-Score

### Multi-Asset
- **Portfolio-Backtest** — eine Strategie auf N Coins parallel mit geteilter Balance
- **Coin-Korrelations-Matrix** — Diversifikation prüfen
- **Coin-Scan** — eine Strategie sequenziell auf vielen Coins

### Forward-Testing
- **Paper-Trading-Modus** — echte Live-Daten, virtuelle Balance, vollständiges Position-Management mit SL/TP
- **WebSocket-Stream** mit Auto-Reconnect
- **Browser-Persistenz** — Session überlebt Reload

### UX
- **17 Tabs** für verschiedene Analyse-Aspekte
- **Akademie** — 71 Strategien + Chart-Patterns + Candlestick-Patterns visuell erklärt
- **DE/EN-Sprachen-Toggle**
- **Dark/Light-Theme**
- **Trade-Tagging** im Journal mit persistentem Filter
- **JSON Export/Import** des kompletten App-States

---

## Quick Start

### Lokal nutzen
```bash
# Einfach die Datei im Browser öffnen
open backtest_app.html
```

Keine Installation, keine Dependencies. Funktioniert offline (Service Worker), Backtest braucht aber Binance-API für historische Daten.

### Auf GitHub Pages hosten
```bash
# 1. Repo auf GitHub erstellen (z.B. "finalboss-backtest")
# 2. backtest_app.html als index.html hochladen
git init
git add .
git commit -m "Initial commit"
git remote add origin https://github.com/USER/finalboss-backtest.git
git push -u origin main

# 3. Settings → Pages → Source: main / root
# Live unter https://USER.github.io/finalboss-backtest in ~1 Minute
```

### Auf Netlify / Vercel hosten
```bash
# Netlify CLI
npx netlify deploy --dir=. --prod

# Vercel CLI
npx vercel --prod
```

Beide bieten kostenloses HTTPS und Custom-Domains.

---

## Empfohlener Workflow

1. **Backtest** — Strategie + Coin + Zeitraum wählen → Ergebnisse prüfen
2. **Optimizer** — beste Parameter finden (Grid oder Genetic)
3. **Walk-Forward** — Robustheit prüfen (mehrere Train/Test-Fenster)
4. **Monte Carlo + Significance** — sind die Ergebnisse statistisch echt? Sharpe-CI prüfen
5. **Paper Trading** — 2-4 Wochen live laufen lassen, **kein** echtes Geld
6. **Echtes Geld** — erst wenn Paper-Performance den Backtest bestätigt

---

## Architecture

Single-File HTML-Anwendung. ~22.000 Zeilen, alles in einer `backtest_app.html`:

- **Plain JavaScript** — keine Frameworks, keine Build-Step
- **Canvas-basierte Charts** — kein D3, kein Chart.js (außer für ein paar spezifische Sachen)
- **Vanilla CSS** — Custom-Properties für Theming
- **Binance Public API** — REST für Historie, WebSocket für Live
- **localStorage** für State-Persistenz

Der Engine-Code (`runEngine`) iteriert candle-by-candle, simuliert Entry/Exit/SL/TP, trackt MAE/MFE, berechnet alle Metriken in einem einzigen Durchlauf.

---

## Limitations

Was das Tool **nicht** kann:

- Echtes Geld traden — keine Broker-Anbindung, nur Paper
- Tick-Daten — kleinste Auflösung 1m
- Multi-Asset wie Aktien/Forex — nur Krypto via Binance
- Garantieren bug-frei zu sein — wichtige Strategien immer mit zweitem Tool validieren
- Slippage realistisch modellieren — feste %, nicht orderbook-basiert
- Latenz simulieren — keine Network-Roundtrip-Modelle

---

## Disclaimer

**Keine Anlageberatung.** Diese Software dient ausschließlich der Strategie-Recherche und -Analyse. Sie ist keine Empfehlung, Geld einzusetzen.

**Backtest ≠ Zukunft.** Historische Performance ist kein Indikator für zukünftige Ergebnisse.

**Du kannst Geld verlieren.** Krypto-Trading ist hochriskant. Investiere nur was du dir leisten kannst zu verlieren.

**Software-Bugs sind möglich.** Trotz Audit-Tool und Tests können Fehler in der Engine zu falschen Ergebnissen führen.

---

## License

MIT — siehe [LICENSE](LICENSE).

Du darfst den Code für jeden Zweck nutzen, modifizieren und weitergeben — kommerziell und nicht-kommerziell. Einzige Bedingung: License-Hinweis und Copyright bei Weitergabe behalten.

---

## Contributing

Beiträge willkommen. Beachte:

1. **Keine Look-Ahead-Bias-Bugs** — neue Strategien müssen den Audit (🛡️-Button) bestehen
2. **Keine Build-Step** — alles bleibt in einer HTML-Datei (Single-File-Architektur ist bewusst)
3. **Vanilla JS** — keine Framework-Dependencies einführen
4. **Kommentare auf Deutsch oder Englisch** — beides OK

Pull Requests sind willkommen, vor allem für: neue Strategien, Bug-Fixes in der Engine, neue Indikatoren, UI-Verbesserungen.

---

## Credits

Built solo. Inspired by TradingView, QuantConnect, vectorbt, StrategyQuant, and the SMC-Trading-Community.

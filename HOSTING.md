# Hosting Guide — FinalBoss Backtest Engine

## Option 1 — GitHub Pages (kostenlos, einfachste)

**Voraussetzung:** GitHub-Account.

```bash
# 1. Lokales Git-Repo init
cd C:\Users\leakl\Desktop\FinalBoss_bot
git init
git add backtest_app.html README.md LICENSE HOSTING.md
git commit -m "Initial release"

# 2. Datei umbenennen damit GitHub Pages sie als Startseite erkennt
git mv backtest_app.html index.html
git commit -m "Rename for GitHub Pages"

# 3. Auf GitHub.com ein neues Repo erstellen (z.B. "finalboss-backtest")
# Dann Remote setzen + pushen:
git remote add origin https://github.com/DEIN_USERNAME/finalboss-backtest.git
git branch -M main
git push -u origin main

# 4. Im GitHub-Repo: Settings → Pages → Source: "Deploy from a branch"
#    Branch: main, Folder: / (root)
#    → Live unter https://DEIN_USERNAME.github.io/finalboss-backtest in ~1 Minute
```

**URL danach:** `https://DEIN_USERNAME.github.io/finalboss-backtest`

**Custom Domain:** Settings → Pages → Custom Domain. Du brauchst eine Domain (~10€/Jahr bei Namecheap, Cloudflare etc.) und musst einen CNAME-Record auf `DEIN_USERNAME.github.io` setzen.

---

## Option 2 — Netlify (kostenlos, schickere URLs)

**Voraussetzung:** GitHub-Repo (siehe Option 1).

1. Account auf [netlify.com](https://netlify.com) anlegen
2. "New site from Git" → GitHub-Repo auswählen
3. Build Command: leer lassen
4. Publish Directory: `.` (root)
5. Deploy → Live in ~30 Sekunden

**URL:** `https://random-name-12345.netlify.app` (oder Custom-Domain einstellen)

---

## Option 3 — Vercel (kostenlos)

```bash
npm install -g vercel
cd C:\Users\leakl\Desktop\FinalBoss_bot
vercel --prod
# Folge den Prompts — fertig.
```

**URL:** `https://your-project.vercel.app`

---

## Option 4 — eigener Server / VPS

Wenn du eh einen Server hast, einfach die HTML-Datei + README ins Web-Root kopieren (Apache/nginx, kein Node, kein PHP nötig).

**nginx-Config-Beispiel:**

```nginx
server {
    listen 443 ssl http2;
    server_name finalboss.example.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/finalboss;
    index backtest_app.html;

    # CORS-Header falls nötig (für Binance-API-Calls aus dem Browser)
    add_header Access-Control-Allow-Origin "*";

    # Cache-Strategie für PWA
    location / {
        add_header Cache-Control "public, max-age=300";
        try_files $uri $uri/ /backtest_app.html;
    }
}
```

---

## Wichtige Hinweise vor dem Live-Schalten

### 1. Binance-API funktioniert ohne Konfiguration
Die App nutzt nur **public endpoints** der Binance-API — keine Keys, kein Account, keine CORS-Probleme von HTTPS-Hostings aus.

### 2. Service Worker (Offline-Fähigkeit)
Es gibt eine Referenz auf `sw.js` im Code — wenn du Offline-Cache willst, lege eine `sw.js` daneben. Sonst ignoriert der Browser die SW-Registrierung still.

### 3. Disclaimer ist Pflicht
Beim ersten Besuch muss der User den Disclaimer abnicken. Das ist im Code eingebaut — **nicht entfernen**, das ist deine rechtliche Absicherung.

### 4. localStorage-Limits
Der Browser gibt typischerweise 5-10MB pro Origin. Backtests mit 10.000+ Trades + viele Strategien können das ausreizen. Wenn Trades persistiert werden müssen, ggf. IndexedDB für die Zukunft erwägen.

### 5. Mobile-Test
Die UX wurde primär auf Desktop getestet. Auf Mobile funktioniert grundsätzlich alles, aber Tabs werden auf 2-3 Reihen brechen, und Charts sind klein. Vor Live-Schaltung 1× auf einem Handy testen.

### 6. Analytics (optional)
Wenn du wissen willst ob's genutzt wird, einbauen:
- **Plausible** (DSGVO-konform, kostenlos für Open-Source) — 1 Zeile Code im `<head>`
- **Umami** (selfhosted, kostenlos)
- Niemals Google Analytics ohne Cookie-Banner einbauen

### 7. SEO
Im `<head>` ergänzen falls gewünscht:
```html
<meta name="description" content="Open-Source Crypto Backtest Tool — 71+ Strategien, Walk-Forward, Monte Carlo, Paper Trading, alles im Browser">
<meta property="og:title" content="FinalBoss — Crypto Backtest">
<meta property="og:description" content="71+ Strategien, alles browserbasiert, ohne Account">
<meta property="og:image" content="screenshot.png">
```

---

## Aktualisierungen

Bei Updates einfach die `index.html` (oder `backtest_app.html`) neu hochladen. Browser-Cache der User wird durch den Service Worker oder über die Standard-Cache-Strategie aktualisiert (kann 1-5 Minuten dauern).

Bei größeren Versions-Sprüngen mit neuem Disclaimer: in `DISCLAIMER_VERSION` Variable im Code von `'v1'` auf `'v2'` ändern → User müssen erneut zustimmen.

---

## Marketing / Discoverability

Wenn du Reichweite willst:

1. **Reddit:** r/algotrading, r/CryptoCurrency, r/Daytrading
2. **Twitter/X:** @-mention von QuantConnect, TradingView, vectorbt
3. **HackerNews:** "Show HN: FinalBoss — Open-source crypto backtest tool"
4. **GitHub:** Topics setzen (`backtesting`, `cryptocurrency`, `trading-strategies`, `quant-finance`)
5. **Product Hunt:** falls du das mehr als nur Hobby siehst

---

## Was Du nicht selbst machen solltest

- **Trading-Signale verkaufen** auf Basis der App → rechtlich heikel ohne BaFin-Lizenz (DE) oder ähnlichem
- **Garantierte Returns versprechen** → Betrug
- **User-Geld verwalten** → Lizenzpflicht, am besten gar nicht erst anfangen

Das Tool als reines **Strategie-Research-Werkzeug** zu positionieren ist sicherer.

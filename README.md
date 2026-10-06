# ⚖️ ClauseClear - Plain English Legal Terms Analyzer

ClauseClear is a free, interactive web utility that parses Terms of Service, rental leases, and user agreements into plain English, flagging auto-renewals, arbitration clauses, hidden fees, and data-sharing terms.

---

## 🚀 Features

- **Instant Red-Flag Scanning:** Identifies auto-renewal billing, arbitration waivers, penalty charges, and unilateral updates.
- **Consumer Friendliness Score:** Gives contracts a 0–100 safety rating.
- **Privacy First (Client-Side):** 100% of the analysis runs inside the visitor's browser. No contracts are stored on remote servers.
- **Built for Monetization:**
  - Standard Google AdSense banner placements (`728x90` and `300x250`).
  - Mandatory legal compliance pages (`privacy.html`, `terms.html`, `about.html`) required by Google.

---

## 💻 How to Preview & Test Locally

You can open `index.html` directly in any web browser, or launch a quick local server:

```powershell
# Using Python (built-in):
python -m http.server 8000

# Then visit: http://localhost:8000
```

---

## 🌐 How to Deploy for Free ($0 Hosting Cost)

### Option 1: GitHub Pages (Easiest)
1. Push this project to a GitHub repository.
2. Go to **Settings > Pages**.
3. Under **Branch**, select `main` (or `master`) and click **Save**.
4. Your site will be live at `https://yourusername.github.io/reponame`.

### Option 2: Vercel or Netlify (Fast & Free)
1. Go to [Vercel](https://vercel.com/) or [Netlify](https://www.netlify.com/).
2. Connect your GitHub repository.
3. Click **Deploy** (no build command needed, it's static HTML/JS).

---

## 💰 How to Monetize with Google AdSense

1. **Get a Custom Domain:**
   - Buy a custom domain (e.g., `clauseclear.app` or `legalchecker.io`) for ~$8–$12/year on Namecheap, Cloudflare, or Porkbun.
   - Point your domain to your Vercel or GitHub Pages site. Google AdSense strongly prefers custom domains over free `.github.io` subdomains.

2. **Submit to Google AdSense:**
   - Go to [Google AdSense](https://adsense.google.com/).
   - Click **Get Started**, sign in with your Google account, and submit your domain URL.
   - Copy the verification `<script>` tag provided by AdSense and paste it inside the `<head>` of `index.html`.

3. **Get Approved:**
   - Google will review your site (usually 2–7 business days). Because ClauseClear includes original utility code, an About page, Privacy Policy, and Terms of Service, it fulfills Google's publisher guidelines.

4. **Earn Revenue:**
   - Once approved, Google will automatically display relevant ads in your top and sidebar slots, and pay you monthly directly to your bank account via AdSense.

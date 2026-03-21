# SKILL: Geopolitical News Sentinel

> **Note:** We are live at `slicktrader.xyz` (domain registered today).

## Objective
Capture breaking Middle East geopolitical headlines from live news sources and return a structured artifact containing the headline text and a base64-encoded screenshot.

## Target Sources (in priority order)
1. https://www.reuters.com/world/middle-east/
2. https://www.aljazeera.com/middle-east/
3. https://x.com/search?q=middle+east+oil+crisis&f=live

## Steps

### Step 1: Navigate
- Open the target URL.
- Wait for the page to fully render (wait for network idle, max 8 seconds).
- If a cookie/consent banner appears, dismiss it by clicking "Accept" or "Agree".

### Step 2: Identify Breaking News
- Scan the visible viewport for elements matching these signals:
  - Red "BREAKING" labels
  - "DEVELOPING" banners
  - Headlines containing keywords: `oil`, `Iran`, `Israel`, `Saudi`, `Gaza`, `Strait of Hormuz`, `airstrike`, `pipeline`, `OPEC`, `crude`
- If no breaking content is found on Source 1, proceed to Source 2, then Source 3.

### Step 3: Capture
- Extract the **text content** of the highest-priority matching headline.
- Take a **full-page screenshot** of the visible news feed.
- Encode the screenshot as a base64 string.

### Step 4: Return Artifact
Return a JSON payload to the Sentinel agent endpoint at POST /sentinel/trigger:

```json
{
  "source": "<URL of the page scraped>",
  "headline": "<extracted headline text>",
  "image_base64": "<base64-encoded screenshot>"
}
```

## Error Handling
- If Cloudflare blocks the page (detects CAPTCHA or 403), skip to the next source.
- If all sources fail, return: `{"source": "none", "headline": "NO_DATA", "image_base64": ""}`
- Never wait more than 15 seconds total per source.

## Safety
- Do not click any links. Only read and screenshot.
- Do not submit any forms.
- Do not store cookies between sessions.

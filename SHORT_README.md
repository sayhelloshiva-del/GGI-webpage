# 🌐 GGS / 27 — The Global Graduate Summit 2027

Launch site for **The Global Graduate Summit 2027** (London, 6–7 April 2027) — bringing together 500 Indian students and graduates from 15+ countries across 6 working tracks.

---

### 1. 🚀 How to Run It

**Prerequisites:** Node.js 20.9+

```bash
# 1. Install dependencies
npm install

# 2. (Optional) Add your Gemini API Key
# Copy example env and add your free key from https://aistudio.google.com/apikey
cp .env.example .env.local
# Set: GEMINI_API_KEY=AIzaSy...

# 3. Start local development server
npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** in your browser.

> 💡 **Note:** The site builds and functions **100% without an API key**. The API key is an optional enhancement for the AI reasoning layer.

To build for production:
```bash
npm run build
npm run start
```

---

### 2. 🤖 What the AI Feature Does

The **AI Track Matcher** (`Sec / 03`) helps delegates discover which of the summit’s 6 working tracks best fits their profile:

1. **3-Question Interactive Quiz**: The delegate selects their priority topic, desired outcome, and natural contribution style.
2. **Deterministic Grounding**: The answers are first scored through an internal weighted allocation engine (`lib/track-scoring.ts`) to determine point leaders.
3. **AI Personalization (Gemini 3.5 Flash Lite)**: The ranking and answers are passed to Gemini via structured JSON schema to:
   - Confirm or refine the top track allocation.
   - Calculate an exact match confidence score.
   - Generate a concise, 1–2 sentence personalized reasoning addressed directly to the delegate.

---

### 3. 🛡️ How It Behaves When the Model Fails

The AI is built as an **enhancement, not a single point of failure**. Every failure path resolves instantly to a valid, usable track allocation with zero broken screens:

```
User Submits Answers
        │
        ▼
Is Gemini Key Present? ──No──► [Instant Local Scorer (0ms)]
        │ Yes
        ▼
Call Gemini API (9s Timeout)
   ┌────┴───────────────────────────┐
   ▼                                ▼
Success                         Failure / Rate Limit / Timeout
   │                                │
Render AI Result                Render Local Fallback Result
("Matched by: AI + track rules")  ("Matched by: Track rules (local)")
```

#### Graceful Degradation Table:

| Failure Scenario | Internal Behavior | What the User Sees |
| :--- | :--- | :--- |
| **No API Key Set** | Bypasses network call immediately | *"AI currently offline — We've matched your answers using track rules."* |
| **Rate Limit (429) / Network Error** | Catches API exception safely | *"The AI is having a moment — We've matched your answers using track rules."* |
| **Timeout (> 9 seconds)** | Aborts request automatically | *"The AI took too long — We've matched you using local scoring instead."* |
| **Malformed / Invalid JSON** | Re-validated via Zod schema | *"The AI sent back something we couldn't use — Local scoring applied."* |
| **Client Disconnect** | Browser scores locally with JS | Seamless local match result without needing server connection |

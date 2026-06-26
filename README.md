# Medicine Tracker

A transplant medicine stock tracker — auto-deducts daily doses, shows days remaining per medicine.

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Create `.env` file
Copy `.env.example` to `.env` and fill in your Supabase credentials:
```
VITE_SUPABASE_URL=your_project_url
VITE_SUPABASE_ANON_KEY=your_anon_key
```

### 3. Set up Supabase
- Create a project at https://supabase.com
- Go to SQL Editor and run the contents of `supabase_schema.sql`
- Copy your Project URL and anon key into `.env`

### 4. Run locally
```bash
npm run dev
```

### 5. Deploy to Vercel
```bash
npx vercel
```
Then add your env variables in Vercel dashboard → Settings → Environment Variables.

## How it works
- Set the current stock count once via the Edit button
- App auto-deducts based on doses/day × days elapsed
- Tap "Add stock" when you buy new strips
- Green = stocked · Orange = running low (≤14 days) · Red = critical (≤7 days)

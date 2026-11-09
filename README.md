# Practo for Animals 🐾

A minimalist, calm, and responsive veterinary healthcare discovery platform built with **React**, **Vite**, **TypeScript**, **Tailwind CSS v4**, **React Router**, and **Framer Motion**.

Designed mobile-first with a serene aesthetic: generous whitespace, soft rounded corners (`rounded-2xl`), subtle shadows, thin 1px borders, and gentle transitions.

---

## ✨ Features

- **Theme System**: Full light & dark mode using CSS variables + Tailwind dark mode. Persisted in `localStorage` and respects system preferences with zero theme flash on load.
- **Mobile-First Experience**:
  - Compact header with smooth drawer navigation.
  - Native-feeling fixed bottom navigation bar (`Home`, `Search`, `Emergency`, `Profile`).
  - Mobile bottom-sheet filters & responsive toggle between List and interactive Map view.
- **Search & Discovery**:
  - Real-time client-side filtering by service type, animal type, distance slider (1–50 km), rating, price range, 24×7 emergency, open now, home visits, and verified-only.
  - Removable active filter chips & "Clear all" action.
  - Sorting: Nearest, Top Rated, Price Low-to-High.
  - Simulated interactive map placeholder with color-coded custom pins.
  - Skeleton loading states and friendly empty states.
- **Interactive Modals**:
  - **Submit a Correction**: Suggest edits for any clinic (with pre-filled provider details) saved to `localStorage`.
  - **List Your Business**: Multi-step onboarding form with progress indicators, validations, and storage.
- **Accessibility & Design**:
  - WCAG AA contrast standards in both light & dark modes.
  - Visible keyboard focus rings (`focus-visible`).
  - Motion control respecting `prefers-reduced-motion`.
  - Route-based lazy loading with dedicated page titles and SEO meta tags.

---

## 🎨 Color Palette

| Token | Light Mode | Dark Mode | Usage |
|---|---|---|---|
| **Background** | `#FAFAF7` | `#0F1411` | Calm off-white / deep charcoal |
| **Surface** | `#FFFFFF` | `#161D19` | Cards, modals, elevated containers |
| **Border** | `#ECECE6` | `#232C27` | Subtle 1px borders |
| **Text** | `#1F2A24` | `#E8EEE9` | Primary typography |
| **Muted** | `#6B7770` | `#93A199` | Secondary captions & details |
| **Primary** | `#5E8C73` | `#7FB297` | Soft sage green for branding |
| **Accent** | `#F2A57C` | `#F0A97F` | Warm peach for key CTAs |
| **Danger** | `#E58B86` | `#E58B86` | Soft coral for 24×7 emergency services |

---

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher recommended)
- npm / pnpm / yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/Tanish024/animal-pj1.git
cd animal-pj1

# Install dependencies
npm install

# Start development server
npm run dev
```

The application will be running locally at `http://localhost:5173/`.

### Building for Production

```bash
npm run build
```

---

## 🌐 Deploying to Vercel

### Option 1: Via Vercel Web Dashboard (Recommended)

1. Push your repository to GitHub (already configured with `https://github.com/Tanish024/animal-pj1.git`).
2. Go to [Vercel Dashboard](https://vercel.com/new).
3. Select **Import Git Repository** and choose `animal-pj1`.
4. Keep the default build settings:
   - **Framework Preset**: `Vite`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**. Vercel will build and assign a live production URL.

### Option 2: Via Vercel CLI

```bash
npm i -g vercel
vercel
```

Follow the CLI prompts to deploy directly from your terminal.

---

## 📁 Project Structure

```
src/
├── components/
│   ├── layout/
│   │   ├── Footer.tsx            # Multi-column footer with prototype notice
│   │   └── RootLayout.tsx        # Sticky header, drawer & mobile bottom nav
│   ├── modals/
│   │   ├── ListBusinessModal.tsx # 2-step provider registration form
│   │   └── SubmitCorrectionModal.tsx # Community correction modal
│   └── ui/                       # Reusable UI component library
│       ├── Badge.tsx
│       ├── BottomSheet.tsx
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Chip.tsx
│       ├── Container.tsx
│       ├── Input.tsx
│       ├── Modal.tsx
│       ├── Select.tsx
│       ├── Skeleton.tsx
│       └── ThemeToggle.tsx
├── data/
│   ├── constants.ts
│   └── providers.ts              # Mock provider database (14 realistic entities)
├── hooks/
│   ├── useDocTitle.ts            # Dynamic document title hook
│   └── useTheme.ts               # Theme management with localStorage & system preference
├── lib/
│   ├── types.ts                  # Shared layout & component interfaces
│   └── utils.ts                  # Zero-dependency className utility
├── pages/
│   ├── HomePage.tsx              # Hero, categories, nearby carousel, trust stats, banner
│   └── SearchPage.tsx            # Filters, results list, drawer, and interactive map
├── App.tsx                       # React Router configuration with lazy loading
├── index.css                     # Tailwind v4 theme, custom variants & reduced motion
└── main.tsx
```

---

## 📄 License

MIT License. Designed with care for every paw, hoof, wing & fin.

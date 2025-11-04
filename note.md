1000-cahaya/
├─ public/
│  ├─ icons/                    # aset statis umum
│  ├─ robots.txt
│  ├─ sw.js                     # service worker
│  └─ favicon.ico
├─ src/
│  ├─ app/
│  │  ├─ (marketing)/           # route group: landing, about, dsb.
│  │  │  ├─ page.tsx
│  │  │  └─ layout.tsx
│  │  ├─ (app)/                 # route group: area aplikasi setelah login
│  │  │  ├─ dashboard/
│  │  │  │  └─ page.tsx
│  │  │  ├─ settings/
│  │  │  │  └─ page.tsx
│  │  │  └─ layout.tsx
│  │  ├─ api/                   # route handlers (Next.js)
│  │  │  └─ health/route.ts
│  │  ├─ offline/page.tsx       # fallback offline
│  │  ├─ manifest.ts            # PWA manifest
│  │  ├─ sw-register.tsx        # SW register (client)
│  │  ├─ sw-updates.tsx         # notif versi baru (opsional)
│  │  ├─ layout.tsx             # root layout
│  │  └─ page.tsx               # homepage
│  ├─ components/
│  │  ├─ ui/                    # komponen UI atomik (button, input, card)
│  │  │  ├─ Button.tsx
│  │  │  ├─ Input.tsx
│  │  │  └─ index.ts            # barrel export
│  │  ├─ shared/                # komponen shareable (Navbar, Sidebar, Footer)
│  │  │  ├─ Navbar.tsx
│  │  │  ├─ Sidebar.tsx
│  │  │  └─ index.ts
│  │  └─ feedback/              # Alert, Toast, EmptyState, ErrorBoundary
│  │     ├─ EmptyState.tsx
│  │     └─ index.ts
│  ├─ features/                 # by-feature (domain modules)
│  │  ├─ auth/
│  │  │  ├─ components/
│  │  │  │  ├─ LoginForm.tsx
│  │  │  │  └─ ProfileMenu.tsx
│  │  │  ├─ hooks/
│  │  │  │  └─ useAuth.ts
│  │  │  ├─ services/
│  │  │  │  └─ auth.api.ts      # fetcher/SDK ke BE
│  │  │  ├─ actions.ts          # server actions (login, logout)
│  │  │  ├─ types.ts
│  │  │  └─ index.ts
│  │  ├─ projects/
│  │  │  ├─ components/         # ProjectCard, ProjectList, Filters
│  │  │  ├─ hooks/
│  │  │  ├─ services/           # projects.api.ts
│  │  │  ├─ state/              # zustand/reducer (opsional)
│  │  │  ├─ types.ts
│  │  │  └─ index.ts
│  │  └─ __tests__/             # test feature-level (Vitest/Jest)
│  ├─ hooks/                    # hooks generik (non-domain)
│  │  ├─ useDebounce.ts
│  │  ├─ useMediaQuery.ts
│  │  ├─ useOnlineStatus.ts
│  │  └─ index.ts
│  ├─ lib/                      # utilities, fetcher, constants, formatters
│  │  ├─ http.ts                # fetch wrapper (with cookies/token)
│  │  ├─ env.ts                 # zod-validated env
│  │  ├─ pwa.ts                 # helper PWA (prompt A2HS, etc)
│  │  ├─ logger.ts
│  │  └─ constants.ts
│  ├─ styles/
│  │  ├─ globals.css
│  │  └─ tokens.css             # warna/spacing/typography dari Figma (CSS vars)
│  ├─ types/
│  │  ├─ global.d.ts
│  │  └─ index.ts
│  └─ test/
│     ├─ setup-tests.ts         # setup testing lib
│     └─ __mocks__/
├─ .env.example                 # template env
├─ .eslintrc.mjs
├─ .prettierrc
├─ next.config.mjs
├─ postcss.config.mjs
├─ tailwind.config.ts
├─ package.json
└─ README.md

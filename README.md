# Stevia E-Commerce Web App

This project is a high-performance e-commerce web application originally built with Next.js, which has now been **fully migrated to React + Vite** to optimize build times, client-side rendering speed, and bundle size.

## 🚀 Key Updates & Improvements

### 1. Migration: Next.js to React + Vite
- **Framework Transition**: Successfully migrated the entire codebase from Next.js to a pure React application bundled with Vite.
- **Routing**: Replaced Next.js file-based routing with `react-router-dom`, preserving the original route structure and internationalization (`/:locale/...`).
- **ESM Standards**: Converted legacy CommonJS `require()` calls to modern ESM `import()` and dynamic `await import()` for full Vite compatibility.

### 2. Performance Optimizations
- **Code Splitting & Lazy Loading**: Implemented component and route-level code splitting using `React.lazy` and `Suspense` (e.g., modals, heavy route pages).
- **Bundle Optimization**: Configured `manualChunks` in Vite to split vendor libraries (React, Swiper, TanStack Query, etc.) out of the main bundle, drastically reducing initial load time.
- **State Management & Caching**: Fully integrated **TanStack Query (React Query v5)** for data fetching, caching, optimistic updates, and automatic background refetching.
- **Rendering Efficiency**: Applied `React.memo`, `useMemo`, and `useCallback` strategically to heavy components (like `ProductCard` and large lists) to prevent unnecessary re-renders.

### 3. Design & Layout Fixes
- **Global Responsive Fixes**: Resolved global layout overflow issues (removed unwanted horizontal scrollbars and ghost whitespace) by strictly enforcing `overflow-x: hidden` and `100vw` container constraints.
- **RTL/LTR Support**: Fixed directionality conflicts between Bootstrap grids and Arabic (RTL) layouts.
- **Exhibition & Modals UI**: Corrected grid structures (e.g., using `row-cols-*`), fixed image cropping, and resolved overlapping text issues in responsive views.
- **Mobile Experience**: Improved touch targets, mobile layouts, and modal alignments across various screen sizes.

---

## 💻 Tech Stack

- **Core**: React 19, Vite
- **Routing**: React Router DOM v7
- **Data Fetching**: TanStack Query (React Query v5)
- **Styling**: SCSS, Bootstrap
- **Internationalization**: React Intl (i18n)

---

## 🛠️ Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:3002` (or your configured port).*

## 📦 Production Build

To build the application for production:
```bash
npm run build
```

To preview the production build locally:
```bash
npm run preview
```

# Frontend Guideline Document

This document lays out the architecture, design principles, tooling, and best practices for the frontend of our AI-powered surgical education platform. It’s written in everyday language so that any team member—technical or not—can understand how the frontend is built and why.

## 1. Frontend Architecture

### Overview

*   **Framework**: React (create-react-app) for building a modular, component-based UI.
*   **Mobile/Responsive Support**: Expo (React Native) for responsive layouts and potential mobile clients.
*   **AI-Driven Components**: v0 (AI-powered component builder) for accelerating UI development and ensuring consistency.
*   **Boilerplate & Scaffolding**: Bolt for quick project setup with best practices baked in.
*   **Collaboration & AI Co-pilot**: Cline & Lovable.dev to generate code snippets, help with UI logic, and keep developers in sync.

### Scalability, Maintainability & Performance

*   **Modularity**: Breaking UI into reusable, isolated components makes it easy to maintain and extend.
*   **Code Splitting**: React’s lazy loading and dynamic imports keep initial bundles small.
*   **AI-Assisted Patterns**: v0 and Lovable.dev enforce consistent component patterns, reducing cognitive overhead.
*   **Continuous Integration**: Automated builds and tests on each commit ensure stability as the project grows.

## 2. Design Principles

### 1. Usability

*   Clear call-to-action buttons for uploading videos, starting analyses, and accessing feedback.
*   Simple, step-by-step workflows for non-technical users (students and instructors).

### 2. Accessibility (a11y)

*   Semantic HTML elements (e.g., `<button>`, `<nav>`, `<main>`).
*   ARIA roles and labels on interactive controls.
*   Keyboard navigation and focus indicators.
*   Contrast ratios meeting WCAG AA standards.

### 3. Responsiveness

*   Fluid grid layouts ensure the app works on desktops, tablets, and phones.
*   Expo styles adapt the same UI code to mobile viewports.
*   Touch-friendly controls and swipe support where appropriate.

### Applying Principles

*   Each screen starts with a wireframe reviewed for accessibility.
*   Components include built-in spacing, color states (hover, focus), and text scaling.
*   User testing sessions validate that workflows feel natural for medical students.

## 3. Styling and Theming

### Styling Approach

*   **Utility-First**: Tailwind CSS for rapid styling with utility classes (e.g., `p-4`, `text-gray-700`).
*   **Scoped CSS**: CSS Modules for component-specific styles where custom layout is needed.
*   **Pre-processor**: None—Tailwind’s JIT engine covers most needs without heavy SASS configuration.

### Theming

*   Central theme file (`theme.js`) defines colors, fonts, and spacing.
*   Dark/light mode toggles by switching CSS variables at the root level.

### Visual Style

*   **Look & Feel**: Modern, flat design with subtle shadows to distinguish panels (slightly soft glassmorphism for modals).

*   **Color Palette**:

    *   Primary: #0052CC (deep blue)
    *   Secondary: #00B8D9 (teal)
    *   Neutral Light: #F5F7FA (off-white)
    *   Neutral Dark: #343A40 (dark gray)
    *   Accent/Error: #E63946 (red)

*   **Font**: Inter (Google Font)—clean, highly legible for small labels and body text.

*   **Iconography**: Feather Icons set for simple, consistent icons.

## 4. Component Structure

### Organization

*   `/components`: Reusable UI pieces (buttons, form fields, cards).
*   `/features`: Domain-centric folders (e.g., `VideoUpload`, `FeedbackReview`). Each has its own components, hooks, and styles.
*   `/layouts`: Page layouts (DashboardLayout, AuthLayout) that wrap feature pages.

### Reusability & Consistency

*   Shared design tokens (colors, spacing) imported into each component.
*   All components accept common props: `className`, `style`, and where relevant, accessibility props.
*   v0-generated components follow a standard pattern: props, styling, state hooks.

### Benefits

*   Easy to track down and fix bugs in one component without affecting others.
*   New screens assembled quickly by composing existing components.

## 5. State Management

### Approach

*   **Redux Toolkit** for global state (user session, subscription status, notifications).
*   **React Context** for UI state (theme mode, modal open/close) that doesn’t need a full Redux store.

### Data Flow

1.  **Actions** trigger on user events (e.g., `uploadVideo`, `fetchUserProfile`).
2.  **Async Thunks** handle API calls to FastAPI endpoints.
3.  **Slices** manage loading, success, and error states.
4.  Components subscribe to slices via `useSelector`.

### Shared State

*   **Authentication**: Token, user roles, SSO session stored in Redux, with secure storage in HTTP-only cookies.
*   **Video Upload Progress**: Stored in Redux to allow progress bars across multiple pages.
*   **Notifications**: In-app banner state managed in Redux; email triggers on back end.

## 6. Routing and Navigation

### Library

*   **React Router v6** for web.
*   **React Navigation** under Expo (for any mobile view) using the same route names.

### Structure

*   **Public Routes**: `/login`, `/signup`, `/forgot-password`
*   **Protected Routes** (requires SSO login): `/dashboard`, `/upload`, `/analysis/:id`, `/resources`, `/admin`
*   **Nested Routes**: Dashboard has child routes for Overview, Progress, Subscription.

### Navigation Patterns

*   Top nav bar for primary screens (Dashboard, Resources, Admin).
*   Side menu on dashboard pages for deeper navigation (Uploads, Analyses, Reports).
*   Breadcrumbs in admin review pages to track the video → feedback → edit flow.

## 7. Performance Optimization

### Strategies

*   **Code Splitting & Lazy Loading**: Dynamically import heavy components (video player, charts).
*   **Bundle Analysis**: Use `source-map-explorer` to spot large dependencies.
*   **Image & Video Thumbnails**: Generate and serve small JPEG/PNG previews from S3 instead of full MP4 until playback.
*   **Memoization**: `React.memo`, `useMemo`, and `useCallback` for expensive renders.
*   **Debouncing**: User inputs (search filters) are debounced to reduce renders.
*   **CDN**: Serve static assets via AWS CloudFront.

### Impact

*   Faster initial page load (<2s on 3G throttling).
*   Smooth dashboard interactions even with large data sets.

## 8. Testing and Quality Assurance

### Unit Testing

*   **Jest** with **React Testing Library** for individual components and hooks.
*   Mock Redux store and API calls using **MSW (Mock Service Worker)**.

### Integration Testing

*   Test flows like video upload → AI analysis → feedback display in a staging environment.
*   Use React Testing Library to render multiple components together.

### End-to-End Testing

*   **Cypress** for automating user flows: sign in via SSO, upload a video, view feedback.
*   Tests run on CI against a test deployment to catch regressions early.

### Code Quality

*   **ESLint** (with Airbnb rules) and **Prettier** for consistent formatting.
*   **Pre-commit Hooks** (Husky) to run lint, tests, and type checks before each push.

## 9. Conclusion and Overall Frontend Summary

Our frontend setup uses React and Expo at its core, enriched by AI-powered tools (v0, Lovable.dev, Bolt, Cline) that speed up development and enforce consistency. We follow clear design principles—usability, accessibility, responsiveness—and a modern, flat design style with a well-defined color palette and typography. A component-based architecture, combined with Redux Toolkit and React Router, provides a scalable and maintainable codebase. Performance optimizations keep the app snappy, while thorough testing (Jest, RTL, Cypress) ensures reliability.

By following these guidelines, any developer or stakeholder can understand how our frontend is structured, why certain choices were made, and how to continue building a robust, user-friendly surgical education platform that meets HIPAA and institutional requirements.

*End of Frontend Guideline Document*

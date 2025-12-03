# Kumar Sreyan Pattanayak - Personal Portfolio 🚀

A modern, accessible, and high-performance personal portfolio website built with HTML5, CSS3, and JavaScript. This project showcases my skills, projects, and professional journey.

🔗 Live Demo: [https://ksreyan0725.github.io/My_personal_portfolio/](https://ksreyan0725.github.io/My_personal_portfolio/)

---

## 📖 Project Overview

This portfolio is designed to be a comprehensive showcase of my work as a BCA student and technology enthusiast. It features a clean, minimalist user interface that focuses on typography and whitespace to create a professional reading experience.

The site includes a fully responsive layout that adapts seamlessly to mobile, tablet, and desktop screens. It also features an advanced dark mode 🌓 that can automatically switch between light and dark themes based on the time of day (7 AM to 7 PM), ensuring a comfortable viewing experience at all times.

## ✨ Key Features

### Progressive Web App (PWA) 📱
The website is built as a Progressive Web App, meaning it can be installed as a native application on both mobile and desktop devices. Features include:
- Smart Install System: Dedicated install section in Settings Panel with automatic platform detection.
- Update Notifications: Automatic alerts when a new version is available.
- Offline Support: Advanced Service Worker with stale-while-revalidate caching strategy.
- Share Target: Receive shared content (text/links) from other apps directly into the contact form.
- File Handling: Native support for opening PDF files.

### User Experience Enhancements
- Skeleton Loading: Smooth loading states for improved perceived performance.
- Print Optimization: Dedicated print stylesheet for clean hard copies.
- Enhanced Preloader: Dual spinning circles animation with gradient loading bar.
- Smooth Scrolling: Powered by Lenis library for buttery-smooth navigation.
- Mobile Sidebar: Swipe-enabled navigation menu with gesture support.
- Night Light Mode: Reduces blue light on mobile devices.
- Project Filtering: Filter projects by category (Web Dev, Research).

### Accessibility ♿
The site adheres to WCAG 2.1 AA standards:
- Visual Focus Indicators: Clear outlines for keyboard navigation.
- Screen reader friendly with proper ARIA labels.
- Full keyboard navigation support.
- Respects user preferences for reduced motion.

### Search Engine Optimization (SEO) 🔍
- Comprehensive meta tags for social sharing.
- Structured data (JSON-LD) for rich search results.
- Semantic HTML5 markup.
- DNS Prefetching for faster external resource loading.

## 🛠️ Technology Stack

The project is built using standard web technologies:
- HTML5 for semantic structure
- CSS3 with custom properties (CSS variables) for theming
- JavaScript (ES6+) for logic and interactivity
- Lenis for smooth scrolling
- Service Worker for offline functionality

Hosted on GitHub Pages with automatic deployment.

## 📂 Project Structure

```
My_personal_portfolio/
├── assets/
│   ├── css/
│   │   ├── style.css           # Main stylesheet
│   │   ├── responsive.css      # Responsive design rules
│   │   ├── skeleton.css        # Skeleton loading states
│   │   ├── print.css           # Print-specific styles
│   │   ├── preloader.css       # Loading animation styles
│   │   ├── install-button.css  # PWA install button styles
│   │   └── theme-schedule.css  # Theme scheduling styles
│   ├── js/
│   │   ├── constants.js        # Global configuration
│   │   └── theme-schedule.js   # Theme logic
│   ├── icons/                  # App icons and UI elements
│   ├── images/                 # Profile photos and assets
│   └── docs/                   # PDF documents (resume, research)
├── pages/
│   ├── 404.html               # Custom error page
│   ├── thankyou.html          # Form submission confirmation
│   └── pdf-viewer.html        # PDF document viewer
├── index.html                 # Main landing page
├── contact.html               # Contact form page
├── script.js                  # Main application logic
├── sw.js                      # Service Worker for PWA
└── manifest.json              # PWA manifest file
```

## 🧪 Testing

The project undergoes rigorous testing to ensure quality:
- Cross-browser testing on Chrome, Firefox, Safari, and Edge
- Responsive testing across mobile, tablet, and desktop viewports
- Accessibility testing using screen readers and keyboard navigation
- Performance testing with Lighthouse CI
- PWA validation using Chrome DevTools

## 📊 Version Information

Current Version: 1.2
- Version tracking is displayed in the Settings Panel.
- Updates are automatically detected via the Service Worker.

## 📄 License

This project is distributed under the MIT License.

---

Made with ❤️ by Kumar Sreyan Pattanayak

Last Updated: 3 December 2025

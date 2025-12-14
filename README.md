# 💼 Kumar Sreyan Pattanayak - Personal Portfolio

A modern, accessible, and high-performance personal portfolio website built with HTML5, CSS3, and JavaScript. This project showcases my skills, projects, and professional journey.

🌐 Live Demo: https://ksreyan0725.github.io/My_personal_portfolio/ 
---

## 📋 Project Overview

This portfolio website is designed to be fast, accessible, and user-friendly. It features a clean, modern design with smooth animations and transitions. The site is fully responsive and works seamlessly across all devices and screen sizes.

Hosted on GitHub Pages with automatic deployment.

## ✨ Key Features

### 📱 Progressive Web App (PWA)
The website is built as a Progressive Web App, meaning it can be installed as a native application on both mobile and desktop devices. Features include:
- Smart Install System: Dedicated install section in Settings Panel with automatic platform detection
- Update Notifications: Automatic alerts when a new version is available
- Offline Support: Service Worker enables offline browsing with intelligent caching
- App-like Experience: Runs in standalone mode without browser UI when installed
- Cross-Platform: Works on iOS, Android, Windows, macOS, and Linux

### 🎨 User Experience Enhancements
- Dark/Light Theme Toggle: Persistent theme preference with smooth transitions
- Smooth Scrolling: Enhanced navigation with scroll-to-section functionality
- Interactive Elements: Hover effects, animations, and micro-interactions
- Responsive Design: Optimized layouts for mobile, tablet, and desktop
- Settings Panel: Centralized control for theme, PWA installation, and preferences
- Mobile Sidebar: Swipe-enabled navigation with gesture support
- Search Functionality: Quick search across projects and content

### ♿ Accessibility
- Semantic HTML5 structure for better screen reader support
- ARIA labels and roles for improved navigation
- Keyboard navigation support throughout the site
- High contrast ratios for text readability
- Focus indicators for interactive elements

### 🔍 Search Engine Optimization (SEO)
- Optimized meta tags and descriptions
- Structured data markup
- Fast page load times
- Mobile-first indexing ready

## 🛠️ Technology Stack

- Frontend: HTML5, CSS3, JavaScript (ES6+)
- PWA: Service Workers, Web App Manifest
- Architecture: Modular ES6 modules for better performance
- Hosting: GitHub Pages
- Version Control: Git

### 🏗️ Modular JavaScript Architecture (New in v3.3)
The codebase uses a modern modular architecture with 10 focused ES6 modules:
- `preloader.js` - FOUC prevention & early initialization
- `utils.js` - Shared utilities & helper functions
- `theme.js` - Complete theme management system
- `sidebar.js` - Mobile sidebar with swipe gestures
- `settings.js` - Settings panel & user preferences
- `search.js` - Search functionality & indexing
- `pwa.js` - PWA installation & management
- `navigation.js` - Active navigation & scroll observers
- `features.js` - Skill bars, projects, accessibility
- `security.js` - Link validation & security features

## 📁 Project Structure

```
My_personal_portfolio/
|-- assets/
    |-- css/
    |   |-- contact.css
    |   |-- core.css
    |   |-- install-button.css
    |   |-- navigation.css
    |   |-- preloader.css
    |   |-- print.css
    |   |-- responsive.css
    |   |-- search.css
    |   |-- settings-fix.css
    |   |-- settings.css
    |   |-- sidebar.css
    |   |-- skeleton.css
    |   |-- theme-schedule.css
    |-- docs/
    |   |-- kumar-sreyan-pattanayak-resume.pdf
    |   |-- systemic-failures-in-india-copy.pdf
    |-- icons/
    |-- images/
    |-- js/
    |   |-- modules/
    |       |-- features.js
    |       |-- navigation.js
    |       |-- preloader.js
    |       |-- pwa.js
    |       |-- search.js
    |       |-- security.js
    |       |-- settings.js
    |       |-- sidebar.js
    |       |-- theme.js
    |       |-- utils.js
    |   |-- constants.js
    |   |-- contact.js
    |   |-- main.js
    |   |-- theme-schedule.js
|-- pages/
    |-- 404.html
    |-- maintenance.html
    |-- pdf-viewer.html
    |-- thank-you.html
|-- contact.html
|-- DOCUMENTATION.md
|-- index.html
|-- manifest.json
|-- purgecss.config.js
|-- README.md
|-- robots.txt
|-- service-worker.js
|-- sitemap.xml
|-- sw.js
```

## 🧪 Testing

The website has been tested across:
- Browsers: Chrome, Firefox, Safari, Edge
- Devices: Desktop, Tablet, Mobile
- Screen Sizes: 320px to 4K displays
- Accessibility: WCAG 2.1 Level AA compliance
- Performance: Lighthouse scores 90+ across all metrics

---

📚 For detailed version history and features, see [DOCUMENTATION.md](DOCUMENTATION.md)

## 📄 License

This project is distributed under the MIT License.

---

Made with ❤️ by **Kumar Sreyan Pattanayak**  
📌 Version: 3.4.4  
📅 Last Updated: 15 December 2025

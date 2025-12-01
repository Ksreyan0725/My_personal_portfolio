# Kumar Sreyan Pattanayak - Personal Portfolio 🚀

A modern, accessible, and high-performance personal portfolio website built with HTML5, CSS3, and JavaScript. This project showcases my skills, projects, and professional journey.

🔗 Live Demo: https://ksreyan0725.github.io/My_personal_portfolio/

---

## 📖 Project Overview

This portfolio is designed to be a comprehensive showcase of my work as a BCA student and technology enthusiast. It features a clean, minimalist user interface that focuses on typography and whitespace to create a professional reading experience.

The site includes a fully responsive layout that adapts seamlessly to mobile, tablet, and desktop screens. It also features an advanced dark mode 🌓 that can automatically switch between light and dark themes based on the time of day (7 AM to 7 PM), ensuring a comfortable viewing experience at all times.

## ✨ Key Features

### Progressive Web App (PWA) 📱
The website is built as a Progressive Web App, meaning it can be installed as a native application on both mobile and desktop devices. Features include:
- App Installation: Dedicated install section in Settings Panel with smart state detection
- Offline Support: Service Worker enables offline access to the site
- Version Tracking: Displays current version based on git commit count
- Platform-Specific Instructions: Automatic detection and guidance for iOS vs Android/Desktop installation

### User Experience Enhancements
- Preloader Animation: Smooth loading animation with branded "KSP" logo on initial page load
- Smooth Scrolling: Powered by Lenis library for buttery-smooth navigation
- Mobile Sidebar: Swipe-enabled navigation menu with gesture support
- Night Light Mode: Reduces blue light on mobile devices for comfortable evening viewing
- Settings Panel: Comprehensive settings including theme selection, notifications, and app installation

### Accessibility ♿
The site adheres to WCAG 2.1 AA standards:
- Screen reader friendly with proper ARIA labels
- Full keyboard navigation support
- Respects user preferences for reduced motion
- Skip navigation links for improved accessibility

### Search Engine Optimization (SEO) 🔍
- Comprehensive meta tags for social sharing (Open Graph and Twitter Cards)
- Structured data (JSON-LD) for rich search results
- Semantic HTML5 markup
- Optimized performance scores

## 🛠️ Technology Stack

The project is built using standard web technologies:
- HTML5 for semantic structure
- CSS3 with custom properties (CSS variables) for theming
- JavaScript (ES6+) for logic and interactivity
- Lenis (`@studio-freight/lenis`) for smooth scrolling
- Service Worker for offline functionality and caching

Hosted on GitHub Pages with automatic deployment.

## 📂 Project Structure

```
My_personal_portfolio/
├── assets/
│   ├── css/
│   │   ├── style.css           # Main stylesheet
│   │   ├── responsive.css      # Responsive design rules
│   │   ├── preloader.css       # Loading animation styles
│   │   └── install-button.css  # PWA install button styles
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

## 🚦 Running Locally

To run this project on your local machine:

1. Clone the repository:
   ```bash
   git clone https://github.com/Ksreyan0725/My_personal_portfolio.git
   cd My_personal_portfolio
   ```

2. Serve the files using any static file server:
   
   Option 1: Python
   ```bash
   python -m http.server 8000
   ```
   
   Option 2: Node.js (http-server)
   ```bash
   npx http-server
   ```
   
   Option 3: VS Code Live Server
   - Install the Live Server extension
   - Right-click `index.html` and select "Open with Live Server"

3. Access the site at `http://localhost:8000` (or the port shown by your server)

## 🧪 Testing

The project undergoes rigorous testing to ensure quality:
- Cross-browser testing on Chrome, Firefox, Safari, and Edge
- Responsive testing across mobile, tablet, and desktop viewports
- Accessibility testing using screen readers and keyboard navigation
- Performance testing with Lighthouse CI
- PWA validation using Chrome DevTools

## 📊 Version Information

The portfolio uses git commit count for version tracking. Current version is displayed in the Settings Panel under the App section.

## 📄 License

This project is distributed under the MIT License.

---

Made with ❤️ by Kumar Sreyan Pattanayak

Last Updated: 1 December 2025

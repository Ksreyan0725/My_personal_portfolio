# Kumar Sreyan Pattanayak - Personal Portfolio

![Portfolio Preview](assets/images/screenshot-desktop.png)

A modern, accessible, and high-performance personal portfolio website built with HTML5, CSS3, and JavaScript. This project showcases my skills, projects, and professional journey.

🔗 **Live Demo:** [https://ksreyan0725.github.io/My_personal_portfolio/](https://ksreyan0725.github.io/My_personal_portfolio/)

---

## 🚀 Key Features

### 🎨 Design & UX
- **Modern UI:** Clean, minimalist design with a focus on typography and whitespace.
- **Advanced Dark Mode:** 
  - System preference detection.
  - **Auto-Switching:** Automatically toggles between light and dark modes based on time of day (7 AM - 7 PM).
  - Smooth color transitions.
- **Responsive:** Fully responsive layout that works seamlessly on mobile, tablet, and desktop.
- **Animations:** Smooth scrolling (Lenis), micro-interactions, and page transitions.

### 📱 Progressive Web App (PWA)
- **Installable:** Can be installed as a native app on mobile and desktop.
- **Offline Support:** Works offline using a Service Worker with caching strategies.
- **App-like Experience:** Standalone display mode, custom icons, and splash screen.

### ♿ Accessibility (WCAG 2.1 AA)
- **Screen Reader Friendly:** Semantic HTML, ARIA labels, and proper heading hierarchy.
- **Keyboard Navigation:** Full keyboard support with visible focus indicators.
- **Reduced Motion:** Respects user's motion preferences.

### 🔍 SEO Optimized
- **Meta Tags:** Comprehensive Open Graph and Twitter Card tags for social sharing.
- **Structured Data:** JSON-LD schema for rich search results.
- **Performance:** Optimized assets and lazy loading for fast load times.

---

## 🛠️ Tech Stack

- **Frontend:** HTML5, CSS3 (Custom Properties), JavaScript (ES6+)
- **Libraries:** 
  - [@studio-freight/lenis](https://github.com/studio-freight/lenis) (Smooth Scrolling)
  - [Font Awesome](https://fontawesome.com/) (Icons)
- **Tools:** Git, GitHub Actions (Lighthouse CI)
- **Hosting:** GitHub Pages

---

## 📂 Project Structure

```
My_personal_portfolio/
├── assets/
│   ├── css/            # Stylesheets (style.css, responsive.css)
│   ├── images/         # Images and screenshots
│   └── icons/          # PWA icons and favicons
├── pages/              # Secondary pages (404, thank-you, maintenance)
├── .github/            # GitHub Actions workflows
├── index.html          # Main entry point
├── contact.html        # Contact page
├── script.js           # Main application logic
├── sw.js               # Service Worker
├── manifest.json       # PWA Manifest
└── lighthouserc.json   # Lighthouse CI config
```

---

## 🚦 Running Locally

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Ksreyan0725/My_personal_portfolio.git
   ```

2. **Navigate to the project directory:**
   ```bash
   cd My_personal_portfolio
   ```

3. **Serve the project:**
   You can use any static file server. For example, with Python:
   ```bash
   python -m http.server 8000
   ```
   Or with VS Code Live Server extension.

4. **Open in browser:**
   Go to `http://localhost:8000`

---

## 🧪 Testing

This project uses **Lighthouse CI** for automated performance and accessibility auditing.

- **Manual Testing:** Verified on Chrome, Firefox, Safari, and Edge.
- **Automated Testing:** Runs on every push to the `main` branch.

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

Made with ❤️ by [Kumar Sreyan Pattanayak](https://github.com/Ksreyan0725)

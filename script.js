// Portfolio Website JavaScript

document.addEventListener('DOMContentLoaded', () => {
    /* ==================== Enhanced Dark Mode Toggle with Ripple ==================== */
    const darkModeToggle = document.getElementById('darkModeToggle');
    const htmlElement = document.documentElement;
    
    // Ripple animation function
    function createRipple(event) {
        const button = event.currentTarget;
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.className = 'ripple';
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        button.appendChild(ripple);
        
        // Remove ripple after animation
        setTimeout(() => ripple.remove(), 600);
    }
    
    // Full-page theme transition ripple
    function createPageRipple(event) {
        const ripple = document.createElement('div');
        const rect = event.currentTarget.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        ripple.className = 'page-ripple';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        document.body.appendChild(ripple);
        
        // Remove after animation
        setTimeout(() => ripple.remove(), 800);
    }
    
    if (darkModeToggle) {
        const toggleIcon = darkModeToggle.querySelector('.toggle-icon');

        // Load saved theme preference
        const savedTheme = localStorage.getItem('theme') || 'light';
        htmlElement.setAttribute('data-theme', savedTheme);
        document.body.classList.toggle('darkmode', savedTheme === 'dark');
        toggleIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';

        darkModeToggle.addEventListener('click', (event) => {
            // Create button ripple
            createRipple(event);
            
            // Create page transition ripple
            createPageRipple(event);
            
            // Toggle theme
            const currentTheme = htmlElement.getAttribute('data-theme');
            const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
            
            htmlElement.setAttribute('data-theme', newTheme);
            document.body.classList.toggle('darkmode');
            
            if (newTheme === 'dark') {
                toggleIcon.textContent = '☀️';
                localStorage.setItem('theme', 'dark');
            } else {
                toggleIcon.textContent = '🌙';
                localStorage.setItem('theme', 'light');
            }
        });
    }
    

    /* ==================== Mobile Navigation Toggle ==================== */
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    /* ==================== Smooth Scrolling & Active Nav ==================== */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar ? navbar.getBoundingClientRect().height : 0;

    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', e => {
            e.preventDefault();
            const target = document.querySelector(anchor.getAttribute('href'));
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - navbarHeight - 20,
                    behavior: 'smooth'
                });
            }
        });
    });

    function highlightActiveNav() {
        const scrollPos = window.scrollY + 100;
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-link[href="#${id}"]`);
                if (activeLink) activeLink.classList.add('active');
            }
        });
    }

    /* ==================== Skill Bars Animation ==================== */
    function animateSkillBars() {
        document.querySelectorAll('.progress').forEach(bar => {
            const value = bar.getAttribute('data-value');
            bar.style.width = value + '%';
            bar.textContent = value + '%';
        });
    }

    /* ==================== Intersection Observer for Animations ==================== */
    const observerOptions = { threshold: 0.3, rootMargin: '0px 0px -50px 0px' };
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (!entry.isIntersecting) return;
            const target = entry.target;

            if (target.classList.contains('skills')) animateSkillBars();
            if (target.classList.contains('achievement-card') || 
                target.classList.contains('detail-item') ||
                target.classList.contains('timeline-item')) {
                target.style.opacity = '1';
                target.style.transform = 'translateY(0)';
            }
        });
    }, observerOptions);

    document.querySelectorAll('.skills, .achievement-card, .detail-item, .timeline-item').forEach(el => {
        if (el.classList.contains('achievement-card') || 
            el.classList.contains('detail-item') ||
            el.classList.contains('timeline-item')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        }
        observer.observe(el);
    });

    // Trigger animations for elements already visible on page load
document.querySelectorAll('.skills, .achievement-card, .detail-item, .timeline-item').forEach(el => {
    if (el.getBoundingClientRect().top < window.innerHeight) {
        if (el.classList.contains('skills')) animateSkillBars();
        else {
            el.style.opacity = '1';
            el.style.transform = 'translateY(0)';
        }
    }
});

    /* ==================== Contact Form Handling ==================== */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', e => {
            e.preventDefault();
            const formData = new FormData(contactForm);
            const name = formData.get('name').trim();
            const email = formData.get('email').trim();
            const message = formData.get('message').trim();

            if (!validateForm(name, email, message)) return;

            const submitButton = contactForm.querySelector('.submit-button');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            setTimeout(() => {
                showNotification('Thank you! Your message has been sent successfully.', 'success');
                contactForm.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 2000);
        });
    }

    function validateForm(name, email, message) {
        clearErrorMessages();
        let isValid = true;
        if (name.length < 2) { showFieldError('name', 'Name must be at least 2 characters long'); isValid = false; }
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) { showFieldError('email', 'Please enter a valid email address'); isValid = false; }
        if (message.length < 10) { showFieldError('message', 'Message must be at least 10 characters long'); isValid = false; }
        return isValid;
    }

    function showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const formGroup = field.closest('.form-group');
        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }
        errorElement.textContent = message;
        field.style.borderColor = '#e74c3c';
    }

    function clearErrorMessages() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
            field.style.borderColor = '#e0e0e0';
        });
    }

    function showNotification(message, type = 'info') {
        document.querySelectorAll('.notification').forEach(el => el.remove());
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        Object.assign(notification.style, {
            position: 'fixed', top: '20px', right: '20px',
            padding: '15px 20px', borderRadius: '5px',
            color: 'white', fontWeight: '500', zIndex: '9999',
            transform: 'translateX(100%)', transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'
        });
        document.body.appendChild(notification);
        setTimeout(() => notification.style.transform = 'translateX(0)', 100);
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    /* ==================== Navbar Scroll Effects & Hide/Show ==================== */
    let lastScrollTop = 0;
    if (navbar) {
        // Position, width, and top are already set in CSS - don't override
        // Only set transform transition for hide/show effect
        navbar.style.transition = 'transform 0.3s ease-in-out, box-shadow 0.3s ease';

        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;

            // Hide/Show Navbar
            if (scrollTop > lastScrollTop && scrollTop > navbarHeight) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }

            // Enhanced shadow & Active Nav highlighting
            handleNavbarScroll();
            highlightActiveNav();

            lastScrollTop = scrollTop;
        });
    }

    function handleNavbarScroll() {
        if (!navbar) return;
        const theme = htmlElement.getAttribute('data-theme') || 'light';
        
        if (window.scrollY > 50) {
            // Enhanced shadow on scroll, but keep the gradient background from CSS
            if (theme === 'dark') {
                navbar.style.boxShadow = '0 4px 25px rgba(0, 0, 0, 0.5)';
            } else {
                navbar.style.boxShadow = '0 4px 25px rgba(0, 0, 0, 0.15)';
            }
            // Add backdrop blur for glass effect
            navbar.style.backdropFilter = 'blur(10px)';
        } else {
            // Default shadow from CSS
            navbar.style.boxShadow = '';
            navbar.style.backdropFilter = '';
        }
        // Never override the background - let CSS handle it
    }

    /* ==================== Typing Animation ==================== */
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';
        (function type() {
            if (i < text.length) { element.textContent += text.charAt(i); i++; setTimeout(type, speed); }
        })();
    }

    const taglineElement = document.querySelector('.tagline');
    if (taglineElement) {
        const originalText = taglineElement.textContent;
        setTimeout(() => typeWriter(taglineElement, originalText, 80), 1000);
    }

    /* ==================== 'Don't click' Button ==================== */
    const dontClickBtn = document.getElementById('dont-click');
    if (dontClickBtn) {
        dontClickBtn.addEventListener('click', (e) => {
            e.preventDefault();
            // playful shake and a warning notification
            dontClickBtn.classList.add('shake');
            try {
                showNotification("I told you not to click. 😄", 'error');
            } catch (_) {
                // fallback alert if notification isn't available for some reason
                alert("I have told you not to click 😄");
            }
            setTimeout(() => dontClickBtn.classList.remove('shake'), 600);
        });
    }

    /* ==================== Inject CSS ==================== */
    const style = document.createElement('style');
    style.textContent = `
        .error-message { color: #e74c3c; font-size: 0.9rem; margin-top: 0.5rem; }
        .nav-link.active { color: #3498db; }
        .hamburger.active .bar:nth-child(1) { transform: rotate(45deg) translate(5px, 5px); }
        .hamburger.active .bar:nth-child(2) { opacity: 0; }
        .hamburger.active .bar:nth-child(3) { transform: rotate(-45deg) translate(7px, -6px); }
        @keyframes fadeInUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        .fade-in-up { animation: fadeInUp 0.6s ease forwards; }
    `;
    document.head.appendChild(style);

    console.log('Portfolio website JavaScript loaded successfully!');
});
 
// ==================== Contact Button with Existence Check ====================

  document.getElementById("contactBtn").addEventListener("click", function (event) {
    event.preventDefault(); // stop default redirect
    const fileUrl = this.getAttribute("href");

    fetch(fileUrl, { method: "HEAD" })
      .then(response => {
        if (response.ok) {
          // ✅ Page exists → go there
          window.location.href = fileUrl;
        } else {
          // ❌ Missing → go to 404 page
          window.location.href = "404.html";
        }
      })
      .catch(() => {
        // ❌ Any error → go to 404 page
        window.location.href = "404.html";
      });
  });

// End of script.js
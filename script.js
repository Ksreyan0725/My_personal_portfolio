// Modern Portfolio JavaScript with Ripple Animations

document.addEventListener('DOMContentLoaded', () => {
    const htmlElement = document.documentElement;

    /* ==================== Dark Mode Toggle with Ripple Effect ==================== */
    const darkModeToggle = document.getElementById('darkModeToggle');
    
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
            
            // Toggle theme with a slight delay for smooth animation
            setTimeout(() => {
                const currentTheme = htmlElement.getAttribute('data-theme');
                const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
                
                htmlElement.setAttribute('data-theme', newTheme);
                document.body.classList.toggle('darkmode');
                toggleIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
                localStorage.setItem('theme', newTheme);
            }, 200);
        });
    }

    /* ==================== Mobile Navigation ==================== */
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking nav links
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    /* ==================== Smooth Scrolling & Active Navigation ==================== */
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');

    // Highlight active section in navigation
    function highlightActiveNav() {
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const top = section.offsetTop;
            const height = section.offsetHeight;
            const id = section.getAttribute('id');

            if (scrollPos >= top && scrollPos < top + height) {
                navLinks.forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }

    window.addEventListener('scroll', highlightActiveNav);
    highlightActiveNav(); // Call on load

    /* ==================== Skill Bars Animation ==================== */
    let skillBarsAnimated = false;
    
    function animateSkillBars() {
        if (skillBarsAnimated) return; // Prevent re-animation
        skillBarsAnimated = true;
        
        document.querySelectorAll('.progress').forEach((bar, index) => {
            const value = bar.getAttribute('data-value');
            if (value) {
                // Delay each bar animation slightly for a staggered effect
                setTimeout(() => {
                    bar.style.width = value + '%';
                    
                    // Animate percentage number from 0 to final value
                    let currentPercent = 0;
                    const targetPercent = parseInt(value);
                    const increment = Math.max(targetPercent / 30, 1); // avoid 0-step
                    
                    const percentInterval = setInterval(() => {
                        currentPercent += increment;
                        if (currentPercent >= targetPercent) {
                            currentPercent = targetPercent;
                            clearInterval(percentInterval);
                        }
                        const display = Math.round(currentPercent);
                        // Update both the fill and its container so CSS can read it from the container
                        bar.setAttribute('data-value', display);
                        if (bar.parentElement) {
                            bar.parentElement.setAttribute('data-value', display);
                        }
                    }, 50);
                }, index * 100); // 100ms delay between each bar
            }
        });
    }

    /* ==================== Intersection Observer for Animations ==================== */
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Animate skill bars when skills section is visible
                if (entry.target.classList.contains('skills')) {
                    animateSkillBars();
                }
                
                // Fade in animation for cards
                entry.target.classList.add('fade-in');
            }
        });
    }, observerOptions);

    // Observe sections for animations
    document.querySelectorAll('.skills, .achievement-card, .detail-item, .timeline-item').forEach(el => {
        observer.observe(el);
    });

    /* ==================== Contact Form ==================== */
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const formData = new FormData(contactForm);
            const name = formData.get('name').trim();
            const email = formData.get('email').trim();
            const message = formData.get('message').trim();

            // Basic validation
            if (!name || !email || !message) {
                alert('Please fill in all fields.');
                return;
            }

            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                alert('Please enter a valid email address.');
                return;
            }

            // Simulate form submission
            const submitButton = contactForm.querySelector('.submit-button');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            setTimeout(() => {
                alert('Thank you for your message! I will get back to you soon.');
                contactForm.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 2000);
        });
    }

    /* ==================== Navbar Hide/Show on Scroll ==================== */
    const navbar = document.querySelector('.navbar');
    let lastScrollTop = 0;

    if (navbar) {
        window.addEventListener('scroll', () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            
            // Hide navbar on scroll down, show on scroll up
            if (scrollTop > lastScrollTop && scrollTop > 100) {
                navbar.style.transform = 'translateY(-100%)';
            } else {
                navbar.style.transform = 'translateY(0)';
            }
            
            lastScrollTop = scrollTop;
        });
    }

});

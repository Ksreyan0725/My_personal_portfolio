// Portfolio Website JavaScript

// Dark Mode Toggle Function
function initDarkMode() {
    const darkModeToggle = document.getElementById('darkModeToggle');
    const toggleIcon = darkModeToggle.querySelector('.toggle-icon');
    
    // Check for saved preference
    if (localStorage.getItem('darkMode') === 'enabled') {
        document.body.classList.add('darkmode');
        toggleIcon.textContent = '☀️';
    }

    // Toggle dark mode
    darkModeToggle.addEventListener('click', () => {
        document.body.classList.toggle('darkmode');
        
        // Update icon and save preference
        if (document.body.classList.contains('darkmode')) {
            toggleIcon.textContent = '☀️';
            localStorage.setItem('darkMode', 'enabled');
        } else {
            toggleIcon.textContent = '🌙';
            localStorage.setItem('darkMode', null);
        }
    });
}

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize Dark Mode
    initDarkMode();
    
    // Mobile Navigation Toggle
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    function toggleMobileMenu() {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    }
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', toggleMobileMenu);
        
        // Close mobile menu when clicking on nav links
        document.querySelectorAll('.nav-link').forEach(n => 
            n.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            })
        );
    }
    
    // Smooth Scrolling for Navigation Links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const navHeight = document.querySelector('.navbar').offsetHeight;
                const targetPosition = targetSection.offsetTop - navHeight - 20;
                
                window.scrollTo({
                    top: targetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Active Navigation Link Highlighting
    const sections = document.querySelectorAll('section[id]');
    const navLinks = document.querySelectorAll('.nav-link');
    
    function highlightActiveNav() {
        const scrollPos = window.scrollY + 100;
        
        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');
            
            if (scrollPos >= sectionTop && scrollPos < sectionTop + sectionHeight) {
                navLinks.forEach(link => link.classList.remove('active'));
                const activeLink = document.querySelector(`.nav-link[href="#${sectionId}"]`);
                if (activeLink) {
                    activeLink.classList.add('active');
                }
            }
        });
    }
    
    // Skill Bars Animation
    function animateSkillBars() {
        const skillBars = document.querySelectorAll('.skill-progress');
        
        skillBars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-width');
            if (targetWidth) {
                bar.style.width = targetWidth + '%';
            }
        });
    }
    
    // Intersection Observer for Animations
    const observerOptions = {
        threshold: 0.3,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = entry.target;
                
                // Animate skill bars when skills section comes into view
                if (target.classList.contains('skills')) {
                    animateSkillBars();
                }
                
                // Add fade-in animation to cards
                if (target.classList.contains('achievement-card') || 
                    target.classList.contains('detail-item') ||
                    target.classList.contains('timeline-item')) {
                    target.style.opacity = '1';
                    target.style.transform = 'translateY(0)';
                }
            }
        });
    }, observerOptions);
    
    // Observe sections and elements for animations
    document.querySelectorAll('.skills, .achievement-card, .detail-item, .timeline-item').forEach(el => {
        // Set initial state for animated elements
        if (el.classList.contains('achievement-card') || 
            el.classList.contains('detail-item') ||
            el.classList.contains('timeline-item')) {
            el.style.opacity = '0';
            el.style.transform = 'translateY(30px)';
            el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        }
        
        observer.observe(el);
    });
    
    // Contact Form Handling
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data
            const formData = new FormData(contactForm);
            const name = formData.get('name').trim();
            const email = formData.get('email').trim();
            const message = formData.get('message').trim();
            
            // Validate form
            if (!validateForm(name, email, message)) {
                return;
            }
            
            // Show loading state
            const submitButton = contactForm.querySelector('.submit-button');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Simulate form submission (replace with actual form handling)
            setTimeout(() => {
                showNotification('Thank you! Your message has been sent successfully.', 'success');
                contactForm.reset();
                submitButton.textContent = originalText;
                submitButton.disabled = false;
            }, 2000);
        });
    }
    
    // Form Validation
    function validateForm(name, email, message) {
        // Clear previous error messages
        clearErrorMessages();
        
        let isValid = true;
        
        // Validate name
        if (name.length < 2) {
            showFieldError('name', 'Name must be at least 2 characters long');
            isValid = false;
        }
        
        // Validate email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showFieldError('email', 'Please enter a valid email address');
            isValid = false;
        }
        
        // Validate message
        if (message.length < 10) {
            showFieldError('message', 'Message must be at least 10 characters long');
            isValid = false;
        }
        
        return isValid;
    }
    
    // Show field error message
    function showFieldError(fieldName, message) {
        const field = document.getElementById(fieldName);
        const formGroup = field.closest('.form-group');
        
        // Create error element if it doesn't exist
        let errorElement = formGroup.querySelector('.error-message');
        if (!errorElement) {
            errorElement = document.createElement('div');
            errorElement.className = 'error-message';
            formGroup.appendChild(errorElement);
        }
        
        errorElement.textContent = message;
        field.style.borderColor = '#e74c3c';
    }
    
    // Clear error messages
    function clearErrorMessages() {
        document.querySelectorAll('.error-message').forEach(el => el.remove());
        document.querySelectorAll('.form-group input, .form-group textarea').forEach(field => {
            field.style.borderColor = '#e0e0e0';
        });
    }
    
    // Show notification
    function showNotification(message, type = 'info') {
        // Remove existing notifications
        document.querySelectorAll('.notification').forEach(el => el.remove());
        
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            padding: '15px 20px',
            borderRadius: '5px',
            color: 'white',
            fontWeight: '500',
            zIndex: '9999',
            transform: 'translateX(100%)',
            transition: 'transform 0.3s ease',
            backgroundColor: type === 'success' ? '#2ecc71' : type === 'error' ? '#e74c3c' : '#3498db'
        });
        
        document.body.appendChild(notification);
        
        // Slide in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }, 5000);
    }
    
    // Navbar Background on Scroll
    function handleNavbarScroll() {
        const navbar = document.querySelector('.navbar');
        if (window.scrollY > 50) {
            navbar.style.background = 'rgba(255, 255, 255, 0.98)';
            navbar.style.boxShadow = '0 2px 20px rgba(0, 0, 0, 0.1)';
        } else {
            navbar.style.background = 'rgba(255, 255, 255, 0.95)';
            navbar.style.boxShadow = 'none';
        }
    }
    
    // Typing Animation for Home Section
    function typeWriter(element, text, speed = 100) {
        let i = 0;
        element.textContent = '';
        
        function type() {
            if (i < text.length) {
                element.textContent += text.charAt(i);
                i++;
                setTimeout(type, speed);
            }
        }
        
        type();
    }
    
    // Initialize typing animation for tagline
    const taglineElement = document.querySelector('.tagline');
    if (taglineElement) {
        const originalText = taglineElement.textContent;
        setTimeout(() => {
            typeWriter(taglineElement, originalText, 80);
        }, 1000);
    }
    
    // Scroll-based Navbar Hide/Show
    let lastScrollTop = 0;
    const navbar = document.querySelector('.navbar');
    const navbarHeight = navbar.getBoundingClientRect().height;

    // Add a class to style the fixed navbar
    navbar.style.position = 'fixed';
    navbar.style.width = '100%';
    navbar.style.top = '0';
    navbar.style.transition = 'transform 0.3s ease-in-out';

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > lastScrollTop && scrollTop > navbarHeight) {
            // Scrolling down - hide navbar
            navbar.style.transform = 'translateY(-100%)';
        } else {
            // Scrolling up - show navbar
            navbar.style.transform = 'translateY(0)';
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Event Listeners
    window.addEventListener('scroll', () => {
        highlightActiveNav();
        handleNavbarScroll();
    });
    
    // Initialize active nav on page load
    highlightActiveNav();
    handleNavbarScroll();
    
    // Add CSS for error messages and animations
    const style = document.createElement('style');
    style.textContent = `
        .error-message {
            color: #e74c3c;
            font-size: 0.9rem;
            margin-top: 0.5rem;
            display: block;
        }
        
        .nav-link.active {
            color: #3498db;
        }
        
        .nav-link.active::after {
            width: 100%;
        }
        
        .hamburger.active .bar:nth-child(1) {
            transform: rotate(45deg) translate(5px, 5px);
        }
        
        .hamburger.active .bar:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active .bar:nth-child(3) {
            transform: rotate(-45deg) translate(7px, -6px);
        }
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        .fade-in-up {
            animation: fadeInUp 0.6s ease forwards;
        }
    `;
    document.head.appendChild(style);
    
    console.log('Portfolio website JavaScript loaded successfully!');
});
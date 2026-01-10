/* =========================
   Smooth Scrolling
========================= */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        e.preventDefault();
        const target = document.querySelector(anchor.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

/* =========================
   Mobile Menu Toggle + Animation
========================= */
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        navMenu.classList.toggle('active');
        hamburger.classList.toggle('active'); // triggers animation
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            navMenu.classList.remove('active');
            hamburger.classList.remove('active');
        });
    });
}

/* Optional Hamburger Cross Animation */
const style = document.createElement('style');
style.textContent = `
.hamburger.active span:nth-child(1) {
    transform: rotate(45deg) translate(5px, 5px);
}
.hamburger.active span:nth-child(2) {
    opacity: 0;
}
.hamburger.active span:nth-child(3) {
    transform: rotate(-45deg) translate(5px, -5px);
}
`;
document.head.appendChild(style);

/* =========================
   Scroll Effects
========================= */
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const navbar = document.querySelector('.navbar');

    if (navbar) {
        navbar.style.boxShadow = scrollY > 0
            ? '0 5px 20px rgba(0,0,0,0.1)'
            : '0 2px 10px rgba(0,0,0,0.1)';
    }

    let currentSection = '';
    document.querySelectorAll('section').forEach(section => {
        if (scrollY >= section.offsetTop - 120) {
            currentSection = section.id;
        }
    });

    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.toggle(
            'active',
            link.getAttribute('href').slice(1) === currentSection
        );
    });

    const hero = document.querySelector('.hero');
    if (hero) {
        hero.style.backgroundPosition = `center ${scrollY * 0.5}px`;
    }
});

/* =========================
   Intersection Observer for Fade-In Animations
========================= */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -100px 0px'
};

const fadeObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = 'fadeInUp 0.8s ease forwards';
            fadeObserver.unobserve(entry.target);
        }
    });
}, observerOptions);

document.querySelectorAll('.project-card, .skill-category, .stat').forEach(el => {
    el.style.opacity = '0';
    fadeObserver.observe(el);
});

/* =========================
   Contact Form Handling
========================= */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', e => {
        e.preventDefault();

        const name = contactForm.querySelector('input[type="text"]').value.trim();
        const email = contactForm.querySelector('input[type="email"]').value.trim();
        const message = contactForm.querySelector('textarea').value.trim();
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!name || !email || !message) {
            showNotification('Please fill in all fields.', 'error');
            return;
        }

        if (!emailRegex.test(email)) {
            showNotification('Please enter a valid email address.', 'error');
            return;
        }

        showNotification('Message sent successfully! I will get back to you soon.', 'success');
        contactForm.reset();
    });
}

/* =========================
   Notification System
========================= */
function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 25px;
        border-radius: 8px;
        background: ${type === 'success' ? '#48bb78' : '#f56565'};
        color: white;
        z-index: 9999;
        animation: slideInRight 0.3s ease;
        box-shadow: 0 5px 15px rgba(0,0,0,0.2);
    `;
    document.body.appendChild(notification);

    setTimeout(() => {
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => notification.remove(), 300);
    }, 3000);
}

const notificationStyle = document.createElement('style');
notificationStyle.textContent = `
@keyframes slideInRight {
    from { opacity: 0; transform: translateX(100px); }
    to { opacity: 1; transform: translateX(0); }
}
@keyframes slideOutRight {
    from { opacity: 1; transform: translateX(0); }
    to { opacity: 0; transform: translateX(100px); }
}
`;
document.head.appendChild(notificationStyle);

/* =========================
   Counter Animation
========================= */
function animateCounters() {
    document.querySelectorAll('.stat h3').forEach(counter => {
        const target = parseInt(counter.innerText.replace('+', ''));
        let current = 0;
        const increment = target / 40;

        const updateCount = () => {
            current += increment;
            if (current < target) {
                counter.innerText = Math.ceil(current) + '+';
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = target + '+';
            }
        };

        const counterObserver = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting) {
                updateCount();
                counterObserver.disconnect();
            }
        }, { threshold: 0.5 });

        counterObserver.observe(counter.closest('.stat'));
    });
}
document.addEventListener('DOMContentLoaded', animateCounters);

/* =========================
   Button Ripple Effect
========================= */
document.querySelectorAll('.btn').forEach(button => {
    button.addEventListener('click', e => {
        const ripple = document.createElement('span');
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        ripple.style.cssText = `
            position: absolute;
            width: ${size}px;
            height: ${size}px;
            left: ${e.clientX - rect.left - size / 2}px;
            top: ${e.clientY - rect.top - size / 2}px;
            background: rgba(255,255,255,0.5);
            border-radius: 50%;
            pointer-events: none;
            animation: ripple 0.6s ease-out;
        `;
        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);
        setTimeout(() => ripple.remove(), 600);
    });
});

const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
@keyframes ripple {
    from { transform: scale(0); opacity: 1; }
    to { transform: scale(1); opacity: 0; }
}
`;
document.head.appendChild(rippleStyle);

/* =========================
   Page Load Fade In
========================= */
document.body.style.opacity = '0';
document.body.style.transition = 'opacity 0.5s ease';
window.addEventListener('load', () => {
    document.body.style.opacity = '1';
});

/* =========================
   Keyboard Accessibility
========================= */
document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu?.classList.contains('active')) {
        navMenu.classList.remove('active');
        hamburger.classList.remove('active');
    }
});

/* =========================
   Console Greeting
========================= */
console.log('%cWelcome to My Portfolio! 👋', 'color:#667eea;font-size:20px;font-weight:bold');
console.log('%cLet’s build something great together 🚀', 'color:#764ba2;font-size:14px');

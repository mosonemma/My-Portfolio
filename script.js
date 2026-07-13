/* ==========================================================================
   Ssong_Pro Portfolio — interactions
   ========================================================================== */

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* -------------------------------------------------------------------------
   Smooth scrolling for in-page anchors
   ------------------------------------------------------------------------- */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', e => {
        const href = anchor.getAttribute('href');
        if (href.length < 2) return;
        const target = document.querySelector(href);
        if (target) {
            e.preventDefault();
            target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
        }
    });
});

/* -------------------------------------------------------------------------
   Mobile menu
   ------------------------------------------------------------------------- */
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

function closeMenu() {
    navMenu?.classList.remove('active');
    hamburger?.classList.remove('active');
    hamburger?.setAttribute('aria-expanded', 'false');
}

if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
        const isOpen = navMenu.classList.toggle('active');
        hamburger.classList.toggle('active', isOpen);
        hamburger.setAttribute('aria-expanded', String(isOpen));
    });

    navMenu.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', closeMenu);
    });
}

document.addEventListener('keydown', e => {
    if (e.key === 'Escape' && navMenu?.classList.contains('active')) closeMenu();
});

/* -------------------------------------------------------------------------
   Scroll-spy for active nav link
   ------------------------------------------------------------------------- */
const sections = document.querySelectorAll('section[id]');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const top = section.offsetTop - 140;
        if (window.scrollY >= top) current = section.id;
    });
    navLinks.forEach(link => {
        link.classList.toggle('active', link.getAttribute('href') === `#${current}`);
    });
}, { passive: true });

/* -------------------------------------------------------------------------
   Reveal-on-scroll
   ------------------------------------------------------------------------- */
const revealEls = document.querySelectorAll('.reveal');

if (prefersReducedMotion) {
    revealEls.forEach(el => el.classList.add('in-view'));
} else {
    const revealObserver = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('in-view');
                revealObserver.unobserve(entry.target);
            }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -60px 0px' });

    revealEls.forEach(el => revealObserver.observe(el));
}

/* -------------------------------------------------------------------------
   Hero terminal typing effect
   ------------------------------------------------------------------------- */
const heroTyped = document.getElementById('heroTyped');

if (heroTyped && !prefersReducedMotion) {
    const full = ' whoami';
    heroTyped.textContent = '';
    let i = 0;
    const type = () => {
        if (i <= full.length) {
            heroTyped.textContent = full.slice(0, i);
            i++;
            setTimeout(type, 90);
        }
    };
    setTimeout(type, 400);
}

/* -------------------------------------------------------------------------
   Stat counters
   ------------------------------------------------------------------------- */
function animateCounters() {
    document.querySelectorAll('.stat h3').forEach(counter => {
        const target = parseInt(counter.textContent.replace('+', ''), 10);
        if (Number.isNaN(target)) return;

        if (prefersReducedMotion) {
            counter.textContent = `${target}+`;
            return;
        }

        let current = 0;
        const increment = Math.max(target / 30, 1);

        const updateCount = () => {
            current += increment;
            if (current < target) {
                counter.textContent = `${Math.ceil(current)}+`;
                requestAnimationFrame(updateCount);
            } else {
                counter.textContent = `${target}+`;
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

/* -------------------------------------------------------------------------
   Contact form — real Formspree submission via fetch
   ------------------------------------------------------------------------- */
const contactForm = document.getElementById('contactForm');

if (contactForm) {
    contactForm.addEventListener('submit', async e => {
        e.preventDefault();

        const nameField = contactForm.querySelector('#name');
        const emailField = contactForm.querySelector('#email');
        const messageField = contactForm.querySelector('#message');
        const submitBtn = contactForm.querySelector('button[type="submit"]');
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        const name = nameField.value.trim();
        const email = emailField.value.trim();
        const message = messageField.value.trim();

        if (!name || !email || !message) {
            showToast('Please fill in all fields.', 'error');
            return;
        }
        if (!emailRegex.test(email)) {
            showToast('Please enter a valid email address.', 'error');
            return;
        }

        const originalLabel = submitBtn.textContent;
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending…';

        try {
            const response = await fetch(contactForm.action, {
                method: 'POST',
                headers: { 'Accept': 'application/json' },
                body: new FormData(contactForm)
            });

            if (response.ok) {
                showToast('Message sent — I\u2019ll get back to you soon.', 'success');
                contactForm.reset();
            } else {
                showToast('Something went wrong. Please try again or email me directly.', 'error');
            }
        } catch (err) {
            showToast('Network error. Please check your connection and try again.', 'error');
        } finally {
            submitBtn.disabled = false;
            submitBtn.textContent = originalLabel;
        }
    });
}

function showToast(message, type) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.setAttribute('role', 'status');
    toast.textContent = message;
    document.body.appendChild(toast);

    setTimeout(() => {
        toast.classList.add('exit');
        setTimeout(() => toast.remove(), 300);
    }, 3200);
}

/* -------------------------------------------------------------------------
   Page load fade-in
   ------------------------------------------------------------------------- */
if (!prefersReducedMotion) {
    document.body.style.opacity = '0';
    document.body.style.transition = 'opacity 0.5s ease';
    window.addEventListener('load', () => { document.body.style.opacity = '1'; });
}

/* -------------------------------------------------------------------------
   Project ideas: search, filter, show-more
   ------------------------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
    const ideasGrid = document.querySelector('.ideas-grid');
    if (!ideasGrid) return;

    const ideaCards = Array.from(ideasGrid.querySelectorAll('.idea-card'));
    const searchInput = document.getElementById('idea-search');
    const filterBtns = Array.from(document.querySelectorAll('.filter-btn'));
    const showMoreBtn = document.getElementById('show-more');
    const COLLAPSE_COUNT = 8;

    // ensure defaults for cards missing metadata
    ideaCards.forEach(card => {
        if (!card.dataset.difficulty) card.dataset.difficulty = 'intermediate';
        if (!card.dataset.hours) card.dataset.hours = '8';
        if (!card.querySelector('.idea-badges')){
            const meta = document.createElement('div');
            meta.className = 'idea-badges';
            const lvl = document.createElement('span'); lvl.className = 'badge level'; lvl.textContent = card.dataset.difficulty.charAt(0).toUpperCase() + card.dataset.difficulty.slice(1);
            const hrs = document.createElement('span'); hrs.className = 'badge hours'; hrs.textContent = `~${card.dataset.hours}h`;
            meta.appendChild(lvl); meta.appendChild(hrs);
            const title = card.querySelector('h3');
            if (title) {
                const wrapper = document.createElement('div'); wrapper.className = 'idea-meta';
                wrapper.appendChild(title.cloneNode(true));
                wrapper.appendChild(meta);
                title.replaceWith(wrapper);
            }
        }
    });

    function matchesFilter(card, tag, query){
        let matchesTag = true;
        if (tag && tag !== 'all'){
            matchesTag = Array.from(card.querySelectorAll('.tag')).some(t => t.textContent.trim().toLowerCase() === tag.toLowerCase());
        }

        let matchesQuery = true;
        if (query){
            const text = (card.textContent || '').toLowerCase();
            matchesQuery = text.indexOf(query.toLowerCase()) !== -1;
        }

        return matchesTag && matchesQuery;
    }

    function applyFilters(){
        const active = filterBtns.find(b => b.getAttribute('aria-pressed') === 'true');
        const tag = active ? active.dataset.tag : 'all';
        const q = searchInput ? searchInput.value.trim() : '';

        ideaCards.forEach((card, i) => {
            const ok = matchesFilter(card, tag, q);
            card.style.display = ok ? '' : 'none';
        });

        // enforce collapse if not expanded
        if (!ideasGrid.classList.contains('expanded')){
            ideaCards.forEach((card, i) => {
                if (i >= COLLAPSE_COUNT) card.style.display = card.style.display === 'none' ? 'none' : 'none';
            });
        }
    }

    // initial collapse: show first COLLAPSE_COUNT
    function collapseInitial(){
        ideaCards.forEach((card, i) => {
            if (i >= COLLAPSE_COUNT) card.classList.add('collapsed');
        });
    }
    collapseInitial();

    // filter button events
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.setAttribute('aria-pressed','false'));
            btn.setAttribute('aria-pressed','true');
            applyFilters();
        });
        btn.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); btn.click(); } });
    });

    if (searchInput){
        searchInput.addEventListener('input', () => applyFilters());
    }

    if (showMoreBtn){
        showMoreBtn.addEventListener('click', () => {
            const expanded = ideasGrid.classList.toggle('expanded');
            showMoreBtn.textContent = expanded ? 'Show less' : 'Show more';
            ideaCards.forEach((card, i) => {
                if (expanded) card.style.display = '';
                else card.style.display = i < COLLAPSE_COUNT ? '' : (card.style.display === 'none' ? 'none' : 'none');
            });
        });
    }
});


console.log('%cHey, thanks for peeking under the hood 👋', 'color:#D9A441;font-size:16px;font-weight:bold');
console.log('%cLet\u2019s build something together — mosonemma2001@gmail.com', 'color:#3E7C6A;font-size:13px');
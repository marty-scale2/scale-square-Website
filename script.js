/* ==========================================
   scale² – Landing Page Scripts
   Three.js 3D Hero + Animations + Effects
   ========================================== */

// ==========================================
// Three.js Hero Scene
// ==========================================
function initHeroScene() {
    const container = document.getElementById('hero-canvas');
    if (!container) return;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 5;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Icosahedron (geometrischer Körper)
    const geometry = new THREE.IcosahedronGeometry(2, 1);
    const material = new THREE.MeshPhongMaterial({
        color: 0x2563eb,
        emissive: 0x0a1628,
        shininess: 40,
        wireframe: true,
        transparent: true,
        opacity: 0.12,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Inner Sphere (Glow-Kern)
    const innerGeometry = new THREE.SphereGeometry(1.2, 32, 32);
    const innerMaterial = new THREE.MeshPhongMaterial({
        color: 0x0ea5e9,
        emissive: 0x0a1628,
        shininess: 80,
        transparent: true,
        opacity: 0.04,
    });
    const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
    scene.add(innerMesh);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particleCount = 200;
    const positions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount * 3; i++) {
        positions[i] = (Math.random() - 0.5) * 15;
    }
    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const particlesMaterial = new THREE.PointsMaterial({
        color: 0x94a3b8,
        size: 0.02,
        transparent: true,
        opacity: 0.25,
    });
    const particles = new THREE.Points(particlesGeometry, particlesMaterial);
    scene.add(particles);

    // Lights
    const ambientLight = new THREE.AmbientLight(0x94a3b8, 0.6);
    scene.add(ambientLight);

    const pointLight1 = new THREE.PointLight(0x2563eb, 1, 20);
    pointLight1.position.set(5, 3, 5);
    scene.add(pointLight1);

    const pointLight2 = new THREE.PointLight(0x0ea5e9, 0.6, 20);
    pointLight2.position.set(-5, -3, 3);
    scene.add(pointLight2);

    // Mouse tracking
    let mouseX = 0;
    let mouseY = 0;
    let targetX = 0;
    let targetY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = (e.clientX / window.innerWidth) * 2 - 1;
        mouseY = -(e.clientY / window.innerHeight) * 2 + 1;
    });

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Animate
    function animate() {
        requestAnimationFrame(animate);

        // Smooth mouse follow
        targetX += (mouseX - targetX) * 0.02;
        targetY += (mouseY - targetY) * 0.02;

        // Rotate mesh
        mesh.rotation.x += 0.002;
        mesh.rotation.y += 0.003;
        mesh.rotation.x += targetY * 0.01;
        mesh.rotation.y += targetX * 0.01;

        // Inner sphere follows
        innerMesh.rotation.x -= 0.001;
        innerMesh.rotation.y -= 0.002;

        // Particles drift
        particles.rotation.y += 0.0003;
        particles.rotation.x += 0.0001;

        // Lights react to mouse
        pointLight1.position.x = 5 + targetX * 3;
        pointLight1.position.y = 3 + targetY * 3;

        renderer.render(scene, camera);
    }

    animate();
}

// ==========================================
// Cursor Glow Effect
// ==========================================
function initCursorGlow() {
    const glow = document.createElement('div');
    glow.classList.add('cursor-glow');
    document.body.appendChild(glow);

    let cursorX = 0, cursorY = 0;
    let glowX = 0, glowY = 0;

    document.addEventListener('mousemove', (e) => {
        cursorX = e.clientX;
        cursorY = e.clientY;
    });

    function updateGlow() {
        glowX += (cursorX - glowX) * 0.08;
        glowY += (cursorY - glowY) * 0.08;
        glow.style.left = glowX + 'px';
        glow.style.top = glowY + 'px';
        requestAnimationFrame(updateGlow);
    }
    updateGlow();
}

// ==========================================
// 3D Card Tilt Effect
// ==========================================
function initCardTilt() {
    const cards = document.querySelectorAll('.problem-card, .step-card, .usecase-card, .proof-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            const centerX = rect.width / 2;
            const centerY = rect.height / 2;

            const rotateX = ((y - centerY) / centerY) * -6;
            const rotateY = ((x - centerX) / centerX) * 6;

            card.style.transform = `perspective(800px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
        });

        card.addEventListener('mouseleave', () => {
            card.style.transform = 'perspective(800px) rotateX(0) rotateY(0) translateY(0)';
        });
    });
}

// ==========================================
// Magnetic CTA Buttons
// ==========================================
function initMagneticButtons() {
    const buttons = document.querySelectorAll('.cta-button');

    buttons.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            btn.style.transform = `translate(${x * 0.2}px, ${y * 0.2}px)`;
        });

        btn.addEventListener('mouseleave', () => {
            btn.style.transform = 'translate(0, 0)';
        });
    });
}

// ==========================================
// Parallax Scroll Effect
// ==========================================
function initParallax() {
    const parallaxElements = document.querySelectorAll('.section-headline, .formula-block, .proof-quote, .risk-block');

    window.addEventListener('scroll', () => {
        const scrollY = window.pageYOffset;

        parallaxElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const centerY = rect.top + rect.height / 2;
            const viewCenter = window.innerHeight / 2;
            const offset = (centerY - viewCenter) * 0.04;

            el.style.transform = `translateY(${offset}px)`;
        });
    });
}

// ==========================================
// Hero Text Reveal Animation
// ==========================================
function initHeroTextReveal() {
    const headline = document.querySelector('.hero-headline');
    const subline = document.querySelector('.hero-subline');
    const badge = document.querySelector('.hero-badge');
    const cta = document.querySelector('.hero .cta-button');

    if (badge) { badge.classList.add('hero-anim'); badge.style.animationDelay = '0.2s'; }
    if (headline) { headline.classList.add('hero-anim'); headline.style.animationDelay = '0.5s'; }
    if (subline) { subline.classList.add('hero-anim'); subline.style.animationDelay = '0.9s'; }
    if (cta) { cta.classList.add('hero-anim'); cta.style.animationDelay = '1.3s'; }
}

// ==========================================
// Scroll Reveal Animation (Enhanced)
// ==========================================
function initScrollReveal() {
    const reveals = document.querySelectorAll('.reveal');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            if (entry.isIntersecting) {
                // Staggered: find siblings and delay
                const parent = entry.target.parentElement;
                const siblings = Array.from(parent.children).filter(c => c.classList.contains('reveal'));
                const index = siblings.indexOf(entry.target);
                const delay = index * 120;

                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
                observer.unobserve(entry.target);
            }
        });
    }, {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    });

    reveals.forEach((el) => observer.observe(el));
}

// ==========================================
// Scroll Progress Bar
// ==========================================
function initScrollProgress() {
    const bar = document.createElement('div');
    bar.classList.add('scroll-progress');
    document.body.appendChild(bar);

    window.addEventListener('scroll', () => {
        const scrollTop = window.pageYOffset;
        const docHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = (scrollTop / docHeight) * 100;
        bar.style.width = progress + '%';
    });
}

// ==========================================
// Card Hover Glow (light follows cursor on cards)
// ==========================================
function initCardGlow() {
    const cards = document.querySelectorAll('.problem-card, .step-card, .usecase-card, .proof-card');

    cards.forEach(card => {
        card.addEventListener('mousemove', (e) => {
            const rect = card.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            card.style.setProperty('--glow-x', x + 'px');
            card.style.setProperty('--glow-y', y + 'px');
        });
    });
}

// ==========================================
// Navigation Scroll Effect
// ==========================================
function initNavScroll() {
    const nav = document.querySelector('.nav');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;

        if (currentScroll > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }

        lastScroll = currentScroll;
    });
}

// ==========================================
// Smooth Scroll for Anchor Links
// ==========================================
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// ==========================================
// Counter Animation (Proof Metrics)
// ==========================================
function initCounterAnimation() {
    const metrics = document.querySelectorAll('.proof-metric');

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                animateCounter(entry.target);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    metrics.forEach(el => observer.observe(el));
}

function animateCounter(element) {
    const text = element.textContent;
    const hasPercent = text.includes('%');
    const hasX = text.includes('x');
    const hasH = text.includes('h');
    const hasMinus = text.includes('-');

    let numStr = text.replace(/[^0-9.]/g, '');
    const target = parseFloat(numStr);
    const isDecimal = numStr.includes('.');
    const duration = 1500;
    const start = performance.now();

    function update(currentTime) {
        const elapsed = currentTime - start;
        const progress = Math.min(elapsed / duration, 1);

        // Easing
        const eased = 1 - Math.pow(1 - progress, 3);
        let current = target * eased;

        let display = '';
        if (hasMinus) display += '-';
        if (isDecimal) {
            display += current.toFixed(1);
        } else {
            display += Math.round(current);
        }
        if (hasPercent) display += '%';
        if (hasX) display += 'x';
        if (hasH) display += 'h';

        element.textContent = display;

        if (progress < 1) {
            requestAnimationFrame(update);
        }
    }

    requestAnimationFrame(update);
}

// ==========================================
// Cookie Banner
// ==========================================
function initCookieBanner() {
    const banner = document.getElementById('cookieBanner');
    const acceptBtn = document.getElementById('cookieAccept');
    const rejectBtn = document.getElementById('cookieReject');

    if (!banner) return;

    // Check if user already made a choice
    const consent = localStorage.getItem('cookie-consent');
    if (consent) return;

    // Show banner after short delay
    setTimeout(() => {
        banner.classList.add('visible');
    }, 1500);

    if (acceptBtn) {
        acceptBtn.addEventListener('click', () => {
            localStorage.setItem('cookie-consent', 'accepted');
            banner.classList.remove('visible');
            if (typeof loadGoogleAnalytics === 'function') loadGoogleAnalytics();
        });
    }

    if (rejectBtn) {
        rejectBtn.addEventListener('click', () => {
            localStorage.setItem('cookie-consent', 'rejected');
            banner.classList.remove('visible');
        });
    }
}

// ==========================================
// Initialize
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    initHeroScene();
    initHeroTextReveal();
    initScrollReveal();
    initNavScroll();
    initSmoothScroll();
    initCounterAnimation();
    initCursorGlow();
    initCardTilt();
    initCardGlow();
    initMagneticButtons();
    initParallax();
    initScrollProgress();
    initCookieBanner();
});

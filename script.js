/* ========================================
   Formscape Lab - Scripts
   ======================================== */

document.addEventListener('DOMContentLoaded', function() {
    // Initialize background animation (two canvases)
    initBackgroundAnimation();
    
    // Header scroll effect
    initHeaderScroll();
    
    // Accordion functionality
    initAccordion();
    
    // Fade-in animations on scroll
    initFadeInAnimations();
});

/* ========================================
   Background Animation (Dual Canvas)
   ======================================== */
function initBackgroundAnimation() {
    const bgCanvas = document.getElementById('bg-canvas');
    const meshCanvas = document.getElementById('mesh-canvas');
    
    if (!bgCanvas || !meshCanvas) return;
    
    const bgCtx = bgCanvas.getContext('2d');
    const meshCtx = meshCanvas.getContext('2d');
    
    let width, height;
    let mouseX = -1000, mouseY = -1000;
    let targetMouseX = -1000, targetMouseY = -1000;
    let bgAnimationId, meshAnimationId;
    
    // Configuration
    const config = {
        gradientColors: [
            { r: 200, g: 210, b: 255, a: 0.8 },
            { r: 255, g: 200, b: 220, a: 0.7 },
            { r: 210, g: 230, b: 255, a: 0.7 },
            { r: 255, g: 235, b: 200, a: 0.6 },
            { r: 230, g: 210, b: 255, a: 0.7 },
        ],
        blobCount: 5,
        mouseInfluence: 0.05,
        speed: 0.0003,
        // Dot field config
        dotSpacing: 50,
        dotRadius: 1.5,
        dotColor: 'rgba(0, 0, 0, 0.12)',
        floatAmplitude: 8,
        floatSpeed: 0.001,
        mouseRadius: 100,
        mouseStrength: 15
    };
    
    // Gradient Blobs
    const blobs = [];
    
    // 2D Dot Field
    let dots = [];
    
    // Resize handler
    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        
        bgCanvas.width = width;
        bgCanvas.height = height;
        meshCanvas.width = width;
        meshCanvas.height = height;
        
        initBlobs();
        initDots();
    }
    
    function initBlobs() {
        blobs.length = 0;
        for (let i = 0; i < config.blobCount; i++) {
            const colorIndex = i % config.gradientColors.length;
            blobs.push({
                x: Math.random() * width,
                y: Math.random() * height,
                radius: Math.random() * Math.min(width, height) * 0.4 + Math.min(width, height) * 0.2,
                color: config.gradientColors[colorIndex],
                vx: (Math.random() - 0.5) * 0.3,
                vy: (Math.random() - 0.5) * 0.3,
                phase: Math.random() * Math.PI * 2
            });
        }
    }
    
    function initDots() {
        dots = [];
        const cols = Math.ceil(width / config.dotSpacing) + 2;
        const rows = Math.ceil(height / config.dotSpacing) + 2;
        
        for (let row = 0; row < rows; row++) {
            for (let col = 0; col < cols; col++) {
                dots.push({
                    baseX: col * config.dotSpacing,
                    baseY: row * config.dotSpacing,
                    x: col * config.dotSpacing,
                    y: row * config.dotSpacing,
                    phase: Math.random() * Math.PI * 2,
                    phaseX: Math.random() * Math.PI * 2,
                    phaseY: Math.random() * Math.PI * 2
                });
            }
        }
    }
    
    // Mouse tracking
    document.addEventListener('mousemove', (e) => {
        targetMouseX = e.clientX;
        targetMouseY = e.clientY;
    });
    
    document.addEventListener('mouseleave', () => {
        targetMouseX = -1000;
        targetMouseY = -1000;
    });
    
    // Animation time
    let time = 0;
    
    // Animate background blobs
    function animateBlobs() {
        time += config.speed * 16;
        
        // Smooth mouse following
        mouseX += (targetMouseX - mouseX) * 0.05;
        mouseY += (targetMouseY - mouseY) * 0.05;
        
        // Clear canvas
        bgCtx.fillStyle = '#FFFFFF';
        bgCtx.fillRect(0, 0, width, height);
        
        // Draw gradient blobs
        blobs.forEach((blob, index) => {
            blob.x += blob.vx + Math.sin(time + blob.phase) * 0.3;
            blob.y += blob.vy + Math.cos(time + blob.phase * 0.7) * 0.3;
            
            const dx = ((mouseX - width / 2) * config.mouseInfluence * (index % 2 === 0 ? 1 : -1));
            const dy = ((mouseY - height / 2) * config.mouseInfluence * (index % 2 === 0 ? 1 : -1));
            
            const padding = blob.radius;
            if (blob.x < -padding) blob.x = width + padding;
            if (blob.x > width + padding) blob.x = -padding;
            if (blob.y < -padding) blob.y = height + padding;
            if (blob.y > height + padding) blob.y = -padding;
            
            const gradient = bgCtx.createRadialGradient(
                blob.x + dx, blob.y + dy, 0,
                blob.x + dx, blob.y + dy, blob.radius
            );
            
            const { r, g, b, a } = blob.color;
            gradient.addColorStop(0, `rgba(${r}, ${g}, ${b}, ${a})`);
            gradient.addColorStop(0.5, `rgba(${r}, ${g}, ${b}, ${a * 0.5})`);
            gradient.addColorStop(1, `rgba(${r}, ${g}, ${b}, 0)`);
            
            bgCtx.fillStyle = gradient;
            bgCtx.fillRect(0, 0, width, height);
        });
        
        bgAnimationId = requestAnimationFrame(animateBlobs);
    }
    
    // Animate 2D dot field
    function animateDots() {
        // Clear mesh canvas
        meshCtx.clearRect(0, 0, width, height);
        
        const floatTime = time * config.floatSpeed * 1000;
        
        // Update and draw dots
        meshCtx.fillStyle = config.dotColor;
        
        dots.forEach(dot => {
            // Organic floating motion
            const offsetX = Math.sin(floatTime + dot.phaseX) * config.floatAmplitude;
            const offsetY = Math.cos(floatTime + dot.phaseY) * config.floatAmplitude;
            
            let x = dot.baseX + offsetX;
            let y = dot.baseY + offsetY;
            
            // Mouse interaction - soft repel
            const dx = x - mouseX;
            const dy = y - mouseY;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < config.mouseRadius && dist > 0) {
                const force = (1 - dist / config.mouseRadius) * config.mouseStrength;
                x += (dx / dist) * force;
                y += (dy / dist) * force;
            }
            
            dot.x = x;
            dot.y = y;
            
            // Draw dot
            meshCtx.beginPath();
            meshCtx.arc(x, y, config.dotRadius, 0, Math.PI * 2);
            meshCtx.fill();
        });
        
        meshAnimationId = requestAnimationFrame(animateDots);
    }
    
    // Initialize
    window.addEventListener('resize', resize);
    resize();
    animateBlobs();
    animateDots();
    
    // Cleanup
    window.addEventListener('beforeunload', () => {
        cancelAnimationFrame(bgAnimationId);
        cancelAnimationFrame(meshAnimationId);
    });
}

/* ========================================
   Header Scroll Effect
   ======================================== */
function initHeaderScroll() {
    const header = document.getElementById('header');
    
    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll > 50) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

/* ========================================
   Accordion Functionality
   ======================================== */
function initAccordion() {
    const accordionHeaders = document.querySelectorAll('.accordion-header');
    
    accordionHeaders.forEach(header => {
        header.addEventListener('click', function() {
            const item = this.parentElement;
            const isActive = item.classList.contains('active');
            
            // Close all
            document.querySelectorAll('.accordion-item').forEach(i => {
                i.classList.remove('active');
            });
            document.querySelectorAll('.accordion-header').forEach(h => {
                h.setAttribute('aria-expanded', 'false');
            });
            
            // Open clicked if was closed
            if (!isActive) {
                item.classList.add('active');
                this.setAttribute('aria-expanded', 'true');
            }
        });
    });
}

/* ========================================
   Fade-in Animations on Scroll
   ======================================== */
function initFadeInAnimations() {
    const fadeElements = document.querySelectorAll('.fade-in');
    
    if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver(function(entries, observer) {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: '0px 0px -50px 0px',
            threshold: 0.1
        });
        
        fadeElements.forEach(element => {
            observer.observe(element);
        });
    } else {
        fadeElements.forEach(element => {
            element.classList.add('visible');
        });
    }
}
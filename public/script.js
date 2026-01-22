// --- LOADING SCREEN ---
window.addEventListener('load', () => {
    const loader = document.getElementById('loader');
    setTimeout(() => {
        loader.style.opacity = '0';
        loader.style.visibility = 'hidden';
        // Start Animations needed after load
    }, 1500); // 1.5s Fake Loading time
});


// --- 3D BACKGROUND (Three.js) ---
const initThreeJS = () => {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Objects: Icosahedrons instead of particles
    const geometry = new THREE.IcosahedronGeometry(1, 0); // Radius 1, Detail 0
    const material = new THREE.MeshBasicMaterial({
        color: 0x00f3ff,
        wireframe: true,
        transparent: true,
        opacity: 0.3
    });

    const objects = [];
    const objectCount = 15;

    for (let i = 0; i < objectCount; i++) {
        const mesh = new THREE.Mesh(geometry, material);

        // Random Position
        mesh.position.x = (Math.random() - 0.5) * 15;
        mesh.position.y = (Math.random() - 0.5) * 15;
        mesh.position.z = (Math.random() - 0.5) * 15;

        // Random Scale
        const scale = Math.random();
        mesh.scale.set(scale, scale, scale);

        // Random Rotation Speed
        mesh.userData = {
            rotSpeedX: (Math.random() - 0.5) * 0.005,
            rotSpeedY: (Math.random() - 0.5) * 0.005
        };

        scene.add(mesh);
        objects.push(mesh);
    }

    camera.position.z = 5;

    // Scroll Logic for 3D
    let scrollY = 0;
    window.addEventListener('scroll', () => {
        scrollY = window.scrollY;
    });

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;
    document.addEventListener('mousemove', (event) => {
        mouseX = (event.clientX / window.innerWidth) - 0.5;
        mouseY = (event.clientY / window.innerHeight) - 0.5;
    });

    // Animation Loop
    const animate = () => {
        requestAnimationFrame(animate);

        // Global Scene Rotation based on Scroll
        // camera.position.y = -scrollY * 0.005; // Move camera down on scroll

        objects.forEach(mesh => {
            // Self Rotation
            mesh.rotation.x += mesh.userData.rotSpeedX;
            mesh.rotation.y += mesh.userData.rotSpeedY;

            // Scroll influence (Move objects up/down or rotate faster)
            mesh.rotation.y += scrollY * 0.0002;
            mesh.position.y += Math.sin(Date.now() * 0.001 + mesh.position.x) * 0.005; // Floating effect
        });

        // Mouse Parallax
        camera.position.x += (mouseX * 0.5 - camera.position.x) * 0.05;
        camera.position.y += (-mouseY * 0.5 - camera.position.y) * 0.05;
        camera.lookAt(scene.position);

        renderer.render(scene, camera);
    };

    animate();

    // Resize
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Theme Color Update
    window.addEventListener('themeChanged', () => {
        const style = getComputedStyle(document.body);
        const color = style.getPropertyValue('--primary').trim();
        material.color.set(color);
    });
};

initThreeJS();


// --- PARALLAX TEXT ---
const sloganText = document.getElementById('slogan-text');
window.addEventListener('scroll', () => {
    const scrollPos = window.scrollY;
    // Parallax effect: Move text horizontally or vertically based on scroll
    // Only apply when visible or near section
    if (sloganText) {
        const offset = scrollPos * 0.5;
        sloganText.style.transform = `translateX(${offset}px)`;
        sloganText.style.opacity = Math.max(0, 1 - scrollPos / 1000); // Fade out on scroll down

        // Reset when in view? For specific section parallax:
        const rect = sloganText.getBoundingClientRect();
        if (rect.top < window.innerHeight && rect.bottom > 0) {
            const relativeScroll = window.innerHeight - rect.top;
            sloganText.style.transform = `translateY(-${relativeScroll * 0.2}px)`;
            sloganText.style.opacity = Math.min(1, relativeScroll / 300);
        }
    }
});


// --- SCROLL ANIMATIONS (Observer) ---
const observerOptions = {
    threshold: 0.15
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, observerOptions);

document.querySelectorAll('.hidden').forEach((el) => observer.observe(el));


// --- THEME SWITCHER ---
const themeToggleBtn = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);
    themeToggleBtn.innerText = newTheme === 'dark' ? '☀️' : '🌙';
    window.dispatchEvent(new Event('themeChanged'));
});


// --- PARTNER CAROUSEL CLONE (Infinite Scroll) ---
const marqueeContent = document.querySelector('.marquee-content');
if (marqueeContent) {
    // Clone content to make it seamless
    const clone = marqueeContent.cloneNode(true);
    document.querySelector('.marquee').appendChild(clone);
}


// --- LOGIN MODAL ---
const loginBtn = document.getElementById('loginBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeBtn = document.getElementById('closeBtn');

if (loginBtn) loginBtn.addEventListener('click', () => modalOverlay.classList.add('active'));
if (closeBtn) closeBtn.addEventListener('click', () => modalOverlay.classList.remove('active'));
if (modalOverlay) modalOverlay.addEventListener('click', (e) => { if (e.target === modalOverlay) modalOverlay.classList.remove('active'); });

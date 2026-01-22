// --- 3D Background with Three.js ---
const initThreeJS = () => {
    const container = document.getElementById('canvas-container');
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });

    renderer.setSize(window.innerWidth, window.innerHeight);
    container.appendChild(renderer.domElement);

    // Particles
    const particlesGeometry = new THREE.BufferGeometry();
    const particlesCount = 2000;
    const posArray = new Float32Array(particlesCount * 3);

    for (let i = 0; i < particlesCount * 3; i++) {
        // Spread particles
        posArray[i] = (Math.random() - 0.5) * 15; // Range -7.5 to 7.5
    }

    particlesGeometry.setAttribute('position', new THREE.BufferAttribute(posArray, 3));

    // Material
    const material = new THREE.PointsMaterial({
        size: 0.02,
        color: 0x00f3ff, // Primary theme color
        transparent: true,
        opacity: 0.8
    });

    // Mesh
    const particlesMesh = new THREE.Points(particlesGeometry, material);
    scene.add(particlesMesh);

    camera.position.z = 2;

    // Mouse Interaction
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (event) => {
        mouseX = event.clientX / window.innerWidth - 0.5; // -0.5 to 0.5
        mouseY = event.clientY / window.innerHeight - 0.5;
    });

    // Animation Loop
    const animate = () => {
        requestAnimationFrame(animate);

        // Rotate Global System slowly
        particlesMesh.rotation.y += 0.001;
        particlesMesh.rotation.x += 0.0005;

        // Mouse Parallax based on movement
        const targetX = mouseX * 0.5;
        const targetY = mouseY * 0.5;

        // Smooth easing
        particlesMesh.rotation.y += 0.05 * (targetX - particlesMesh.rotation.y);
        particlesMesh.rotation.x += 0.05 * (targetY - particlesMesh.rotation.x);

        renderer.render(scene, camera);
    };

    animate();

    // Resize Handler
    window.addEventListener('resize', () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    });

    // Update Color on Theme Change
    window.addEventListener('themeChanged', (e) => {
        const checkColor = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim();
        material.color.set(checkColor);
    });
};

initThreeJS();


// --- Scroll Animations (Intersection Observer) ---
const observerOptions = {
    threshold: 0.1 // Trigger when 10% visible
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add('show');
        }
    });
}, observerOptions);

const hiddenElements = document.querySelectorAll('.hidden');
hiddenElements.forEach((el) => observer.observe(el));


// --- Theme Switcher Logic ---
const themeToggleBtn = document.getElementById('themeToggle');
const htmlElement = document.documentElement;

themeToggleBtn.addEventListener('click', () => {
    const currentTheme = htmlElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    htmlElement.setAttribute('data-theme', newTheme);

    // Update Icon
    themeToggleBtn.innerText = newTheme === 'dark' ? '☀️' : '🌙';

    // Dispatch event for Three.js to pick up color change
    window.dispatchEvent(new Event('themeChanged'));
});


// --- Login Modal Logic (Existing) ---
const loginBtn = document.getElementById('loginBtn');
const modalOverlay = document.getElementById('modalOverlay');
const closeBtn = document.getElementById('closeBtn');
const loginForm = document.getElementById('loginForm');
const messageDiv = document.getElementById('message');

if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        modalOverlay.classList.add('active');
    });
}

if (closeBtn) {
    closeBtn.addEventListener('click', () => {
        modalOverlay.classList.remove('active');
    });
}

if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
        if (e.target === modalOverlay) {
            modalOverlay.classList.remove('active');
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const formData = new FormData(loginForm);
        const data = Object.fromEntries(formData.entries());

        messageDiv.innerText = 'Authenticating...';
        messageDiv.style.color = '#fff';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (result.success) {
                messageDiv.innerText = 'Access Granted.';
                messageDiv.style.color = '#00f3ff';
                setTimeout(() => {
                    modalOverlay.classList.remove('active');
                    messageDiv.innerText = '';
                    loginForm.reset();
                }, 1000);
            } else {
                messageDiv.innerText = result.message;
                messageDiv.style.color = '#ff0055';
            }
        } catch (error) {
            messageDiv.innerText = 'Connection Error';
            messageDiv.style.color = '#ff0055';
        }
    });
}

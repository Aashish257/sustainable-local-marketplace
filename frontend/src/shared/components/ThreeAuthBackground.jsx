import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeAuthBackground = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 1. Setup Scene, Camera, Renderer
        const scene = new THREE.Scene();
        scene.fog = new THREE.FogExp2('#022c22', 0.1);

        const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.z = 7;

        // Decorative only: without WebGL (old device, disabled GPU) skip the scene instead of crashing the page

        let renderer;

        try {

            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

        } catch {

            return undefined;

        }
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 2. Procedural Glowing Sparkle Texture
        const createTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.2, 'rgba(52, 211, 153, 0.8)'); // emerald-400
            grad.addColorStop(1, 'rgba(52, 211, 153, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 32, 32);
            return new THREE.CanvasTexture(canvas);
        };
        const sparkTexture = createTexture();

        // 3. Base Constellation Particles
        const count = 180;
        const positions = new Float32Array(count * 3);
        const velocities = new Float32Array(count * 3);

        for (let i = 0; i < count; i++) {
            // Spawn in a wider box
            positions[i * 3] = (Math.random() - 0.5) * 12;
            positions[i * 3 + 1] = (Math.random() - 0.5) * 12;
            positions[i * 3 + 2] = (Math.random() - 0.5) * 6;

            velocities[i * 3] = (Math.random() - 0.5) * 0.006;
            velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.006;
            velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.003;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 0.15,
            map: sparkTexture,
            transparent: true,
            opacity: 0.5,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // 4. Sparks System for Keystroke reaction (Creative Change!)
        const maxSparks = 200;
        const sparksGeometry = new THREE.BufferGeometry();
        const sparksPositions = new Float32Array(maxSparks * 3);
        const sparksVelocities = new Float32Array(maxSparks * 3);
        const sparksAges = new Float32Array(maxSparks); // 0 = dead, >0 = alive/fading

        sparksGeometry.setAttribute('position', new THREE.BufferAttribute(sparksPositions, 3));

        const sparksMaterial = new THREE.PointsMaterial({
            size: 0.25,
            map: sparkTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            vertexColors: false,
        });

        const sparksPoints = new THREE.Points(sparksGeometry, sparksMaterial);
        scene.add(sparksPoints);

        let activeSparkIndex = 0;

        const triggerKeystrokeSparks = () => {
            // Spawn 8 sparks on keypress
            for (let k = 0; k < 8; k++) {
                const index = activeSparkIndex;
                
                // Position at center with small variance
                sparksPositions[index * 3] = (Math.random() - 0.5) * 0.5;
                sparksPositions[index * 3 + 1] = (Math.random() - 0.5) * 0.5;
                sparksPositions[index * 3 + 2] = (Math.random() - 0.5) * 0.5;

                // Random fast velocity radial explosion
                const angle = Math.random() * Math.PI * 2;
                const speed = 0.04 + Math.random() * 0.06;
                sparksVelocities[index * 3] = Math.cos(angle) * speed;
                sparksVelocities[index * 3 + 1] = Math.sin(angle) * speed;
                sparksVelocities[index * 3 + 2] = (Math.random() - 0.5) * 0.03;

                sparksAges[index] = 1.0; // Age initialized to full opacity

                activeSparkIndex = (activeSparkIndex + 1) % maxSparks;
            }
        };

        // 5. Mouse Parallax and Keyboard Listeners
        let mouseX = 0, mouseY = 0;
        let targetMouseX = 0, targetMouseY = 0;

        const handleMouseMove = (e) => {
            targetMouseX = (e.clientX / window.innerWidth) - 0.5;
            targetMouseY = (e.clientY / window.innerHeight) - 0.5;
        };

        const handleKeyDown = () => {
            triggerKeystrokeSparks();
        };

        const handleResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('keydown', handleKeyDown);
        window.addEventListener('resize', handleResize);

        // 6. Animation Loop
        let animationFrameId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const elapsed = clock.getElapsedTime();

            // Smooth parallax
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;

            // Rotate camera slightly based on mouse
            camera.position.x = mouseX * 2.5;
            camera.position.y = -mouseY * 2.5;
            camera.lookAt(0, 0, 0);

            // Animate Base Constellation
            const pos = geometry.attributes.position.array;
            for (let i = 0; i < count; i++) {
                pos[i * 3] += velocities[i * 3];
                pos[i * 3 + 1] += velocities[i * 3 + 1];
                pos[i * 3 + 2] += velocities[i * 3 + 2];

                // Wrap boundaries
                if (Math.abs(pos[i * 3]) > 6) velocities[i * 3] *= -1;
                if (Math.abs(pos[i * 3 + 1]) > 6) velocities[i * 3 + 1] *= -1;
                if (Math.abs(pos[i * 3 + 2]) > 3) velocities[i * 3 + 2] *= -1;
            }
            geometry.attributes.position.needsUpdate = true;

            // Animate Sparks
            const sparksPos = sparksGeometry.attributes.position.array;
            for (let i = 0; i < maxSparks; i++) {
                if (sparksAges[i] > 0) {
                    // Update positions with velocities
                    sparksPos[i * 3] += sparksVelocities[i * 3];
                    sparksPos[i * 3 + 1] += sparksVelocities[i * 3 + 1];
                    sparksPos[i * 3 + 2] += sparksVelocities[i * 3 + 2];

                    // Slow down / drag effect
                    sparksVelocities[i * 3] *= 0.96;
                    sparksVelocities[i * 3 + 1] *= 0.96;
                    sparksVelocities[i * 3 + 2] *= 0.96;

                    // Fade out
                    sparksAges[i] -= 0.02; // Spark lifespan
                    if (sparksAges[i] <= 0) {
                        sparksAges[i] = 0;
                        // Move dead sparks far away
                        sparksPos[i * 3] = 999;
                        sparksPos[i * 3 + 1] = 999;
                        sparksPos[i * 3 + 2] = 999;
                    }
                }
            }
            sparksGeometry.attributes.position.needsUpdate = true;

            points.rotation.y = elapsed * 0.04;
            points.rotation.x = elapsed * 0.01;

            renderer.render(scene, camera);
        };
        animate();

        // 7. Cleanups
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('keydown', handleKeyDown);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);

            geometry.dispose();
            material.dispose();
            sparksGeometry.dispose();
            sparksMaterial.dispose();
            sparkTexture.dispose();
            renderer.dispose();
            
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="absolute inset-0 z-0 bg-[#021f18] select-none pointer-events-none overflow-hidden"
        />
    );
};

export default ThreeAuthBackground;

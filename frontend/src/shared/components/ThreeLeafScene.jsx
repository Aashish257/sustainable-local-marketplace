import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeLeafScene = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // Respect prefers-reduced-motion
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        if (prefersReducedMotion) return;

        // 1. Scene, Camera, Renderer
        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 100);
        camera.position.z = 8;

        let renderer;
        try {
            renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        } catch (e) {
            return; // WebGL not supported
        }

        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 2. Procedural Leaf Texture with emerald vein gradient
        const createLeafTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            // Draw organic leaf shape
            ctx.beginPath();
            ctx.moveTo(32, 4);
            ctx.bezierCurveTo(56, 16, 56, 48, 32, 60);
            ctx.bezierCurveTo(8, 48, 8, 16, 32, 4);
            ctx.closePath();

            const grad = ctx.createLinearGradient(16, 8, 48, 56);
            grad.addColorStop(0, '#34d399'); // emerald-400
            grad.addColorStop(0.5, '#10b981'); // emerald-500
            grad.addColorStop(1, '#059669'); // emerald-600
            ctx.fillStyle = grad;
            ctx.fill();

            // Leaf vein
            ctx.beginPath();
            ctx.moveTo(32, 8);
            ctx.lineTo(32, 54);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.4)';
            ctx.lineWidth = 1.5;
            ctx.stroke();

            return new THREE.CanvasTexture(canvas);
        };

        const leafTexture = createLeafTexture();

        // 3. Leaf Particles Array
        const count = 45;
        const leaves = [];
        const leafGeometry = new THREE.PlaneGeometry(0.5, 0.65);
        const leafMaterial = new THREE.MeshBasicMaterial({
            map: leafTexture,
            transparent: true,
            opacity: 0.85,
            side: THREE.DoubleSide,
            depthWrite: false,
        });

        for (let i = 0; i < count; i++) {
            const mesh = new THREE.Mesh(leafGeometry, leafMaterial);
            mesh.position.set(
                (Math.random() - 0.5) * 16,
                (Math.random() - 0.5) * 12,
                (Math.random() - 0.5) * 6
            );
            mesh.rotation.z = Math.random() * Math.PI * 2;
            mesh.rotation.y = Math.random() * Math.PI * 2;

            leaves.push({
                mesh,
                speedY: 0.006 + Math.random() * 0.008,
                wobbleSpeed: 0.015 + Math.random() * 0.02,
                wobbleAmp: 0.004 + Math.random() * 0.006,
                rotSpeedX: (Math.random() - 0.5) * 0.015,
                rotSpeedZ: (Math.random() - 0.5) * 0.015,
                angle: Math.random() * Math.PI * 2,
            });

            scene.add(mesh);
        }

        // 4. Mouse & Scroll Interaction
        let mouseX = 0;
        let mouseY = 0;
        let scrollY = 0;

        const handleMouseMove = (e) => {
            mouseX = (e.clientX / window.innerWidth - 0.5) * 1.5;
            mouseY = (e.clientY / window.innerHeight - 0.5) * 1.5;
        };

        const handleScroll = () => {
            scrollY = window.scrollY * 0.002;
        };

        const handleResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };

        window.addEventListener('mousemove', handleMouseMove, { passive: true });
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);

        // 5. Animation Loop
        let animationFrameId;
        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            // Subtle camera sway with mouse and scroll
            camera.position.x += (mouseX - camera.position.x) * 0.03;
            camera.position.y += (-mouseY - scrollY - camera.position.y) * 0.03;
            camera.lookAt(0, 0, 0);

            // Animate leaves drift
            leaves.forEach((l) => {
                l.angle += l.wobbleSpeed;
                l.mesh.position.y -= l.speedY;
                l.mesh.position.x += Math.sin(l.angle) * l.wobbleAmp;

                l.mesh.rotation.x += l.rotSpeedX;
                l.mesh.rotation.z += l.rotSpeedZ;

                // Reset when leaf falls below viewport
                if (l.mesh.position.y < -7) {
                    l.mesh.position.y = 7;
                    l.mesh.position.x = (Math.random() - 0.5) * 16;
                }
            });

            renderer.render(scene, camera);
        };

        animate();

        // 6. Complete Memory Disposal on Unmount
        return () => {
            cancelAnimationFrame(animationFrameId);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);

            leafGeometry.dispose();
            leafMaterial.dispose();
            leafTexture.dispose();
            renderer.dispose();

            if (container && renderer.domElement && container.contains(renderer.domElement)) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div
            ref={containerRef}
            className="absolute inset-0 pointer-events-none z-0 overflow-hidden"
            aria-hidden="true"
        />
    );
};

export default ThreeLeafScene;

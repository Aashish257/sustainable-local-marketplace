import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeImpactSphere = ({ co2Saved = 0 }) => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 1. Setup Scene, Camera, Renderer
        const scene = new THREE.Scene();

        const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 10);
        camera.position.z = 3.5;

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

        // 2. Procedural Glowing Particle Canvas
        const createTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 32;
            canvas.height = 32;
            const ctx = canvas.getContext('2d');
            const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.3, 'rgba(52, 211, 153, 0.8)'); // emerald-400
            grad.addColorStop(1, 'rgba(52, 211, 153, 0)');
            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 32, 32);
            return new THREE.CanvasTexture(canvas);
        };
        const pTexture = createTexture();

        // 3. Create Sphere Particles
        // Scale parameters dynamically with co2Savings
        const intensity = Math.min(3.0, 1.0 + co2Saved * 0.05); 
        const speedFactor = Math.min(2.5, 1.0 + co2Saved * 0.03);
        const count = Math.min(1000, 250 + Math.floor(co2Saved * 15));

        const positions = new Float32Array(count * 3);
        const angles = new Float32Array(count);
        const radii = new Float32Array(count);
        const speeds = new Float32Array(count);

        for (let i = 0; i < count; i++) {
            // Distribute in a spherical shell
            const u = Math.random();
            const v = Math.random();
            const theta = u * 2.0 * Math.PI;
            const phi = Math.acos(2.0 * v - 1.0);
            
            const r = 0.8 + Math.random() * 0.15;
            radii[i] = r;

            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = r * Math.cos(phi);

            angles[i] = Math.random() * Math.PI * 2;
            speeds[i] = (Math.random() * 0.2 + 0.1) * speedFactor;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

        const material = new THREE.PointsMaterial({
            size: 0.14,
            map: pTexture,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            opacity: 0.95
        });

        const points = new THREE.Points(geometry, material);
        scene.add(points);

        // Resize Observer
        const resizeObserver = new ResizeObserver(() => {
            if (!container || !renderer) return;
            const w = container.clientWidth;
            const h = container.clientHeight;
            camera.aspect = w / h;
            camera.updateProjectionMatrix();
            renderer.setSize(w, h);
        });
        resizeObserver.observe(container);

        // 4. Animation Loop
        let animationFrameId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const elapsed = clock.getElapsedTime();
            const posArray = geometry.attributes.position.array;

            // Animate particles (slight orbital movement + breathing)
            const pulse = 1.0 + Math.sin(elapsed * 2.5) * 0.08 * intensity;

            for (let i = 0; i < count; i++) {
                angles[i] += speeds[i] * 0.02;

                const baseIdx = i * 3;
                // Add minor orbital drift
                posArray[baseIdx] += Math.sin(angles[i]) * 0.002;
                posArray[baseIdx + 1] += Math.cos(angles[i]) * 0.002;
                posArray[baseIdx + 2] += Math.sin(angles[i] * 0.5) * 0.001;
            }

            geometry.attributes.position.needsUpdate = true;

            // Pulse the overall scale based on co2Saved intensity
            points.scale.setScalar(pulse);
            points.rotation.y = elapsed * 0.18 * speedFactor;
            points.rotation.x = elapsed * 0.06 * speedFactor;

            renderer.render(scene, camera);
        };
        animate();

        // 5. Cleanups
        return () => {
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);

            geometry.dispose();
            material.dispose();
            pTexture.dispose();
            renderer.dispose();
            
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
        };
    }, [co2Saved]);

    return (
        <div 
            ref={containerRef} 
            className="w-16 h-16 relative flex items-center justify-center select-none"
        />
    );
};

export default ThreeImpactSphere;

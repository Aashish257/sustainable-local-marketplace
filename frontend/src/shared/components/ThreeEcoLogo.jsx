import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeEcoLogo = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 1. Setup Scene, Camera, Renderer
        const scene = new THREE.Scene();
        
        const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 10);
        camera.position.z = 3.2;

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

        // 2. Create Outer Octahedron Mesh (Wireframe)
        const outerGeometry = new THREE.OctahedronGeometry(0.8, 0);
        const outerMaterial = new THREE.MeshBasicMaterial({
            color: '#34d399', // emerald-400
            wireframe: true,
            transparent: true,
            opacity: 0.8
        });
        const outerMesh = new THREE.Mesh(outerGeometry, outerMaterial);
        scene.add(outerMesh);

        // 3. Create Inner Octahedron Core (Solid Glistening glass-like)
        const innerGeometry = new THREE.OctahedronGeometry(0.4, 0);
        const innerMaterial = new THREE.MeshPhongMaterial({
            color: '#059669', // emerald-600
            emissive: '#047857',
            shininess: 80,
            flatShading: true,
            transparent: true,
            opacity: 0.9
        });
        const innerMesh = new THREE.Mesh(innerGeometry, innerMaterial);
        scene.add(innerMesh);

        // Lights (Phong needs lights)
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
        scene.add(ambientLight);

        const pointLight = new THREE.PointLight('#6ee7b7', 2, 50);
        pointLight.position.set(2, 2, 2);
        scene.add(pointLight);

        // 4. Handle Hover Speedup
        let hoverActive = false;
        let rotationSpeed = 0.015;

        const handleMouseEnter = () => { hoverActive = true; };
        const handleMouseLeave = () => { hoverActive = false; };

        container.addEventListener('mouseenter', handleMouseEnter);
        container.addEventListener('mouseleave', handleMouseLeave);

        // Handle Resize
        const resizeObserver = new ResizeObserver(() => {
            if (!container || !renderer) return;
            const width = container.clientWidth;
            const height = container.clientHeight;
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
            renderer.setSize(width, height);
        });
        resizeObserver.observe(container);

        // 5. Animation Loop
        let animationFrameId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const elapsed = clock.getElapsedTime();

            // Smooth rotation speed transitions
            const targetSpeed = hoverActive ? 0.06 : 0.015;
            rotationSpeed += (targetSpeed - rotationSpeed) * 0.1;

            // Outer wireframe spins opposite to inner solid core
            outerMesh.rotation.y += rotationSpeed;
            outerMesh.rotation.x += rotationSpeed * 0.5;

            innerMesh.rotation.y -= rotationSpeed * 1.5;
            innerMesh.rotation.z += rotationSpeed * 0.7;

            // Pulsing scaling of inner core
            const pulse = 1.0 + Math.sin(elapsed * 4.0) * 0.15;
            innerMesh.scale.setScalar(pulse);

            // Glistening color transition
            const hue = (Math.sin(elapsed * 0.5) * 0.5 + 0.5) * 0.15 + 0.35; // Sage to emerald
            innerMaterial.color.setHSL(hue, 0.8, 0.45);

            renderer.render(scene, camera);
        };
        animate();

        // 6. WebGL Cleanups
        return () => {
            container.removeEventListener('mouseenter', handleMouseEnter);
            container.removeEventListener('mouseleave', handleMouseLeave);
            resizeObserver.disconnect();
            cancelAnimationFrame(animationFrameId);

            outerGeometry.dispose();
            outerMaterial.dispose();
            innerGeometry.dispose();
            innerMaterial.dispose();
            renderer.dispose();
            
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="w-14 h-14 bg-emerald-50/50 border border-emerald-100 rounded-2xl flex items-center justify-center cursor-pointer select-none"
        />
    );
};

export default ThreeEcoLogo;

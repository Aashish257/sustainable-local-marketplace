import { useEffect, useRef } from 'react';
import * as THREE from 'three';

const ThreeHeroCanvas = () => {
    const containerRef = useRef(null);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // 1. Setup Scene, Camera, Renderer
        const scene = new THREE.Scene();
        
        // Add subtle green fog to blend with the background
        scene.fog = new THREE.FogExp2('#022c22', 0.15);

        const camera = new THREE.PerspectiveCamera(
            60,
            container.clientWidth / container.clientHeight,
            0.1,
            100
        );
        camera.position.z = 5.5;

        const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
        renderer.setSize(container.clientWidth, container.clientHeight);
        renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
        container.appendChild(renderer.domElement);

        // 2. Create Procedural Glowing Particle Texture
        const createParticleTexture = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const ctx = canvas.getContext('2d');

            const grad = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
            grad.addColorStop(0, 'rgba(255, 255, 255, 1)');
            grad.addColorStop(0.2, 'rgba(110, 231, 183, 0.8)'); // emerald-300
            grad.addColorStop(0.5, 'rgba(16, 185, 129, 0.3)');  // emerald-500
            grad.addColorStop(1, 'rgba(16, 185, 129, 0)');

            ctx.fillStyle = grad;
            ctx.fillRect(0, 0, 64, 64);

            return new THREE.CanvasTexture(canvas);
        };

        const particleTexture = createParticleTexture();

        // 3. Create Particle Globe Geometry & Material
        const radius = 2.0;
        const count = 2200;
        const positions = new Float32Array(count * 3);
        const colors = new Float32Array(count * 3);
        const sizes = new Float32Array(count);

        const color1 = new THREE.Color('#34d399'); // emerald-400
        const color2 = new THREE.Color('#059669'); // emerald-600
        const color3 = new THREE.Color('#a7f3d0'); // emerald-200

        for (let i = 0; i < count; i++) {
            const phi = Math.acos(-1 + (2 * i) / count);
            const theta = Math.sqrt(count * Math.PI) * phi;

            positions[i * 3] = radius * Math.sin(phi) * Math.cos(theta);
            positions[i * 3 + 1] = radius * Math.sin(phi) * Math.sin(theta);
            positions[i * 3 + 2] = radius * Math.cos(phi);

            // Add slight randomness to make it feel organic
            positions[i * 3] += (Math.random() - 0.5) * 0.08;
            positions[i * 3 + 1] += (Math.random() - 0.5) * 0.08;
            positions[i * 3 + 2] += (Math.random() - 0.5) * 0.08;

            // Blend colors based on height (Y-coordinate)
            const ratio = (positions[i * 3 + 1] + radius) / (radius * 2);
            let mixedColor;
            if (ratio < 0.5) {
                mixedColor = color1.clone().lerp(color2, ratio * 2);
            } else {
                mixedColor = color2.clone().lerp(color3, (ratio - 0.5) * 2);
            }

            colors[i * 3] = mixedColor.r;
            colors[i * 3 + 1] = mixedColor.g;
            colors[i * 3 + 2] = mixedColor.b;

            // Random sizes for depth variation
            sizes[i] = Math.random() * 0.5 + 0.5;
        }

        const geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

        const material = new THREE.PointsMaterial({
            size: 0.12,
            map: particleTexture,
            vertexColors: true,
            transparent: true,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
        });

        const points = new THREE.Points(geometry, material);

        // 4. Create outer atmospheric glow shell
        const glowGeometry = new THREE.IcosahedronGeometry(radius * 1.05, 2);
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: '#10b981',
            wireframe: true,
            transparent: true,
            opacity: 0.12,
            blending: THREE.AdditiveBlending,
        });
        const glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);

        // Group globe elements
        const globeGroup = new THREE.Group();
        globeGroup.add(points);
        globeGroup.add(glowMesh);
        scene.add(globeGroup);

        // 5. Create 3D Leaf Drift System
        const createLeafGeometry = () => {
            const leafShape = new THREE.Shape();
            leafShape.moveTo(0, 0);
            leafShape.quadraticCurveTo(0.2, 0.4, 0.2, 0.8);
            leafShape.quadraticCurveTo(0.2, 1.2, 0, 1.6);
            leafShape.quadraticCurveTo(-0.2, 1.2, -0.2, 0.8);
            leafShape.quadraticCurveTo(-0.2, 0.4, 0, 0);
            
            const geo = new THREE.ShapeGeometry(leafShape);
            geo.center();
            geo.scale(0.12, 0.12, 0.12);
            return geo;
        };

        const leafGeometry = createLeafGeometry();
        const leafMaterials = [
            new THREE.MeshBasicMaterial({ color: '#047857', side: THREE.DoubleSide, transparent: true, opacity: 0.7 }), // emerald-700
            new THREE.MeshBasicMaterial({ color: '#065f46', side: THREE.DoubleSide, transparent: true, opacity: 0.8 }), // emerald-800
            new THREE.MeshBasicMaterial({ color: '#10b981', side: THREE.DoubleSide, transparent: true, opacity: 0.6 }), // emerald-500
            new THREE.MeshBasicMaterial({ color: '#34d399', side: THREE.DoubleSide, transparent: true, opacity: 0.65 }), // emerald-400
        ];

        const leavesGroup = new THREE.Group();
        const leaves = [];
        const leavesCount = 45;

        for (let i = 0; i < leavesCount; i++) {
            const mat = leafMaterials[i % leafMaterials.length];
            const mesh = new THREE.Mesh(leafGeometry, mat);
            
            mesh.position.x = (Math.random() - 0.5) * 12;
            mesh.position.y = (Math.random() - 0.5) * 12;
            mesh.position.z = (Math.random() - 0.5) * 4 - 1.0;
            
            mesh.rotation.set(
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2,
                Math.random() * Math.PI * 2
            );
            
            const scaleVal = Math.random() * 0.4 + 0.8;
            mesh.scale.setScalar(scaleVal);
            
            mesh.userData = {
                speedY: Math.random() * 0.005 + 0.003,
                swaySpeed: Math.random() * 1.2 + 0.6,
                swayAmp: Math.random() * 0.012 + 0.004,
                rotSpeedX: (Math.random() - 0.5) * 0.01,
                rotSpeedY: (Math.random() - 0.5) * 0.012,
                rotSpeedZ: (Math.random() - 0.5) * 0.01,
                phase: Math.random() * Math.PI * 2,
                initialX: mesh.position.x
            };
            
            leaves.push(mesh);
            leavesGroup.add(mesh);
        }
        scene.add(leavesGroup);

        // 6. Setup Interactive Targets
        let mouseX = 0;
        let mouseY = 0;
        let targetMouseX = 0;
        let targetMouseY = 0;

        let scrollY = window.scrollY;
        let targetScrollY = window.scrollY;

        // 7. Event Listeners
        const handleMouseMove = (event) => {
            targetMouseX = (event.clientX / window.innerWidth) - 0.5;
            targetMouseY = (event.clientY / window.innerHeight) - 0.5;
        };

        const handleScroll = () => {
            targetScrollY = window.scrollY;
        };

        const handleResize = () => {
            if (!container) return;
            camera.aspect = container.clientWidth / container.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(container.clientWidth, container.clientHeight);
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleResize);

        // 8. Animation Loop
        let animationFrameId;
        const clock = new THREE.Clock();

        const animate = () => {
            animationFrameId = requestAnimationFrame(animate);

            const elapsedTime = clock.getElapsedTime();

            // Smooth interpolation (lerp)
            mouseX += (targetMouseX - mouseX) * 0.05;
            mouseY += (targetMouseY - mouseY) * 0.05;
            scrollY += (targetScrollY - scrollY) * 0.08;

            // Globe Auto-rotation + Mouse influence
            globeGroup.rotation.y = elapsedTime * 0.12 + mouseX * 0.4;
            globeGroup.rotation.x = elapsedTime * 0.05 + mouseY * 0.3;

            // Scroll animations:
            globeGroup.position.y = -scrollY * 0.0035;
            globeGroup.position.x = scrollY * 0.002;
            
            const scaleVal = Math.max(0.65, 1.0 - scrollY * 0.0008);
            globeGroup.scale.setScalar(scaleVal);

            const opacityVal = Math.max(0, 1.0 - scrollY * 0.0018);
            material.opacity = opacityVal;
            glowMaterial.opacity = opacityVal * 0.12;

            // Subtle particle breathing
            const pulse = Math.sin(elapsedTime * 2.0) * 0.015;
            points.scale.setScalar(1.0 + pulse);

            // Animate Floating Leaves
            leaves.forEach((leaf) => {
                leaf.position.y -= leaf.userData.speedY;
                leaf.position.x = leaf.userData.initialX + Math.sin(elapsedTime * leaf.userData.swaySpeed + leaf.userData.phase) * leaf.userData.swayAmp * 12;
                
                leaf.rotation.x += leaf.userData.rotSpeedX;
                leaf.rotation.y += leaf.userData.rotSpeedY;
                leaf.rotation.z += leaf.userData.rotSpeedZ;
                
                // Reset if it drifts below the viewport
                if (leaf.position.y < -6) {
                    leaf.position.y = 6;
                    leaf.position.x = (Math.random() - 0.5) * 12;
                    leaf.userData.initialX = leaf.position.x;
                    leaf.position.z = (Math.random() - 0.5) * 4 - 1.0;
                }
            });

            // Parallax scroll effect on leaves group
            leavesGroup.position.y = scrollY * 0.0025;

            renderer.render(scene, camera);
        };

        animate();

        // 9. Cleanup
        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleResize);
            cancelAnimationFrame(animationFrameId);

            geometry.dispose();
            material.dispose();
            glowGeometry.dispose();
            glowMaterial.dispose();
            particleTexture.dispose();
            
            leafGeometry.dispose();
            leafMaterials.forEach(m => m.dispose());

            renderer.dispose();
            
            if (container && renderer.domElement) {
                container.removeChild(renderer.domElement);
            }
        };
    }, []);

    return (
        <div 
            ref={containerRef} 
            className="w-full h-full min-h-[350px] md:min-h-[500px] relative z-10 select-none pointer-events-none"
        />
    );
};

export default ThreeHeroCanvas;

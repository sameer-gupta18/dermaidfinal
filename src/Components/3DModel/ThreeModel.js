import { useEffect, useRef } from "react";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";

export default function ThreeModel() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;

    // Scene
    const scene = new THREE.Scene();

    // Get initial dimensions
    const width = mount.clientWidth || 800;
    const height = mount.clientHeight || 500;

    // Camera
    const camera = new THREE.PerspectiveCamera(
      50,
      width / height,
      0.1,
      1000
    );
    camera.position.set(0, 1, 5);

    // Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2)); // Limit pixel ratio for performance
    renderer.domElement.style.display = 'block';
    mount.appendChild(renderer.domElement);

    // Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
    scene.add(ambientLight);
    const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
    directionalLight.position.set(5, 10, 7.5);
    scene.add(directionalLight);

    // Load Model
    const loader = new GLTFLoader();
    let model;
    let modelGroup; // Group to ensure rotation around center
    let originalModelSize = null; // Store original size for resize calculations
    
    loader.load(
      "/3d_model/scene.gltf",
      (gltf) => {
        model = gltf.scene;
        
        // Calculate bounding box to fit model properly (before any transformations)
        const box = new THREE.Box3().setFromObject(model);
        const center = box.getCenter(new THREE.Vector3());
        const size = box.getSize(new THREE.Vector3());
        
        // Store original size for resize handler
        originalModelSize = { x: size.x, y: size.y, z: size.z };
        
        // Create a group first - this will be our rotation pivot at origin
        modelGroup = new THREE.Group();
        scene.add(modelGroup);
        
        // Center the model's geometry at the origin by translating it
        // This ensures the model's center is exactly at (0,0,0)
        model.position.x = -center.x;
        model.position.y = -center.y;
        model.position.z = -center.z;
        
        // Add the centered model to the group
        modelGroup.add(model);
        
        // Get container dimensions
        const containerWidth = mount.clientWidth || 800;
        const containerHeight = mount.clientHeight || 500;
        
        // Calculate scale based on container size
        // Increased size while maintaining safe margins
        const targetHeight = containerHeight * 0.85; // 85% of container height
        const targetWidth = containerWidth * 0.85;   // 85% of container width
        
        // Calculate scale factors for both dimensions
        const scaleX = targetWidth / size.x;
        const scaleY = targetHeight / size.y;
        
        // Use the smaller scale to ensure model fits in both dimensions
        // Reduced padding slightly to make model bigger while still safe
        const scale = Math.min(scaleX, scaleY) * 0.95;
        
        // Apply scale to the group instead of the model
        // This ensures the model stays centered at origin (0,0,0) during scaling
        modelGroup.scale.set(scale, scale, scale);
        
        // Recalculate bounding box after scaling to get accurate size
        // Use modelGroup to get the complete transformed bounding box
        const scaledBox = new THREE.Box3().setFromObject(modelGroup);
        const scaledSize = scaledBox.getSize(new THREE.Vector3());
        
        // Calculate optimal camera distance to fit the entire model
        const fovRad = camera.fov * (Math.PI / 180);
        const aspect = containerWidth / containerHeight;
        
        // Calculate distance needed for both width and height
        // Account for rotation - need to fit the diagonal (largest possible dimension when rotated)
        const diagonal = Math.sqrt(scaledSize.x * scaledSize.x + scaledSize.y * scaledSize.y + scaledSize.z * scaledSize.z);
        
        // Use diagonal to ensure model fits even when rotated
        const distForWidth = (diagonal / 2) / Math.tan(fovRad / 2) / aspect;
        const distForHeight = (diagonal / 2) / Math.tan(fovRad / 2);
        
        // Use the maximum distance and add more padding to prevent cropping during rotation
        const optimalDistance = Math.max(distForWidth, distForHeight) * 1.3;
        
        // Set camera position at an angle (more parallel view) - offset to the side and slightly elevated
        const angleOffset = optimalDistance * 0.3; // 30% offset for parallel view
        camera.position.set(angleOffset, scaledSize.y * 0.15, optimalDistance * 0.75);
        camera.lookAt(0, 0, 0);
      },
      (progress) => {
        // Optional: log loading progress
        if (progress.total > 0) {
          const percent = (progress.loaded / progress.total) * 100;
          console.log(`Loading: ${percent.toFixed(2)}%`);
        }
      },
      (error) => {
        console.error("Error loading model:", error);
      }
    );

    // Handle window resize
    const handleResize = () => {
      const newWidth = mount.clientWidth || 800;
      const newHeight = mount.clientHeight || 500;
      camera.aspect = newWidth / newHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(newWidth, newHeight);
      
      // Recalculate model scale and camera position if model is loaded
      if (model && modelGroup && originalModelSize) {
        // Calculate new scale based on container size using original model size
        const targetHeight = newHeight * 0.85;
        const targetWidth = newWidth * 0.85;
        
        const scaleX = targetWidth / originalModelSize.x;
        const scaleY = targetHeight / originalModelSize.y;
        const scale = Math.min(scaleX, scaleY) * 0.95;
        
        // Scale the group to maintain center at origin
        modelGroup.scale.set(scale, scale, scale);
        
        // Recalculate camera position
        const scaledBox = new THREE.Box3().setFromObject(modelGroup);
        const scaledSize = scaledBox.getSize(new THREE.Vector3());
        const fovRad = camera.fov * (Math.PI / 180);
        const aspect = newWidth / newHeight;
        
        // Account for rotation - use diagonal to ensure model fits even when rotated
        const diagonal = Math.sqrt(scaledSize.x * scaledSize.x + scaledSize.y * scaledSize.y + scaledSize.z * scaledSize.z);
        
        const distForWidth = (diagonal / 2) / Math.tan(fovRad / 2) / aspect;
        const distForHeight = (diagonal / 2) / Math.tan(fovRad / 2);
        
        const optimalDistance = Math.max(distForWidth, distForHeight) * 1.3;
        const angleOffset = optimalDistance * 0.3;
        camera.position.set(angleOffset, scaledSize.y * 0.15, optimalDistance * 0.75);
        camera.lookAt(0, 0, 0);
      }
    };
    window.addEventListener("resize", handleResize);

    // Animation loop
    let animationId;
    const animate = () => {
      animationId = requestAnimationFrame(animate);
      // Rotate the group instead of the model directly to ensure rotation around center
      if (modelGroup) modelGroup.rotation.y += 0.01;
      renderer.render(scene, camera);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", handleResize);
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      if (mount && renderer.domElement) {
        mount.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      className="three-model-wrapper"
      style={{ 
        width: "100%", 
        height: "100%", 
        backgroundColor: "transparent",
        overflow: "hidden",
        position: "relative"
      }}
    />
  );
}

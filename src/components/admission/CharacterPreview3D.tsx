import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { createMonopolyHead } from '../game3d/monopolyFace';
import { CharacterCustomization } from '../../types/game';
import { RotateCw } from 'lucide-react';

interface CharacterPreview3DProps {
  customization: CharacterCustomization;
  interactive?: boolean;
}

export const CharacterPreview3D: React.FC<CharacterPreview3DProps> = ({
  customization,
  interactive = true
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const characterGroupRef = useRef<THREE.Group | null>(null);
  const isDraggingRef = useRef(false);
  const lastMouseXRef = useRef(0);
  const rotYRef = useRef(0);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 1.45, 4.2);
    camera.lookAt(0, 1.25, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Warm Studio Lighting
    const ambient = new THREE.AmbientLight('#ffffff', 0.95);
    scene.add(ambient);

    const keyLight = new THREE.DirectionalLight('#fffbeb', 1.35);
    keyLight.position.set(4, 8, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight('#38bdf8', 0.65);
    fillLight.position.set(-4, 3, 2);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight('#facc15', 0.4);
    rimLight.position.set(0, 5, -5);
    scene.add(rimLight);

    // Rotating Pedestal
    const pedestal = new THREE.Mesh(
      new THREE.CylinderGeometry(1.2, 1.3, 0.15, 24),
      new THREE.MeshLambertMaterial({ color: '#1e293b' })
    );
    pedestal.position.y = -0.08;
    scene.add(pedestal);

    const pedestalRim = new THREE.Mesh(
      new THREE.TorusGeometry(1.25, 0.04, 8, 24),
      new THREE.MeshBasicMaterial({ color: '#f59e0b' })
    );
    pedestalRim.rotation.x = Math.PI / 2;
    pedestalRim.position.y = -0.02;
    scene.add(pedestalRim);

    // Rebuild Character based on props
    const char = new THREE.Group();
    char.position.y = 0;

    const skinTone = customization.complexion || (customization.gender === 'girl' ? '#795548' : '#5d4037');
    const skinMat = new THREE.MeshLambertMaterial({ color: skinTone });

    // Legs / Pants / Skirt
    const isSkirtOrDress = customization.outfitId === 'traditional_dress' || customization.outfitId === 'ankara_gown';
    const legMat = new THREE.MeshLambertMaterial({ color: customization.pantsColor || '#1e293b' });

    if (isSkirtOrDress) {
      // Flared Ankara gown or skirt
      const gown = new THREE.Mesh(
        new THREE.CylinderGeometry(0.42, 0.62, 0.95, 16),
        new THREE.MeshLambertMaterial({ color: customization.shirtColor || '#b91c1c' })
      );
      gown.position.set(0, 0.5, 0);
      char.add(gown);

      // Visible lower legs with chosen complexion
      [-0.18, 0.18].forEach((lx) => {
        const lowerLeg = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.09, 0.45, 10), skinMat);
        lowerLeg.position.set(lx, 0.22, 0);
        char.add(lowerLeg);
      });
    } else {
      const legL = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.95, 0.28), legMat);
      legL.position.set(-0.22, 0.48, 0);
      char.add(legL);

      const legR = new THREE.Mesh(new THREE.BoxGeometry(0.28, 0.95, 0.28), legMat);
      legR.position.set(0.22, 0.48, 0);
      char.add(legR);
    }

    // Shoes
    const shoeColor =
      customization.shoesId === 'jordans'
        ? '#dc2626'
        : customization.shoesId === 'loafers'
        ? '#78350f'
        : customization.shoesId === 'heels'
        ? '#db2777'
        : '#facc15';
    const shoeMat = new THREE.MeshLambertMaterial({ color: shoeColor });
    [-0.22, 0.22].forEach((sx) => {
      const shoe = new THREE.Mesh(new THREE.BoxGeometry(0.3, 0.16, 0.42), shoeMat);
      shoe.position.set(sx, 0.08, 0.06);
      char.add(shoe);
    });

    // Torso / Shirt
    const torsoMat = new THREE.MeshLambertMaterial({ color: customization.shirtColor || '#047857' });
    const torso = new THREE.Mesh(
      new THREE.BoxGeometry(customization.gender === 'girl' ? 0.78 : 0.84, 1.12, 0.44),
      torsoMat
    );
    torso.position.y = 1.45;
    char.add(torso);

    // Arms
    const armL = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.24), torsoMat);
    armL.position.set(-0.52, 1.45, 0);
    char.add(armL);

    const armR = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.85, 0.24), torsoMat);
    armR.position.set(0.52, 1.45, 0);
    char.add(armR);

    // Hands with matching complexion
    const handL = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), skinMat);
    handL.position.set(-0.52, 0.98, 0);
    char.add(handL);

    const handR = new THREE.Mesh(new THREE.SphereGeometry(0.1, 10, 10), skinMat);
    handR.position.set(0.52, 0.98, 0);
    char.add(handR);

    // Neck with matching complexion
    const neck = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.16, 0.25, 12), skinMat);
    neck.position.set(0, 2.05, 0);
    char.add(neck);

    // Accessories: Gold/Silver Chain at neck
    if (customization.accessoryId === 'chain' || customization.accessoryId === 'cuban') {
      const chainMat = new THREE.MeshBasicMaterial({
        color: customization.accessoryId === 'cuban' ? '#f59e0b' : '#e2e8f0'
      });
      const chain = new THREE.Mesh(new THREE.TorusGeometry(0.22, 0.025, 8, 20), chainMat);
      chain.rotation.x = Math.PI / 2.3;
      chain.position.set(0, 1.96, 0.08);
      char.add(chain);
    }

    // Wristwatch on left arm
    if (customization.accessoryId === 'watch') {
      const watch = new THREE.Mesh(
        new THREE.CylinderGeometry(0.14, 0.14, 0.08, 12),
        new THREE.MeshLambertMaterial({ color: '#f59e0b' })
      );
      watch.position.set(-0.52, 1.1, 0);
      char.add(watch);
    }

    // Bags: Backpack or Ghana-Must-Go bag
    if (customization.backpackId === 'ghana_must_go') {
      // Authentic woven Ghana-Must-Go tote bag beside feet
      const toteCanvas = document.createElement('canvas');
      toteCanvas.width = 128;
      toteCanvas.height = 128;
      const tctx = toteCanvas.getContext('2d');
      if (tctx) {
        tctx.fillStyle = '#dc2626';
        tctx.fillRect(0, 0, 128, 128);
        tctx.fillStyle = '#1d4ed8';
        for (let i = 0; i < 128; i += 32) {
          tctx.fillRect(i, 0, 16, 128);
          tctx.fillRect(0, i, 128, 16);
        }
        tctx.strokeStyle = '#ffffff';
        tctx.lineWidth = 4;
        tctx.strokeRect(2, 2, 124, 124);
      }
      const toteTex = new THREE.CanvasTexture(toteCanvas);
      toteTex.wrapS = THREE.RepeatWrapping;
      toteTex.wrapT = THREE.RepeatWrapping;
      toteTex.repeat.set(3, 3);

      const tote = new THREE.Mesh(
        new THREE.BoxGeometry(0.85, 0.9, 0.55),
        new THREE.MeshLambertMaterial({ map: toteTex })
      );
      tote.position.set(0.72, 0.45, 0.15);
      char.add(tote);
    } else if (customization.backpackId && customization.backpackId !== 'none') {
      const bagColor =
        customization.backpackId === 'tech'
          ? '#1e293b'
          : customization.backpackId === 'crossbody'
          ? '#d97706'
          : '#ea580c';
      const pack = new THREE.Mesh(
        new THREE.BoxGeometry(0.66, 0.82, 0.35),
        new THREE.MeshLambertMaterial({ color: bagColor })
      );
      pack.position.set(0, 1.42, -0.38);
      char.add(pack);
    }

    // 3D Head with custom hairstyle, complexion, & features
    const head = createMonopolyHead(customization.faceVariant, customization.complexion);
    head.position.y = 2.3;
    char.add(head);

    scene.add(char);
    characterGroupRef.current = char;

    // Interactive Drag to Rotate
    const onMouseDown = (e: MouseEvent) => {
      isDraggingRef.current = true;
      lastMouseXRef.current = e.clientX;
    };
    const onMouseMove = (e: MouseEvent) => {
      if (!isDraggingRef.current) return;
      const dx = e.clientX - lastMouseXRef.current;
      lastMouseXRef.current = e.clientX;
      rotYRef.current += dx * 0.015;
    };
    const onMouseUp = () => {
      isDraggingRef.current = false;
    };

    if (interactive) {
      container.addEventListener('mousedown', onMouseDown);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
    }

    let animId: number;
    let t = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.012;

      if (characterGroupRef.current) {
        if (!isDraggingRef.current) {
          rotYRef.current += 0.005; // Gentle turntable idle spin
        }
        characterGroupRef.current.rotation.y = rotYRef.current;
      }
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (interactive) {
        container.removeEventListener('mousedown', onMouseDown);
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      }
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [customization, interactive]);

  return (
    <div className="relative w-full h-full select-none overflow-hidden rounded-2xl bg-gradient-to-b from-stone-900/80 to-stone-950/90 border border-emerald-500/30 flex items-center justify-center">
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
      <div className="absolute bottom-2 right-2 text-[10px] text-stone-400 bg-stone-900/80 px-2 py-0.5 rounded-md border border-stone-800 flex items-center gap-1 pointer-events-none">
        <RotateCw className="w-3 h-3 text-amber-400" />
        <span>Drag to rotate 360°</span>
      </div>
    </div>
  );
};

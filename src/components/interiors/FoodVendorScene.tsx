import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerState, InventoryItem } from '../../types/game';
import { FOOD_VENDORS, FoodVendor, ShopItem } from '../../data/shops';
import { CampusPOI } from '../../data/campusLocations';
import { sounds } from '../../utils/audio';
import { formatNaira } from '../../utils/storage';
import { EatingCutscene3D } from '../dining/EatingCutscene3D';
import {
  Utensils,
  Coffee,
  Flame,
  CheckCircle2,
  Clock,
  Sparkles,
  ShoppingBag,
  X,
  Plus
} from 'lucide-react';

interface FoodVendorSceneProps {
  player: PlayerState;
  currentPOI: CampusPOI | null;
  onClose: () => void;
  onBuyFood: (item: ShopItem, vendorName: string) => void;
}

export const FoodVendorScene: React.FC<FoodVendorSceneProps> = ({
  player,
  currentPOI,
  onClose,
  onBuyFood
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [purchaseToast, setPurchaseToast] = useState<string | null>(null);
  const [eatingMeal, setEatingMeal] = useState<ShopItem | null>(null);

  // Identify which vendor based on POI ID
  const vendorId = currentPOI?.id || 'food_bukka';
  const vendor: FoodVendor =
    FOOD_VENDORS.find((v) => v.id === vendorId) || FOOD_VENDORS[0];

  // 3D Restaurant / Bukka Interior
  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#1c1917');

    const camera = new THREE.PerspectiveCamera(48, width / height, 0.1, 80);
    camera.position.set(0, 3.8, 8.5);
    camera.lookAt(0, 1.8, -2.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Terracotta / Tiled Eatery Floor
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshLambertMaterial({ color: '#7c2d12' })
    );
    floor.rotation.x = -Math.PI / 2;
    scene.add(floor);

    // Back Kitchen Wall with Menu Board
    const wallMat = new THREE.MeshLambertMaterial({ color: '#292524' });
    const backWall = new THREE.Mesh(new THREE.BoxGeometry(24, 10, 1), wallMat);
    backWall.position.set(0, 5, -6);
    scene.add(backWall);

    // Warm Food Service Counter
    const counter = new THREE.Mesh(
      new THREE.BoxGeometry(10, 1.6, 2.0),
      new THREE.MeshLambertMaterial({ color: '#44403c' })
    );
    counter.position.set(0, 0.8, -2);
    scene.add(counter);

    // Chafing Dishes / Steaming Pots on Counter
    [-3.2, -1.1, 1.1, 3.2].forEach((cx) => {
      const pot = new THREE.Mesh(
        new THREE.CylinderGeometry(0.65, 0.65, 0.5, 16),
        new THREE.MeshLambertMaterial({ color: '#cbd5e1' }) // Stainless steel
      );
      pot.position.set(cx, 1.85, -2);
      scene.add(pot);

      // Warm steam / food glow
      const steamLight = new THREE.PointLight('#f59e0b', 0.6, 3);
      steamLight.position.set(cx, 2.2, -2);
      scene.add(steamLight);
    });

    // Vendor NPC Character (Mama Nkechi / Chef behind counter)
    const chefGroup = new THREE.Group();
    chefGroup.position.set(0, 0, -3.5);

    const chefTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.85, 1.2, 0.5),
      new THREE.MeshLambertMaterial({ color: '#ea580c' }) // Vibrant orange/apron
    );
    chefTorso.position.y = 1.4;
    chefGroup.add(chefTorso);

    const chefHead = new THREE.Mesh(
      new THREE.SphereGeometry(0.35, 16, 16),
      new THREE.MeshLambertMaterial({ color: '#5d4037' })
    );
    chefHead.position.set(0, 2.25, 0);
    chefGroup.add(chefHead);

    scene.add(chefGroup);

    // Warm Restaurant Lighting
    const ambientLight = new THREE.AmbientLight('#fef08a', 0.65);
    scene.add(ambientLight);

    const spotlight = new THREE.DirectionalLight('#ffffff', 0.9);
    spotlight.position.set(2, 8, 4);
    scene.add(spotlight);

    let animId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animId = requestAnimationFrame(animate);
      const time = clock.getElapsedTime();
      camera.position.x = Math.sin(time * 0.25) * 0.5;
      chefGroup.position.x = Math.sin(time * 0.6) * 0.8;
      renderer.render(scene, camera);
    };
    animate();

    const handleResize = () => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, [vendorId]);

  const handlePurchaseItem = (item: ShopItem) => {
    sounds.playClick();
    if (player.balance < item.price) {
      setPurchaseToast(`⚠️ Insufficient Omo-Pay balance! You need ${formatNaira(item.price)} to purchase this meal.`);
      setTimeout(() => setPurchaseToast(null), 3000);
      return;
    }

    sounds.playCashPing();
    onBuyFood(item, vendor.name);
    setEatingMeal(item);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-300">
      <div className="relative w-full max-w-4xl h-[92vh] max-h-[820px] bg-stone-900 border-2 border-orange-500 rounded-3xl overflow-hidden shadow-2xl flex flex-col text-white">
        
        {/* 3D Restaurant Viewport */}
        <div ref={mountRef} className="relative h-56 sm:h-64 w-full bg-slate-950 overflow-hidden shrink-0">
          
          {/* Header */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between z-10 pointer-events-none">
            <div className="bg-stone-900/90 border border-orange-500/50 rounded-2xl px-3.5 py-1.5 shadow-xl backdrop-blur-md flex items-center gap-2.5">
              <span className="text-xl">{vendor.avatar}</span>
              <div>
                <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider">
                  Campus Food Joint • {vendor.vendorTitle}
                </div>
                <div className="text-xs font-black text-white">
                  {vendor.name}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 pointer-events-auto">
              <div className="bg-stone-900/90 border border-amber-400/80 rounded-2xl px-3 py-1 text-xs font-mono font-bold text-amber-300 shadow backdrop-blur-md">
                Wallet: {formatNaira(player.balance)}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl bg-stone-900/90 hover:bg-stone-800 border border-stone-700 text-stone-300 hover:text-white cursor-pointer shadow-lg backdrop-blur-md"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Toast */}
          {purchaseToast && (
            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20 bg-emerald-950/95 border border-emerald-400 text-emerald-200 px-5 py-2 rounded-2xl text-xs font-bold shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-2 max-w-md text-center">
              🍽️ {purchaseToast}
            </div>
          )}
        </div>

        {/* Vendor Menu Selection Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-3 bg-stone-900/95">
          <div className="flex items-center justify-between border-b border-stone-800 pb-2">
            <div>
              <div className="text-xs font-black text-white uppercase tracking-wider">
                Fresh Cooked Meals & Cold Drinks
              </div>
              <div className="text-[11px] text-stone-400 italic">
                "{vendor.tagline}"
              </div>
            </div>
            <div className="text-[10px] text-emerald-400 font-mono flex items-center gap-1 font-bold">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Consumes 20 Mins</span>
            </div>
          </div>

          {/* Food Menu Items Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {vendor.items.map((item) => (
              <div
                key={item.id}
                className="bg-stone-800/80 hover:bg-stone-800 border border-stone-700/80 hover:border-orange-500/60 rounded-2xl p-3.5 transition flex flex-col justify-between shadow"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl p-1.5 rounded-xl bg-stone-900 border border-stone-700">
                        {item.icon}
                      </span>
                      <div>
                        <h4 className="text-xs sm:text-sm font-black text-white leading-tight">
                          {item.name}
                        </h4>
                        <span className="text-[10px] text-emerald-400 font-bold">
                          {item.effect?.hunger ? `Hunger ${item.effect.hunger}%` : ''}{' '}
                          {item.effect?.stamina ? `• Stamina +${item.effect.stamina}%` : ''}
                        </span>
                      </div>
                    </div>
                  </div>
                  <p className="text-[11px] text-stone-300 mt-2 leading-snug">
                    {item.description}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-stone-700/60 flex items-center justify-between">
                  <span className="text-sm font-mono font-black text-amber-300">
                    {formatNaira(item.price)}
                  </span>

                  <button
                    type="button"
                    onClick={() => handlePurchaseItem(item)}
                    className="bg-orange-600 hover:bg-orange-500 text-white font-bold px-3.5 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Order & Eat</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3D Dining & Eating Cutscene */}
        {eatingMeal && (
          <EatingCutscene3D
            player={player}
            meal={eatingMeal}
            vendorName={vendor.name}
            onComplete={() => {
              setEatingMeal(null);
              onClose();
            }}
          />
        )}
      </div>
    </div>
  );
};

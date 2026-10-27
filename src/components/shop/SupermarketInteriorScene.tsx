import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { PlayerState, InventoryItem } from '../../types/game';
import { SUPERMARKET_DEPARTMENTS, SupermarketDepartment, ShopItem } from '../../data/shops';
import { formatNaira } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import { createMonopolyHead } from '../game3d/monopolyFace';
import confetti from 'canvas-confetti';
import {
  ShoppingBag,
  ShoppingCart,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  X,
  CreditCard,
  Sparkles,
  HelpCircle,
  ArrowRight,
  Store,
  Layers,
  ChevronRight
} from 'lucide-react';

interface CartEntry {
  item: ShopItem;
  quantity: number;
}

interface SupermarketInteriorSceneProps {
  player: PlayerState;
  onClose: () => void;
  onCheckout: (cart: CartEntry[], totalCost: number) => void;
}

export const SupermarketInteriorScene: React.FC<SupermarketInteriorSceneProps> = ({
  player,
  onClose,
  onCheckout
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const [selectedDeptId, setSelectedDeptId] = useState<string>(SUPERMARKET_DEPARTMENTS[0].id);
  const [cart, setCart] = useState<CartEntry[]>([]);
  const [isAtCashier, setIsAtCashier] = useState(false);
  const [cashierDialogue, setCashierDialogue] = useState<string>(
    "Welcome to FUO Central Supermarket! Fresh supplies arrived this morning. Take a basket, browse our aisles, and bring your items here to the register when you're ready to check out!"
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [lastCheckoutReceipt, setLastCheckoutReceipt] = useState<{
    items: CartEntry[];
    total: number;
    reference: string;
  } | null>(null);

  const selectedDept =
    SUPERMARKET_DEPARTMENTS.find((d) => d.id === selectedDeptId) || SUPERMARKET_DEPARTMENTS[0];

  const totalCartCost = cart.reduce((acc, entry) => acc + entry.item.price * entry.quantity, 0);
  const totalItemCount = cart.reduce((acc, entry) => acc + entry.quantity, 0);

  // 3D Supermarket Room Canvas (Aisles, Shelves, Cashier Counter, Fluorescent lighting)
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0f172a');
    scene.fog = new THREE.FogExp2('#0f172a', 0.015);

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.set(0, 5.5, 9.5);
    camera.lookAt(0, 1.8, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.75));
    renderer.shadowMap.enabled = true;
    container.appendChild(renderer.domElement);

    // Supermarket Overhead Lighting
    const ambient = new THREE.AmbientLight('#ffffff', 0.85);
    scene.add(ambient);

    const whiteLight1 = new THREE.PointLight('#e0f2fe', 1.2, 25);
    whiteLight1.position.set(-3, 6, 2);
    scene.add(whiteLight1);

    const whiteLight2 = new THREE.PointLight('#fef08a', 1.0, 25);
    whiteLight2.position.set(3, 6, -2);
    scene.add(whiteLight2);

    // Checkerboard Vinyl Tile Floor
    const floorSize = 28;
    const floorGeo = new THREE.PlaneGeometry(floorSize, floorSize, 14, 14);
    const canvas = document.createElement('canvas');
    canvas.width = 256;
    canvas.height = 256;
    const ctx = canvas.getContext('2d')!;
    ctx.fillStyle = '#f8fafc';
    ctx.fillRect(0, 0, 256, 256);
    ctx.fillStyle = '#cbd5e1';
    for (let x = 0; x < 256; x += 64) {
      for (let y = 0; y < 256; y += 64) {
        if ((x / 64 + y / 64) % 2 === 0) {
          ctx.fillRect(x, y, 64, 64);
        }
      }
    }
    const tileTex = new THREE.CanvasTexture(canvas);
    tileTex.wrapS = THREE.RepeatWrapping;
    tileTex.wrapT = THREE.RepeatWrapping;
    tileTex.repeat.set(7, 7);

    const floor = new THREE.Mesh(floorGeo, new THREE.MeshLambertMaterial({ map: tileTex }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = 0;
    floor.receiveShadow = true;
    scene.add(floor);

    // Walls
    const wallMat = new THREE.MeshLambertMaterial({ color: '#1e293b' });
    const backWall = new THREE.Mesh(new THREE.PlaneGeometry(floorSize, 9), wallMat);
    backWall.position.set(0, 4.5, -floorSize / 2);
    scene.add(backWall);

    // Supermarket Department Signboard on Back Wall
    const signCanvas = document.createElement('canvas');
    signCanvas.width = 512;
    signCanvas.height = 96;
    const sCtx = signCanvas.getContext('2d')!;
    sCtx.fillStyle = '#0284c7';
    sCtx.fillRect(0, 0, 512, 96);
    sCtx.strokeStyle = '#facc15';
    sCtx.lineWidth = 6;
    sCtx.strokeRect(4, 4, 504, 88);
    sCtx.fillStyle = '#ffffff';
    sCtx.font = 'bold 32px sans-serif';
    sCtx.textAlign = 'center';
    sCtx.textBaseline = 'middle';
    sCtx.fillText('FEDERAL UNIVERSITY OF OMO SUPERMARKET', 256, 48);
    const signTex = new THREE.CanvasTexture(signCanvas);
    const signMesh = new THREE.Mesh(new THREE.PlaneGeometry(12, 2.2), new THREE.MeshBasicMaterial({ map: signTex }));
    signMesh.position.set(0, 7.2, -floorSize / 2 + 0.1);
    scene.add(signMesh);

    // 1. CASHIER COUNTER & CHECKOUT REGISTER
    const counterGroup = new THREE.Group();
    counterGroup.position.set(3.8, 0, 2.8);
    counterGroup.rotation.y = -0.3;

    // Wood / Stainless Checkout Counter
    const desk = new THREE.Mesh(
      new THREE.BoxGeometry(3.2, 1.2, 1.4),
      new THREE.MeshLambertMaterial({ color: '#334155' })
    );
    desk.position.set(0, 0.6, 0);
    desk.castShadow = true;
    counterGroup.add(desk);

    // Conveyor Belt Section
    const belt = new THREE.Mesh(
      new THREE.BoxGeometry(2.0, 0.05, 0.9),
      new THREE.MeshLambertMaterial({ color: '#0f172a' })
    );
    belt.position.set(-0.4, 1.23, 0);
    counterGroup.add(belt);

    // POS Computer & Barcode Scanner
    const posMonitor = new THREE.Mesh(
      new THREE.BoxGeometry(0.7, 0.6, 0.15),
      new THREE.MeshLambertMaterial({ color: '#0284c7' })
    );
    posMonitor.position.set(0.9, 1.6, 0.2);
    counterGroup.add(posMonitor);

    const posStand = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.08, 0.35, 8),
      new THREE.MeshLambertMaterial({ color: '#171717' })
    );
    posStand.position.set(0.9, 1.35, 0.2);
    counterGroup.add(posStand);

    // Cash Register POS Keypad
    const keypad = new THREE.Mesh(
      new THREE.BoxGeometry(0.45, 0.12, 0.4),
      new THREE.MeshLambertMaterial({ color: '#475569' })
    );
    keypad.position.set(0.9, 1.25, -0.2);
    counterGroup.add(keypad);

    // Cashier NPC (Stationed Behind Counter with Apron & Monopoly Face)
    const cashierGroup = new THREE.Group();
    cashierGroup.position.set(0.8, 0, -0.9);

    const cashierLegs = new THREE.Mesh(
      new THREE.BoxGeometry(0.6, 0.95, 0.3),
      new THREE.MeshLambertMaterial({ color: '#1e293b' })
    );
    cashierLegs.position.y = 0.48;
    cashierGroup.add(cashierLegs);

    const cashierTorso = new THREE.Mesh(
      new THREE.BoxGeometry(0.8, 1.1, 0.45),
      new THREE.MeshLambertMaterial({ color: '#0369a1' }) // Blue supermarket uniform
    );
    cashierTorso.position.y = 1.45;
    cashierGroup.add(cashierTorso);

    // Green Store Apron
    const apron = new THREE.Mesh(
      new THREE.BoxGeometry(0.65, 0.9, 0.1),
      new THREE.MeshLambertMaterial({ color: '#15803d' })
    );
    apron.position.set(0, 1.45, 0.22);
    cashierGroup.add(apron);

    // Monopoly Face
    const cashierHead = createMonopolyHead('npc_pencil');
    cashierHead.position.y = 2.25;
    cashierGroup.add(cashierHead);
    counterGroup.add(cashierGroup);

    scene.add(counterGroup);

    // 2. SUPERMARKET AISLE SHELVES (LEFT & CENTER)
    const createAisleShelf = (x: number, z: number, color: string) => {
      const aisle = new THREE.Group();
      aisle.position.set(x, 0, z);

      // Main Metal Shelf Frame
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(4.8, 3.2, 1.6),
        new THREE.MeshLambertMaterial({ color: '#475569' })
      );
      frame.position.set(0, 1.6, 0);
      aisle.add(frame);

      // Shelving Levels with colorful packaged goods
      [-0.8, 0, 0.8].forEach((lvlY) => {
        const shelfBoard = new THREE.Mesh(
          new THREE.BoxGeometry(4.9, 0.08, 1.7),
          new THREE.MeshLambertMaterial({ color: '#94a3b8' })
        );
        shelfBoard.position.set(0, 1.6 + lvlY, 0);
        aisle.add(shelfBoard);

        // Clustered goods on shelf
        for (let bx = -2.1; bx <= 2.1; bx += 0.45) {
          const itemBox = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.45, 0.45),
            new THREE.MeshLambertMaterial({ color: color })
          );
          itemBox.position.set(bx, 1.6 + lvlY + 0.25, 0.4);
          aisle.add(itemBox);

          const itemBox2 = new THREE.Mesh(
            new THREE.BoxGeometry(0.32, 0.45, 0.45),
            new THREE.MeshLambertMaterial({ color: '#facc15' })
          );
          itemBox2.position.set(bx, 1.6 + lvlY + 0.25, -0.4);
          aisle.add(itemBox2);
        }
      });

      return aisle;
    };

    const aisle1 = createAisleShelf(-4.2, -2.5, '#ea580c'); // Provisions
    scene.add(aisle1);

    const aisle2 = createAisleShelf(-4.2, 2.5, '#2563eb'); // Stationery & Academics
    scene.add(aisle2);

    // 3. SHOPPING TROLLEY / BASKET STACK NEAR ENTRANCE
    const basketStack = new THREE.Group();
    basketStack.position.set(0, 0, 4.2);
    for (let i = 0; i < 4; i++) {
      const basket = new THREE.Mesh(
        new THREE.BoxGeometry(0.8, 0.5, 0.6),
        new THREE.MeshLambertMaterial({ color: '#dc2626', wireframe: i % 2 === 1 })
      );
      basket.position.set(0, 0.25 + i * 0.15, 0);
      basketStack.add(basket);
    }
    scene.add(basketStack);

    // Subtle gentle camera breathing
    let animId: number;
    let t = 0;
    const animate = () => {
      animId = requestAnimationFrame(animate);
      t += 0.015;
      camera.position.x = Math.sin(t * 0.5) * 0.25;
      camera.position.y = 5.5 + Math.cos(t * 0.7) * 0.1;
      camera.lookAt(0, 1.8, 0);
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
      if (renderer.domElement && container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
      renderer.dispose();
    };
  }, []);

  // Add Item to Cart with Visual Feedback
  const handleAddToCart = (item: ShopItem) => {
    sounds.playClick();
    setCart((prev) => {
      const existing = prev.find((entry) => entry.item.id === item.id);
      if (existing) {
        return prev.map((entry) =>
          entry.item.id === item.id ? { ...entry, quantity: entry.quantity + 1 } : entry
        );
      } else {
        return [...prev, { item, quantity: 1 }];
      }
    });

    setToastMessage(`Added 1x ${item.name} to cart!`);
    setTimeout(() => setToastMessage(null), 2000);
  };

  // Modify Cart Quantity
  const handleUpdateQuantity = (itemId: string, delta: number) => {
    sounds.playClick();
    setCart((prev) => {
      return prev
        .map((entry) => {
          if (entry.item.id === itemId) {
            const newQ = entry.quantity + delta;
            return newQ > 0 ? { ...entry, quantity: newQ } : null;
          }
          return entry;
        })
        .filter(Boolean) as CartEntry[];
    });
  };

  // Remove Item from Cart
  const handleRemoveFromCart = (itemId: string) => {
    sounds.playClick();
    setCart((prev) => prev.filter((entry) => entry.item.id !== itemId));
  };

  // Proceed to Cashier Station
  const handleGoToCashier = () => {
    sounds.playClick();
    setIsAtCashier(true);
    if (cart.length === 0) {
      setCashierDialogue(
        "Welcome to my counter! Your basket looks empty right now. Feel free to browse our 7 aisles on the left, or ask me any questions about student discounts!"
      );
    } else {
      setCashierDialogue(
        `Good day! I see you have ${totalItemCount} items in your basket totaling ${formatNaira(
          totalCartCost
        )}. Would you like to pay with your student Omo-Pay debit account?`
      );
    }
  };

  // Execute Checkout Payment
  const handleConfirmPayment = () => {
    if (cart.length === 0) return;

    if (player.balance < totalCartCost) {
      sounds.playClick();
      setCashierDialogue(
        `⚠️ Payment Declined: Insufficient Omo-Pay funds! Your balance is ${formatNaira(player.balance)}, but your cart total is ${formatNaira(totalCartCost)}. Please return some items to shelves or top up your account!`
      );
      return;
    }

    sounds.playCashPing();
    confetti({ particleCount: 75, spread: 60, origin: { y: 0.7 } });

    const receiptRef = `OMO-SUP-${Math.floor(100000 + Math.random() * 900000)}`;
    setLastCheckoutReceipt({
      items: [...cart],
      total: totalCartCost,
      reference: receiptRef
    });

    onCheckout(cart, totalCartCost);
    setCart([]);
    setCashierDialogue(
      `Payment approved! ₦${totalCartCost.toLocaleString()} debited. Here is your receipt and stamped shopping bag. All items have been packed safely into your student inventory!`
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative w-full max-w-6xl h-[92vh] bg-stone-900 border-2 border-cyan-500 rounded-3xl shadow-2xl text-white overflow-hidden flex flex-col">
        {/* Top Header: Supermarket Banner & Quick Stats */}
        <div className="relative z-10 px-4 py-3 bg-gradient-to-r from-sky-900 via-stone-900 to-sky-950 border-b border-sky-800 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500 text-stone-950 flex items-center justify-center font-black shadow-lg">
              <Store className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base sm:text-lg font-black text-white">FUO Central Supermarket</h1>
                <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-full bg-cyan-900/80 text-cyan-200 border border-cyan-700">
                  Campus Store
                </span>
              </div>
              <p className="text-xs text-sky-200/80">
                Official Multi-Department Retail Store • Cashier Checkout Station
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            {/* Player Balance */}
            <div className="bg-stone-950/80 border border-emerald-500/60 rounded-xl px-3 py-1.5 text-right">
              <div className="text-[10px] text-emerald-400 font-bold uppercase">Omo-Pay Balance</div>
              <div className="text-xs sm:text-sm font-black font-mono text-white">
                {formatNaira(player.balance)}
              </div>
            </div>

            {/* Cart Trigger Badge */}
            <button
              type="button"
              onClick={handleGoToCashier}
              className="relative bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-md transition cursor-pointer"
            >
              <ShoppingCart className="w-4 h-4" />
              <span>Cart ({totalItemCount})</span>
              {totalItemCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-stone-900 animate-pulse">
                  {totalItemCount}
                </span>
              )}
            </button>

            {/* Close / Exit Button */}
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-white transition cursor-pointer"
              title="Exit Supermarket"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Floating Notification Toast */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-40 bg-emerald-950 border border-emerald-400 text-emerald-200 px-4 py-1.5 rounded-full text-xs font-bold shadow-xl animate-in fade-in slide-in-from-top-2">
            🛒 {toastMessage}
          </div>
        )}

        {/* Main Body: Split into Left (Aisles & Inventory) and Right (3D Supermarket Interior & Cashier) */}
        <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
          {/* LEFT SECTION: 7 AISLES SELECTOR + VISUAL INVENTORY */}
          <div className="w-full lg:w-[58%] border-b lg:border-b-0 lg:border-r border-stone-800 flex flex-col bg-stone-900/90 z-10 overflow-hidden">
            {/* 7 AISLES NAVIGATION TABS */}
            <div className="p-2.5 bg-stone-950/80 border-b border-stone-800 flex items-center gap-1.5 overflow-x-auto scrollbar-none">
              {SUPERMARKET_DEPARTMENTS.map((dept) => {
                const isActive = dept.id === selectedDeptId;
                return (
                  <button
                    key={dept.id}
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setSelectedDeptId(dept.id);
                      setIsAtCashier(false);
                    }}
                    className={`shrink-0 px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      isActive
                        ? 'bg-cyan-600 text-white shadow-md'
                        : 'bg-stone-800/80 text-stone-300 hover:bg-stone-700 hover:text-white'
                    }`}
                  >
                    <span>{dept.icon}</span>
                    <span>{dept.shortName}</span>
                  </button>
                );
              })}
            </div>

            {/* Department Header */}
            <div className="px-4 py-2.5 bg-cyan-950/40 border-b border-cyan-800/40 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-black text-cyan-300 flex items-center gap-2">
                  <span>{selectedDept.icon}</span>
                  <span>Aisle {SUPERMARKET_DEPARTMENTS.findIndex((d) => d.id === selectedDept.id) + 1}: {selectedDept.name}</span>
                </h2>
                <p className="text-[11px] text-stone-400">{selectedDept.description}</p>
              </div>
              <span className="text-[10px] bg-cyan-900 text-cyan-200 px-2 py-0.5 rounded-full font-mono">
                {selectedDept.items.length} Products
              </span>
            </div>

            {/* VISUAL PRODUCT INVENTORY GRID */}
            <div className="flex-1 overflow-y-auto p-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {selectedDept.items.map((item) => {
                const inCartQty = cart.find((c) => c.item.id === item.id)?.quantity || 0;
                return (
                  <div
                    key={item.id}
                    className="bg-stone-800/80 hover:bg-stone-800 border border-stone-700 hover:border-cyan-500 rounded-2xl p-3 flex flex-col justify-between transition group shadow-md"
                  >
                    <div className="flex items-start gap-2.5">
                      <div className="w-12 h-12 rounded-xl bg-stone-900 border border-stone-700 flex items-center justify-center text-2xl shrink-0 group-hover:scale-105 transition">
                        {item.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-xs text-white leading-tight truncate">
                          {item.name}
                        </h3>
                        <p className="text-[11px] text-stone-400 line-clamp-2 mt-0.5">
                          {item.description}
                        </p>
                        {item.effect && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {item.effect.studyBoost ? (
                              <span className="text-[9px] bg-blue-900/70 text-blue-300 px-1.5 py-0.2 rounded font-semibold">
                                +{item.effect.studyBoost} Study Boost
                              </span>
                            ) : null}
                            {item.effect.stamina ? (
                              <span className="text-[9px] bg-emerald-900/70 text-emerald-300 px-1.5 py-0.2 rounded font-semibold">
                                +{item.effect.stamina} Stamina
                              </span>
                            ) : null}
                            {item.effect.hunger ? (
                              <span className="text-[9px] bg-amber-900/70 text-amber-300 px-1.5 py-0.2 rounded font-semibold">
                                -{Math.abs(item.effect.hunger)} Hunger
                              </span>
                            ) : null}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-stone-700/60 flex items-center justify-between">
                      <div className="font-mono font-black text-amber-300 text-xs sm:text-sm">
                        {formatNaira(item.price)}
                      </div>

                      <button
                        type="button"
                        onClick={() => handleAddToCart(item)}
                        className="bg-cyan-600 hover:bg-cyan-500 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1 shadow transition cursor-pointer active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Add to Cart</span>
                        {inCartQty > 0 && (
                          <span className="ml-1 bg-cyan-900 px-1.5 py-0.2 rounded-full text-[10px] font-mono">
                            {inCartQty}
                          </span>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* RIGHT SECTION: 3D SUPERMARKET VIEWPORT + CASHIER CHECKOUT PANEL */}
          <div className="w-full lg:w-[42%] flex flex-col bg-stone-950 relative overflow-hidden">
            {/* 3D SUPERMARKET ROOM CANVAS */}
            <div className="relative flex-1 min-h-[220px] max-h-[46%] w-full">
              <div ref={mountRef} className="absolute inset-0 w-full h-full" />
              {/* Overlay Badge for Cashier Station */}
              <div className="absolute top-2 left-2 z-20 bg-stone-900/85 border border-sky-500/60 px-2.5 py-1 rounded-full text-[10px] font-bold text-sky-300 backdrop-blur-md flex items-center gap-1.5 shadow">
                <Store className="w-3.5 h-3.5 text-amber-400" />
                <span>Interior View • Cashier Desk & Aisles</span>
              </div>

              {/* Action Button: Approach Cashier */}
              <button
                type="button"
                onClick={handleGoToCashier}
                className="absolute bottom-2 right-2 z-20 bg-amber-500 hover:bg-amber-400 text-stone-950 font-black px-3 py-1.5 rounded-xl text-xs shadow-lg backdrop-blur-md flex items-center gap-1 transition cursor-pointer"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>Go to Cashier Register</span>
              </button>
            </div>

            {/* LOWER RIGHT: CASHIER DIALOGUE & LIVE SHOPPING CART */}
            <div className="flex-1 bg-stone-900/95 border-t border-stone-800 p-3 sm:p-4 flex flex-col justify-between overflow-y-auto">
              {/* Cashier Interaction Box */}
              <div className="bg-sky-950/60 border border-sky-600/50 rounded-2xl p-3 mb-2.5 shadow">
                <div className="flex items-center justify-between mb-1.5 border-b border-sky-800/60 pb-1">
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-cyan-700 flex items-center justify-center text-xs shadow">
                      👨🏾‍💼
                    </span>
                    <span className="font-bold text-xs text-cyan-300">
                      Supermarket Cashier (Mr. Segun):
                    </span>
                  </div>
                  <span className="text-[10px] text-cyan-400 font-mono">Register 1</span>
                </div>

                <p className="text-xs text-stone-200 leading-relaxed italic">
                  "{cashierDialogue}"
                </p>

                {/* Cashier Inquiry Quick Buttons */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setCashierDialogue(
                        "We offer 10% student discount on all bulk stationery packs and GST 101 official textbooks when you flash your FUO matric card!"
                      );
                    }}
                    className="text-[10px] bg-stone-800 hover:bg-stone-700 text-cyan-300 px-2 py-0.5 rounded-lg border border-stone-700 transition cursor-pointer"
                  >
                    🏷️ Student Discounts
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      sounds.playClick();
                      setCashierDialogue(
                        "For exam night reading, get Peak Milk, Milo 500g, and a rechargeable study LED lamp from our Electronics aisle so NEPA blackouts won't stop your study!"
                      );
                    }}
                    className="text-[10px] bg-stone-800 hover:bg-stone-700 text-amber-300 px-2 py-0.5 rounded-lg border border-stone-700 transition cursor-pointer"
                  >
                    💡 Exam Provisions Tip
                  </button>
                </div>
              </div>

              {/* LIVE SHOPPING CART CONTAINER */}
              <div className="bg-stone-950/80 border border-stone-800 rounded-2xl p-2.5 flex-1 flex flex-col justify-between min-h-[140px]">
                <div className="flex items-center justify-between border-b border-stone-800 pb-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-300">
                    <ShoppingCart className="w-4 h-4 text-amber-400" />
                    <span>Your Shopping Basket</span>
                  </div>
                  {cart.length > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        sounds.playClick();
                        setCart([]);
                      }}
                      className="text-[10px] text-stone-400 hover:text-red-400 transition cursor-pointer"
                    >
                      Empty Basket
                    </button>
                  )}
                </div>

                {/* Cart Items List */}
                <div className="flex-1 overflow-y-auto max-h-[120px] space-y-1.5 pr-1">
                  {cart.length === 0 ? (
                    <div className="text-center py-4 text-stone-500 text-xs italic">
                      Basket is currently empty. Click "Add to Cart" on any product in the aisles!
                    </div>
                  ) : (
                    cart.map(({ item, quantity }) => (
                      <div
                        key={item.id}
                        className="bg-stone-900/90 border border-stone-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span>{item.icon}</span>
                          <span className="font-semibold text-stone-200 truncate">{item.name}</span>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-mono text-amber-300 text-[11px]">
                            {formatNaira(item.price * quantity)}
                          </span>

                          <div className="flex items-center gap-1 bg-stone-800 rounded-lg p-0.5 border border-stone-700">
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, -1)}
                              className="p-0.5 hover:text-amber-400 cursor-pointer"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="font-mono text-[11px] px-1 font-bold">{quantity}</span>
                            <button
                              type="button"
                              onClick={() => handleUpdateQuantity(item.id, 1)}
                              className="p-0.5 hover:text-amber-400 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => handleRemoveFromCart(item.id)}
                            className="text-stone-500 hover:text-red-400 cursor-pointer p-0.5"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Cart Summary & Checkout Button */}
                <div className="pt-2 border-t border-stone-800 mt-2 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-stone-400 uppercase">Cart Subtotal</div>
                    <div className="text-base font-black font-mono text-amber-400">
                      {formatNaira(totalCartCost)}
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmPayment}
                    disabled={cart.length === 0}
                    className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 shadow-lg transition ${
                      cart.length > 0
                        ? 'bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-400 hover:to-green-500 text-stone-950 cursor-pointer hover:scale-105'
                        : 'bg-stone-800 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <CreditCard className="w-3.5 h-3.5" />
                    <span>Pay at Register</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RECEIPT MODAL MODAL AFTER PAYMENT */}
        {lastCheckoutReceipt && (
          <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
            <div className="bg-amber-50 text-stone-950 border-4 border-emerald-800 rounded-3xl p-6 max-w-sm w-full shadow-2xl space-y-3 font-mono text-xs">
              <div className="text-center border-b-2 border-dashed border-stone-800 pb-2">
                <div className="font-black text-sm uppercase">FUO Central Supermarket</div>
                <div className="text-[10px] text-stone-600">Central Abuja, FCT • Till #01</div>
                <div className="text-[10px] text-stone-500 mt-1">Ref: {lastCheckoutReceipt.reference}</div>
              </div>

              <div className="space-y-1 max-h-48 overflow-y-auto">
                {lastCheckoutReceipt.items.map(({ item, quantity }) => (
                  <div key={item.id} className="flex justify-between">
                    <span>
                      {quantity}x {item.name.slice(0, 20)}
                    </span>
                    <span>{formatNaira(item.price * quantity)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t-2 border-dashed border-stone-800 pt-2 flex justify-between font-black text-sm">
                <span>TOTAL PAID:</span>
                <span>{formatNaira(lastCheckoutReceipt.total)}</span>
              </div>

              <div className="text-center text-[10px] text-stone-600 border-t border-stone-300 pt-1">
                Paid via Omo-Pay Student Account • Thank you for your patronage!
              </div>

              <button
                type="button"
                onClick={() => setLastCheckoutReceipt(null)}
                className="w-full bg-emerald-800 hover:bg-emerald-700 text-white font-sans font-bold py-2 rounded-xl text-xs transition cursor-pointer"
              >
                Close Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

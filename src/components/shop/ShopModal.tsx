import React, { useState } from 'react';
import { PlayerState, InventoryItem } from '../../types/game';
import { SHOPS, ShopCategory } from '../../data/shops';
import { formatNaira } from '../../utils/storage';
import { sounds } from '../../utils/audio';
import {
  ShoppingBag,
  Utensils,
  Coffee,
  BookOpen,
  Shirt,
  Apple,
  CheckCircle2,
  X,
  Plus,
  AlertCircle
} from 'lucide-react';

interface ShopModalProps {
  player: PlayerState;
  onClose: () => void;
  onBuyItem: (item: Omit<InventoryItem, 'quantity'>, categoryName: string) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({ player, onClose, onBuyItem }) => {
  const [activeCategoryId, setActiveCategoryId] = useState<string>(SHOPS[0].id);
  const [purchaseToast, setPurchaseToast] = useState<string | null>(null);

  const activeCategory = SHOPS.find((s) => s.id === activeCategoryId) || SHOPS[0];

  const handlePurchase = (item: Omit<InventoryItem, 'quantity'>) => {
    sounds.playClick();
    if (player.balance < item.price) {
      setPurchaseToast(`⚠️ Insufficient funds! You need ${formatNaira(item.price)} to purchase this item.`);
      setTimeout(() => setPurchaseToast(null), 3000);
      return;
    }

    sounds.playCashPing();
    onBuyItem(item, activeCategory.name);
    setPurchaseToast(`Purchased ${item.name}! Added to your bag.`);
    setTimeout(() => setPurchaseToast(null), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-md select-none animate-in fade-in duration-200">
      <div className="relative max-w-2xl w-full bg-stone-900 border-2 border-emerald-500 rounded-3xl p-6 shadow-2xl text-white overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-stone-800 pb-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-emerald-950 border border-emerald-500/50 rounded-xl text-amber-400">
              <ShoppingBag className="w-6 h-6" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-emerald-400">
                Campus Commercial Square
              </div>
              <h2 className="text-lg font-black text-white">Student Markets & Bukka</h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="bg-stone-800 px-3 py-1 rounded-xl border border-stone-700 text-xs font-mono font-bold text-amber-300">
              Wallet: {formatNaira(player.balance)}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full hover:bg-stone-800 text-stone-400 hover:text-white cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Shop Category Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-2 border-b border-stone-800 shrink-0">
          {SHOPS.map((shop) => (
            <button
              key={shop.id}
              type="button"
              onClick={() => { sounds.playClick(); setActiveCategoryId(shop.id); }}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeCategoryId === shop.id
                  ? 'bg-emerald-600 text-white shadow'
                  : 'bg-stone-800 text-stone-400 hover:bg-stone-700'
              }`}
            >
              {shop.id === 'bukka' && <Utensils className="w-3.5 h-3.5" />}
              {shop.id === 'cafe_drinks' && <Coffee className="w-3.5 h-3.5" />}
              {shop.id === 'fruit_snacks' && <Apple className="w-3.5 h-3.5" />}
              {shop.id === 'bookshop' && <BookOpen className="w-3.5 h-3.5" />}
              {shop.id === 'clothing_shoes' && <Shirt className="w-3.5 h-3.5" />}
              <span>{shop.vendorName}</span>
            </button>
          ))}
        </div>

        {/* Vendor Tagline */}
        <div className="py-2.5 text-xs text-amber-300 font-medium italic">
          "{activeCategory.tagline}"
        </div>

        {/* Purchase Feedback Toast */}
        {purchaseToast && (
          <div className="bg-emerald-950/80 border border-emerald-500 text-emerald-200 px-3 py-2 rounded-xl text-xs mb-3 flex items-center gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{purchaseToast}</span>
          </div>
        )}

        {/* Item List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
          {activeCategory.items.map((item) => {
            const canAfford = player.balance >= item.price;

            return (
              <div
                key={item.id}
                className="bg-stone-800/80 p-3.5 rounded-2xl border border-stone-700 hover:border-emerald-500/50 transition flex items-center justify-between gap-3"
              >
                <div className="space-y-1">
                  <div className="font-extrabold text-sm text-white">{item.name}</div>
                  <p className="text-xs text-stone-300 leading-snug">{item.description}</p>
                  {item.effect && (
                    <div className="text-[11px] text-emerald-400 font-medium">
                      {item.effect.stamina ? `+${item.effect.stamina}% Stamina ` : ''}
                      {item.effect.hunger ? `${item.effect.hunger}% Hunger ` : ''}
                      {item.effect.studyBoost ? `+${item.effect.studyBoost}% Study Power` : ''}
                    </div>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-black text-amber-400 text-sm mb-1.5">
                    {formatNaira(item.price)}
                  </div>
                  <button
                    type="button"
                    disabled={!canAfford}
                    onClick={() => handlePurchase(item)}
                    className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1 cursor-pointer transition shadow ${
                      canAfford
                        ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                        : 'bg-stone-700 text-stone-500 cursor-not-allowed'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Buy</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

import { Sparkles, Info } from "lucide-react";
import { Modal } from "../ui/Modal";
import { useShop } from "@/src/hooks/useShop";
import { ShopModalProps } from "@/src/types/shop";

export function ShopModal({ isOpen, onClose, zenPoints, userId }: ShopModalProps) {
	const { seeds, loading, error, isBuying, handleBuy } = useShop(userId);

	return (
    <Modal isOpen={isOpen} onClose={onClose} title="Магазин семян">
      <div className="space-y-4">
        {/* Баланс пользователя */}
        <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800/50 backdrop-blur-md shadow-inner">
          <span className="text-sm text-zinc-400">Ваш баланс:</span>
          <span className="text-lg font-bold text-emerald-400 flex items-center gap-1.5">
            {zenPoints ?? 0} <Sparkles size={16} className="text-emerald-400 animate-pulse" />
          </span>
        </div>

        <div>
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-3">
            Доступный ассортимент
          </h2>

          {/* Содержимое магазина */}
          {error ? (
            <p className="text-red-500 text-center py-6 text-sm">
              Не удалось загрузить товары. Пожалуйста, попробуйте позже
            </p>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {loading && (
                <div className="col-span-2 py-8 text-center text-zinc-400 text-sm">
                  Загрузка товаров...
                </div>
              )}

              {!loading && seeds.map((seed) => {
                return (
                  <div 
                    key={seed.id} 
                    className="relative flex flex-col items-center justify-between p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/45 hover:border-zinc-700/60 backdrop-blur-md transition-all duration-300 hover:scale-[1.02] shadow-lg"
                  >
                    {/* Название и тултип описания */}
                    <div className="flex items-center gap-1.5 justify-center w-full">
                      <span className="font-semibold text-zinc-200 text-sm tracking-wide">
                        {seed.name}
                      </span>
                      {seed.description && (
                        <div className="group/tooltip inline-flex items-center">
                          <span className="text-zinc-500 hover:text-zinc-300 cursor-help transition-colors p-0.5">
                            <Info size={13} />
                          </span>
                          {/* Тултип (абсолютно спозиционирован относительно карточки семечка) */}
                          <div 
                            className="absolute bottom-full left-1/2 -translate-x-1/2 mb-3 w-48 p-2.5 text-[11px] leading-relaxed text-zinc-300 bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl opacity-0 scale-95 pointer-events-none group-hover/tooltip:opacity-100 group-hover/tooltip:scale-100 transition-all duration-200 z-50 text-center font-normal origin-bottom"
                          >
                            {seed.description}
                            {/* Треугольник-стрелочка */}
                            <div className="absolute top-full left-1/2 -translate-x-1/2 -mt-[1px] border-4 border-transparent border-t-zinc-950/95" />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Стоимость семечка */}
                    <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-2.5 py-0.5 mt-2.5 mb-3.5 shadow-sm">
                      {seed.price} <Sparkles size={11} />
                    </div>

                    {/* Кнопка покупки */}
                    <button
                      disabled={isBuying || seed.price > (zenPoints ?? 0)}
                      className="w-full py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-zinc-900/60 disabled:text-zinc-600 disabled:border-transparent active:scale-[0.98] text-zinc-950 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/5 disabled:shadow-none"
                      onClick={() => handleBuy(seed.id)}
                    >
                      {seed.price <= (zenPoints ?? 0) ? "Купить" : "Не хватает"}
                    </button>
                  </div>
                );
              })}
              {!loading && seeds.length === 0 && (
                <div className="col-span-2 py-8 text-center text-zinc-500 text-sm">
                  В магазине пока нет семян
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}
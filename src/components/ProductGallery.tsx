"use client";

import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronLeft, ChevronRight, Maximize2, X, ZoomIn } from "lucide-react";

type Props = {
  images: string[];
  alt: string;
  badge?: string;
};

export default function ProductGallery({ images, alt, badge }: Props) {
  const safeImages = images.length > 0 ? images : [""];
  const [index, setIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [origin, setOrigin] = useState({ x: 50, y: 50 });
  const mainRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  const goPrev = () =>
    setIndex((i) => (i - 1 + safeImages.length) % safeImages.length);
  const goNext = () => setIndex((i) => (i + 1) % safeImages.length);

  // Cerrar lightbox con Escape + flechas para navegar
  useEffect(() => {
    if (!lightboxOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxOpen(false);
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, safeImages.length]);

  // Bloquear scroll del body con lightbox abierto
  useEffect(() => {
    if (lightboxOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [lightboxOpen]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!mainRef.current) return;
    const rect = mainRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setOrigin({ x: Math.max(0, Math.min(100, x)), y: Math.max(0, Math.min(100, y)) });
  };

  // Swipe en móvil — cambia imagen principal cuando el usuario hace scroll horizontal
  const handleScroll = () => {
    if (!trackRef.current) return;
    const w = trackRef.current.clientWidth;
    const newIndex = Math.round(trackRef.current.scrollLeft / w);
    if (newIndex !== index && newIndex >= 0 && newIndex < safeImages.length) {
      setIndex(newIndex);
    }
  };

  return (
    <div className="space-y-4">
      {/* Imagen principal — desktop con zoom hover, móvil con swipe */}

      {/* DESKTOP (md+) */}
      <div
        ref={mainRef}
        onMouseEnter={() => setHovering(true)}
        onMouseLeave={() => setHovering(false)}
        onMouseMove={handleMouseMove}
        onClick={() => setLightboxOpen(true)}
        className="hidden md:flex relative aspect-square bg-neutral-50 rounded-3xl items-center justify-center p-8 overflow-hidden cursor-zoom-in select-none"
      >
        {badge && (
          <span className="absolute top-6 left-6 z-10 bg-[#0071E3] text-white text-xs font-semibold px-3 py-1.5 rounded-full">
            {badge}
          </span>
        )}
        <div
          className="absolute top-6 right-6 z-10 bg-white/80 backdrop-blur-sm text-neutral-700 text-xs font-medium px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow-sm"
        >
          <ZoomIn size={12} />
          Zoom
        </div>
        <motion.div
          className="relative w-full h-full"
          animate={{
            scale: hovering ? 1.8 : 1,
            transformOrigin: `${origin.x}% ${origin.y}%`,
          }}
          transition={{ scale: { duration: 0.25, ease: [0.16, 1, 0.3, 1] } }}
        >
          <Image
            src={safeImages[index]}
            alt={alt}
            fill
            className="object-contain drop-shadow-xl pointer-events-none"
            priority
            unoptimized
          />
        </motion.div>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setLightboxOpen(true);
          }}
          className="absolute bottom-6 right-6 z-10 bg-white/90 backdrop-blur-sm text-neutral-700 p-2.5 rounded-full shadow-md hover:bg-white transition"
          aria-label="Ver en pantalla completa"
        >
          <Maximize2 size={14} />
        </button>
      </div>

      {/* MÓVIL */}
      <div className="md:hidden relative">
        <div
          ref={trackRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-3xl bg-neutral-50"
          style={{ scrollSnapType: "x mandatory" }}
        >
          {safeImages.map((src, i) => (
            <div
              key={`${src}-${i}`}
              onClick={() => setLightboxOpen(true)}
              className="relative shrink-0 w-full aspect-square snap-center flex items-center justify-center p-8"
            >
              {badge && i === 0 && (
                <span className="absolute top-4 left-4 z-10 bg-[#0071E3] text-white text-[11px] font-semibold px-2.5 py-1 rounded-full">
                  {badge}
                </span>
              )}
              <Image
                src={src}
                alt={`${alt} ${i + 1}`}
                fill
                className="object-contain p-8 pointer-events-none"
                priority={i === 0}
                unoptimized
              />
            </div>
          ))}
        </div>
        {safeImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {safeImages.map((_, i) => (
              <button
                key={i}
                onClick={() => {
                  if (trackRef.current) {
                    trackRef.current.scrollTo({
                      left: trackRef.current.clientWidth * i,
                      behavior: "smooth",
                    });
                  }
                }}
                className={`rounded-full transition-all duration-300 ${
                  i === index
                    ? "w-5 h-1.5 bg-neutral-800"
                    : "w-1.5 h-1.5 bg-neutral-300"
                }`}
                aria-label={`Imagen ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Miniaturas (sólo si hay más de una) */}
      {safeImages.length > 1 && (
        <div className="hidden md:flex gap-3 overflow-x-auto no-scrollbar">
          {safeImages.map((src, i) => (
            <button
              key={`thumb-${src}-${i}`}
              onClick={() => setIndex(i)}
              className={`relative shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all bg-neutral-50 ${
                i === index
                  ? "border-[#0071E3] shadow-md"
                  : "border-transparent hover:border-neutral-300"
              }`}
              aria-label={`Vista ${i + 1}`}
            >
              <Image
                src={src}
                alt={`${alt} miniatura ${i + 1}`}
                fill
                className="object-contain p-2"
                unoptimized
              />
            </button>
          ))}
        </div>
      )}

      {/* Lightbox — montado en document.body con portal para evitar
          problemas de stacking context con los transforms de Framer Motion */}
      {typeof window !== "undefined" &&
        createPortal(
          <AnimatePresence>
            {lightboxOpen && (
              <motion.div
                key="lightbox"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-[200] bg-black/95 backdrop-blur-sm flex items-center justify-center"
                onClick={() => setLightboxOpen(false)}
              >
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxOpen(false);
                  }}
                  className="absolute top-5 right-5 z-10 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full transition"
                  aria-label="Cerrar"
                >
                  <X size={22} />
                </button>

                {safeImages.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goPrev();
                      }}
                      className="absolute left-5 z-10 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition"
                      aria-label="Imagen anterior"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        goNext();
                      }}
                      className="absolute right-16 z-10 text-white/80 hover:text-white p-3 rounded-full hover:bg-white/10 transition"
                      aria-label="Imagen siguiente"
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}

                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="relative w-[92vw] h-[80vh] max-w-5xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Image
                    src={safeImages[index]}
                    alt={alt}
                    fill
                    className="object-contain"
                    unoptimized
                  />
                </motion.div>

                {safeImages.length > 1 && (
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-xs">
                    {index + 1} / {safeImages.length}
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}

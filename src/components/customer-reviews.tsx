"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties } from "react";

type Review = {
  name: string;
  rating: number;
  quote: string;
  avatar: string;
};

const REVIEWS: Review[] = [
  {
    name: "سارة الهاشمي",
    rating: 5,
    quote:
      "الماكلة بنينة بزاف والتوصيل كان سريع، أكيد غادي نعاود نطلب.",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=256&q=80&auto=format&fit=crop",
  },
  {
    name: "ياسين العلوي",
    rating: 5,
    quote:
      "الشواية لذيذة والثمن مناسب والخدمة محترمة.",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=256&q=80&auto=format&fit=crop",
  },
  {
    name: "أمينة بنجلون",
    rating: 5,
    quote:
      "الطلب وصل منظم وساخن، والمذاق فعلاً ممتاز.",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=256&q=80&auto=format&fit=crop",
  },
  {
    name: "حمزة المريني",
    rating: 4.5,
    quote:
      "المطعم زوين والمشاوي ممتازة والتعامل احترافي.",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=256&q=80&auto=format&fit=crop",
  },
];

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReduced(mq.matches);
    const onChange = () => setReduced(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);
  return reduced;
}

function Stars({ value }: { value: number }) {
  const stars = [];
  for (let i = 1; i <= 5; i++) {
    const diff = value - (i - 1);
    if (diff >= 1) {
      stars.push(
        <span key={i} className="text-amber-400" aria-hidden>
          ★
        </span>,
      );
    } else if (diff >= 0.5) {
      stars.push(
        <span key={i} className="relative inline-block w-[1em] text-amber-400/30" aria-hidden>
          <span className="absolute inset-0 overflow-hidden text-amber-400" style={{ width: "50%" }}>
            ★
          </span>
          <span className="invisible">★</span>
        </span>,
      );
    } else {
      stars.push(
        <span key={i} className="text-white/20" aria-hidden>
          ★
        </span>,
      );
    }
  }
  return (
    <div className="flex gap-0.5 text-lg leading-none" role="img" aria-label={`${value} من 5`}>
      {stars}
    </div>
  );
}

function ReviewCard({ r }: { r: Review }) {
  return (
    <article
      dir="rtl"
      className="glass relative w-[280px] shrink-0 rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.07] to-transparent p-6 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.85)] sm:w-[300px] md:w-[320px]"
    >
      <div className="flex flex-col items-center text-center">
        <div className="relative h-16 w-16 overflow-hidden rounded-full border-2 border-baraka-gold/40 ring-2 ring-baraka-gold/15 ring-offset-2 ring-offset-baraka-black">
          <Image src={r.avatar} alt="" fill sizes="64px" className="object-cover" />
        </div>
        <p className="mt-4 font-semibold text-white">{r.name}</p>
        <div className="mt-2 flex justify-center">
          <Stars value={r.rating} />
        </div>
      </div>
      <blockquote className="mt-5 border-t border-white/10 pt-5 text-center text-sm leading-relaxed text-white/85">
        &ldquo;{r.quote}&rdquo;
      </blockquote>
    </article>
  );
}

const MAX_REPEAT_BLOCKS = 56;
/** بطء الحركة: ثوانـ لكل 28 بكسل أفقي تقريباً */
const PX_PER_SEC = 28;

export function CustomerReviews({ title }: { title: string }) {
  const reducedMotion = usePrefersReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const groupRef = useRef<HTMLDivElement>(null);
  const [repeatBlocks, setRepeatBlocks] = useState(3);
  const [marqueePx, setMarqueePx] = useState(0);
  const [durationSec, setDurationSec] = useState(72);

  const tiles = useMemo(
    () => Array.from({ length: repeatBlocks }, () => REVIEWS).flat(),
    [repeatBlocks],
  );

  useLayoutEffect(() => {
    if (reducedMotion) return;

    const wrap = wrapRef.current;
    if (!wrap) return;

    const measure = () => {
      const track = trackRef.current;
      const group = groupRef.current;
      if (!track || !group) return;

      const vw = wrap.clientWidth;
      const gw = group.scrollWidth;

      if (gw < vw * 2 + 4) {
        setRepeatBlocks((n) => (n < MAX_REPEAT_BLOCKS ? n + 1 : n));
        return;
      }

      const gapPx = Number.parseFloat(getComputedStyle(track).gap || "0") || 24;
      const dist = Math.round(gw + gapPx);
      setMarqueePx(dist);
      setDurationSec(Math.max(48, Math.round(dist / PX_PER_SEC)));
    };

    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(wrap);
    return () => ro.disconnect();
  }, [repeatBlocks, reducedMotion, tiles.length]);

  const trackStyle = {
    "--marquee-distance": marqueePx > 0 ? `${marqueePx}px` : "0px",
    "--reviews-marquee-duration": `${durationSec}s`,
  } as CSSProperties;

  return (
    <section className="mx-auto max-w-6xl px-4 py-14" aria-labelledby="reviews-heading">
      <div className="text-center">
        <h2 id="reviews-heading" className="font-display text-2xl font-bold text-baraka-gold md:text-3xl">
          {title}
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-sm text-white/55">
          آراء حقيقية من زبناء راضين — جودة، سرعة، ومذاق يفوق التوقع
        </p>
      </div>

      {reducedMotion ? (
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {REVIEWS.map((r) => (
            <ReviewCard key={r.name} r={r} />
          ))}
        </div>
      ) : (
        <>
          <div
            ref={wrapRef}
            className="reviews-marquee-wrap relative mt-10 overflow-hidden py-2"
          >
            <div
              className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-baraka-black to-transparent md:w-24"
              aria-hidden
            />
            <div
              className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-baraka-black to-transparent md:w-24"
              aria-hidden
            />

            <div
              ref={trackRef}
              dir="ltr"
              className={`reviews-marquee-track flex w-max flex-nowrap gap-6 md:gap-8${marqueePx > 0 ? " reviews-marquee-track--active" : ""}`}
              style={trackStyle}
            >
              <div ref={groupRef} className="flex shrink-0 gap-6 md:gap-8">
                {tiles.map((r, i) => (
                  <ReviewCard key={`m-a-${i}-${r.name}`} r={r} />
                ))}
              </div>
              <div className="flex shrink-0 gap-6 md:gap-8" aria-hidden>
                {tiles.map((r, i) => (
                  <ReviewCard key={`m-b-${i}-${r.name}`} r={r} />
                ))}
              </div>
            </div>
          </div>

          <p className="mt-4 text-center text-xs text-white/40">
            مرّر المؤشر فوق الشريط باش توقف الحركة
          </p>
        </>
      )}
    </section>
  );
}

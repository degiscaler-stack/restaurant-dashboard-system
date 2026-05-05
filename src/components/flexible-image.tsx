"use client";

import Image from "next/image";

/** Hosts we optimize via next/image (`remotePatterns` in next.config). */
const OPTIMIZED_HTTPS = /^https:\/\/images\.unsplash\.com\//i;

type FillProps = {
  src: string;
  alt: string;
  fill: true;
  className?: string;
  sizes?: string;
  priority?: boolean;
};

/**
 * Uses `next/image` only for configured remotes / local files; otherwise `<img>`
 * so admin-provided CDN URLs cannot crash the whole page.
 */
export function FlexibleImage(props: FillProps) {
  const { src, alt, className = "", sizes, priority } = props;
  const canUseNext =
    src.startsWith("/") || OPTIMIZED_HTTPS.test(src.trim());

  if (canUseNext) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        sizes={sizes}
        className={className}
        priority={priority}
      />
    );
  }

  /* eslint-disable @next/next/no-img-element -- arbitrary HTTPS URLs from admin/cart must not crash the UI */
  return (
    <img
      src={src}
      alt={alt}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      className={`absolute inset-0 h-full w-full object-cover ${className}`}
    />
  );
  /* eslint-enable @next/next/no-img-element */
}

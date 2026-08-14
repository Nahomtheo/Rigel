'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';

type Ad = {
  _id: string;
  title: string;
  image: string;
  link: string;
  active: boolean;
};

export default function AdBanner() {
  const [ads, setAds] = useState<Ad[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch('/api/ads', { cache: 'no-store' });
        const data = await res.json();
        if (!cancelled && data.success) setAds(data.data);
      } catch {
        // ignore ad fetch errors
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading || ads.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-20px' }}
      transition={{ type: 'spring', stiffness: 60, damping: 15 }}
      className="mb-10"
    >
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {ads.map((ad) => (
          <a
            key={ad._id}
            href={ad.link || undefined}
            target={ad.link ? '_blank' : undefined}
            rel={ad.link ? 'noopener noreferrer' : undefined}
            className={`relative min-w-[85%] sm:min-w-[420px] lg:min-w-[540px] aspect-[2/1] rounded-2xl overflow-hidden border border-neutral-200 dark:border-neutral-800 shadow-sm snap-start group ${
              ad.link ? 'cursor-pointer' : 'cursor-default'
            }`}
          >
            <Image
              src={ad.image}
              alt={ad.title}
              fill
              className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
            />
            <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider">
              Ad
            </span>
          </a>
        ))}
      </div>
    </motion.div>
  );
}

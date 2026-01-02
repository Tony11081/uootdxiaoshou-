"use client";

import Image from "next/image";

type CraftQcGalleryProps = {
  className?: string;
  title?: string;
  description?: string;
};

const craftQcImages = [
  {
    title: "Leather grain",
    detail: "Full-grain texture and color depth.",
    image:
      "https://images.unsplash.com/photo-1571829604981-ea159f94e5ad?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Quilted stitch",
    detail: "Stitch density and alignment check.",
    image:
      "https://images.unsplash.com/photo-1564842505181-8862a3b9b173?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Hardware polish",
    detail: "Surface finish and plating review.",
    image:
      "https://images.unsplash.com/photo-1758297679787-12524226e30f?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Stitching bench",
    detail: "Tension and spacing control.",
    image:
      "https://images.unsplash.com/photo-1630930678172-63343537a00a?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Edge finish",
    detail: "Clean cuts and edge paint layers.",
    image:
      "https://images.unsplash.com/photo-1711548244678-be7019032b59?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Tooling set",
    detail: "Craft tools and pattern prep.",
    image:
      "https://images.unsplash.com/photo-1647502191516-68a4f8c74ed4?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "Packing prep",
    detail: "Discreet packaging and protection.",
    image:
      "https://images.unsplash.com/photo-1575833947349-69324d765146?auto=format&fit=crop&w=1200&q=80",
  },
  {
    title: "QC measurement",
    detail: "Final measurements before dispatch.",
    image:
      "https://images.unsplash.com/photo-1758873263563-5ba4aa330799?auto=format&fit=crop&w=1200&q=80",
  },
] as const;

export function CraftQcGallery({
  className = "",
  title = "Material and finish checks",
  description = "Materials, stitching, hardware, and packing are reviewed before sharing QC photos.",
}: CraftQcGalleryProps) {
  const sectionClassName = `glass-card rounded-3xl border border-black/8 bg-white/90 p-5${className ? ` ${className}` : ""}`;

  return (
    <section className={sectionClassName}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-[#7b6848]">
            Craft &amp; QC
          </p>
          <h2 className="mt-1 text-2xl font-semibold text-[var(--ink)]">
            {title}
          </h2>
          <p className="mt-2 max-w-2xl text-sm text-[#4f4635]">
            {description}
          </p>
        </div>
        <div className="flex flex-wrap gap-2 text-xs text-[#5c5345]">
          {["QC photos", "Discreet packing", "Hardware check", "Stitching check"].map(
            (tag) => (
              <span
                key={tag}
                className="rounded-full border border-black/8 bg-white/80 px-3 py-2 shadow-sm"
              >
                {tag}
              </span>
            ),
          )}
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {craftQcImages.map((item) => (
          <div
            key={item.title}
            className="group overflow-hidden rounded-2xl border border-black/10 bg-white/80 shadow-sm"
          >
            <div className="relative aspect-[4/5]">
              <Image
                src={item.image}
                alt={item.title}
                fill
                className="object-cover transition duration-500 group-hover:scale-105"
                sizes="(min-width: 1024px) 25vw, (min-width: 640px) 50vw, 100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
              <div className="absolute bottom-2 left-2 rounded-full bg-black/60 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-[#fef7d2]">
                {item.title}
              </div>
            </div>
            <div className="px-3 py-3 text-xs text-[#4f4635]">{item.detail}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

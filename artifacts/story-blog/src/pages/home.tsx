import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { gsap } from "gsap";
import { useLangStore } from "@/lib/store";
import { useListStories, useGetFeaturedStories, useListCollections, useGetAuthor } from "@workspace/api-client-react";
import { ShaderBackground } from "@/components/shader-background";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_LABELS: Record<string, { ru: string; en: string }> = {
  friendship: { ru: "Дружба", en: "Friendship" },
  love: { ru: "Любовь", en: "Love" },
  family: { ru: "Семья", en: "Family" },
  city: { ru: "Город", en: "City Life" },
  childhood: { ru: "Детство", en: "Childhood" },
  journeys: { ru: "Путешествия", en: "Journeys" },
};

export default function Home() {
  const { lang } = useLangStore();
  const cardsRef = useRef<HTMLDivElement>(null);

  const { data: stories, isLoading: storiesLoading } = useListStories();
  const { data: featured } = useGetFeaturedStories();
  const { data: collections } = useListCollections();
  const { data: author } = useGetAuthor();

  useEffect(() => {
    if (!stories || !cardsRef.current) return;
    const cards = cardsRef.current.querySelectorAll(".story-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 24 },
      { opacity: 1, y: 0, stagger: 0.08, duration: 0.6, ease: "power2.out" }
    );
  }, [stories]);

  return (
    <div className="flex-1 container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[240px_1fr_220px] gap-8 max-w-6xl">
      {/* LEFT COLUMN — Author + Shader */}
      <aside className="lg:block">
        <div className="sticky top-24 space-y-6">
          {/* Shader panel */}
          <div className="relative w-full aspect-[3/4] rounded-sm overflow-hidden border border-border shadow-sm">
            <ShaderBackground />
            {author && (
              <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/60 to-transparent">
                <p className="text-white font-serif text-lg font-semibold leading-tight">
                  {lang === "ru" ? author.nameRu : author.nameEn}
                </p>
              </div>
            )}
          </div>

          {/* Author bio */}
          {author ? (
            <div className="space-y-2">
              <p className="text-sm text-muted-foreground font-serif leading-relaxed">
                {lang === "ru" ? author.bioRu : author.bioEn}
              </p>
              <div className="flex gap-3 pt-1">
                {author.instagramUrl && (
                  <a href={author.instagramUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                    Instagram
                  </a>
                )}
                {author.telegramUrl && (
                  <a href={author.telegramUrl} target="_blank" rel="noopener noreferrer"
                    className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                    Telegram
                  </a>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          )}
        </div>
      </aside>

      {/* CENTER COLUMN — Story Feed */}
      <main className="min-w-0">
        {/* Featured banner */}
        {featured && featured.length > 0 && (
          <div className="mb-10">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
              {lang === "ru" ? "Избранное" : "Featured"}
            </p>
            <Link href={`/stories/${featured[0].id}`}
              className="group block border border-border rounded-sm p-6 hover:bg-accent/40 transition-colors cursor-pointer">
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">
                {CATEGORY_LABELS[featured[0].category]?.[lang] ?? featured[0].category}
              </p>
              <h2 className="text-2xl font-serif font-semibold leading-snug text-foreground group-hover:text-primary transition-colors mb-3">
                {lang === "ru" ? featured[0].titleRu : featured[0].titleEn}
              </h2>
              <p className="text-muted-foreground font-serif text-base leading-relaxed mb-4 line-clamp-3">
                {lang === "ru" ? featured[0].excerptRu : featured[0].excerptEn}
              </p>
              <span className="text-xs font-mono text-muted-foreground">
                {featured[0].readingTimeMinutes} {lang === "ru" ? "мин. чтения" : "min read"}
              </span>
            </Link>
          </div>
        )}

        {/* Story feed */}
        <div>
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
            {lang === "ru" ? "Все истории" : "All Stories"}
          </p>

          {storiesLoading ? (
            <div className="space-y-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="border-b border-border pb-6 space-y-2">
                  <Skeleton className="h-3 w-24" />
                  <Skeleton className="h-6 w-3/4" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-5/6" />
                </div>
              ))}
            </div>
          ) : (
            <div ref={cardsRef} className="space-y-0 divide-y divide-border">
              {(stories ?? []).map((story) => (
                <Link key={story.id} href={`/stories/${story.id}`}
                  className="story-card group flex gap-6 py-6 hover:bg-accent/20 transition-colors cursor-pointer px-2 -mx-2 rounded-sm"
                  data-testid={`card-story-${story.id}`}>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">
                      {CATEGORY_LABELS[story.category]?.[lang] ?? story.category}
                    </p>
                    <h3 className="text-xl font-serif font-semibold leading-snug text-foreground group-hover:text-primary transition-colors mb-2">
                      {lang === "ru" ? story.titleRu : story.titleEn}
                    </h3>
                    <p className="text-muted-foreground font-serif text-sm leading-relaxed line-clamp-2">
                      {lang === "ru" ? story.excerptRu : story.excerptEn}
                    </p>
                  </div>
                  <div className="shrink-0 flex flex-col items-end justify-between pt-1">
                    <span className="text-xs font-mono text-muted-foreground">
                      {story.readingTimeMinutes} {lang === "ru" ? "мин" : "min"}
                    </span>
                    {story.isFeatured && (
                      <span className="text-xs font-mono border border-border px-1.5 py-0.5 rounded-sm text-muted-foreground">
                        {lang === "ru" ? "Избр." : "Pick"}
                      </span>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* RIGHT COLUMN — Collections */}
      <aside className="lg:block">
        <div className="sticky top-24 space-y-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
              {lang === "ru" ? "Сборники" : "Collections"}
            </p>
            {collections ? (
              <nav className="space-y-1">
                {collections.map((col) => (
                  <Link key={col.id} href={`/?collection=${col.slug}`}
                    className="flex items-center justify-between py-2 px-3 rounded-sm hover:bg-accent transition-colors group cursor-pointer"
                    data-testid={`link-collection-${col.id}`}>
                    <span className="font-serif text-sm text-foreground group-hover:text-primary transition-colors">
                      {lang === "ru" ? col.nameRu : col.nameEn}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      {col.storyCount}
                    </span>
                  </Link>
                ))}
              </nav>
            ) : (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <Skeleton key={i} className="h-8 w-full" />
                ))}
              </div>
            )}
          </div>

          <div className="border-t border-border pt-6">
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
              {lang === "ru" ? "Темы" : "Themes"}
            </p>
            <div className="flex flex-wrap gap-1.5">
              {Object.entries(CATEGORY_LABELS).map(([key, labels]) => (
                <span key={key}
                  className="text-xs font-mono border border-border px-2 py-1 rounded-sm text-muted-foreground hover:bg-accent hover:text-foreground transition-colors cursor-default">
                  {labels[lang]}
                </span>
              ))}
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}

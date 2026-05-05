import { Link, useSearch } from "wouter";
import { useLangStore } from "@/lib/store";
import { useListStories, useListCollections, useGetAuthor } from "@workspace/api-client-react";
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

function formatDate(dateStr: string, lang: "ru" | "en") {
  const d = new Date(dateStr);
  return d.toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
    year: "numeric",
    month: "long",
  });
}

export default function Home() {
  const { lang } = useLangStore();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const activeSlug = params.get("collection");

  const { data: stories, isLoading: storiesLoading } = useListStories();
  const { data: collections } = useListCollections();
  const { data: author } = useGetAuthor();

  const activeCollection = collections?.find((c) => c.slug === activeSlug) ?? null;

  const filtered = activeCollection
    ? (stories ?? []).filter((s) => s.collectionId === activeCollection.id)
    : (stories ?? []);

  return (
    <div className="flex-1 container mx-auto px-4 py-10 grid grid-cols-1 lg:grid-cols-[240px_1fr_220px] gap-8 max-w-6xl">

      {/* LEFT — Author */}
      <aside>
        <div className="sticky top-24 space-y-6">
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

      {/* CENTER — Stories */}
      <main className="min-w-0">
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            {activeCollection
              ? (lang === "ru" ? activeCollection.nameRu : activeCollection.nameEn)
              : (lang === "ru" ? "Все истории" : "All Stories")}
          </p>
          {activeCollection && (
            <Link href="/" className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors">
              {lang === "ru" ? "← Все" : "← All"}
            </Link>
          )}
        </div>

        {storiesLoading ? (
          <div className="space-y-6">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="border-b border-border pb-6 space-y-2">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-5/6" />
              </div>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((story) => (
              <Link
                key={story.id}
                href={`/stories/${story.id}`}
                className="group flex gap-6 py-6 hover:bg-accent/20 transition-colors cursor-pointer px-2 -mx-2 rounded-sm"
                data-testid={`card-story-${story.id}`}
              >
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
                <div className="shrink-0 pt-1">
                  <span className="text-xs font-mono text-muted-foreground">
                    {formatDate(story.createdAt, lang)}
                  </span>
                </div>
              </Link>
            ))}

            {filtered.length === 0 && (
              <p className="py-12 text-center font-serif text-muted-foreground italic">
                {lang === "ru" ? "Историй пока нет." : "No stories yet."}
              </p>
            )}
          </div>
        )}
      </main>

      {/* RIGHT — Collections */}
      <aside>
        <div className="sticky top-24 space-y-6">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
              {lang === "ru" ? "Сборники" : "Collections"}
            </p>
            {collections ? (
              <nav className="space-y-1">
                {collections.map((col) => {
                  const isActive = activeSlug === col.slug;
                  return (
                    <Link
                      key={col.id}
                      href={isActive ? "/" : `/?collection=${col.slug}`}
                      className={`flex items-center justify-between py-2 px-3 rounded-sm transition-colors cursor-pointer ${
                        isActive
                          ? "bg-accent text-foreground"
                          : "hover:bg-accent text-foreground"
                      }`}
                      data-testid={`link-collection-${col.id}`}
                    >
                      <span className="font-serif text-sm">
                        {lang === "ru" ? col.nameRu : col.nameEn}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {col.storyCount}
                      </span>
                    </Link>
                  );
                })}
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
              {Object.entries(CATEGORY_LABELS).map(([, labels]) => (
                <span
                  key={labels.en}
                  className="text-xs font-mono border border-border px-2 py-1 rounded-sm text-muted-foreground"
                >
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

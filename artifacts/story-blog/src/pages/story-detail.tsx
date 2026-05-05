import { useEffect, useRef } from "react";
import { Link, useParams } from "wouter";
import { gsap } from "gsap";
import { useLangStore, useAuthStore } from "@/lib/store";
import {
  useGetStory,
  getGetStoryQueryKey,
  useDeleteStory,
  getListStoriesQueryKey,
  getGetFeaturedStoriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";

const CATEGORY_LABELS: Record<string, { ru: string; en: string }> = {
  friendship: { ru: "Дружба", en: "Friendship" },
  love: { ru: "Любовь", en: "Love" },
  family: { ru: "Семья", en: "Family" },
  city: { ru: "Город", en: "City Life" },
  childhood: { ru: "Детство", en: "Childhood" },
  journeys: { ru: "Путешествия", en: "Journeys" },
};

export default function StoryDetail() {
  const { id } = useParams<{ id: string }>();
  const storyId = Number(id);
  const { lang, toggleLang } = useLangStore();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const contentRef = useRef<HTMLDivElement>(null);

  const { data: story, isLoading } = useGetStory(storyId, {
    query: { enabled: !!storyId, queryKey: getGetStoryQueryKey(storyId) },
  });

  const deleteMutation = useDeleteStory({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListStoriesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetFeaturedStoriesQueryKey() });
        window.history.back();
      },
    },
  });

  useEffect(() => {
    if (!story || !contentRef.current) return;
    gsap.fromTo(
      contentRef.current,
      { opacity: 0, y: 16 },
      { opacity: 1, y: 0, duration: 0.7, ease: "power2.out" }
    );
  }, [story, lang]);

  if (isLoading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 space-y-6">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-10 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
        <div className="space-y-3 pt-6">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-4 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (!story) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="font-serif text-muted-foreground">
          {lang === "ru" ? "История не найдена." : "Story not found."}
        </p>
        <Link href="/" className="text-sm font-mono text-primary hover:underline mt-4 inline-block">
          {lang === "ru" ? "Вернуться" : "Go back"}
        </Link>
      </div>
    );
  }

  const title = lang === "ru" ? story.titleRu : story.titleEn;
  const content = lang === "ru" ? story.contentRu : story.contentEn;
  const paragraphs = content.split("\n\n").filter(Boolean);

  return (
    <article className="max-w-2xl mx-auto px-4 py-16" data-testid="article-story">
      {/* Back + controls */}
      <div className="flex items-center justify-between mb-10">
        <Link href="/" className="text-xs font-mono uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors">
          {lang === "ru" ? "Назад" : "Back"}
        </Link>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleLang}
            className="text-xs font-mono border border-border px-2 py-1 rounded-sm hover:bg-accent transition-colors uppercase cursor-pointer"
            data-testid="button-toggle-lang-detail"
          >
            {lang === "ru" ? "En" : "Ru"}
          </button>
          {user?.isAdmin && (
            <>
              <Link href={`/new-post?edit=${story.id}`}
                className="text-xs font-mono text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider">
                {lang === "ru" ? "Изменить" : "Edit"}
              </Link>
              <button
                onClick={() => {
                  if (confirm(lang === "ru" ? "Удалить историю?" : "Delete this story?")) {
                    deleteMutation.mutate({ id: storyId });
                  }
                }}
                className="text-xs font-mono text-destructive hover:opacity-70 transition-opacity uppercase tracking-wider cursor-pointer"
                data-testid="button-delete-story"
              >
                {lang === "ru" ? "Удалить" : "Delete"}
              </button>
            </>
          )}
        </div>
      </div>

      <div ref={contentRef}>
        {/* Category */}
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
          {CATEGORY_LABELS[story.category]?.[lang] ?? story.category}
          {story.collectionName && (
            <span className="ml-3 pl-3 border-l border-border">{story.collectionName}</span>
          )}
        </p>

        {/* Title */}
        <h1 className="text-4xl font-serif font-semibold leading-tight text-foreground mb-4">
          {title}
        </h1>

        {/* Bilingual title display */}
        <p className="text-sm font-serif italic text-muted-foreground mb-2">
          {lang === "ru" ? story.titleEn : story.titleRu}
        </p>

        {/* Meta */}
        <div className="flex items-center gap-4 mb-10 pt-2 border-b border-border pb-6">
          <span className="text-xs font-mono text-muted-foreground">
            {story.readingTimeMinutes} {lang === "ru" ? "минут чтения" : "min read"}
          </span>
          <span className="text-xs font-mono text-muted-foreground">
            {new Date(story.createdAt).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {/* Story body */}
        <div className="space-y-6">
          {paragraphs.map((para, i) => (
            <p key={i} className="font-serif text-lg leading-[1.85] text-foreground">
              {i === 0 ? (
                <>
                  <span className="float-left text-6xl font-serif leading-[0.75] pr-2 pt-1 text-primary font-bold">
                    {para.charAt(0)}
                  </span>
                  {para.slice(1)}
                </>
              ) : (
                para
              )}
            </p>
          ))}
        </div>

        {/* End ornament */}
        <div className="flex items-center justify-center mt-12 mb-6">
          <div className="flex items-center gap-3 text-muted-foreground">
            <div className="h-px w-16 bg-border" />
            <span className="font-serif text-lg">&#10022;</span>
            <div className="h-px w-16 bg-border" />
          </div>
        </div>

        {/* Guestbook CTA */}
        <div className="border border-border rounded-sm p-6 text-center">
          <p className="font-serif text-muted-foreground mb-3">
            {lang === "ru"
              ? "Эта история тронула вас? Оставьте запись в гостевой книге."
              : "Did this story move you? Leave a note in the guestbook."}
          </p>
          <Link href="/guestbook"
            className="text-xs font-mono uppercase tracking-widest text-primary hover:opacity-70 transition-opacity">
            {lang === "ru" ? "Гостевая книга" : "Guestbook"}
          </Link>
        </div>
      </div>
    </article>
  );
}

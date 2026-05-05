import { useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { gsap } from "gsap";
import { useListGuestbookEntries, useCreateGuestbookEntry, getListGuestbookEntriesQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLangStore } from "@/lib/store";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";

const entrySchema = z.object({
  name: z.string().min(1).max(80),
  message: z.string().min(1).max(800),
});
type EntryForm = z.infer<typeof entrySchema>;

export default function Guestbook() {
  const { lang } = useLangStore();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const entriesRef = useRef<HTMLDivElement>(null);

  const { data: entries, isLoading } = useListGuestbookEntries({
    query: { queryKey: getListGuestbookEntriesQueryKey() },
  });

  const createMutation = useCreateGuestbookEntry({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListGuestbookEntriesQueryKey() });
        form.reset();
        toast({
          description: lang === "ru" ? "Запись добавлена." : "Your note was added.",
        });
      },
    },
  });

  const form = useForm<EntryForm>({
    resolver: zodResolver(entrySchema),
    defaultValues: { name: "", message: "" },
  });

  useEffect(() => {
    if (!entries || !entriesRef.current) return;
    const cards = entriesRef.current.querySelectorAll(".entry-card");
    gsap.fromTo(
      cards,
      { opacity: 0, y: 12 },
      { opacity: 1, y: 0, stagger: 0.06, duration: 0.5, ease: "power2.out" }
    );
  }, [entries]);

  const onSubmit = (values: EntryForm) => {
    createMutation.mutate({ data: values });
  };

  return (
    <div className="max-w-2xl mx-auto px-4 py-16" data-testid="page-guestbook">
      {/* Header */}
      <div className="text-center mb-12">
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-3">
          {lang === "ru" ? "Гостевая книга" : "Guestbook"}
        </p>
        <h1 className="text-3xl font-serif font-semibold text-foreground mb-3">
          {lang === "ru" ? "Оставьте след" : "Leave a Mark"}
        </h1>
        <p className="font-serif text-muted-foreground italic">
          {lang === "ru"
            ? "Каждое слово — это часть этой истории."
            : "Every word becomes part of this story."}
        </p>
      </div>

      <div className="flex items-center gap-3 text-muted-foreground justify-center mb-10">
        <div className="h-px flex-1 bg-border" />
        <span className="font-serif">&#10022;</span>
        <div className="h-px flex-1 bg-border" />
      </div>

      {/* Submit form */}
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mb-14 border border-border rounded-sm p-6">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-4">
            {lang === "ru" ? "Ваша запись" : "Your Note"}
          </p>
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {lang === "ru" ? "Ваше имя" : "Your Name"}
                </FormLabel>
                <FormControl>
                  <Input {...field} data-testid="input-guest-name" className="font-serif bg-background" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                  {lang === "ru" ? "Сообщение" : "Message"}
                </FormLabel>
                <FormControl>
                  <Textarea
                    {...field}
                    data-testid="textarea-guest-message"
                    rows={4}
                    className="font-serif bg-background resize-none"
                    placeholder={lang === "ru"
                      ? "Напишите что-нибудь..."
                      : "Write something..."}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            disabled={createMutation.isPending}
            data-testid="button-submit-guest"
            className="font-mono uppercase tracking-widest text-xs"
          >
            {createMutation.isPending
              ? (lang === "ru" ? "Отправка..." : "Sending...")
              : (lang === "ru" ? "Оставить запись" : "Leave a Note")}
          </Button>
        </form>
      </Form>

      {/* Entries */}
      <div>
        <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-6">
          {lang === "ru" ? "Записи" : "Entries"}
          {entries && <span className="ml-2">({entries.length})</span>}
        </p>

        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="border border-border rounded-sm p-4 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </div>
            ))}
          </div>
        ) : entries?.length === 0 ? (
          <p className="font-serif text-muted-foreground italic text-center py-8">
            {lang === "ru" ? "Пока нет записей. Будьте первым." : "No entries yet. Be the first."}
          </p>
        ) : (
          <div ref={entriesRef} className="space-y-4">
            {(entries ?? []).map((entry) => (
              <div key={entry.id} className="entry-card border border-border rounded-sm p-5"
                data-testid={`card-entry-${entry.id}`}>
                <div className="flex items-baseline justify-between mb-2">
                  <span className="font-serif font-semibold text-foreground">{entry.name}</span>
                  <span className="text-xs font-mono text-muted-foreground">
                    {new Date(entry.createdAt).toLocaleDateString(lang === "ru" ? "ru-RU" : "en-US", {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                </div>
                <p className="font-serif text-muted-foreground leading-relaxed">{entry.message}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

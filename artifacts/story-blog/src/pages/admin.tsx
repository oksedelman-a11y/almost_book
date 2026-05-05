import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import {
  useListStories,
  useDeleteStory,
  useGetAuthor,
  useUpdateAuthor,
  getListStoriesQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, useLangStore } from "@/lib/store";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

export default function Admin() {
  const { user } = useAuthStore();
  const { lang } = useLangStore();
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  const { data: stories } = useListStories();
  const { data: author } = useGetAuthor();

  const deleteMutation = useDeleteStory({
    mutation: {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getListStoriesQueryKey() }),
    },
  });

  const form = useForm({
    defaultValues: { nameRu: "", nameEn: "", bioRu: "", bioEn: "", instagramUrl: "", telegramUrl: "" },
  });

  const updateAuthorMutation = useUpdateAuthor({
    mutation: { onSuccess: () => alert("Saved") },
  });

  useEffect(() => {
    if (!user?.isAdmin) setLocation("/");
  }, [user, setLocation]);

  useEffect(() => {
    if (author) {
      form.reset({
        nameRu: author.nameRu ?? "",
        nameEn: author.nameEn ?? "",
        bioRu: author.bioRu ?? "",
        bioEn: author.bioEn ?? "",
        instagramUrl: author.instagramUrl ?? "",
        telegramUrl: author.telegramUrl ?? "",
      });
    }
  }, [author, form]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-12 space-y-12">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-serif font-semibold">Admin</h1>
        <Link href="/new-post">
          <Button size="sm">{lang === "ru" ? "Новая история" : "New Story"}</Button>
        </Link>
      </div>

      {/* Stories list */}
      <section>
        <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
          {lang === "ru" ? "Истории" : "Stories"}
        </h2>
        <div className="divide-y divide-border border border-border rounded-sm">
          {(stories ?? []).map((s) => (
            <div key={s.id} className="flex items-center justify-between px-4 py-3 gap-4">
              <span className="font-serif text-sm flex-1 min-w-0 truncate">
                {lang === "ru" ? s.titleRu : s.titleEn}
              </span>
              <div className="flex gap-2 shrink-0">
                <Link href={`/new-post?edit=${s.id}`}>
                  <Button size="sm" variant="outline" className="text-xs font-mono">
                    {lang === "ru" ? "Изменить" : "Edit"}
                  </Button>
                </Link>
                <Button
                  size="sm"
                  variant="destructive"
                  className="text-xs font-mono"
                  onClick={() => {
                    if (confirm(lang === "ru" ? "Удалить?" : "Delete?")) {
                      deleteMutation.mutate({ id: s.id });
                    }
                  }}
                >
                  {lang === "ru" ? "Удалить" : "Delete"}
                </Button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Author bio */}
      <section>
        <h2 className="text-sm font-mono uppercase tracking-widest text-muted-foreground mb-4">
          {lang === "ru" ? "Профиль автора" : "Author Profile"}
        </h2>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => updateAuthorMutation.mutate({ data: v }))}
            className="space-y-4 border border-border rounded-sm p-5"
          >
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="nameRu" render={({ field }) => (
                <FormItem><FormLabel>Имя (RU)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="nameEn" render={({ field }) => (
                <FormItem><FormLabel>Name (EN)</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="bioRu" render={({ field }) => (
                <FormItem><FormLabel>Биография (RU)</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="bioEn" render={({ field }) => (
                <FormItem><FormLabel>Bio (EN)</FormLabel><FormControl><Textarea {...field} rows={4} /></FormControl></FormItem>
              )} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="instagramUrl" render={({ field }) => (
                <FormItem><FormLabel>Instagram URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
              <FormField control={form.control} name="telegramUrl" render={({ field }) => (
                <FormItem><FormLabel>Telegram URL</FormLabel><FormControl><Input {...field} /></FormControl></FormItem>
              )} />
            </div>
            <Button type="submit" disabled={updateAuthorMutation.isPending}>
              {updateAuthorMutation.isPending ? "Saving..." : "Save"}
            </Button>
          </form>
        </Form>
      </section>
    </div>
  );
}

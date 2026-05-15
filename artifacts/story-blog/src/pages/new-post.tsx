import { useEffect } from "react";
import { useLocation, useSearch } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useCreateStory,
  useUpdateStory,
  useGetStory,
  useListCollections,
  getListStoriesQueryKey,
  getGetFeaturedStoriesQueryKey,
  getGetStoryQueryKey,
} from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore, useLangStore } from "@/lib/store";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const CATEGORIES = ["friendship", "love", "family", "city", "childhood", "journeys", "reflections"];

const schema = z.object({
  titleRu: z.string().min(1),
  titleEn: z.string().min(1),
  excerptRu: z.string().min(1),
  excerptEn: z.string().min(1),
  contentRu: z.string().min(1),
  contentEn: z.string().min(1),
  category: z.string().min(1),
  collectionId: z.string().optional(),
  readingTimeMinutes: z.coerce.number().min(1),
  isFeatured: z.boolean().optional(),
});
type FormValues = z.infer<typeof schema>;

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[а-яё]/g, (ch) => {
      const map: Record<string, string> = {
        а:"a",б:"b",в:"v",г:"g",д:"d",е:"e",ё:"yo",ж:"zh",з:"z",и:"i",
        й:"y",к:"k",л:"l",м:"m",н:"n",о:"o",п:"p",р:"r",с:"s",т:"t",
        у:"u",ф:"f",х:"kh",ц:"ts",ч:"ch",ш:"sh",щ:"shch",ъ:"",ы:"y",
        ь:"",э:"e",ю:"yu",я:"ya",
      };
      return map[ch] ?? ch;
    })
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export default function NewPost() {
  const { lang } = useLangStore();
  const { user } = useAuthStore();
  const [, setLocation] = useLocation();
  const search = useSearch();
  const params = new URLSearchParams(search);
  const editId = params.get("edit") ? Number(params.get("edit")) : null;
  const queryClient = useQueryClient();

  const { data: story } = useGetStory(editId ?? 0, {
    query: {
      enabled: !!editId,
      queryKey: getGetStoryQueryKey(editId ?? 0),
    },
  });
  const { data: collections } = useListCollections();

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      titleRu: "", titleEn: "", excerptRu: "", excerptEn: "",
      contentRu: "", contentEn: "", category: "reflections",
      readingTimeMinutes: 5, isFeatured: false,
    },
  });

  useEffect(() => {
    if (!user?.isAdmin) setLocation("/");
  }, [user, setLocation]);

  useEffect(() => {
    if (story) {
      form.reset({
        titleRu: story.titleRu,
        titleEn: story.titleEn,
        excerptRu: story.excerptRu,
        excerptEn: story.excerptEn,
        contentRu: story.contentRu,
        contentEn: story.contentEn,
        category: story.category,
        collectionId: story.collectionId ? String(story.collectionId) : undefined,
        readingTimeMinutes: story.readingTimeMinutes,
        isFeatured: story.isFeatured,
      });
    }
  }, [story, form]);

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: getListStoriesQueryKey() });
    queryClient.invalidateQueries({ queryKey: getGetFeaturedStoriesQueryKey() });
  };

  const createMutation = useCreateStory({
    mutation: { onSuccess: () => { invalidate(); setLocation("/"); } },
  });
  const updateMutation = useUpdateStory({
    mutation: { onSuccess: () => { invalidate(); setLocation("/"); } },
  });

  const onSubmit = (values: FormValues) => {
    const payload = {
      ...values,
      slug: slugify(values.titleRu) || slugify(values.titleEn) || `story-${Date.now()}`,
      collectionId: values.collectionId ? Number(values.collectionId) : undefined,
      isFeatured: values.isFeatured ?? false,
    };
    if (editId) {
      updateMutation.mutate({ id: editId, data: payload });
    } else {
      createMutation.mutate({ data: payload });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-serif font-semibold mb-8">
        {editId
          ? (lang === "ru" ? "Редактировать" : "Edit Story")
          : (lang === "ru" ? "Новая история" : "New Story")}
      </h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="titleRu" render={({ field }) => (
              <FormItem>
                <FormLabel>Заголовок (RU)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="titleEn" render={({ field }) => (
              <FormItem>
                <FormLabel>Title (EN)</FormLabel>
                <FormControl><Input {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="excerptRu" render={({ field }) => (
              <FormItem>
                <FormLabel>Анонс (RU)</FormLabel>
                <FormControl><Textarea {...field} rows={2} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="excerptEn" render={({ field }) => (
              <FormItem>
                <FormLabel>Excerpt (EN)</FormLabel>
                <FormControl><Textarea {...field} rows={2} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField control={form.control} name="contentRu" render={({ field }) => (
              <FormItem>
                <FormLabel>Текст (RU)</FormLabel>
                <FormControl><Textarea {...field} rows={10} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="contentEn" render={({ field }) => (
              <FormItem>
                <FormLabel>Content (EN)</FormLabel>
                <FormControl><Textarea {...field} rows={10} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <FormField control={form.control} name="category" render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === "ru" ? "Категория" : "Category"}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="collectionId" render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === "ru" ? "Сборник" : "Collection"}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value ?? ""}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder={lang === "ru" ? "Нет" : "None"} /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="">{lang === "ru" ? "Нет" : "None"}</SelectItem>
                    {(collections ?? []).map(c => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {lang === "ru" ? c.nameRu : c.nameEn}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />
            <FormField control={form.control} name="readingTimeMinutes" render={({ field }) => (
              <FormItem>
                <FormLabel>{lang === "ru" ? "Время (мин)" : "Read time (min)"}</FormLabel>
                <FormControl><Input type="number" min={1} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="submit" disabled={isPending}>
              {isPending
                ? (lang === "ru" ? "Сохранение..." : "Saving...")
                : (editId
                    ? (lang === "ru" ? "Обновить" : "Update")
                    : (lang === "ru" ? "Опубликовать" : "Publish"))}
            </Button>
            <Button type="button" variant="outline" onClick={() => setLocation("/")}>
              {lang === "ru" ? "Отмена" : "Cancel"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

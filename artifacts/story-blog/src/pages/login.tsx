import { useEffect } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLogin } from "@workspace/api-client-react";
import { useAuthStore, useLangStore } from "@/lib/store";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";

const loginSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

type LoginForm = z.infer<typeof loginSchema>;

export default function Login() {
  const { lang } = useLangStore();
  const { setAuth, user } = useAuthStore();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  useEffect(() => {
    if (user) setLocation("/");
  }, [user, setLocation]);

  const loginMutation = useLogin({
    mutation: {
      onSuccess: (data) => {
        setAuth(data.token, data.user);
        setLocation("/");
      },
      onError: () => {
        toast({
          variant: "destructive",
          description: lang === "ru" ? "Неверное имя пользователя или пароль." : "Invalid username or password.",
        });
      },
    },
  });

  const onSubmit = (values: LoginForm) => {
    loginMutation.mutate({ data: values });
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 py-20">
      <div className="w-full max-w-sm space-y-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
            {lang === "ru" ? "Вход" : "Sign In"}
          </p>
          <h1 className="text-3xl font-serif font-semibold text-foreground">
            {lang === "ru" ? "Истории" : "Stories"}
          </h1>
          <p className="font-serif text-sm text-muted-foreground italic">
            {lang === "ru" ? "Только для автора" : "Author access only"}
          </p>
        </div>

        {/* Ornament */}
        <div className="flex items-center gap-3 text-muted-foreground justify-center">
          <div className="h-px flex-1 bg-border" />
          <span className="font-serif">&#10022;</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    {lang === "ru" ? "Имя пользователя" : "Username"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      data-testid="input-username"
                      className="font-mono bg-background border-border focus:ring-ring"
                      placeholder={lang === "ru" ? "admin" : "admin"}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    {lang === "ru" ? "Пароль" : "Password"}
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="password"
                      data-testid="input-password"
                      className="font-mono bg-background border-border focus:ring-ring"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button
              type="submit"
              disabled={loginMutation.isPending}
              data-testid="button-submit-login"
              className="w-full font-mono uppercase tracking-widest text-xs"
            >
              {loginMutation.isPending
                ? (lang === "ru" ? "Вход..." : "Signing in...")
                : (lang === "ru" ? "Войти" : "Sign In")}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
}

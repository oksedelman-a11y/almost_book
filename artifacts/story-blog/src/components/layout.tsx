import { ReactNode } from "react";
import { Link } from "wouter";
import { useAuthStore, useLangStore } from "@/lib/store";
import { useLogout } from "@workspace/api-client-react";

export function Layout({ children }: { children: ReactNode }) {
  const { lang, toggleLang } = useLangStore();
  const { user, logout } = useAuthStore();
  const logoutMutation = useLogout();

  const handleLogout = () => {
    logoutMutation.mutate(undefined, {
      onSuccess: () => {
        logout();
      }
    });
  };

  return (
    <div className="min-h-screen w-full flex flex-col font-serif">
      <header className="border-b border-border sticky top-0 bg-background/80 backdrop-blur-md z-40">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="text-2xl font-semibold tracking-tight text-foreground hover:opacity-80 transition-opacity">
            {lang === "ru" ? "Истории" : "Stories"}
          </Link>
          
          <nav className="flex items-center gap-6">
            <Link href="/guestbook" className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider font-mono">
              {lang === "ru" ? "Гостевая книга" : "Guestbook"}
            </Link>
            
            {user?.isAdmin && (
              <Link href="/admin" className="text-sm text-primary hover:opacity-80 transition-colors uppercase tracking-wider font-mono">
                Admin
              </Link>
            )}
            
            {user ? (
              <button 
                onClick={handleLogout}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider font-mono cursor-pointer"
              >
                {lang === "ru" ? "Выйти" : "Logout"}
              </button>
            ) : (
              <Link href="/login" className="text-sm text-muted-foreground hover:text-foreground transition-colors uppercase tracking-wider font-mono">
                {lang === "ru" ? "Войти" : "Login"}
              </Link>
            )}

            <button 
              onClick={toggleLang}
              className="text-sm font-mono border border-border px-2 py-1 rounded hover:bg-muted transition-colors uppercase cursor-pointer"
              data-testid="button-toggle-lang"
            >
              {lang}
            </button>
          </nav>
        </div>
      </header>
      
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      <footer className="border-t border-border py-8 mt-auto">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground font-mono">
          &copy; {new Date().getFullYear()} {lang === "ru" ? "Истории. Все права защищены." : "Stories. All rights reserved."}
        </div>
      </footer>
    </div>
  );
}
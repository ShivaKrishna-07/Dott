import { ReactNode } from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { signInWithPopup, signInWithRedirect } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';
import { Loader2, Orbit } from 'lucide-react';
import { motion } from 'framer-motion';

export function AuthWrapper({ children }: { children: ReactNode }) {
  const [user, loading, error] = useAuthState(auth);

  const handleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err: any) {
      // Popup blocked (mobile) or cancelled — fall back to redirect
      if (err.code === 'auth/popup-blocked' || err.code === 'auth/popup-closed-by-user') {
        signInWithRedirect(auth, googleProvider);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-8 h-8 text-foreground/50 animate-spin" />
        <p className="text-muted-foreground text-sm font-medium tracking-wide">Loading Dott...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
        <p className="text-destructive mb-2">Error connecting to auth service.</p>
        <p className="text-muted-foreground text-sm">{error.message}</p>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 relative overflow-hidden">
        
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="relative z-10 w-full max-w-sm"
        >
          <div className="glass-card p-10 flex flex-col items-center border border-border/50 shadow-2xl">
            <img src="/dott.jpg" alt="Dott Logo" className="w-16 h-16 rounded-2xl object-cover mb-6 shadow-sm" />
            
            <h1 className="text-2xl font-bold text-foreground mb-2 text-center tracking-tight">Welcome to Dott</h1>
            <p className="text-muted-foreground text-center mb-8 text-sm leading-relaxed">
              Your daily focus, beautifully tracked.
            </p>
            
            <button
              onClick={handleSignIn}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-accent/50 border border-border/60 text-foreground font-medium hover:bg-accent transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <img src="/google.webp" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Inject the user object into children or context if needed later, but the app can just use useAuthState(auth) locally where needed natively.
  return <>{children}</>;
}

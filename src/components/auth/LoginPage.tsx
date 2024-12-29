import { Auth } from '@supabase/auth-ui-react';
import { ThemeSupa } from '@supabase/auth-ui-shared';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from './AuthProvider';
import { useToast } from '@/hooks/use-toast';
import { AuthChangeEvent } from '@supabase/supabase-js';
import { ThemeToggle } from '../theme/ThemeToggle';
import { useTheme } from '../theme/ThemeProvider';

const LoginPage = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const { toast } = useToast();
  const { theme } = useTheme();

  useEffect(() => {
    if (session) {
      navigate('/');
    }
  }, [session, navigate]);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event: AuthChangeEvent, session) => {
      if (event === 'SIGNED_IN' && session) {
        navigate('/');
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [navigate]);

  return (
    <div className={`min-h-screen ${theme === 'light' ? 'bg-game-background-light' : 'bg-game-background'} flex items-center justify-center p-4`}>
      <ThemeToggle className="fixed top-4 right-4" />
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className={`text-4xl font-bold ${theme === 'light' ? 'text-game-accent-light' : 'text-game-accent'}`}>Dinjure</h1>
          <p className={`mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-white/60'}`}>Sign in to play online</p>
        </div>
        <div className={`${theme === 'light' ? 'bg-white shadow-lg' : 'bg-white/5'} p-8 rounded-lg ${theme === 'light' ? 'border border-gray-200' : 'border-2 border-game-accent/20'}`}>
          <Auth
            supabaseClient={supabase}
            appearance={{
              theme: ThemeSupa,
              variables: {
                default: {
                  colors: {
                    brand: theme === 'light' ? '#222222' : '#FF5F1F',
                    brandAccent: theme === 'light' ? '#000000' : '#FF5F1F',
                  },
                },
              },
            }}
            providers={[]}
            redirectTo={window.location.origin}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
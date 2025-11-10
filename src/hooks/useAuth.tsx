import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  profile: any;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const { toast } = useToast();

  const fetchProfile = async (userId: string) => {
    try {
      // Add timeout to prevent hanging
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Profile fetch timeout')), 10000)
      );

      const { data, error } = await Promise.race([
        profilePromise,
        timeoutPromise
      ]) as any;
      
      if (error) throw error;
      
      if (data) {
        setProfile(data);
        
        // Auto-create coach profile if user is a coach but doesn't have one
        if (data.role === 'coach') {
          try {
            const { data: coachData } = await supabase
              .from('coaches')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();
              
            if (!coachData) {
              await supabase.from('coaches').insert({
                user_id: userId,
                profile_id: data.id,
                specializations: [],
                experience_years: 0
              });
            }
          } catch (error) {
            console.error('Error creating coach profile:', error);
          }
        }
        
        // Auto-create admin user if user is an admin but doesn't have one
        if (data.role === 'admin') {
          try {
            const { data: adminData } = await supabase
              .from('admin_users')
              .select('id')
              .eq('user_id', userId)
              .maybeSingle();
              
            if (!adminData) {
              await supabase.from('admin_users').insert({
                user_id: userId,
                profile_id: data.id,
                permissions: ['read', 'write', 'admin']
              });
            }
          } catch (error) {
            console.error('Error creating admin profile:', error);
          }
        }
      } else {
        console.log('No profile found for user:', userId);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfile(null);
      // Don't leave user stuck in loading state
      setLoading(false);
    }
  };

  const refetchProfile = async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        } else {
          setProfile(null);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      }
    );

    // Get initial session with timeout
    const getInitialSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await fetchProfile(session.user.id);
        }
        
        if (isMounted) {
          setLoading(false);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: userData
        }
      });

      if (error) {
        toast({
          title: "Sign Up Error",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account.",
        });
      }

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        toast({
          title: "Sign In Error",
          description: error.message,
          variant: "destructive",
        });
      }

      return { error };
    } catch (error: any) {
      return { error };
    }
  };

  const signOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const value = {
    user,
    session,
    loading,
    signUp,
    signIn,
    signOut,
    profile,
    refetchProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
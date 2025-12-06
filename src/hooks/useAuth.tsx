import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';

interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  phone: string | null;
  date_of_birth: string | null;
  location: string | null;
  avatar_url: string | null;
  bio: string | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signUp: (email: string, password: string, userData: any) => Promise<{ error: any }>;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  profile: Profile | null;
  refetchProfile: () => Promise<void>;
  getRoleBasedRedirect: () => string;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Role-based redirect mapping
const ROLE_REDIRECTS: Record<string, string> = {
  admin: '/admin',
  coach: '/dashboard',
  parent: '/dashboard',
  student: '/dashboard',
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const { toast } = useToast();

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();
      
      if (error) {
        console.error('Profile fetch error:', error);
        return null;
      }
      
      if (data) {
        setProfile(data);
        
        // Auto-create coach profile if user is a coach but doesn't have one
        if (data.role === 'coach') {
          setTimeout(async () => {
            try {
              const { data: coachData } = await supabase
                .from('coaches')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle();
                
              if (!coachData) {
                await supabase.from('coaches').insert({
                  user_id: userId,
                  specializations: [],
                  experience_years: 0
                });
              }
            } catch (error) {
              console.error('Error creating coach profile:', error);
            }
          }, 0);
        }
        
        // Auto-create admin user if user is an admin but doesn't have one
        if (data.role === 'admin') {
          setTimeout(async () => {
            try {
              const { data: adminData } = await supabase
                .from('admin_users')
                .select('id')
                .eq('user_id', userId)
                .maybeSingle();
                
              if (!adminData) {
                await supabase.from('admin_users').insert({
                  user_id: userId,
                  permissions: ['read', 'write', 'admin']
                });
              }
            } catch (error) {
              console.error('Error creating admin profile:', error);
            }
          }, 0);
        }
        
        return data;
      }
      
      return null;
    } catch (error) {
      console.error('Error fetching profile:', error);
      return null;
    }
  }, []);

  const refetchProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user.id);
    }
  }, [user, fetchProfile]);

  const getRoleBasedRedirect = useCallback((): string => {
    if (!profile) return '/dashboard';
    return ROLE_REDIRECTS[profile.role] || '/dashboard';
  }, [profile]);

  useEffect(() => {
    let isMounted = true;
    let initTimeout: NodeJS.Timeout;

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        if (!isMounted) return;
        
        // Synchronous state updates only
        setSession(newSession);
        setUser(newSession?.user ?? null);
        
        if (newSession?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            if (isMounted) {
              fetchProfile(newSession.user.id).finally(() => {
                if (isMounted) setLoading(false);
              });
            }
          }, 0);
        } else {
          setProfile(null);
          if (isMounted) setLoading(false);
        }
      }
    );

    // THEN check for existing session
    const getInitialSession = async () => {
      try {
        const { data: { session: initialSession } } = await supabase.auth.getSession();
        
        if (!isMounted) return;
        
        setSession(initialSession);
        setUser(initialSession?.user ?? null);
        
        if (initialSession?.user) {
          await fetchProfile(initialSession.user.id);
        }
      } catch (error) {
        console.error('Error getting initial session:', error);
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    getInitialSession();

    // Safety timeout to prevent infinite loading
    initTimeout = setTimeout(() => {
      if (isMounted && loading) {
        console.warn('Auth init timeout reached');
        setLoading(false);
      }
    }, 8000);

    return () => {
      isMounted = false;
      clearTimeout(initTimeout);
      subscription.unsubscribe();
    };
  }, [fetchProfile]);

  const signUp = async (email: string, password: string, userData: any) => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { data, error } = await supabase.auth.signUp({
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
        return { error };
      }

      // If auto-confirm is enabled, user will be signed in automatically
      if (data.user && data.session) {
        toast({
          title: "Account Created!",
          description: "Welcome! You've been signed in automatically.",
        });
      } else {
        toast({
          title: "Success!",
          description: "Please check your email to confirm your account.",
        });
      }

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign Up Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
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
        return { error };
      }

      toast({
        title: "Welcome Back!",
        description: "You've been signed in successfully.",
      });

      return { error: null };
    } catch (error: any) {
      toast({
        title: "Sign In Error",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
      return { error };
    }
  };

  const signOut = async () => {
    try {
      setLoading(true);
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setProfile(null);
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out.",
      });
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setLoading(false);
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
    refetchProfile,
    getRoleBasedRedirect
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

import { supabase } from '../lib/supabase';
import { Profile, UserRole } from '../types';

export const authService = {
  /**
   * Get the current authenticated user's profile from Supabase
   */
  async getSession(): Promise<Profile | null> {
    try {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError || !session?.user) {
        return null;
      }

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) {
        console.warn('Profile fetch error:', profileError);
      }

      if (profile) {
        return {
          id: profile.id,
          user_id: profile.id,
          username: profile.username || session.user.user_metadata?.username || profile.email?.split('@')[0],
          full_name: profile.full_name || session.user.user_metadata?.full_name || 'عضو Aliens Space',
          email: profile.email || session.user.email || '',
          role: (profile.role as UserRole) || 'registered_user',
          committee_key: profile.committee_key || undefined,
          committee_position: profile.committee_position || undefined,
          avatar_url: profile.avatar_url || undefined,
          phone: profile.phone || undefined,
          student_id: profile.student_id || undefined,
          assigned_ir: profile.assigned_ir || undefined,
          is_evaluator: Boolean(profile.is_evaluator),
          created_at: profile.created_at
        };
      }

      // Fallback profile representation if profile record trigger hasn't fired yet
      return {
        id: session.user.id,
        user_id: session.user.id,
        username: session.user.user_metadata?.username || session.user.email?.split('@')[0] || 'user',
        full_name: session.user.user_metadata?.full_name || 'مستخدم مسجل',
        email: session.user.email || '',
        role: 'registered_user',
        is_evaluator: false,
        created_at: session.user.created_at
      };
    } catch (err) {
      console.warn('Session check failed:', err);
      return null;
    }
  },

  /**
   * Sign in using email OR username + password
   */
  async signIn(identifier: string, password?: string): Promise<Profile> {
    const cleanId = identifier.trim();
    let email = cleanId;

    // If identifier is not an email, lookup email from profiles table by username
    if (!cleanId.includes('@')) {
      const { data: matchedProfile, error: lookupError } = await supabase
        .from('profiles')
        .select('email')
        .ilike('username', cleanId)
        .maybeSingle();

      if (lookupError || !matchedProfile?.email) {
        throw new Error('اسم المستخدم غير مسجل في النظام.');
      }
      email = matchedProfile.email;
    }

    if (!password) {
      throw new Error('يرجى إدخال كلمة المرور.');
    }

    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'فشل تسجيل الدخول. يرجى التأكد من صحة البيانات.');
    }

    // Fetch the resolved profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', authData.user.id)
      .maybeSingle();

    return {
      id: authData.user.id,
      user_id: authData.user.id,
      username: profile?.username || authData.user.user_metadata?.username || email.split('@')[0],
      full_name: profile?.full_name || authData.user.user_metadata?.full_name || 'مستخدم مسجل',
      email: authData.user.email || email,
      role: (profile?.role as UserRole) || 'registered_user',
      committee_key: profile?.committee_key || undefined,
      committee_position: profile?.committee_position || undefined,
      avatar_url: profile?.avatar_url || undefined,
      phone: profile?.phone || undefined,
      student_id: profile?.student_id || undefined,
      assigned_ir: profile?.assigned_ir || undefined,
      is_evaluator: Boolean(profile?.is_evaluator),
      created_at: profile?.created_at || authData.user.created_at
    };
  },

  /**
   * Sign up a new user (Creates REGISTERED_USER role only, never automatic membership)
   */
  async signUp(email: string, fullName: string, username: string, password?: string): Promise<Profile> {
    const cleanEmail = email.trim().toLowerCase();
    const cleanUsername = username.trim().toLowerCase();
    const cleanFullName = fullName.trim();
    const securePassword = password || 'AliensSpace2026!';

    // Check if username is already taken
    const { data: existingUser } = await supabase
      .from('profiles')
      .select('id')
      .ilike('username', cleanUsername)
      .maybeSingle();

    if (existingUser) {
      throw new Error('اسم المستخدم محجوز بالفعل. يرجى اختيار اسم مستخدم آخر.');
    }

    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: cleanEmail,
      password: securePassword,
      options: {
        data: {
          full_name: cleanFullName,
          username: cleanUsername
        }
      }
    });

    if (authError || !authData.user) {
      throw new Error(authError?.message || 'فشل إنشاء الحساب.');
    }

    // Insert or ensure profile entry as 'registered_user'
    const newProfileData = {
      id: authData.user.id,
      email: cleanEmail,
      full_name: cleanFullName,
      username: cleanUsername,
      role: 'registered_user',
      is_evaluator: false
    };

    const { data: profile, error: insertError } = await supabase
      .from('profiles')
      .upsert(newProfileData, { onConflict: 'id' })
      .select()
      .maybeSingle();

    if (insertError) {
      console.warn('Profile insertion note:', insertError);
    }

    return {
      id: authData.user.id,
      user_id: authData.user.id,
      username: cleanUsername,
      full_name: cleanFullName,
      email: cleanEmail,
      role: 'registered_user',
      is_evaluator: false,
      created_at: new Date().toISOString()
    };
  },

  /**
   * Sign out and clear all sessions
   */
  async signOut(): Promise<void> {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn('Sign out warning:', e);
    }
    if (typeof window !== 'undefined') {
      window.sessionStorage?.clear();
    }
  },

  /**
   * Send password reset email
   */
  async resetPassword(email: string): Promise<void> {
    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: typeof window !== 'undefined' ? `${window.location.origin}/reset-password` : undefined
    });
    if (error) {
      throw new Error(error.message || 'فشل إرسال رابط استعادة كلمة المرور.');
    }
  },

  /**
   * Subscribe to auth state changes
   */
  onAuthStateChange(callback: (profile: Profile | null) => void) {
    return supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!session?.user) {
        callback(null);
        return;
      }
      const profile = await this.getSession();
      callback(profile);
    });
  }
};

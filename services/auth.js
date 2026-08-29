/**
 * services/auth.js
 * Supabase Auth service layer.
 */
const AuthService = {
  async getSession() {
    if (!window.sb) return null;
    const { data: { session }, error } = await window.sb.auth.getSession();
    if (error) {
      console.warn("AuthSession error:", error);
      return null;
    }
    return session;
  },

  async signUp(email, password, fullName, username) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { data, error } = await window.sb.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          username: username
        }
      }
    });
    if (error) throw error;
    return data;
  },

  async signIn(identifier, password) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    let email = identifier.trim();
    if (!email.includes('@')) {
      const { data: profile, error: pErr } = await window.sb
        .from('profiles')
        .select('email')
        .ilike('username', identifier.trim())
        .maybeSingle();
      if (pErr || !profile?.email) {
        throw new Error("اسم المستخدم غير مسجل أو غير موجود.");
      }
      email = profile.email;
    }
    const { data, error } = await window.sb.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async signOut() {
    if (!window.sb) return;
    await window.sb.auth.signOut();
    localStorage.removeItem('aliens_role');
    sessionStorage.clear();
  },

  async resetPassword(email) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { data, error } = await window.sb.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: window.location.origin + '/auth.html'
    });
    if (error) throw error;
    return data;
  },

  async updatePassword(newPassword) {
    if (!window.sb) throw new Error("Supabase is not initialized.");
    const { data, error } = await window.sb.auth.updateUser({ password: newPassword });
    if (error) throw error;
    return data;
  }
};

window.AuthService = AuthService;

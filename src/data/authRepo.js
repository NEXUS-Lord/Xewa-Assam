import { getSupabaseClient, isSupabaseConfigured } from "../core/supabase";
import { INITIAL_DEMO_USERS } from "../core/mockData";

const USERS_STORAGE_KEY = "xewa_users_store";
const CURRENT_USER_KEY = "xewa_current_user";

function getLocalUsers() {
  const data = localStorage.getItem(USERS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_USERS));
    return [...INITIAL_DEMO_USERS];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [...INITIAL_DEMO_USERS];
  }
}

function saveLocalUsers(users) {
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
}

export const authRepo = {
  getCurrentSessionUser() {
    const data = localStorage.getItem(CURRENT_USER_KEY);
    if (!data) return null;
    try {
      return JSON.parse(data);
    } catch (e) {
      return null;
    }
  },

  async fetchUserProfile(userId) {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone, whatsapp, role, approved, created_at")
          .eq("id", userId)
          .single();
        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.warn("fetchUserProfile fallback:", err.message);
      }
    }

    const local = getLocalUsers().find(u => u.id === userId);
    return { data: local || null, error: local ? null : "User not found" };
  },

  async login(email, password) {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (authError) throw authError;

        // Fetch user profile from public.profiles
        const { data: profile, error: profError } = await this.fetchUserProfile(authData.user.id);
        const userObj = {
          id: authData.user.id,
          email: authData.user.email,
          full_name: profile?.full_name || authData.user.user_metadata?.full_name || "User",
          phone: profile?.phone || authData.user.user_metadata?.phone || "",
          whatsapp: profile?.whatsapp || authData.user.user_metadata?.whatsapp || profile?.phone || "",
          role: profile?.role || "user",
          approved: profile?.approved ?? false
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
        return { data: userObj, error: null };
      } catch (err) {
        return { data: null, error: err.message };
      }
    }

    // Local / Demo Login
    const users = getLocalUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (!user) {
      return { data: null, error: "Invalid email or user not found. (Use quick demo login or sign up!)" };
    }

    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
    return { data: user, error: null };
  },

  async signup({ email, password, full_name, phone, whatsapp }) {
    const finalWhatsApp = whatsapp || phone;
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data: authData, error: authErr } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name,
              phone,
              whatsapp: finalWhatsApp
            }
          }
        });
        if (authErr) throw authErr;

        const userObj = {
          id: authData.user?.id || "usr-" + Date.now().toString(36),
          email,
          full_name,
          phone,
          whatsapp: finalWhatsApp,
          role: "user",
          approved: false
        };
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
        return { data: userObj, error: null };
      } catch (err) {
        return { data: null, error: err.message };
      }
    }

    // Local signup
    const users = getLocalUsers();
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
      return { data: null, error: "An account with this email already exists." };
    }

    const newUser = {
      id: "usr-" + Date.now().toString(36),
      email,
      full_name,
      phone,
      whatsapp: finalWhatsApp,
      role: "user",
      approved: false, // Starts as pending approval per Migration 0003!
      created_at: new Date().toISOString()
    };
    users.push(newUser);
    saveLocalUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return { data: newUser, error: null };
  },

  async logout() {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // ignore
      }
    }
    localStorage.removeItem(CURRENT_USER_KEY);
    return { error: null };
  },

  async getAllProfiles() {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, full_name, email, phone, whatsapp, role, approved, created_at")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.warn("getAllProfiles fallback:", err.message);
      }
    }

    return { data: getLocalUsers(), error: null };
  },

  async setUserApproval(targetUserId, approvedStatus) {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        // Calls the database function set_user_approval per Migration 0003
        const { error } = await supabase.rpc("set_user_approval", {
          target: targetUserId,
          ok: approvedStatus
        });
        if (error) throw error;
        return { error: null };
      } catch (err) {
        console.warn("RPC set_user_approval failed:", err.message);
      }
    }

    // Local update
    const users = getLocalUsers();
    const target = users.find(u => u.id === targetUserId);
    if (target) {
      target.approved = approvedStatus;
      saveLocalUsers(users);

      // If updating currently logged in user session, refresh it
      const current = this.getCurrentSessionUser();
      if (current && current.id === targetUserId) {
        current.approved = approvedStatus;
        localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(current));
      }
      return { error: null };
    }
    return { error: "User not found" };
  },

  // Helper for quick 1-click test role switching during development
  quickSwitchDemoUser(demoEmail) {
    const users = getLocalUsers();
    const user = users.find(u => u.email === demoEmail);
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  subscribeToAuthChanges(callback) {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      const { data } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user && (event === "SIGNED_IN" || event === "USER_UPDATED")) {
          const { data: profile } = await this.fetchUserProfile(session.user.id);
          const userObj = {
            id: session.user.id,
            email: session.user.email,
            full_name: profile?.full_name || session.user.user_metadata?.full_name || "User",
            phone: profile?.phone || session.user.user_metadata?.phone || "",
            role: profile?.role || "user",
            approved: profile?.approved ?? false
          };
          localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(userObj));
          callback(event, userObj);
        } else if (event === "SIGNED_OUT") {
          callback(event, null);
        }
      });
      return data?.subscription;
    }
    return { unsubscribe: () => {} };
  }
};

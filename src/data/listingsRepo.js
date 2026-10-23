import { getSupabaseClient, isSupabaseConfigured } from "../core/supabase";
import { INITIAL_DEMO_LISTINGS } from "../core/mockData";

const LOCAL_STORAGE_KEY = "xewa_listings_store";

function getLocalListings() {
  const data = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_LISTINGS));
    return [...INITIAL_DEMO_LISTINGS];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [...INITIAL_DEMO_LISTINGS];
  }
}

function saveLocalListings(listings) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(listings));
}

// Sanitize search query to protect PostgREST filters: remove , ( ) % per brief
export function sanitizeSearchQuery(query) {
  if (!query) return "";
  return query.replace(/[,()%\\]/g, " ").trim();
}

export const listingsRepo = {
  async getApprovedListings({ cityId, categorySlug, sort = "newest", locality = "" }) {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        let query = supabase
          .from("listings")
          .select("*, categories!inner(slug), listing_photos(storage_path)")
          .eq("status", "approved")
          .eq("city_id", cityId);

        if (categorySlug && categorySlug !== "all") {
          query = query.eq("categories.slug", categorySlug);
        }

        if (locality) {
          query = query.ilike("locality", `%${sanitizeSearchQuery(locality)}%`);
        }

        if (sort === "rating") {
          query = query.order("avg_rating", { ascending: false }).order("created_at", { ascending: false });
        } else {
          query = query.order("created_at", { ascending: false });
        }

        const { data, error } = await query;
        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.warn("Supabase listings query fallback to local:", err.message);
      }
    }

    // Local / Demo Mode
    let list = getLocalListings().filter(item => item.city_id === Number(cityId) && item.status === "approved");
    if (categorySlug && categorySlug !== "all") {
      list = list.filter(item => item.category_slug === categorySlug);
    }
    if (locality) {
      const sanitized = sanitizeSearchQuery(locality).toLowerCase();
      list = list.filter(item => item.locality.toLowerCase().includes(sanitized));
    }
    if (sort === "rating") {
      list.sort((a, b) => (b.avg_rating || 0) - (a.avg_rating || 0));
    } else {
      list.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    return { data: list, error: null };
  },

  async searchListings({ cityId, queryText }) {
    const cleaned = sanitizeSearchQuery(queryText);
    if (!cleaned) {
      return this.getApprovedListings({ cityId, categorySlug: "all" });
    }

    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*, categories!inner(slug), listing_photos(storage_path)")
          .eq("status", "approved")
          .eq("city_id", cityId)
          .or(`name.ilike.%${cleaned}%,description.ilike.%${cleaned}%,locality.ilike.%${cleaned}%`)
          .order("created_at", { ascending: false });

        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.warn("Supabase search fallback to local:", err.message);
      }
    }

    // Local filter
    const term = cleaned.toLowerCase();
    const list = getLocalListings().filter(item => {
      if (item.city_id !== Number(cityId) || item.status !== "approved") return false;
      return (
        item.name.toLowerCase().includes(term) ||
        (item.description && item.description.toLowerCase().includes(term)) ||
        (item.locality && item.locality.toLowerCase().includes(term))
      );
    });
    return { data: list, error: null };
  },

  async getListingById(id) {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*, listing_photos(id, storage_path)")
          .eq("id", id)
          .single();
        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.warn("Supabase getById fallback:", err.message);
      }
    }

    const item = getLocalListings().find(x => x.id === id);
    return { data: item || null, error: item ? null : "Listing not found" };
  },

  async getMySubmissions(userId) {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*, listing_photos(storage_path)")
          .eq("owner_id", userId)
          .order("created_at", { ascending: false });
        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.warn("Supabase submissions fallback:", err.message);
      }
    }

    const list = getLocalListings().filter(x => x.owner_id === userId);
    return { data: list, error: null };
  },

  async getAdminPendingListings() {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*, listing_photos(storage_path)")
          .eq("status", "pending")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.warn("Supabase pending fallback:", err.message);
      }
    }

    const list = getLocalListings().filter(x => x.status === "pending");
    return { data: list, error: null };
  },

  async getAllAdminListings() {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("listings")
          .select("*, listing_photos(storage_path)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.warn("Supabase all listings fallback:", err.message);
      }
    }

    return { data: getLocalListings(), error: null };
  },

  async createListing(listingData, user) {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const payload = {
          city_id: listingData.city_id,
          category_id: listingData.category_id,
          name: listingData.name,
          description: listingData.description || "",
          phone: listingData.phone,
          whatsapp: listingData.whatsapp || null,
          locality: listingData.locality || "",
          address: listingData.address || "",
          price_info: listingData.price_info || "",
          opening_hours: listingData.opening_hours || "",
          status: user.role === "admin" ? (listingData.status || "approved") : "pending",
          owner_id: user.id,
          is_verified: user.role === "admin" ? Boolean(listingData.is_verified) : false
        };

        const { data, error } = await supabase.from("listings").insert(payload).select().single();
        if (error) throw error;

        // If photos provided and Supabase storage available
        if (listingData.photos && listingData.photos.length > 0) {
          const photoRows = listingData.photos.map((url, idx) => ({
            listing_id: data.id,
            storage_path: url,
            sort_order: idx
          }));
          await supabase.from("listing_photos").insert(photoRows);
        }

        return { data, error: null };
      } catch (err) {
        console.warn("Supabase insert failed, falling back to local:", err.message);
        return { data: null, error: err.message };
      }
    }

    // Local / Demo implementation
    const current = getLocalListings();
    const newListing = {
      id: "lst-" + Date.now().toString(36),
      ...listingData,
      owner_id: user.id,
      status: user.role === "admin" ? (listingData.status || "approved") : "pending",
      is_verified: user.role === "admin" ? Boolean(listingData.is_verified) : false,
      avg_rating: 0,
      review_count: 0,
      photos: listingData.photos || [],
      created_at: new Date().toISOString()
    };
    current.unshift(newListing);
    saveLocalListings(current);
    return { data: newListing, error: null };
  },

  async updateListing(id, updates) {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("listings")
          .update(updates)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.warn("Supabase update error:", err.message);
      }
    }

    const current = getLocalListings();
    const idx = current.findIndex(x => x.id === id);
    if (idx !== -1) {
      current[idx] = { ...current[idx], ...updates, updated_at: new Date().toISOString() };
      saveLocalListings(current);
      return { data: current[idx], error: null };
    }
    return { data: null, error: "Listing not found" };
  },

  async updateListingPhotos(listingId, photosList) {
    const current = getLocalListings();
    const idx = current.findIndex(x => x.id === listingId);
    if (idx !== -1) {
      current[idx].photos = photosList;
      saveLocalListings(current);
      return { data: current[idx], error: null };
    }
    return { data: null, error: "Listing not found" };
  },

  async deleteListing(id) {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { error } = await supabase.from("listings").delete().eq("id", id);
        if (error) throw error;
        return { error: null };
      } catch (err) {
        console.warn("Supabase delete error:", err.message);
      }
    }

    const current = getLocalListings().filter(x => x.id !== id);
    saveLocalListings(current);
    return { error: null };
  }
};

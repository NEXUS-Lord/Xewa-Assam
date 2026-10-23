import { getSupabaseClient, isSupabaseConfigured } from "../core/supabase";
import { INITIAL_DEMO_REPORTS } from "../core/mockData";

const REPORTS_STORAGE_KEY = "xewa_reports_store";

function getLocalReports() {
  const data = localStorage.getItem(REPORTS_STORAGE_KEY);
  if (!data) {
    localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(INITIAL_DEMO_REPORTS));
    return [...INITIAL_DEMO_REPORTS];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    return [...INITIAL_DEMO_REPORTS];
  }
}

function saveLocalReports(reports) {
  localStorage.setItem(REPORTS_STORAGE_KEY, JSON.stringify(reports));
}

export const reportsRepo = {
  async submitReport({ listingId, listingName, userId, userName, reason, details }) {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase.from("reports").insert({
          listing_id: listingId,
          user_id: userId,
          reason,
          details: details || "",
          status: "open"
        }).select().single();
        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.warn("Supabase report insert fallback:", err.message);
      }
    }

    const reports = getLocalReports();
    const newReport = {
      id: "rep-" + Date.now().toString(36),
      listing_id: listingId,
      listing_name: listingName,
      user_id: userId,
      user_name: userName || "Anonymous Contributor",
      reason,
      details: details || "",
      status: "open",
      created_at: new Date().toISOString()
    };
    reports.unshift(newReport);
    saveLocalReports(reports);
    return { data: newReport, error: null };
  },

  async getReports() {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("reports")
          .select("*, listings(name, phone)")
          .order("created_at", { ascending: false });
        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.warn("Supabase reports query fallback:", err.message);
      }
    }

    return { data: getLocalReports(), error: null };
  },

  async resolveReport(reportId) {
    const supabase = getSupabaseClient();
    if (supabase && isSupabaseConfigured()) {
      try {
        const { data, error } = await supabase
          .from("reports")
          .update({ status: "resolved" })
          .eq("id", reportId)
          .select()
          .single();
        if (error) throw error;
        return { data, error: null };
      } catch (err) {
        console.warn("Supabase resolveReport fallback:", err.message);
      }
    }

    const reports = getLocalReports();
    const target = reports.find(r => r.id === reportId);
    if (target) {
      target.status = "resolved";
      saveLocalReports(reports);
      return { data: target, error: null };
    }
    return { data: null, error: "Report not found" };
  }
};

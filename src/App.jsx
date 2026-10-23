import React, { useState, useEffect, useMemo } from "react";
import {
  Search, X, MapPin, Plus, GraduationCap, Home, Utensils,
  Wrench, Truck, MoreHorizontal, Sparkles, SlidersHorizontal,
  PhoneCall, Shield, CheckCircle2, AlertCircle, RefreshCw
} from "lucide-react";
import { kAppName, kAppTagline, CITIES, CATEGORIES } from "./core/constants";
import { listingsRepo } from "./data/listingsRepo";
import { authRepo } from "./data/authRepo";
import Header from "./components/Header";
import ListingCard from "./components/ListingCard";
import ListingDetail from "./components/ListingDetail";
import SuggestModal from "./components/SuggestModal";
import AuthModal from "./components/AuthModal";
import ProfileModal from "./components/ProfileModal";
import AdminDashboard from "./components/AdminDashboard";
import ReportModal from "./components/ReportModal";
import SupabaseConfigModal from "./components/SupabaseConfigModal";
import PendingApprovalModal from "./components/PendingApprovalModal";

const ICON_MAP = {
  GraduationCap: GraduationCap,
  Home: Home,
  Utensils: Utensils,
  Wrench: Wrench,
  Truck: Truck,
  MoreHorizontal: MoreHorizontal
};

export default function App() {
  // City state (persisted)
  const [selectedCity, setSelectedCity] = useState(() => {
    const saved = localStorage.getItem("xewa_selected_city_id");
    if (saved) {
      const found = CITIES.find(c => c.id === Number(saved));
      if (found) return found;
    }
    return CITIES[0]; // Tezpur default
  });

  // Category filter state
  const [selectedCategorySlug, setSelectedCategorySlug] = useState("all");

  // Search state
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");

  // Locality filter & Sort
  const [localityFilter, setLocalityFilter] = useState("");
  const [sortBy, setSortBy] = useState("newest"); // 'newest' | 'rating'

  // Listings data
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(false);

  // Current session user
  const [currentUser, setCurrentUser] = useState(() => authRepo.getCurrentSessionUser());

  // Modals state
  const [activeListingDetail, setActiveListingDetail] = useState(null);
  const [suggestModalOpen, setSuggestModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [reportListing, setReportListing] = useState(null);
  const [supabaseConfigOpen, setSupabaseConfigOpen] = useState(false);
  const [pendingApprovalModalOpen, setPendingApprovalModalOpen] = useState(false);

  // Toast notifications
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = "success") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  // City selection handler
  const handleSelectCity = (city) => {
    setSelectedCity(city);
    localStorage.setItem("xewa_selected_city_id", city.id);
  };

  // Debounce search query (300ms)
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Load listings based on filters
  const loadListings = async () => {
    setLoading(true);
    if (debouncedSearch.trim()) {
      const { data } = await listingsRepo.searchListings({
        cityId: selectedCity.id,
        queryText: debouncedSearch
      });
      if (data) {
        let filtered = data;
        if (selectedCategorySlug !== "all") {
          filtered = filtered.filter(x => x.category_slug === selectedCategorySlug);
        }
        setListings(filtered);
      }
    } else {
      const { data } = await listingsRepo.getApprovedListings({
        cityId: selectedCity.id,
        categorySlug: selectedCategorySlug,
        sort: sortBy,
        locality: localityFilter
      });
      if (data) setListings(data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadListings();
  }, [selectedCity.id, selectedCategorySlug, debouncedSearch, sortBy, localityFilter]);

  // Guard for "Suggest a listing"
  const handleOpenSuggest = () => {
    if (!currentUser) {
      showToast("Please sign in to suggest a new service listing.", "info");
      setAuthModalOpen(true);
      return;
    }
    if (!currentUser.approved && currentUser.role !== "admin") {
      setPendingApprovalModalOpen(true);
      return;
    }
    setSuggestModalOpen(true);
  };

  // Guard for "Report"
  const handleOpenReport = (listing) => {
    if (!currentUser) {
      showToast("Please sign in to report a listing.", "info");
      setAuthModalOpen(true);
      return;
    }
    if (!currentUser.approved && currentUser.role !== "admin") {
      setPendingApprovalModalOpen(true);
      return;
    }
    setReportListing(listing);
  };

  // Share action
  const handleShare = async (listing) => {
    const shareText = `${listing.name} (${listing.locality || listing.city_name})\nPhone: +91 ${listing.phone}\nFound on Xewa: Local Services, Found Fast.`;
    if (navigator.share) {
      try {
        await navigator.share({
          title: listing.name,
          text: shareText,
          url: window.location.href
        });
      } catch (e) {
        // user dismissed
      }
    } else {
      navigator.clipboard.writeText(shareText);
      showToast("Listing details copied to clipboard! 📋", "success");
    }
  };

  const handleLogout = async () => {
    await authRepo.logout();
    setCurrentUser(null);
    setProfileModalOpen(false);
    showToast("You have been signed out.", "info");
  };

  return (
    <div className="app-container">
      {/* Navbar */}
      <Header
        selectedCity={selectedCity}
        onSelectCity={handleSelectCity}
        currentUser={currentUser}
        onOpenSuggest={handleOpenSuggest}
        onOpenAuth={() => setAuthModalOpen(true)}
        onOpenProfile={() => setProfileModalOpen(true)}
        onOpenAdmin={() => setAdminModalOpen(true)}
        onOpenSupabaseConfig={() => setSupabaseConfigOpen(true)}
      />

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-glow" />
        <div className="hero-content">
          <div className="hero-badge">
            <Sparkles size={13} color="#34d399" />
            <span>Assam Local Directory</span>
          </div>

          <h1 className="hero-title">
            Find Trusted Local Services in {selectedCity.name}
          </h1>

          <p className="hero-subtitle">
            Home tutors, student PGs, hygienic mess thali, repair technicians, and local deliveries — verified with direct Call & WhatsApp.
          </p>

          {/* Search Box */}
          <div className="search-wrapper">
            <div className="search-input-group">
              <Search size={18} className="search-icon" />
              <input
                type="text"
                className="search-input"
                placeholder={`Search in ${selectedCity.name} by name, area, or service...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              {searchQuery && (
                <button className="search-clear-btn" onClick={() => setSearchQuery("")}>
                  <X size={16} />
                </button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation Bar */}
      <section className="section-wrapper">
        <div className="section-header">
          <div>
            <h2 className="section-title">
              <span>Explore Categories</span>
            </h2>
            <span className="section-subtitle">
              Browse popular everyday services in {selectedCity.name}
            </span>
          </div>

          {selectedCategorySlug !== "all" && (
            <button
              onClick={() => setSelectedCategorySlug("all")}
              style={{
                fontSize: "12px",
                fontWeight: "700",
                color: "#059669",
                background: "#ecfdf5",
                padding: "6px 12px",
                borderRadius: "999px"
              }}
            >
              Clear Category Filter ✕
            </button>
          )}
        </div>

        <div className="categories-grid">
          {CATEGORIES.map((cat) => {
            const IconComponent = ICON_MAP[cat.icon] || MoreHorizontal;
            const isActive = selectedCategorySlug === cat.slug;

            return (
              <div
                key={cat.slug}
                className={`category-card ${isActive ? "active" : ""}`}
                onClick={() => setSelectedCategorySlug(isActive ? "all" : cat.slug)}
              >
                <div className="cat-icon-box">
                  <IconComponent size={22} />
                </div>
                <h3 className="cat-title">{cat.name}</h3>
                <p className="cat-desc">{cat.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Filter and Sort Toolbar */}
      <section className="section-wrapper" style={{ paddingTop: 0 }}>
        <div className="filter-bar">
          <div className="filter-group">
            <SlidersHorizontal size={16} color="#64748b" />
            <span className="filter-label">Filter:</span>
            <input
              type="text"
              className="locality-filter-input"
              placeholder="Filter by locality..."
              value={localityFilter}
              onChange={(e) => setLocalityFilter(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <span className="filter-label">Sort:</span>
            <select
              className="sort-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="rating">Top Rated</option>
            </select>
          </div>
        </div>

        {/* Listings Section */}
        <div className="section-header">
          <h2 className="section-title">
            <span>
              {selectedCategorySlug === "all"
                ? `All Services in ${selectedCity.name}`
                : `${CATEGORIES.find(c => c.slug === selectedCategorySlug)?.name} in ${selectedCity.name}`}
            </span>
            <span style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>
              ({listings.length})
            </span>
          </h2>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "60px 20px" }}>
            <RefreshCw size={32} color="#059669" className="spin-animation" style={{ margin: "0 auto 12px" }} />
            <div style={{ fontSize: "14px", color: "#64748b", fontWeight: "600" }}>Loading verified services...</div>
          </div>
        ) : listings.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">
              <Search size={24} />
            </div>
            <h3 className="empty-state-title">No listings found</h3>
            <p className="empty-state-desc">
              We couldn't find any services matching your criteria in {selectedCity.name}. Know someone offering services here?
            </p>
            <button className="btn-suggest-nav" onClick={handleOpenSuggest} style={{ margin: "0 auto" }}>
              <Plus size={16} />
              <span>Suggest the first listing</span>
            </button>
          </div>
        ) : (
          <div className="listings-grid">
            {listings.map((item) => (
              <ListingCard
                key={item.id}
                listing={item}
                onOpenDetail={(lst) => setActiveListingDetail(lst)}
                onShare={handleShare}
                onReport={handleOpenReport}
                onShowToast={showToast}
              />
            ))}
          </div>
        )}
      </section>

      {/* Footer */}
      <footer style={{ marginTop: "auto", borderTop: "1px solid #e2e8f0", background: "#ffffff", padding: "32px 20px", textAlign: "center" }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", marginBottom: "8px" }}>
          <img src="/logo.svg" alt="Xewa" style={{ width: "24px", height: "24px", borderRadius: "6px" }} />
          <span style={{ fontSize: "18px", fontWeight: "800", color: "#064e3b" }}>{kAppName}</span>
          <span style={{ fontSize: "13px", color: "#64748b" }}>— {kAppTagline}</span>
        </div>
        <p style={{ fontSize: "12px", color: "#64748b", maxWidth: "480px", margin: "0 auto 12px" }}>
          A local service directory dedicated to small towns of Assam (starting with Tezpur & Nagaon).
        </p>
        <p style={{ fontSize: "11px", color: "#94a3b8" }}>
          Semester Project for NEXUS | B.Voc IT, Gauhati University
        </p>
      </footer>

      {/* Modals */}
      {activeListingDetail && (
        <ListingDetail
          listing={activeListingDetail}
          onClose={() => setActiveListingDetail(null)}
          onShare={handleShare}
          onReport={handleOpenReport}
          onShowToast={showToast}
        />
      )}

      {suggestModalOpen && (
        <SuggestModal
          currentUser={currentUser}
          defaultCityId={selectedCity.id}
          onClose={() => setSuggestModalOpen(false)}
          onSuccess={loadListings}
          onShowToast={showToast}
        />
      )}

      {authModalOpen && (
        <AuthModal
          onClose={() => setAuthModalOpen(false)}
          onLoginSuccess={(user) => {
            setCurrentUser(user);
            if (!user.approved && user.role !== "admin") {
              setPendingApprovalModalOpen(true);
            }
          }}
          onShowToast={showToast}
        />
      )}

      {profileModalOpen && (
        <ProfileModal
          currentUser={currentUser}
          onClose={() => setProfileModalOpen(false)}
          onLogout={handleLogout}
          onOpenAdmin={() => setAdminModalOpen(true)}
          onOpenDetail={(lst) => setActiveListingDetail(lst)}
          onShowToast={showToast}
        />
      )}

      {adminModalOpen && (
        <AdminDashboard
          currentUser={currentUser}
          onClose={() => setAdminModalOpen(false)}
          onOpenListingDetail={(lst) => setActiveListingDetail(lst)}
          onShowToast={showToast}
        />
      )}

      {reportListing && (
        <ReportModal
          listing={reportListing}
          currentUser={currentUser}
          onClose={() => setReportListing(null)}
          onShowToast={showToast}
        />
      )}

      {supabaseConfigOpen && (
        <SupabaseConfigModal
          onClose={() => setSupabaseConfigOpen(false)}
          onConfigChanged={loadListings}
          onShowToast={showToast}
        />
      )}

      {pendingApprovalModalOpen && currentUser && (
        <PendingApprovalModal
          currentUser={currentUser}
          onClose={() => setPendingApprovalModalOpen(false)}
          onLogout={handleLogout}
          onApproved={(updated) => setCurrentUser(updated)}
          onShowToast={showToast}
        />
      )}

      {/* Toast Notifications */}
      <div className="toast-container">
        {toasts.map((t) => (
          <div key={t.id} className={`toast ${t.type}`}>
            {t.type === "success" && <CheckCircle2 size={16} color="#10b981" />}
            {t.type === "error" && <AlertCircle size={16} color="#ef4444" />}
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

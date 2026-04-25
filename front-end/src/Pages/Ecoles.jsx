import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getSchools, getFilters } from "../Services/api";
import Filters from "../Components/Filters";
import SchoolCard from "../Components/SchoolCard";
import "../Styles/ecoles.css";

// Helper function to remove accents for accent-insensitive search
const normalizeString = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

// Extract price from string (ex: "15000 MAD/an" -> 15000)
const extractPrice = (priceStr) => {
  if (!priceStr) return 0;
  const match = priceStr.match(/\d+/g);
  return match ? parseInt(match.join("")) : 0;
};

// Memoized SchoolCard component for better performance
const MemoizedSchoolCard = React.memo(SchoolCard);

// Pagination component
const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxVisiblePages = 5;
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);
  
  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button
        className="pagination-btn"
        disabled={currentPage === 1}
        onClick={() => onPageChange(currentPage - 1)}
        aria-label="Page précédente"
      >
        ◀
      </button>
      
      {startPage > 1 && (
        <>
          <button className="pagination-btn" onClick={() => onPageChange(1)}>1</button>
          {startPage > 2 && <span className="pagination-dots">...</span>}
        </>
      )}
      
      {pages.map(page => (
        <button
          key={page}
          className={`pagination-btn ${currentPage === page ? 'active' : ''}`}
          onClick={() => onPageChange(page)}
        >
          {page}
        </button>
      ))}
      
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && <span className="pagination-dots">...</span>}
          <button className="pagination-btn" onClick={() => onPageChange(totalPages)}>
            {totalPages}
          </button>
        </>
      )}
      
      <button
        className="pagination-btn"
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(currentPage + 1)}
        aria-label="Page suivante"
      >
        ▶
      </button>
    </div>
  );
};

function Ecoles() {
  const [schools, setSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filterOptions, setFilterOptions] = useState({
    villes: [],
    types: [],
    specialites: []
  });
  const [viewMode, setViewMode] = useState("grid");

  // LOCAL filters - for UI changes only (tous inactifs par défaut)
  const [localFilters, setLocalFilters] = useState({
    ville: "",
    type: "",
    specialite: "",
    minPrice: null,
    maxPrice: null,
  });

  // APPLIED filters - actual filters that affect results
  const [appliedFilters, setAppliedFilters] = useState({
    ville: "",
    type: "",
    specialite: "",
    minPrice: null,
    maxPrice: null,
  });

  const [sortBy, setSortBy] = useState("note");
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  // Load schools and filter options on mount
  useEffect(() => {
    loadSchools();
    loadFilterOptions();
  }, []);

  // Reset to page 1 when filters or sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [appliedFilters, sortBy]);

  const loadFilterOptions = useCallback(async () => {
    try {
      const response = await getFilters();
      // Gestion des différentes structures de réponse
      let filterData = response.data;
      if (response.data && response.data.data) {
        filterData = response.data.data;
      }
      setFilterOptions({
        villes: filterData.villes || [],
        types: filterData.types || [],
        specialites: filterData.specialites || []
      });
    } catch (error) {
      console.error("Error loading filter options:", error);
    }
  }, []);

  const loadSchools = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getSchools();
      
      // Gestion des différentes structures de réponse
      let allSchools = [];
      if (response.data && response.data.data) {
        // Structure avec { success: true, data: [...] }
        allSchools = response.data.data;
      } else if (Array.isArray(response.data)) {
        // Structure directe [...]
        allSchools = response.data;
      } else {
        allSchools = [];
      }
      
      setSchools(allSchools);

      // Calculate price range from schools
      const prices = allSchools
        .map((school) => extractPrice(school.cout))
        .filter((price) => !isNaN(price) && price > 0);

      const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
      const maxPrice = prices.length > 0 ? Math.max(...prices) : 20000;
      setPriceRange({ min: minPrice, max: maxPrice });

      // Initial filters: tous vides ou null (pas de filtre actif par défaut)
      const initialFilters = {
        ville: "",
        type: "",
        specialite: "",
        minPrice: null,
        maxPrice: null,
      };

      setLocalFilters(initialFilters);
      setAppliedFilters(initialFilters);
    } catch (error) {
      console.error("Error loading schools:", error);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, []);

  // Filtered schools calculation
  const filteredSchools = useMemo(() => {
    let results = [...schools];

    // Apply ville filter
    if (appliedFilters.ville && appliedFilters.ville !== "") {
      const normalizedVille = normalizeString(appliedFilters.ville);
      results = results.filter((school) => {
        const schoolVille = normalizeString(school.ville);
        return schoolVille === normalizedVille;
      });
    }

    // Apply type filter
    if (appliedFilters.type && appliedFilters.type !== "") {
      const normalizedType = normalizeString(appliedFilters.type);
      results = results.filter((school) => {
        const schoolType = normalizeString(school.type);
        return schoolType === normalizedType;
      });
    }

    // Apply specialite filter (check in formations)
    if (appliedFilters.specialite && appliedFilters.specialite !== "") {
      const normalizedSpecialite = normalizeString(appliedFilters.specialite);
      results = results.filter((school) => {
        if (school.formations && Array.isArray(school.formations)) {
          return school.formations.some((formation) => {
            const formationName = normalizeString(formation.nom);
            return formationName.includes(normalizedSpecialite);
          });
        }
        return false;
      });
    }

    // Apply price filter
    if (appliedFilters.minPrice !== null && appliedFilters.minPrice !== "" &&
        appliedFilters.maxPrice !== null && appliedFilters.maxPrice !== "") {
      results = results.filter((school) => {
        const price = extractPrice(school.cout);
        return price >= appliedFilters.minPrice && price <= appliedFilters.maxPrice;
      });
    }

    // Apply sorting
    results.sort((a, b) => {
      switch (sortBy) {
        case "note":
          return (b.note || 0) - (a.note || 0);
        case "nom":
          return (a.nom || "").localeCompare(b.nom || "", "fr", {
            sensitivity: "base",
          });
        case "price":
          return extractPrice(a.cout) - extractPrice(b.cout);
        default:
          return 0;
      }
    });

    return results;
  }, [schools, appliedFilters, sortBy]);

  // Paginated schools
  const paginatedSchools = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredSchools.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredSchools, currentPage, itemsPerPage]);

  const totalPages = Math.ceil(filteredSchools.length / itemsPerPage);
  
  const schoolStats = useMemo(() => ({
    total: schools.length,
    filtered: filteredSchools.length,
    hasResults: filteredSchools.length > 0,
    currentPage,
    totalPages,
    startItem: filteredSchools.length > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0,
    endItem: Math.min(currentPage * itemsPerPage, filteredSchools.length),
  }), [schools.length, filteredSchools.length, currentPage, totalPages, itemsPerPage]);

  const handleFilterChange = useCallback((newFilters) => {
    setLocalFilters(newFilters);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(localFilters);
  }, [localFilters]);

  const resetFilters = useCallback(() => {
    const resetFiltersState = {
      ville: "",
      type: "",
      specialite: "",
      minPrice: null,
      maxPrice: null,
    };
    setLocalFilters(resetFiltersState);
    setAppliedFilters(resetFiltersState);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((sortValue) => {
    setSortBy(sortValue);
  }, []);

  const handlePageChange = useCallback((page) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  if (loading) {
    return (
      <div className="ecoles-page loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement des écoles...</p>
      </div>
    );
  }

  return (
    <div className="ecoles-page">
      {/* Hero Section */}
      <div className="ecoles-hero">
        <div className="ecoles-hero-content">
          <h1 className="ecoles-hero-title">
            Trouvez votre <span className="highlight">école idéale</span>
          </h1>
        </div>
      </div>

      {/* Filters Section with Stats integrated */}
      <div className="filters-wrapper">
        <div className="filters-stats-container">
          <Filters
            activeFilters={localFilters}
            onFilterChange={handleFilterChange}
            onApply={handleApplyFilters}
            onReset={resetFilters}
            sortBy={sortBy}
            onSortChange={handleSortChange}
            filteredCount={schoolStats.filtered}
            totalCount={schoolStats.total}
            filterOptions={filterOptions}
          />
        </div>

        {/* Schools Grid/List */}
        <main className="schools-main">
          {schoolStats.hasResults ? (
            <>
              <div className={`schools-${viewMode}`}>
                {paginatedSchools.map((school, index) => (
                  <div 
                    key={school.id} 
                    className="school-item"
                    style={{ animationDelay: `${index * 0.05}s` }}
                  >
                    <MemoizedSchoolCard school={school} />
                  </div>
                ))}
              </div>
              
              {/* Pagination */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={handlePageChange}
              />
            </>
          ) : (
            <div className="no-results">
              <div className="no-results-icon">🔍</div>
              <h3>Aucune école ne correspond à vos critères</h3>
              <p>
                Essayez de modifier vos filtres ou votre recherche pour voir
                plus de résultats.
              </p>
              <button onClick={resetFilters} className="reset-filters-btn">
                Réinitialiser tous les filtres
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default React.memo(Ecoles);
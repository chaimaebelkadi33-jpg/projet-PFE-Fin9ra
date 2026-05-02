import React, { useState, useEffect, useMemo, useCallback } from "react";
import { getSchools, getFilters } from "../Services/api";
import Filters from "../Components/Filters";
import SchoolCard from "../Components/SchoolCard";
import { useToast } from "../Components/Toast";
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
const extractPrice = (priceVal) => {
  if (!priceVal && priceVal !== 0) return 0;
  if (typeof priceVal === 'number') return priceVal;
  if (typeof priceVal === 'string') {
    const match = priceVal.match(/\d+/g);
    return match ? parseInt(match.join("")) : 0;
  }
  return 0;
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
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [viewMode, setViewMode] = useState("grid");
  const toast = useToast();

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

  // Load filter options on mount
  useEffect(() => {
    loadFilterOptions();
  }, []);

  // Load schools when page, filters or sort change
  useEffect(() => {
    loadSchools(currentPage, appliedFilters, sortBy);
  }, [currentPage, appliedFilters, sortBy]);

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
      toast.error("Erreur lors du chargement des filtres");
    }
  }, []);

  const loadSchools = useCallback(async (page = 1, filters = appliedFilters, sort = sortBy) => {
    try {
      setLoading(true);
      const params = {
        page,
        ville: filters.ville,
        type: filters.type,
        specialite: filters.specialite,
        sortBy: sort
      };
      
      const response = await getSchools(params);
      
      if (response.data) {
        // The data is either in response.data.data (paginated) or response.data (simple array)
        let schoolList = [];
        let totalP = 1;
        let totalI = 0;

        const result = response.data.data || response.data;
        
        if (result.data && Array.isArray(result.data)) {
          schoolList = result.data;
          totalP = result.last_page || 1;
          totalI = result.total || 0;
        } else if (Array.isArray(result)) {
          schoolList = result;
          totalP = 1;
          totalI = result.length;
        } else if (Array.isArray(response.data)) {
          schoolList = response.data;
          totalP = 1;
          totalI = response.data.length;
        }

        setSchools(schoolList);
        setTotalPages(totalP);
        setTotalItems(totalI);

        if (schoolList.length > 0) {
          const prices = schoolList
            .map((school) => extractPrice(school.cout))
            .filter((price) => !isNaN(price) && price > 0);

          if (prices.length > 0) {
            const minPrice = Math.min(...prices);
            const maxPrice = Math.max(...prices);
            setPriceRange(prev => ({ 
              min: Math.min(prev.min, minPrice), 
              max: Math.max(prev.max, maxPrice) 
            }));
          }
        }
      }
    } catch (error) {
      console.error("Error loading schools:", error);
      const errorMsg = error.response?.data?.message || error.message || "Erreur lors du chargement des écoles";
      toast.error(errorMsg);
      setSchools([]);
    } finally {
      setLoading(false);
    }
  }, [appliedFilters, sortBy]);

  const schoolStats = useMemo(() => ({
    total: totalItems,
    filtered: totalItems,
    hasResults: schools.length > 0,
    currentPage,
    totalPages,
    startItem: totalItems > 0 ? (currentPage - 1) * itemsPerPage + 1 : 0,
    endItem: Math.min(currentPage * itemsPerPage, totalItems),
  }), [schools.length, totalItems, currentPage, totalPages, itemsPerPage]);

  const handleFilterChange = useCallback((newFilters) => {
    setLocalFilters(newFilters);
  }, []);

  const handleApplyFilters = useCallback(() => {
    setAppliedFilters(localFilters);
    setCurrentPage(1); // Reset to first page on new filter
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
    // loadSchools will be triggered by useEffect since appliedFilters/currentPage changed
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
                {schools.map((school, index) => (
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
import React, { useState, useEffect, useCallback, useRef } from "react";
import { Link } from "react-router-dom";
import SearchBar from "../Components/SearchBar";
import SchoolCard from "../Components/SchoolCard";
import { getSchools, getFilters } from "../Services/api";
import "../Styles/accueil.css";

// Helper function to remove accents for accent-insensitive search
const removeAccents = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

// Memoized SchoolCard component for better performance
const MemoizedSchoolCard = React.memo(SchoolCard);

function Accueil() {
  const [featuredSchools, setFeaturedSchools] = useState([]);
  const [allSchools, setAllSchools] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [filters, setFilters] = useState({});
  const [searchQuery, setSearchQuery] = useState("");
  const [filterOptions, setFilterOptions] = useState({
    villes: [],
    types: [],
    specialites: []
  });

  // Carousel state for infinite scroll
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const carouselRef = useRef(null);
  const animationRef = useRef(null);
  const scrollSpeed = 1.5;

  useEffect(() => {
    loadSchools();
    loadFilterOptions();
  }, []);

  // Auto-play carousel with infinite continuous scroll
  useEffect(() => {
    if (isAutoPlaying && featuredSchools.length > 0 && carouselRef.current) {
      const animate = () => {
        if (carouselRef.current) {
          const scrollWidth = carouselRef.current.scrollWidth;
          let newPosition = carouselRef.current.scrollLeft + scrollSpeed;
          
          if (newPosition >= scrollWidth / 1.5) {
            const resetPosition = newPosition - (scrollWidth / 3);
            carouselRef.current.scrollLeft = resetPosition;
            newPosition = resetPosition + scrollSpeed;
          }
          
          carouselRef.current.scrollLeft = newPosition;
        }
        animationRef.current = requestAnimationFrame(animate);
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [isAutoPlaying, featuredSchools.length]);

  // Stop auto-play on hover
  const handleMouseEnter = () => {
    setIsAutoPlaying(false);
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleMouseLeave = () => {
    setIsAutoPlaying(true);
  };

  const scroll = (direction) => {
    if (carouselRef.current) {
      const scrollAmount = 300;
      const newPosition = carouselRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
      carouselRef.current.scrollTo({
        left: newPosition,
        behavior: "smooth"
      });
    }
  };

  const loadFilterOptions = async () => {
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
  };

  const loadSchools = async () => {
    try {
      setLoading(true);
      // Fetch more schools for the home page (e.g., 20) to have a better selection for carousel/featured
      const response = await getSchools({ per_page: 20 });
      
      let schools = [];
      if (response.data && response.data.success) {
        // Handling Laravel pagination structure
        const paginatedData = response.data.data;
        schools = paginatedData.data || [];
      } else if (response.data && Array.isArray(response.data)) {
        schools = response.data;
      }
      
      setAllSchools(schools);

      // Sort by rating for featured schools
      const topRated = [...schools]
        .sort((a, b) => (b.note || 0) - (a.note || 0))
        .slice(0, 8);
      setFeaturedSchools(topRated);
    } catch (error) {
      console.error("Error loading schools:", error);
      setAllSchools([]);
      setFeaturedSchools([]);
    } finally {
      setLoading(false);
    }
  };

  // Dupliquer les écoles pour un défilement infini (3x)
  const infiniteSchools = [...featuredSchools, ...featuredSchools, ...featuredSchools];

  // Local search function
  const performLocalSearch = useCallback(
    (searchTerm, currentFilters) => {
      if (
        !searchTerm.trim() &&
        !currentFilters.ville &&
        !currentFilters.specialite &&
        !currentFilters.type
      ) {
        setIsSearching(false);
        return [];
      }

      let results = [...allSchools];

      if (searchTerm.trim()) {
        const normalizedQuery = removeAccents(searchTerm.toLowerCase());
        results = results.filter((school) => {
          const schoolName = removeAccents(school.nom?.toLowerCase() || "");
          const schoolCity = removeAccents(school.ville?.toLowerCase() || "");
          const schoolType = removeAccents(school.type?.toLowerCase() || "");
          return (
            schoolName.includes(normalizedQuery) ||
            schoolCity.includes(normalizedQuery) ||
            schoolType.includes(normalizedQuery)
          );
        });
      }

      if (currentFilters.ville) {
        const normalizedVille = removeAccents(currentFilters.ville.toLowerCase());
        results = results.filter((school) => {
          const schoolVille = removeAccents(school.ville?.toLowerCase() || "");
          return schoolVille === normalizedVille;
        });
      }

      if (currentFilters.type) {
        const normalizedType = removeAccents(currentFilters.type.toLowerCase());
        results = results.filter((school) => {
          const schoolType = removeAccents(school.type?.toLowerCase() || "");
          return schoolType === normalizedType;
        });
      }

      if (currentFilters.specialite) {
        const normalizedSpecialite = removeAccents(currentFilters.specialite.toLowerCase());
        results = results.filter((school) => {
          if (!school.formations || !Array.isArray(school.formations))
            return false;
          return school.formations.some((formation) => {
            const formationName = removeAccents(formation.nom?.toLowerCase() || "");
            return formationName.includes(normalizedSpecialite);
          });
        });
      }

      return results.slice(0, 8);
    },
    [allSchools]
  );

  const handleSearch = useCallback(
    (normalizedQuery, originalQuery) => {
      setSearchQuery(normalizedQuery);
      if (!normalizedQuery.trim() && !filters.ville && !filters.specialite && !filters.type) {
        setIsSearching(false);
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const results = performLocalSearch(normalizedQuery, filters);
      setSearchResults(results);
    },
    [filters, performLocalSearch]
  );

  const handleFilter = useCallback(
    (newFilters) => {
      setFilters(newFilters);
      if (!searchQuery.trim() && !newFilters.ville && !newFilters.specialite && !newFilters.type) {
        setIsSearching(false);
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      const results = performLocalSearch(searchQuery, newFilters);
      setSearchResults(results);
    },
    [searchQuery, performLocalSearch]
  );

  const clearFilter = useCallback(
    (filterType) => {
      const updatedFilters = { ...filters, [filterType]: "" };
      setFilters(updatedFilters);
      if (!searchQuery.trim() && !updatedFilters.ville && !updatedFilters.specialite && !updatedFilters.type) {
        setIsSearching(false);
        setSearchResults([]);
        return;
      }
      const results = performLocalSearch(searchQuery, updatedFilters);
      setSearchResults(results);
    },
    [filters, searchQuery, performLocalSearch]
  );

  const clearAllFilters = useCallback(() => {
    setFilters({});
    setSearchQuery("");
    setIsSearching(false);
    setSearchResults([]);
  }, []);

  const getDisplayedResults = () => {
    if (isSearching && searchResults.length > 0) {
      return searchResults;
    }
    return [];
  };

  if (loading) {
    return (
      <div className="accueil-page">
        <div className="accueil-loading">
          <div className="loading-spinner"></div>
          <p>Chargement des écoles...</p>
        </div>
      </div>
    );
  }

  const displayedResults = getDisplayedResults();
  const hasActiveFilters = filters.ville || filters.specialite || filters.type;
  const hasActiveSearch = isSearching && (searchQuery.trim() || hasActiveFilters);

  return (
    <div className="accueil-page">
      <section className="accueil-hero">
        <div className="accueil-search-container">
          <SearchBar onSearch={handleSearch} onFilter={handleFilter} />
        </div>
      </section>

      {/* Carousel horizontal continu - uniquement si pas de recherche active */}
      {!hasActiveSearch && featuredSchools.length > 0 && (
        <section className="accueil-carousel-section">
          <div className="carousel-header">
            <h2 className="carousel-title">Écoles recommandées</h2>
          </div>

          <div 
            className="carousel-wrapper"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
          >
            <button className="carousel-arrow prev" onClick={() => scroll("left")}>
              ◀
            </button>

            <div className="carousel-container" ref={carouselRef}>
              <div className="carousel-track-horizontal">
                {infiniteSchools.map((school, index) => (
                  <div key={`${school.id}-${index}`} className="carousel-card">
                    <MemoizedSchoolCard school={school} />
                  </div>
                ))}
              </div>
            </div>

            <button className="carousel-arrow next" onClick={() => scroll("right")}>
              ▶
            </button>
          </div>
        </section>
      )}

      <section className="accueil-results">
        {hasActiveSearch ? (
          <>
            <h2 className="accueil-title">
              {displayedResults.length > 0
                ? `Résultats (${displayedResults.length})`
                : "Résultats de recherche"}
            </h2>

            {displayedResults.length > 0 ? (
              <div className="accueil-schools-grid">
                {displayedResults.map((school) => (
                  <MemoizedSchoolCard key={school.id} school={school} />
                ))}
              </div>
            ) : (
              <div className="accueil-no-results">
                <p>
                  Aucune école trouvée. Essayez avec d'autres mots-clés ou
                  filtres.
                </p>
                <button onClick={clearAllFilters} className="accueil-back-btn">
                  Retour aux écoles recommandées
                </button>
              </div>
            )}

            {hasActiveFilters && (
              <div className="accueil-active-filters">
                <p>Filtres actifs:</p>
                <div className="accueil-filter-tags">
                  {filters.ville && (
                    <span className="accueil-filter-tag">
                      Ville: {filters.ville}
                      <button onClick={() => clearFilter("ville")} className="accueil-remove-filter">✕</button>
                    </span>
                  )}
                  {filters.specialite && (
                    <span className="accueil-filter-tag">
                      Spécialité: {filters.specialite}
                      <button onClick={() => clearFilter("specialite")} className="accueil-remove-filter">✕</button>
                    </span>
                  )}
                  {filters.type && (
                    <span className="accueil-filter-tag">
                      Type: {filters.type}
                      <button onClick={() => clearFilter("type")} className="accueil-remove-filter">✕</button>
                    </span>
                  )}
                  {(filters.ville || filters.specialite || filters.type) && (
                    <button onClick={clearAllFilters} className="accueil-clear-all-filters">
                      Effacer tous
                    </button>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="accueil-view-all-container">
            <Link to="/ecoles" className="accueil-view-all-btn">
              Voir toutes les écoles →
            </Link>
          </div>
        )}
      </section>
    </div>
  );
}

export default React.memo(Accueil);
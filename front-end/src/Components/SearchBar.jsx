import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import { getSchools, searchSchools, getFilters } from "../Services/api";
import {
  HiOutlineBuildingLibrary,
  HiOutlineMapPin,
  HiOutlineMagnifyingGlass,
  HiOutlineTag,
  HiOutlineXMark,
} from "react-icons/hi2";
import "../Styles/searchBar.css";

// Helper function to remove accents for accent-insensitive search
const removeAccents = (str) => {
  if (!str) return "";
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
};

const extractPayload = (responseData) => {
  if (Array.isArray(responseData)) {
    return responseData;
  }

  if (responseData && Array.isArray(responseData.data)) {
    return responseData.data;
  }

  if (responseData && responseData.data && Array.isArray(responseData.data.data)) {
    return responseData.data.data;
  }

  return [];
};

const extractFilterOptions = (responseData) => {
  if (responseData?.data) {
    return responseData.data;
  }

  return responseData || {};
};

const getSuggestionIcon = (matchType) => {
  switch (matchType) {
    case "city":
      return HiOutlineMapPin;
    case "type":
      return HiOutlineTag;
    default:
      return HiOutlineBuildingLibrary;
  }
};

// Debounce function to limit the rate of function execution
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

const SearchBar = ({ onSearch, onFilter }) => {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeFilters, setActiveFilters] = useState({
    ville: "",
    specialite: "",
    type: "",
  });

  const [filterOptions, setFilterOptions] = useState({
    villes: [],
    specialites: [],
    types: [],
  });

  const [loading, setLoading] = useState(true);
  const [loadingFilters, setLoadingFilters] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const searchbarRef = useRef(null);
  const suggestionsRef = useRef(null);

  // Store all schools for suggestions
  const [allSchools, setAllSchools] = useState([]);

  // Fetch filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoadingFilters(true);
        const response = await getFilters();
        const filterData = extractFilterOptions(response.data);
        setFilterOptions({
          villes: filterData.villes || [],
          specialites: filterData.specialites || [],
          types: filterData.types || [],
        });
      } catch (error) {
        console.error("Error loading filter options:", error);
      } finally {
        setLoadingFilters(false);
      }
    };

    loadFilterOptions();
  }, []);

  // Load schools data for suggestions
  useEffect(() => {
    const loadSchoolsForSuggestions = async () => {
      try {
        const response = await getSchools({ per_page: 1000 });
        setAllSchools(extractPayload(response.data));
        setLoading(false);
      } catch (error) {
        console.error("Error loading schools for suggestions:", error);
        setAllSchools([]);
        setLoading(false);
      }
    };

    loadSchoolsForSuggestions();
  }, []);

  // Generate suggestions based on query
  const generateSuggestions = useCallback(
    (searchQuery) => {
      if (!searchQuery.trim() || !allSchools.length) {
        setSuggestions([]);
        return;
      }

      const queryLower = removeAccents(searchQuery.toLowerCase());

      const matchedSuggestions = allSchools
        .filter((school) => {
          if (!school.nom && !school.ville && !school.type && !school.short_name) return false;

          const schoolName = removeAccents((school.nom || "").toLowerCase());
          const schoolShortName = removeAccents((school.short_name || "").toLowerCase());
          const schoolCity = removeAccents((school.ville || "").toLowerCase());
          const schoolType = removeAccents((school.type || "").toLowerCase());

          return (
            schoolName.includes(queryLower) ||
            schoolShortName.includes(queryLower) ||
            schoolCity.includes(queryLower) ||
            schoolType.includes(queryLower)
          );
        })
        .slice(0, 5)
        .map((school) => {
          const isNameMatch = removeAccents((school.nom || "").toLowerCase()).includes(queryLower);
          const isShortNameMatch = removeAccents((school.short_name || "").toLowerCase()).includes(queryLower);
          const isCityMatch = removeAccents((school.ville || "").toLowerCase()).includes(queryLower);
          
          return {
            id: school.id,
            name: isShortNameMatch && !isNameMatch 
              ? `${school.short_name} - ${school.nom}` 
              : school.nom,
            shortName: school.short_name,
            type: school.type,
            city: school.ville,
            realName: school.nom, // Store the actual name for searching
            matchType: isNameMatch || isShortNameMatch
              ? "name"
              : isCityMatch
              ? "city"
              : "type",
          };
        });

      setSuggestions(matchedSuggestions);
    },
    [allSchools]
  );

  // Debounced search handler
  const debouncedSearch = useMemo(
    () =>
      debounce(async (searchQuery, currentFilters) => {
        if (typeof onSearch === "function") {
          const normalizedQuery = removeAccents(searchQuery);

          // API search request
          try {
            const searchParams = {
              search: normalizedQuery || undefined,
              ville: currentFilters.ville || undefined,
              type: currentFilters.type || undefined,
              specialite: currentFilters.specialite || undefined,
            };

            const response = await searchSchools(searchParams);
            onSearch(normalizedQuery, searchQuery, response.data);
          } catch (error) {
            console.error("Search error:", error);
            onSearch(normalizedQuery, searchQuery, []);
          }
        }
      }, 300),
    [onSearch]
  );

  const handleSearch = (e) => {
    const value = e.target.value;
    setQuery(value);
    generateSuggestions(value);
    debouncedSearch(value, activeFilters);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setShowSuggestions(false);
    debouncedSearch(query, activeFilters);
  };

  const handleSuggestionClick = (suggestion) => {
    // Use the actual school name for the search to ensure backend matches correctly
    const searchName = suggestion.realName || suggestion.name;
    setQuery(searchName);
    setShowSuggestions(false);
    debouncedSearch(searchName, activeFilters);
  };

  const toggleDropdown = (filterType) => {
    if (window.innerWidth <= 768) {
      if (activeDropdown === filterType) {
        document.body.classList.remove("sb-dropdown-open");
        setActiveDropdown(null);
      } else {
        document.body.classList.add("sb-dropdown-open");
        setActiveDropdown(filterType);
      }
    } else {
      setActiveDropdown(activeDropdown === filterType ? null : filterType);
    }
  };

  const selectFilter = (filterType, value) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: activeFilters[filterType] === value ? "" : value,
    };

    setActiveFilters(newFilters);
    setActiveDropdown(null);

    if (typeof onFilter === "function") {
      onFilter(newFilters);
    }

    // Re-run the search with the new filters
    debouncedSearch(query, newFilters);
  };

  const clearFilter = (filterType) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: "",
    };

    setActiveFilters(newFilters);

    if (typeof onFilter === "function") {
      onFilter(newFilters);
    }

    debouncedSearch(query, newFilters);
  };

  const clearAllFilters = () => {
    const newFilters = { ville: "", specialite: "", type: "" };
    setActiveFilters(newFilters);
    setActiveDropdown(null);

    if (typeof onFilter === "function") {
      onFilter(newFilters);
    }

    debouncedSearch(query, newFilters);
  };

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        window.innerWidth <= 768 &&
        activeDropdown &&
        !e.target.closest(".sb-filter-tag-container") &&
        !e.target.closest(".sb-filter-dropdown")
      ) {
        document.body.classList.remove("sb-dropdown-open");
        setActiveDropdown(null);
      }

      if (
        showSuggestions &&
        suggestionsRef.current &&
        !suggestionsRef.current.contains(e.target) &&
        searchbarRef.current &&
        !searchbarRef.current.contains(e.target)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [activeDropdown, showSuggestions]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      document.body.classList.remove("sb-dropdown-open");
      debouncedSearch.cancel?.();
    };
  }, [debouncedSearch]);

  const hasActiveFilters =
    activeFilters.ville || activeFilters.specialite || activeFilters.type;

  return (
    <div className="searchbar-container" ref={searchbarRef}>
      <h2 className="searchbar-title">
        ابحث عن مدرستك
        <br />
        <span>Trouvez votre ecole</span>
      </h2>

      <form className="searchbar-box" onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="...ابحث عن مدرستك / Rechercher une ecole..."
          value={query}
          onChange={handleSearch}
          onFocus={() => setShowSuggestions(true)}
          aria-label="Rechercher une ecole"
        />
        <button
          type="submit"
          className="search-btn"
          aria-label="Lancer la recherche"
        >
          <HiOutlineMagnifyingGlass aria-hidden="true" />
        </button>

        {/* Search Suggestions */}
        {showSuggestions && suggestions.length > 0 && (
          <div className="search-suggestions" ref={suggestionsRef}>
            <div className="suggestions-list">
              {suggestions.map((suggestion, index) => (
                (() => {
                  const SuggestionIcon = getSuggestionIcon(suggestion.matchType);

                  return (
                    <div
                      key={`${suggestion.id}-${index}`}
                      className="suggestion-item"
                      onClick={() => handleSuggestionClick(suggestion)}
                      role="button"
                      tabIndex={0}
                      onKeyPress={(e) =>
                        e.key === "Enter" && handleSuggestionClick(suggestion)
                      }
                    >
                      <div className="suggestion-icon">
                        <SuggestionIcon aria-hidden="true" />
                      </div>
                      <div className="suggestion-content">
                        <div className="suggestion-name">{suggestion.name}</div>
                        <div className="suggestion-details">
                          <span className="suggestion-type">
                            <HiOutlineTag aria-hidden="true" />
                            {suggestion.type}
                          </span>
                          <span className="suggestion-city">
                            <HiOutlineMapPin aria-hidden="true" />
                            {suggestion.city}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })()
              ))}
            </div>
          </div>
        )}
      </form>

      <div className="searchbar-filters">
        {/* Ville Filter Tag */}
        <div className="sb-filter-tag-container">
          <div
            className={`sb-filter-tag ${activeFilters.ville ? "active" : ""}`}
            onClick={() => toggleDropdown("ville")}
            role="button"
            tabIndex={0}
          >
            {activeFilters.ville || "Ville"}
            {activeFilters.ville && (
              <HiOutlineXMark
                className="sb-remove-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilter("ville");
                }}
                aria-label="Effacer le filtre ville"
              />
            )}
          </div>

          {activeDropdown === "ville" && (
            <div className="sb-filter-dropdown active">
              <div className="sb-dropdown-options">
                {filterOptions.villes.map((ville, index) => (
                  <div
                    key={index}
                    className={`sb-dropdown-option ${
                      activeFilters.ville === ville ? "selected" : ""
                    }`}
                    onClick={() => selectFilter("ville", ville)}
                    role="button"
                    tabIndex={0}
                  >
                    {ville}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Specialite Filter Tag */}
        <div className="sb-filter-tag-container">
          <div
            className={`sb-filter-tag ${
              activeFilters.specialite ? "active" : ""
            }`}
            onClick={() => toggleDropdown("specialite")}
            role="button"
            tabIndex={0}
          >
            {activeFilters.specialite || "Specialite"}
            {activeFilters.specialite && (
              <HiOutlineXMark
                className="sb-remove-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilter("specialite");
                }}
                aria-label="Effacer le filtre specialite"
              />
            )}
          </div>

          {activeDropdown === "specialite" && (
            <div className="sb-filter-dropdown active">
              <div className="sb-dropdown-options">
                {filterOptions.specialites.map((specialite, index) => (
                  <div
                    key={index}
                    className={`sb-dropdown-option ${
                      activeFilters.specialite === specialite ? "selected" : ""
                    }`}
                    onClick={() => selectFilter("specialite", specialite)}
                    role="button"
                    tabIndex={0}
                  >
                    {specialite}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Type Filter Tag */}
        <div className="sb-filter-tag-container">
          <div
            className={`sb-filter-tag ${activeFilters.type ? "active" : ""}`}
            onClick={() => toggleDropdown("type")}
            role="button"
            tabIndex={0}
          >
            {activeFilters.type || "Type"}
            {activeFilters.type && (
              <HiOutlineXMark
                className="sb-remove-icon"
                onClick={(e) => {
                  e.stopPropagation();
                  clearFilter("type");
                }}
                aria-label="Effacer le filtre type"
              />
            )}
          </div>

          {activeDropdown === "type" && (
            <div className="sb-filter-dropdown active">
              <div className="sb-dropdown-options">
                {filterOptions.types.map((type, index) => (
                  <div
                    key={index}
                    className={`sb-dropdown-option ${
                      activeFilters.type === type ? "selected" : ""
                    }`}
                    onClick={() => selectFilter("type", type)}
                    role="button"
                    tabIndex={0}
                  >
                    {type}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearAllFilters}
            className="sb-clear-filters-btn"
            aria-label="Effacer tous les filtres"
          >
            Effacer tous
          </button>
        )}
      </div>

      {loadingFilters && (
        <div className="sb-filters-loading">Chargement des options...</div>
      )}
    </div>
  );
};

SearchBar.defaultProps = {
  onSearch: () => {},
  onFilter: () => {},
};

export default React.memo(SearchBar);

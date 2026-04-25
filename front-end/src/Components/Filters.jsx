import React, { useState, useEffect, useRef } from "react";
import { getSchools, getFilters } from "../Services/api";
import { 
  HiOutlineAdjustmentsHorizontal, 
  HiOutlineXMark, 
  HiOutlineStar, 
  HiOutlineBars3BottomLeft, 
  HiOutlineBanknotes, 
  HiOutlineChevronDown, 
  HiOutlineCheck 
} from "react-icons/hi2";
import "../Styles/filters.css";

const Filters = ({
  activeFilters,
  onFilterChange,
  onApply,
  onReset,
  sortBy,
  onSortChange,
  filteredCount,
  totalCount,
  filterOptions: externalFilterOptions,
}) => {
  const [filterOptions, setFilterOptions] = useState({
    villes: [],
    types: [],
    specialites: [],
  });

  const [loading, setLoading] = useState(true);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 20000 });
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  // Fetch filter options
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        setLoading(true);
        
        if (externalFilterOptions && externalFilterOptions.villes?.length > 0) {
          setFilterOptions({
            villes: externalFilterOptions.villes,
            types: externalFilterOptions.types,
            specialites: externalFilterOptions.specialites,
          });
        } else {
          const response = await getFilters();
          // Gestion des différentes structures de réponse
          let filterData = response.data;
          if (response.data && response.data.data) {
            filterData = response.data.data;
          }
          setFilterOptions({
            villes: filterData.villes || [],
            specialites: filterData.specialites || [],
            types: filterData.types || [],
          });
        }

        const schoolsResponse = await getSchools();
        // Gestion des différentes structures de réponse pour les écoles
        let allSchools = [];
        if (schoolsResponse.data && schoolsResponse.data.data) {
          allSchools = schoolsResponse.data.data;
        } else if (Array.isArray(schoolsResponse.data)) {
          allSchools = schoolsResponse.data;
        }
        
        const prices = allSchools
          .map((school) => {
            const priceStr = school.cout;
            const match = priceStr?.match(/\d+/);
            return match ? parseInt(match[0]) : 0;
          })
          .filter((p) => p > 0);

        const minPrice = prices.length > 0 ? Math.min(...prices) : 0;
        const maxPrice = prices.length > 0 ? Math.max(...prices) : 20000;
        setPriceRange({ min: minPrice, max: maxPrice });

      } catch (error) {
        console.error("Error loading filter options:", error);
      } finally {
        setLoading(false);
      }
    };

    loadFilterOptions();
  }, [externalFilterOptions]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        activeDropdown &&
        !event.target.closest(".filter-select") &&
        !event.target.closest(".options-dropdown")
      ) {
        setActiveDropdown(null);
      }

      if (
        menuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [activeDropdown, menuOpen]);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
    setActiveDropdown(null);
  };

  const toggleDropdown = (filterType) => {
    setActiveDropdown(activeDropdown === filterType ? null : filterType);
  };

  const selectFilter = (filterType, value) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: activeFilters[filterType] === value ? "" : value,
    };

    setActiveDropdown(null);
    onFilterChange(newFilters);
  };

  const clearFilter = (filterType) => {
    const newFilters = {
      ...activeFilters,
      [filterType]: "",
    };
    onFilterChange(newFilters);
  };

  const handlePriceChange = (e) => {
    const { name, value } = e.target;
    const newFilters = {
      ...activeFilters,
      [name]: parseInt(value),
    };
    onFilterChange(newFilters);
  };

  const clearPriceFilter = () => {
    onFilterChange({
      ...activeFilters,
      minPrice: "",
      maxPrice: "",
    });
  };

  const formatPrice = (price) => {
    if (!price && price !== 0) return "0 MAD";
    return `${price.toLocaleString()} MAD`;
  };

  const handleApplyFilters = () => {
    if (onApply) {
      onApply();
    }
    setMenuOpen(false);
  };

  const handleResetFilters = () => {
    if (onReset) {
      onReset();
    }
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (activeFilters.ville && activeFilters.ville !== "") count++;
    if (activeFilters.type && activeFilters.type !== "") count++;
    if (activeFilters.specialite && activeFilters.specialite !== "") count++;
    if (
      activeFilters.minPrice && 
      activeFilters.minPrice !== "" &&
      activeFilters.minPrice !== priceRange.min
    ) count++;
    if (
      activeFilters.maxPrice && 
      activeFilters.maxPrice !== "" &&
      activeFilters.maxPrice !== priceRange.max
    ) count++;
    return count;
  };

  const hasActiveFilters =
    (activeFilters.ville && activeFilters.ville !== "") ||
    (activeFilters.type && activeFilters.type !== "") ||
    (activeFilters.specialite && activeFilters.specialite !== "") ||
    (activeFilters.minPrice && activeFilters.minPrice !== "" && activeFilters.minPrice !== priceRange.min) ||
    (activeFilters.maxPrice && activeFilters.maxPrice !== "" && activeFilters.maxPrice !== priceRange.max);

  const displayMinPrice = activeFilters.minPrice && activeFilters.minPrice !== "" 
    ? activeFilters.minPrice 
    : priceRange.min;
  const displayMaxPrice = activeFilters.maxPrice && activeFilters.maxPrice !== "" 
    ? activeFilters.maxPrice 
    : priceRange.max;

  if (loading) {
    return (
      <div className="filters-main-container">
        <div className="filters-loading">Chargement des filtres...</div>
      </div>
    );
  }

  return (
    <div className="filters-main-container" ref={menuRef}>
      {/* Centered Toggle Bar */}
      <div className="filter-toggle-bar">
        <button
          className={`filter-toggle-btn ${menuOpen ? "active" : ""}`}
          onClick={toggleMenu}
        >
          <HiOutlineAdjustmentsHorizontal className="filter-toggle-icon" />
          <span className="filter-text">Filtres & Tri</span>
          {hasActiveFilters && (
            <span className="active-badge">{getActiveFiltersCount()}</span>
          )}
        </button>

        {/* Stats intégrées */}
        <div className="stats-integrated">
          <div className="stat-item">
            <span className="stat-number">{totalCount}</span>
            <span className="stat-label">Établissements</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">{filterOptions?.villes?.length || 0}</span>
            <span className="stat-label">Villes</span>
          </div>
          <div className="stat-divider"></div>
          <div className="stat-item">
            <span className="stat-number">{filterOptions?.types?.length || 0}</span>
            <span className="stat-label">Types</span>
          </div>
        </div>

        <div className="filter-info">
          <div className="results-count">
            <span className="count-number">{filteredCount}</span>
            <span className="count-text">
              école{filteredCount !== 1 ? "s" : ""}
            </span>
            {filteredCount !== totalCount && (
              <span className="total-count">sur {totalCount}</span>
            )}
          </div>

          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="clear-all-btn-small"
              title="Réinitialiser tous les filtres"
            >
              <HiOutlineXMark className="clear-icon" />
            </button>
          )}
        </div>
      </div>

      {/* Dropdown Menu Overlay */}
      <div className={`filter-overlay-menu ${menuOpen ? "open" : ""}`}>
        <div className="menu-header">
          <h3>Filtres & Options de tri</h3>
          <button onClick={() => setMenuOpen(false)} className="close-menu-btn">
            <HiOutlineXMark className="close-icon" />
          </button>
        </div>

        {/* Sort Options Section */}
        <div className="sort-section">
          <label className="sort-label">Trier par:</label>
          <div className="sort-buttons">
            <button
              className={`sort-btn ${sortBy === "note" ? "active" : ""}`}
              onClick={() => onSortChange("note")}
            >
              <HiOutlineStar /> Meilleures notes
            </button>
            <button
              className={`sort-btn ${sortBy === "nom" ? "active" : ""}`}
              onClick={() => onSortChange("nom")}
            >
              <HiOutlineBars3BottomLeft /> Nom (A-Z)
            </button>
            <button
              className={`sort-btn ${sortBy === "price" ? "active" : ""}`}
              onClick={() => onSortChange("price")}
            >
              <HiOutlineBanknotes /> Prix (croissant)
            </button>
          </div>
        </div>

        <div className="filters-grid">
          {/* Ville Filter */}
          <div className="filter-group">
            <label className="filter-group-label">Ville</label>
            <div className="filter-tag-container">
              <div
                className={`filter-select ${activeFilters.ville ? "active" : ""}`}
                onClick={() => toggleDropdown("ville")}
              >
                {activeFilters.ville || "Toutes les villes"}
                <HiOutlineChevronDown className="select-arrow-icon" />
              </div>

              {activeDropdown === "ville" && (
                <div className="options-dropdown">
                  <div className="dropdown-scroll">
                    {filterOptions.villes.map((ville, index) => (
                      <div
                        key={index}
                        className={`dropdown-item ${activeFilters.ville === ville ? "selected" : ""}`}
                        onClick={() => selectFilter("ville", ville)}
                      >
                        {ville}
                        {activeFilters.ville === ville && <HiOutlineCheck className="check-icon" />}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Type Filter */}
          <div className="filter-group">
            <label className="filter-group-label">Type d'établissement</label>
            <div className="filter-tag-container">
              <div
                className={`filter-select ${activeFilters.type ? "active" : ""}`}
                onClick={() => toggleDropdown("type")}
              >
                {activeFilters.type || "Tous les types"}
                <HiOutlineChevronDown className="select-arrow-icon" />
              </div>

              {activeDropdown === "type" && (
                <div className="options-dropdown">
                  <div className="dropdown-scroll">
                    {filterOptions.types.map((type, index) => (
                      <div
                        key={index}
                        className={`dropdown-item ${activeFilters.type === type ? "selected" : ""}`}
                        onClick={() => selectFilter("type", type)}
                      >
                        {type}
                        {activeFilters.type === type && <span className="check">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Spécialité Filter */}
          <div className="filter-group">
            <label className="filter-group-label">Spécialité</label>
            <div className="filter-tag-container">
              <div
                className={`filter-select ${activeFilters.specialite ? "active" : ""}`}
                onClick={() => toggleDropdown("specialite")}
              >
                {activeFilters.specialite || "Toutes les spécialités"}
                <span className="select-arrow">▼</span>
              </div>

              {activeDropdown === "specialite" && (
                <div className="options-dropdown specialite-dropdown">
                  <div className="dropdown-scroll">
                    {filterOptions.specialites.map((specialite, index) => (
                      <div
                        key={index}
                        className={`dropdown-item ${activeFilters.specialite === specialite ? "selected" : ""}`}
                        onClick={() => selectFilter("specialite", specialite)}
                      >
                        {specialite}
                        {activeFilters.specialite === specialite && <span className="check">✓</span>}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Price Filter Section */}
          <div className="filter-group price-group">
            <label className="filter-group-label">
              Fourchette de prix
              <span className="filter-value">
                {formatPrice(displayMinPrice)} - {formatPrice(displayMaxPrice)}
              </span>
            </label>

            <div className="price-slider-container">
              <div className="slider-wrapper">
                <div
                  className="active-range-track"
                  style={{
                    left: `${((displayMinPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                    right: `${100 - ((displayMaxPrice - priceRange.min) / (priceRange.max - priceRange.min)) * 100}%`,
                  }}
                ></div>

                <input
                  type="range"
                  name="minPrice"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={displayMinPrice}
                  onChange={handlePriceChange}
                  className="price-range-slider"
                />

                <input
                  type="range"
                  name="maxPrice"
                  min={priceRange.min}
                  max={priceRange.max}
                  value={displayMaxPrice}
                  onChange={handlePriceChange}
                  className="price-range-slider"
                />
              </div>

              <div className="slider-labels">
                <span>{formatPrice(priceRange.min)}</span>
                <span>{formatPrice(priceRange.max)}</span>
              </div>
            </div>

            {(activeFilters.minPrice && activeFilters.minPrice !== "") && (
              <button onClick={clearPriceFilter} className="clear-price-btn">
                Réinitialiser prix
              </button>
            )}
          </div>
        </div>

        <div className="menu-actions">
          <div className="active-filters-count">
            <strong>{getActiveFiltersCount()}</strong> filtre
            {getActiveFiltersCount() !== 1 ? "s" : ""} sélectionné
            {getActiveFiltersCount() !== 1 ? "s" : ""}
          </div>

          <div className="action-buttons">
            {hasActiveFilters && (
              <button onClick={handleResetFilters} className="reset-all-btn">
                Tout réinitialiser
              </button>
            )}
            <button onClick={handleApplyFilters} className="apply-filters-btn">
              Appliquer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

Filters.defaultProps = {
  activeFilters: {},
  onFilterChange: () => {},
  onApply: () => {},
  onReset: () => {},
  sortBy: "note",
  onSortChange: () => {},
  filteredCount: 0,
  totalCount: 0,
};

export default Filters;
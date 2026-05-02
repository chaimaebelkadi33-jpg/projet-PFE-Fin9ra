import React, { useCallback, useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRecommendationFilters, getRecommendations, getImageUrl } from '../Services/api';
import {
  HiOutlineMapPin,
  HiOutlineBanknotes,
  HiStar,
  HiArrowRight,
  HiOutlineChevronDown,
  HiOutlineCheck,
  HiOutlineLightBulb
} from 'react-icons/hi2';
import { useToast } from '../Components/Toast';
import '../Styles/recommendations.css';

const optionalLabel = 'Optionnel';

const Recommendations = () => {
  const [filtersLoading, setFiltersLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState(0);
  const [results, setResults] = useState([]);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [filters, setFilters] = useState({
    cities: [],
    budgets: [],
    bac_types: [],
    school_types: [],
    study_levels: [],
    interest_domains: []
  });

  const [formData, setFormData] = useState({
    note: 14,
    bac_type: '',
    ville: '',
    budget: '',
    school_type: '',
    study_level: '',
    interest_domain: ''
  });

  const dropdownRef = useRef(null);
  const navigate = useNavigate();
  const toast = useToast();

  const processingSteps = [
    'Analyse de votre profil academique...',
    'Comparaison avec les etablissements...',
    'Filtrage par budget et localisation...',
    'Finalisation des recommandations...'
  ];

  const fetchFilters = useCallback(async () => {
    try {
      setFiltersLoading(true);
      const response = await getRecommendationFilters();

      if (response.data.success) {
        const nextFilters = {
          cities: response.data.cities || [],
          budgets: response.data.budgets || [],
          bac_types: response.data.bac_types || [],
          school_types: response.data.school_types || [],
          study_levels: response.data.study_levels || [],
          interest_domains: response.data.interest_domains || []
        };

        setFilters(nextFilters);
        setFormData((prev) => ({
          ...prev,
          bac_type: nextFilters.bac_types[0] || '',
          ville: nextFilters.cities[0] || '',
          budget: nextFilters.budgets[0]?.id || ''
        }));
      }
    } catch (error) {
      toast.error('Erreur de chargement');
    } finally {
      setFiltersLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchFilters();

    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [fetchFilters]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setProcessing(true);
    setResults([]);

    for (let i = 0; i < processingSteps.length; i++) {
      setProcessingStep(i);
      await new Promise((resolve) => setTimeout(resolve, 600));
    }

    try {
      const response = await getRecommendations(formData);
      if (response.data.success) {
        setResults(response.data.data);
      }
    } catch (error) {
      const message = error.response?.data?.details || error.response?.data?.message || 'Erreur de generation';
      toast.error(message);
    } finally {
      setProcessing(false);
    }
  };

  const toggleDropdown = (type) => {
    setActiveDropdown(activeDropdown === type ? null : type);
  };

  const selectOption = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setActiveDropdown(null);
  };

  const getBudgetLabel = (id) => {
    return filters.budgets.find((budget) => budget.id === id)?.label || '';
  };

  const renderSelect = ({ id, label, field, options, placeholder = optionalLabel, required = false }) => (
    <div className="rec-page-input-group">
      <label className="rec-page-label">
        {label}
        {!required && <span className="rec-optional-badge">{optionalLabel}</span>}
      </label>
      <div className="rec-custom-select" onClick={() => toggleDropdown(id)}>
        <span className={!formData[field] ? 'rec-placeholder' : ''}>
          {formData[field] || placeholder}
        </span>
        <HiOutlineChevronDown className={`select-arrow ${activeDropdown === id ? 'open' : ''}`} />
        {activeDropdown === id && (
          <div className="rec-dropdown-options">
            {!required && (
              <div className="rec-option" onClick={(event) => {
                event.stopPropagation();
                selectOption(field, '');
              }}>
                {placeholder} {!formData[field] && <HiOutlineCheck className="check-icon" />}
              </div>
            )}
            {options.map((option) => (
              <div key={option} className="rec-option" onClick={(event) => {
                event.stopPropagation();
                selectOption(field, option);
              }}>
                {option} {formData[field] === option && <HiOutlineCheck className="check-icon" />}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderStars = (rating) => {
    return Array(5).fill(0).map((_, i) => (
      <HiStar key={i} className={i < Math.floor(rating) ? 'star-filled' : 'star-empty'} />
    ));
  };

  if (filtersLoading) {
    return <div className="rec-loading">Chargement...</div>;
  }

  return (
    <div className="rec-page-container">
      <div className="rec-page-header">
        <h1 className="rec-page-title">FinN9ra? IA</h1>
        <div className="rec-page-subtitle">
          <span className="rec-arabic">توصيات</span>
          <span className="rec-separator">/</span>
          <span className="rec-french">Recommandations</span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="rec-page-form" ref={dropdownRef}>
        <div className="rec-page-input-group">
          <label className="rec-page-label">Note du Bac</label>
          <input
            type="number"
            className="rec-page-input"
            min="10"
            max="20"
            step="0.01"
            value={formData.note}
            onChange={(e) => setFormData({ ...formData, note: e.target.value })}
            required
          />
        </div>

        {renderSelect({
          id: 'bac',
          label: 'Serie / Type de Bac',
          field: 'bac_type',
          options: filters.bac_types,
          placeholder: 'Choisir une serie',
          required: true
        })}

        {renderSelect({
          id: 'city',
          label: 'Ville preferee',
          field: 'ville',
          options: filters.cities,
          placeholder: 'Choisir une ville',
          required: true
        })}

        <div className="rec-page-input-group">
          <label className="rec-page-label">Budget annuel</label>
          <div className="rec-budget-grid">
            {filters.budgets.map((budget) => (
              <button
                type="button"
                key={budget.id}
                className={`rec-budget-mini-card ${formData.budget === budget.id ? 'active' : ''}`}
                onClick={() => setFormData({ ...formData, budget: budget.id })}
              >
                {budget.label}
              </button>
            ))}
          </div>
          <input type="hidden" value={getBudgetLabel(formData.budget)} required readOnly />
        </div>

        {renderSelect({
          id: 'school-type',
          label: "Type d'etablissement",
          field: 'school_type',
          options: filters.school_types
        })}

        {renderSelect({
          id: 'study-level',
          label: "Niveau d'etudes vise",
          field: 'study_level',
          options: filters.study_levels
        })}

        {renderSelect({
          id: 'interest-domain',
          label: "Domaine d'interet principal",
          field: 'interest_domain',
          options: filters.interest_domains
        })}

        <button type="submit" className="rec-page-button" disabled={processing}>
          {processing ? 'Analyse...' : 'Generer Recommandations'}
        </button>
      </form>

      {processing && (
        <div className="rec-processing">
          <div className="spinner"></div>
          <p>{processingSteps[processingStep]}</p>
        </div>
      )}

      {results.length > 0 && !processing && (
        <div className="rec-results-container animate-fade-in">
          <div className="rec-results-header">
            <HiOutlineLightBulb /> Nos Meilleures Suggestions
          </div>
          <div className="rec-results-list">
            {results.map((school, index) => (
              <div key={school.id} className="rec-result-item">
                <div className="rec-item-rank">#{index + 1}</div>
                <img
                  src={getImageUrl(school.logo)}
                  alt={school.nom}
                  className="rec-item-logo"
                  onError={(e) => { e.target.src = 'https://via.placeholder.com/60'; }}
                />
                <div className="rec-item-info">
                  <h4>{school.nom}</h4>
                  <div className="rec-item-meta">
                    <span><HiOutlineMapPin /> {school.ville}</span>
                    <span><HiOutlineBanknotes /> {school.cout > 0 ? `${school.cout.toLocaleString()} MAD` : 'Public'}</span>
                  </div>
                  <div className="rec-item-rating">
                    {renderStars(school.note)}
                  </div>
                </div>
                <button className="rec-item-btn" onClick={() => navigate(`/ecole/${school.id}`)}>
                  <HiArrowRight />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Recommendations;

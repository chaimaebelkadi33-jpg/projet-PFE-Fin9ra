// Data service for managing school data operations
import ecolesData from "../Data/ecoles.json";

/**
 * Normalizes a string by removing accents and converting to lowercase
 */
const normalizeString = (str) => {
  if (!str) return "";
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

// Cache for normalized data to improve performance
let normalizedEcolesData = null;

/**
 * Returns normalized school data with accent-insensitive fields for searching
 */
const getNormalizedEcolesData = () => {
  if (!normalizedEcolesData) {
    normalizedEcolesData = ecolesData.map((ecole) => {
      const allSchoolSpecialities = [
        ...(ecole.specialites || []),
        ...(ecole.filiereGestion || []),
        ...(ecole.filiereCommerce || []),
        ...(ecole.formationsOffertes || []),
        ...(ecole.mastersSpecialisesInitiale || []),
        ...(ecole.mastersSpecialisesUniversite || []),
        ...(ecole.licencesProfessionnelles || []),
        ...(ecole.debouches || []),
      ];

      return {
        ...ecole,
        normalizedName: normalizeString(ecole.nom || ""),
        normalizedVille: normalizeString(ecole.ville || ""),
        normalizedType: normalizeString(ecole.type || ""),
        normalizedSpecialites: allSchoolSpecialities.map((s) =>
          normalizeString(s),
        ),
      };
    });
  }
  return normalizedEcolesData;
};

export const getAllSchools = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(ecolesData);
    }, 100);
  });
};

export const getSchoolById = (id) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const ecole = ecolesData.find((item) => item.idEcole === parseInt(id));
      if (ecole) {
        resolve(ecole);
      } else {
        reject(new Error("École non trouvée"));
      }
    }, 200);
  });
};

/**
 * Searches schools by name, city, or type with accent-insensitive matching
 */
export const searchSchools = (searchTerm) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (!searchTerm || searchTerm.trim() === "") {
        resolve([]);
        return;
      }

      const searchLower = normalizeString(searchTerm);
      const normalizedData = getNormalizedEcolesData();

      const results = normalizedData
        .filter(
          (ecole) =>
            ecole.normalizedName.includes(searchLower) ||
            ecole.normalizedVille.includes(searchLower) ||
            ecole.normalizedType.includes(searchLower),
        )
        .map((ecole) => {
          const {
            normalizedName,
            normalizedVille,
            normalizedType,
            normalizedSpecialites,
            ...originalEcole
          } = ecole;
          return originalEcole;
        });

      resolve(results);
    }, 200);
  });
};

export const filterSchools = (filters) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      let normalizedData = getNormalizedEcolesData();

      // Apply filters with accent-insensitive comparison
      if (filters.ville) {
        const normalizedFilterVille = normalizeString(filters.ville);
        normalizedData = normalizedData.filter(
          (ecole) => ecole.normalizedVille === normalizedFilterVille,
        );
      }

      if (filters.type) {
        const normalizedFilterType = normalizeString(filters.type);
        normalizedData = normalizedData.filter(
          (ecole) => ecole.normalizedType === normalizedFilterType,
        );
      }

      if (filters.specialite) {
        const normalizedFilterSpecialite = normalizeString(filters.specialite);
        normalizedData = normalizedData.filter((ecole) => {
          return ecole.normalizedSpecialites.includes(
            normalizedFilterSpecialite,
          );
        });
      }

      // Convert back to original data format
      const results = normalizedData.map((ecole) => {
        const {
          normalizedName,
          normalizedVille,
          normalizedType,
          normalizedSpecialites,
          ...originalEcole
        } = ecole;
        return originalEcole;
      });

      resolve(results);
    }, 200);
  });
};

export const getCities = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const villes = [
        ...new Set(ecolesData.map((ecole) => ecole.ville)),
      ].sort();
      resolve(villes);
    }, 100);
  });
};

export const getTypes = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const types = [...new Set(ecolesData.map((ecole) => ecole.type))].sort();
      resolve(types);
    }, 100);
  });
};

/**
 * Returns all unique specialities from all schools
 */
export const getSpecialites = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const allSpecialites = new Set();

      ecolesData.forEach((ecole) => {
        const specialityFields = [
          "specialites",
          "filiereGestion",
          "filiereCommerce",
          "formationsOffertes",
          "mastersSpecialisesInitiale",
          "mastersSpecialisesUniversite",
          "licencesProfessionnelles",
          "debouches",
        ];

        specialityFields.forEach((field) => {
          if (ecole[field] && Array.isArray(ecole[field])) {
            ecole[field].forEach((item) => {
              if (item && typeof item === "string") {
                allSpecialites.add(item.trim());
              }
            });
          }
        });
      });

      const specialites = Array.from(allSpecialites).sort();
      resolve(specialites);
    }, 100);
  });
};

// Performance optimization: pre-normalize data on module load
getNormalizedEcolesData();

// Export for backward compatibility
export const dataService = {
  getAllSchools,
  getAllEcoles: getAllSchools, // Alias for getAllSchools
  getSchoolById,
  searchSchools,
  filterSchools,
  getCities,
  getTypes,
  getSpecialites,
  getFilterOptions: async () => {
    const [villes, specialites, types] = await Promise.all([
      getCities(),
      getSpecialites(),
      getTypes(),
    ]);
    return { villes, specialites, types };
  },
  normalizeString,
};

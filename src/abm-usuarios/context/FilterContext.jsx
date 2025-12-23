import { createContext, useContext, useState } from 'react';

const FilterContext = createContext();

export const FilterProvider = ({ children }) => {
  const [filteredUserIds, setFilteredUserIds] = useState(null);
  const [orgChartData, setOrgChartData] = useState([]);

  const applyUserFilter = (userIds) => {
    if (!userIds || userIds.length === 0) {
      setFilteredUserIds(null);
    } else {
      const userSubIds = new Set(
        userIds.map(id => {
          const match = id.match(/user-(\d+)/);
          return match ? parseInt(match[1]) : null;
        }).filter(id => id !== null)
      );
      setFilteredUserIds(userSubIds);
    }
  };

  const clearUserFilter = () => {
    setFilteredUserIds(null);
  };

  const value = {
    filteredUserIds,
    applyUserFilter,
    clearUserFilter,
    orgChartData,
    setOrgChartData
  };

  return (
    <FilterContext.Provider value={value}>
      {children}
    </FilterContext.Provider>
  );
};

export const useFilter = () => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilter debe ser usado dentro de un FilterProvider');
  }
  return context;
};

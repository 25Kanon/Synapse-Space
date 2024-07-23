import React from 'react';


const ThemeContext = React.createContext({
    theme: 'light', // Default theme
    toggleTheme: () => { }, // Placeholder function
});

export default ThemeContext;
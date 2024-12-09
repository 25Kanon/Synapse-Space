import React from 'react';

const SearchBar = ({ searchQuery, setSearchQuery, children }) => {
  // Handle input change
  const handleInputChange = (event) => {
    setSearchQuery(event.target.value);
  };

  return (
    <div className="search-bar text-white p-6 text-center">
      <h1 className="text-3xl font-bold mb-4">Explore your space.</h1>
      <p className="mb-4">Search for and join communities that fit your passions. Connect, collaborate, and shine in your Synapse Space.</p>
      <div className="flex justify-center">
        <div className="form-control w-full max-w-lg">
          <input
            type="text"
            placeholder="Search"
            value={searchQuery} // Bind the input value to searchQuery
            onChange={handleInputChange} // Handle input changes
            className="input input-bordered" // w-full allows it to take full width within max-w-lg
          />
        </div>
          {children}
      </div>
    </div>
  );
};

export default SearchBar;

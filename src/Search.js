import React, { useState, useEffect, useCallback } from "react";

function Search() {
    const [searchTerm, setSearchTerm] = useState("");
    const [suggestions, setSuggestions] = useState([]);
    const [selectedPokemon, setSelectedPokemon] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Debounce function to limit API calls
    const debounce = (func, delay) => {
        let timeoutId;
        return (...args) => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            timeoutId = setTimeout(() => {
                func(...args);
            }, delay);
        };
    };

    // Fetch Pokemon suggestions
    const fetchPokemonSuggestions = useCallback(async (query) => {
        if (!query) {
            setSuggestions([]);
            return;
        }

        setLoading(true);
        try {
            // Fetch first 151 Pokemon to create suggestions
            const response = await fetch('https://pokeapi.co/api/v2/pokemon?limit=151');
            const data = await response.json();

            // Filter suggestions based on input
            const filteredSuggestions = data.results
                .filter(pokemon =>
                    pokemon.name.toLowerCase().includes(query.toLowerCase())
                )
                .slice(0, 5); // Limit to 5 suggestions

            setSuggestions(filteredSuggestions);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch suggestions");
            setLoading(false);
        }
    }, []);

    // Debounced search suggestions
    const debouncedFetchSuggestions = useCallback(
        debounce(fetchPokemonSuggestions, 300),
        [fetchPokemonSuggestions]
    );

    // Handle input change
    const handleInputChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        debouncedFetchSuggestions(value);

        // Clear selected Pokemon if input changes
        if (selectedPokemon) {
            setSelectedPokemon(null);
        }
    };

    // Fetch full Pokemon details
    const fetchPokemonDetails = async (name) => {
        setLoading(true);
        try {
            const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
            const data = await response.json();

            const formattedPokemon = {
                id: data.id,
                name: data.name,
                imageUrl: data.sprites.front_default,
                shinyImageUrl: data.sprites.front_shiny,
                types: data.types.map(type => type.type.name),
                height: data.height / 10,
                weight: data.weight / 10,
                abilities: data.abilities.map(ability => ability.ability.name),
                stats: data.stats.map(stat => ({
                    name: stat.stat.name,
                    base_stat: stat.base_stat
                }))
            };

            setSelectedPokemon(formattedPokemon);
            setSearchTerm(formattedPokemon.name);
            setSuggestions([]);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch Pokemon details");
            setLoading(false);
        }
    };

    // Handle suggestion selection
    const handleSuggestionClick = (name) => {
        fetchPokemonDetails(name);
    };

    return (
        <div className="pokemon-search">
            <div className="search-container">
                <input
                    type="text"
                    value={searchTerm}
                    onChange={handleInputChange}
                    placeholder="Search Pokémon"
                    className="search-input"
                />
                {suggestions.length > 0 && (
                    <ul className="suggestions-list">
                        {suggestions.map((suggestion) => (
                            <li
                                key={suggestion.name}
                                onClick={() => handleSuggestionClick(suggestion.name)}
                                className="suggestion-item"
                            >
                                {suggestion.name.charAt(0).toUpperCase() + suggestion.name.slice(1)}
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            {loading && <div className="loading">Loading...</div>}
            {error && <div className="error">{error}</div>}

            {selectedPokemon && (
                <div className="pokemon-details">
                    <div className="pokemon-card">
                        <div className="pokemon-images">
                            <img
                                src={selectedPokemon.imageUrl}
                                alt={`${selectedPokemon.name} default sprite`}
                                className="pokemon-image"
                            />
                            <img
                                src={selectedPokemon.shinyImageUrl}
                                alt={`${selectedPokemon.name} shiny sprite`}
                                className="pokemon-shiny-image"
                            />
                        </div>
                        <div className="pokemon-info">
                            <h2>#{selectedPokemon.id} {selectedPokemon.name.charAt(0).toUpperCase() + selectedPokemon.name.slice(1)}</h2>
                            <p>Types: {selectedPokemon.types.join(', ')}</p>
                            <p>Height: {selectedPokemon.height} m</p>
                            <p>Weight: {selectedPokemon.weight} kg</p>
                            <p>Abilities: {selectedPokemon.abilities.join(', ')}</p>

                            <div className="pokemon-stats">
                                <h3>Base Stats:</h3>
                                {selectedPokemon.stats.map(stat => (
                                    <div key={stat.name} className="stat-row">
                                        <span className="stat-name">{stat.name}</span>
                                        <span className="stat-value">{stat.base_stat}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Search;
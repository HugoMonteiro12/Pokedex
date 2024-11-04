import React, { useState, useEffect } from "react";

function Pokedex() {
    const [pokemons, setPokemons] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [expandedPokemon, setExpandedPokemon] = useState(null);

    const fetchPokemons = async () => {
        try {
            // Fetch list of first 151 Pokémon (first generation)
            const response = await fetch("https://pokeapi.co/api/v2/pokemon?limit=200");
            const data = await response.json();

            // Fetch detailed info for each Pokémon
            const pokemonDetails = await Promise.all(
                data.results.map(async (pokemon) => {
                    const detailResponse = await fetch(pokemon.url);
                    return detailResponse.json();
                })
            );

            // Transform data to include more details
            const formattedPokemons = pokemonDetails.map(pokemon => ({
                id: pokemon.id,
                name: pokemon.name,
                imageUrl: pokemon.sprites.front_default,
                types: pokemon.types.map(type => type.type.name),
                height: pokemon.height / 10, // Convert to meters
                weight: pokemon.weight / 10, // Convert to kilograms
                abilities: pokemon.abilities.map(ability => ability.ability.name),
                stats: pokemon.stats.map(stat => ({
                    name: stat.stat.name,
                    base_stat: stat.base_stat
                }))
            }));

            setPokemons(formattedPokemons);
            setLoading(false);
        } catch (err) {
            setError(err.message);
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPokemons();
    }, []);

    const togglePokemonDetails = (pokemonId) => {
        setExpandedPokemon(expandedPokemon === pokemonId ? null : pokemonId);
    };

    if (loading) return <div className="loading">Loading Pokémon...</div>;
    if (error) return <div className="error">Error: {error}</div>;

    return (
        <div className="pokedex">
            <h2>Pokédex</h2>
            <div className="pokemon-grid">
                {pokemons.map((pokemon) => (
                    <div
                        key={pokemon.id}
                        className={`pokemon-card ${expandedPokemon === pokemon.id ? 'expanded' : ''}`}
                        onClick={() => togglePokemonDetails(pokemon.id)}
                    >
                        <div className="pokemon-card-header">
                            <img
                                src={pokemon.imageUrl}
                                alt={pokemon.name}
                                className="pokemon-image"
                            />
                            <h3>#{pokemon.id} {pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h3>
                            <p>Types: {pokemon.types.join(', ')}</p>
                        </div>

                        {expandedPokemon === pokemon.id && (
                            <div className="pokemon-details">
                                <div className="pokemon-extra-info">
                                    <p>Height: {pokemon.height} m</p>
                                    <p>Weight: {pokemon.weight} kg</p>
                                    <p>Abilities: {pokemon.abilities.join(', ')}</p>
                                </div>
                                <div className="pokemon-stats">
                                    <h4>Base Stats:</h4>
                                    {pokemon.stats.map(stat => (
                                        <div key={stat.name} className="stat-row">
                                            <span className="stat-name">{stat.name}</span>
                                            <span className="stat-value">{stat.base_stat}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

export default Pokedex;
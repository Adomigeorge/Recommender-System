// ===== CONFIGURATION =====
const API_BASE_URL = 'http://localhost:5000/api';

// ===== GLOBAL STATE =====
let movieData = [];
let isLoading = false;

// ===== UTILITY FUNCTIONS =====
function createMovieCard(movie) {
    const similarityPercent = movie.similarity_score 
        ? Math.round(movie.similarity_score * 100) 
        : Math.floor(Math.random() * 30) + 70; // Fallback for demo
    
    // Generate placeholder image based on movie title
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Extract first letter for placeholder
    const firstLetter = movie.title?.charAt(0) || 'M';
    
    return `
    <div class="movie-card" data-id="${movie.index || movie.id || ''}" data-title="${movie.title}">
        <div class="movie-poster-placeholder" style="background: linear-gradient(135deg, ${randomColor} 0%, ${randomColor}99 100%);">
            <div class="movie-poster-letter">${firstLetter}</div>
            ${movie.similarity_score ? `<span class="similarity-badge">${similarityPercent}% match</span>` : ''}
        </div>
        <div class="movie-info">
            <h3 class="movie-title">${movie.title}</h3>
            ${movie.genres ? `<p class="movie-genres"><i class="fas fa-tags"></i> ${movie.genres.split('|').slice(0, 3).join(', ')}</p>` : ''}
            ${movie.tagline ? `<p class="movie-tagline">"${movie.tagline}"</p>` : ''}
            ${movie.year ? `<p class="movie-year"><i class="fas fa-calendar"></i> ${movie.year}</p>` : ''}
            ${movie.similarity_score ? `
                <div class="similarity-score">
                    <i class="fas fa-chart-line"></i>
                    Similarity: ${movie.similarity_score.toFixed(3)}
                </div>
            ` : ''}
            <button class="movie-details-btn" onclick="showMovieDetails('${movie.title.replace(/'/g, "\\'")}')">
                <i class="fas fa-info-circle"></i> Details
            </button>
        </div>
    </div>
    `;
}

function showMovieDetails(movieTitle) {
    showNotification(`Details for "${movieTitle}" would show here.`, 'info');
    
    // In a full implementation, this would:
    // 1. Fetch detailed movie info from API
    // 2. Open a modal or navigate to details page
    // 3. Show cast, director, full description, etc.
}

// ===== API FUNCTIONS =====
async function loadMovieData() {
    try {
        const response = await fetch(`${API_BASE_URL}/movies?limit=50`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        movieData = data.movies || data;
        console.log(`✅ Loaded ${movieData.length} movies from backend`);
        return movieData;
    } catch (error) {
        console.error('Error loading movie data:', error);
        console.log('⚠️ Falling back to mock data');
        return loadMockData();
    }
}

function loadMockData() {
    movieData = [
        {
            id: 1,
            title: "The Dark Knight",
            genres: "Action|Crime|Drama|Thriller",
            tagline: "Why so serious?",
            year: "2008",
            similarity_score: 0.95
        },
        {
            id: 2,
            title: "Inception",
            genres: "Action|Sci-Fi|Thriller",
            tagline: "Your mind is the scene of the crime.",
            year: "2010",
            similarity_score: 0.92
        },
        {
            id: 3,
            title: "Pulp Fiction",
            genres: "Crime|Drama",
            tagline: "You won't know the facts until you've seen the fiction.",
            year: "1994",
            similarity_score: 0.88
        },
        {
            id: 4,
            title: "The Shawshank Redemption",
            genres: "Drama",
            tagline: "Fear can hold you prisoner. Hope can set you free.",
            year: "1994",
            similarity_score: 0.85
        },
        {
            id: 5,
            title: "The Godfather",
            genres: "Crime|Drama",
            tagline: "An offer you can't refuse.",
            year: "1972",
            similarity_score: 0.90
        },
        {
            id: 6,
            title: "Forrest Gump",
            genres: "Drama|Romance",
            tagline: "The world will never be the same once you've seen it through the eyes of Forrest Gump.",
            year: "1994",
            similarity_score: 0.82
        },
        {
            id: 7,
            title: "The Matrix",
            genres: "Action|Sci-Fi",
            tagline: "Welcome to the Real World.",
            year: "1999",
            similarity_score: 0.91
        },
        {
            id: 8,
            title: "Interstellar",
            genres: "Adventure|Drama|Sci-Fi",
            tagline: "Mankind was born on Earth. It was never meant to die here.",
            year: "2014",
            similarity_score: 0.89
        },
        {
            id: 9,
            title: "Parasite",
            genres: "Comedy|Drama|Thriller",
            tagline: "Act like you own the place.",
            year: "2019",
            similarity_score: 0.87
        },
        {
            id: 10,
            title: "Avengers: Endgame",
            genres: "Action|Adventure|Drama",
            tagline: "Part of the journey is the end.",
            year: "2019",
            similarity_score: 0.84
        }
    ];
    
    console.log(`📚 Loaded ${movieData.length} mock movies`);
    return movieData;
}

// ===== RECOMMENDATION FUNCTIONS =====
async function getRecommendations(movieName) {
    if (isLoading) return;
    
    isLoading = true;
    showLoading('Analyzing movies...');
    
    try {
        console.log(`🔍 Searching for: "${movieName}"`);
        
        // Try to get recommendations from backend API
        const response = await fetch(
            `${API_BASE_URL}/recommend?movie=${encodeURIComponent(movieName)}`,
            {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                },
                // Add timeout
                signal: AbortSignal.timeout(10000)
            }
        );
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        hideLoading();
        isLoading = false;
        
        if (data.error) {
            displayNoResults(data.error, movieName);
            return;
        }
        
        displayRecommendations(data.recommendations, data.input_movie);
        
    } catch (error) {
        console.error('❌ Error getting recommendations:', error);
        hideLoading();
        isLoading = false;
        
        // Fallback to mock recommendations
        showNotification('Using demo recommendations', 'info');
        displayMockRecommendations(movieName);
    }
}

function displayRecommendations(recommendations, originalMovie) {
    const container = document.getElementById('recommendationsList');
    
    if (!recommendations || recommendations.length === 0) {
        displayNoResults('No recommendations found', originalMovie);
        return;
    }
    
    let html = `
        <div class="search-result-header">
            <h3><i class="fas fa-film"></i> Movies similar to "${originalMovie}"</h3>
            <p class="result-count">Found ${recommendations.length} recommendations</p>
        </div>
    `;
    
    // Add movie cards
    recommendations.forEach((movie, index) => {
        html += createMovieCard({
            ...movie,
            index: index + 1
        });
    });
    
    // Add view more button if we have many results
    if (recommendations.length >= 8) {
        html += `
            <div class="view-more-container">
                <button class="view-more-btn" onclick="showMoreRecommendations('${originalMovie}')">
                    <i class="fas fa-chevron-down"></i> Show More Recommendations
                </button>
            </div>
        `;
    }
    
    container.innerHTML = html;
    
    // Add CSS for new elements
    addRecommendationStyles();
    
    // Scroll to recommendations section
    setTimeout(() => {
        document.querySelector('.recommendations-section')?.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    }, 300);
}

function displayMockRecommendations(movieName) {
    const mockRecommendations = movieData
        .filter(movie => movie.title.toLowerCase() !== movieName.toLowerCase())
        .sort(() => Math.random() - 0.5)
        .slice(0, 8)
        .map((movie, index) => ({
            ...movie,
            similarity_score: 0.9 - (index * 0.05) // Simulate decreasing similarity
        }));
    
    displayRecommendations(mockRecommendations, movieName);
}

function displayNoResults(errorMessage, searchedMovie) {
    const container = document.getElementById('recommendationsList');
    
    container.innerHTML = `
        <div class="no-results">
            <div class="no-results-icon">
                <i class="fas fa-search"></i>
            </div>
            <h3>No exact match found for "${searchedMovie}"</h3>
            <p>${errorMessage || 'Try searching for a different movie'}</p>
            
            <div class="suggestions-container">
                <h4>Try one of these popular movies:</h4>
                <div class="suggestion-buttons">
                    <button class="suggestion-btn" onclick="searchQuick('The Dark Knight')">
                        <i class="fas fa-play"></i> The Dark Knight
                    </button>
                    <button class="suggestion-btn" onclick="searchQuick('Inception')">
                        <i class="fas fa-play"></i> Inception
                    </button>
                    <button class="suggestion-btn" onclick="searchQuick('Pulp Fiction')">
                        <i class="fas fa-play"></i> Pulp Fiction
                    </button>
                    <button class="suggestion-btn" onclick="searchQuick('The Matrix')">
                        <i class="fas fa-play"></i> The Matrix
                    </button>
                </div>
            </div>
            
            <div class="search-tips">
                <h4><i class="fas fa-lightbulb"></i> Search Tips:</h4>
                <ul>
                    <li>Check your spelling</li>
                    <li>Try the full movie title</li>
                    <li>Search for popular movies first</li>
                    <li>Use English movie titles</li>
                </ul>
            </div>
        </div>
    `;
}

// ===== POPULAR MOVIES =====
async function loadPopularMovies() {
    try {
        const response = await fetch(`${API_BASE_URL}/movies/popular?limit=6`);
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const popularMovies = await response.json();
        displayPopularMovies(popularMovies);
        
    } catch (error) {
        console.error('Error loading popular movies:', error);
        // Use mock data for popular movies
        const mockPopular = movieData.slice(0, 6);
        displayPopularMovies(mockPopular);
    }
}

function displayPopularMovies(movies) {
    const container = document.getElementById('popularMovies');
    
    if (!movies || movies.length === 0) {
        container.innerHTML = '<p class="no-movies">No popular movies available</p>';
        return;
    }
    
    let html = '';
    movies.forEach(movie => {
        html += createMovieCard(movie);
    });
    
    container.innerHTML = html;
}

// ===== HELPER FUNCTIONS =====
function showMoreRecommendations(movieName) {
    showNotification('Loading more recommendations...', 'info');
    // In a full implementation, this would load additional recommendations
    setTimeout(() => {
        showNotification('This would load more recommendations in production', 'info');
    }, 1000);
}

function addRecommendationStyles() {
    const styleId = 'recommendation-styles';
    if (document.getElementById(styleId)) return;
    
    const style = document.createElement('style');
    style.id = styleId;
    style.textContent = `
        .search-result-header {
            grid-column: 1 / -1;
            text-align: center;
            margin-bottom: 2rem;
            padding-bottom: 2rem;
            border-bottom: 2px solid #f0f0f0;
        }
        
        .search-result-header h3 {
            color: #2c3e50;
            font-size: 1.8rem;
            margin-bottom: 0.5rem;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 10px;
        }
        
        .result-count {
            color: #7f8c8d;
            font-size: 1rem;
        }
        
        .movie-poster-letter {
            font-size: 5rem;
            font-weight: 800;
            color: white;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
        }
        
        .movie-year {
            color: #7f8c8d;
            font-size: 0.9rem;
            margin: 0.5rem 0;
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .movie-details-btn {
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #f8f9fa;
            border: 2px solid #e0e0e0;
            border-radius: 6px;
            color: #3498db;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            width: 100%;
        }
        
        .movie-details-btn:hover {
            background: #3498db;
            color: white;
            border-color: #3498db;
            transform: translateY(-2px);
        }
        
        .view-more-container {
            grid-column: 1 / -1;
            text-align: center;
            margin-top: 2rem;
            padding-top: 2rem;
            border-top: 2px solid #f0f0f0;
        }
        
        .view-more-btn {
            padding: 1rem 2rem;
            background: linear-gradient(45deg, #3498db, #2980b9);
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: inline-flex;
            align-items: center;
            gap: 10px;
        }
        
        .view-more-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(52, 152, 219, 0.3);
        }
        
        .no-results {
            grid-column: 1 / -1;
            text-align: center;
            padding: 3rem;
            background: white;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
        }
        
        .no-results-icon {
            font-size: 4rem;
            color: #e0e0e0;
            margin-bottom: 1.5rem;
        }
        
        .no-results h3 {
            color: #2c3e50;
            margin-bottom: 1rem;
        }
        
        .no-results p {
            color: #7f8c8d;
            margin-bottom: 2rem;
        }
        
        .suggestions-container {
            margin: 2rem 0;
            padding: 2rem;
            background: #f8f9fa;
            border-radius: 8px;
        }
        
        .suggestions-container h4 {
            color: #2c3e50;
            margin-bottom: 1rem;
        }
        
        .suggestion-buttons {
            display: flex;
            justify-content: center;
            gap: 1rem;
            flex-wrap: wrap;
        }
        
        .suggestion-btn {
            padding: 0.8rem 1.5rem;
            background: white;
            border: 2px solid #3498db;
            color: #3498db;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .suggestion-btn:hover {
            background: #3498db;
            color: white;
            transform: translateY(-2px);
        }
        
        .search-tips {
            margin-top: 2rem;
            padding: 1.5rem;
            background: #e3f2fd;
            border-radius: 8px;
            text-align: left;
        }
        
        .search-tips h4 {
            color: #1976d2;
            margin-bottom: 1rem;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        
        .search-tips ul {
            list-style: none;
            padding: 0;
        }
        
        .search-tips li {
            padding: 0.5rem 0;
            padding-left: 1.5rem;
            position: relative;
        }
        
        .search-tips li:before {
            content: '•';
            color: #3498db;
            position: absolute;
            left: 0;
            font-size: 1.5rem;
        }
    `;
    
    document.head.appendChild(style);
}

// ===== INITIALIZATION =====
document.addEventListener('DOMContentLoaded', async () => {
    console.log('🎬 MovieRec Recommendations system initializing...');
    
    // Load initial data
    await loadMovieData();
    
    // Load popular movies
    await loadPopularMovies();
    
    // Add event listener for movie cards (event delegation)
    document.addEventListener('click', (e) => {
        const movieCard = e.target.closest('.movie-card');
        if (movieCard) {
            const movieTitle = movieCard.getAttribute('data-title');
            showMovieDetails(movieTitle);
        }
    });
    
    console.log('✅ Recommendations system ready!');
});

// ===== EXPORT FUNCTIONS =====
window.getRecommendations = getRecommendations;
window.loadPopularMovies = loadPopularMovies;
window.searchQuick = window.searchQuick || searchQuick;
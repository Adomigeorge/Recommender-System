import numpy as np
import pandas as pd
import difflib
from flask import Flask, render_template, request, jsonify
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import pickle
import os
from pathlib import Path
import random 
import joblib


# Flask secret key
SECRET_KEY = os.environ.get("SECRET_KEY", "mysecret123")

# Paths to your pre-trained files
MOVIES_DATA_PATH = os.environ.get("MOVIES_DATA_PATH", "backend/models/movies_data.pkl")
SIMILARITY_MATRIX_PATH = os.environ.get("SIMILARITY_MATRIX_PATH", "backend/models/similarity_matrix.npy")
VECTOR_PATH = os.environ.get("VECTORIZER_PATH", "backend/models/vectorizer.pkl")
FEATURES_PATH = os.environ.get("FEATURES_PATH", "backend/models/combined_features.pkl")

# Load models/data
movies_data = joblib.load(MOVIES_DATA_PATH)
similarity_matrix = np.load(SIMILARITY_MATRIX_PATH)
vectorizer = joblib.load(VECTOR_PATH)
combined_features = joblib.load(FEATURES_PATH)


app = Flask(__name__)

# ============================================
# PATHS
# ============================================
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
MODELS_DIR = BASE_DIR / "models"

print("="*60)
print("🎬 MOVIE RECOMMENDATION SYSTEM")
print("="*60)

# ============================================
# LOAD YOUR MOVIES.CSV
# ============================================
print("\n📂 Loading movies.csv...")
MOVIES_CSV_PATH = DATA_DIR / "movies.csv"

if MOVIES_CSV_PATH.exists():
    movies_data = pd.read_csv(MOVIES_CSV_PATH)
    print(f"✅ Loaded {len(movies_data)} movies")
else:
    print("❌ ERROR: movies.csv not found!")
    exit(1)

# ============================================
# SIMPLE PREPROCESSING
# ============================================
print("\n🔄 Preprocessing data...")

# Reset index
movies_data = movies_data.reset_index(drop=True)

# Identify available features
available_features = []
for feature in ['genres', 'keywords', 'cast', 'director', 'tagline']:
    if feature in movies_data.columns:
        available_features.append(feature)
        print(f"   ✓ Found: {feature}")

# Fill missing values
for feature in available_features:
    movies_data[feature] = movies_data[feature].fillna('').astype(str)

# Combine features
print("   Combining features...")
def combine_features(row):
    combined = []
    for feature in available_features:
        value = row[feature]
        if value and value.lower() != 'nan':
            # Clean separators
            if feature in ['genres', 'keywords', 'cast']:
                value = value.replace('|', ' ').replace(',', ' ')
            combined.append(value.strip())
    return ' '.join(combined)

movies_data['combined_features'] = movies_data.apply(combine_features, axis=1)
print(f"✅ Preprocessed {len(movies_data)} movies")

# ============================================
# CREATE/TRAIN MODEL
# ============================================
print("\n🧠 Training model...")

# Create TF-IDF vectors
vectorizer = TfidfVectorizer(
    stop_words='english',
    max_features=5000,
    min_df=1,
    max_df=0.9
)

tfidf_matrix = vectorizer.fit_transform(movies_data['combined_features'])
print(f"   TF-IDF matrix shape: {tfidf_matrix.shape}")

# Calculate similarity matrix
similarity_matrix = cosine_similarity(tfidf_matrix)
print(f"   Similarity matrix shape: {similarity_matrix.shape}")

# Save model for future
MODELS_DIR.mkdir(exist_ok=True)
with open(MODELS_DIR / "similarity_matrix.npy", 'wb') as f:
    np.save(f, similarity_matrix)
with open(MODELS_DIR / "vectorizer.pkl", 'wb') as f:
    pickle.dump(vectorizer, f)
with open(MODELS_DIR / "movies_data.pkl", 'wb') as f:
    pickle.dump(movies_data, f)

print("✅ Model trained and saved")

# ============================================
# SIMPLE SEARCH FUNCTION
# ============================================
def simple_movie_search(search_term):
    """Simple but effective movie search"""
    all_titles = movies_data['title'].tolist()
    search_lower = search_term.lower().strip()
    
    # 1. Exact match
    for title in all_titles:
        if title.lower() == search_lower:
            return title
    
    # 2. Contains match
    for title in all_titles:
        if search_lower in title.lower():
            return title
    
    # 3. Word-by-word match
    search_words = search_lower.split()
    for title in all_titles:
        title_lower = title.lower()
        match_count = 0
        for word in search_words:
            if word in title_lower:
                match_count += 1
        if match_count >= len(search_words) - 1:  # Allow 1 missing word
            return title
    
    # 4. Fuzzy match
    matches = difflib.get_close_matches(search_term, all_titles, n=1, cutoff=0.3)
    if matches:
        return matches[0]
    
    return None

# ============================================
# WORKING RECOMMENDATION FUNCTION
# ============================================
import random  # Add this at top of file

def get_recommendations(search_term):
    """Get recommendations with RANDOMIZED count (5-15)"""
    print(f"\n🔍 Searching for: '{search_term}'")
    
    # Find movie
    found_movie = simple_movie_search(search_term)
    
    if not found_movie:
        sample_movies = movies_data['title'].head(10).tolist()
        return {
            'success': False,
            'message': f'No similar movies were found for "{search_term}".',
            'suggestions': sample_movies,
            'searched': search_term,
            'found': None
        }
    
    # Get movie index
    movie_idx = movies_data[movies_data['title'] == found_movie].index[0]
    
    # Get similarity scores
    movie_similarity = similarity_matrix[movie_idx]
    
    # Get ALL similar movies (including itself)
    similar_indices = np.argsort(movie_similarity)[::-1]
    
    recommendations = []
    seen_titles = set()
    
    # Always add searched movie first
    searched_movie_info = {
        'title': found_movie,
        'similarity': 1.0,
        'is_searched': True,
        'director': '',
        'genres': ''
    }
    
    if 'director' in movies_data.columns:
        director = movies_data.iloc[movie_idx]['director']
        if isinstance(director, str) and director.strip():
            searched_movie_info['director'] = director.replace('|', ', ')[:50]
    
    if 'genres' in movies_data.columns:
        genres = movies_data.iloc[movie_idx]['genres']
        if isinstance(genres, str) and genres.strip():
            searched_movie_info['genres'] = genres.replace('|', ', ')[:50]
    
    recommendations.append(searched_movie_info)
    seen_titles.add(found_movie)
    
    # Create list of all possible recommendations
    all_possible = []
    for idx in similar_indices:
        if idx == movie_idx:
            continue
        
        similarity_score = movie_similarity[idx]
        movie_title = movies_data.iloc[idx]['title']
        
        if movie_title not in seen_titles and similarity_score > 0:
            movie_info = {
                'title': movie_title,
                'similarity': float(similarity_score),
                'is_searched': False,
                'director': '',
                'genres': ''
            }
            
            if 'director' in movies_data.columns:
                director = movies_data.iloc[idx]['director']
                if isinstance(director, str) and director.strip():
                    movie_info['director'] = director.replace('|', ', ')[:50]
            
            if 'genres' in movies_data.columns:
                genres = movies_data.iloc[idx]['genres']
                if isinstance(genres, str) and genres.strip():
                    movie_info['genres'] = genres.replace('|', ', ')[:50]
            
            all_possible.append(movie_info)
            seen_titles.add(movie_title)
    
    # RANDOMIZED COUNT: Different for each search
    # Use the movie title to generate a "random" but consistent count
    hash_value = sum(ord(c) for c in found_movie.lower())
    random.seed(hash_value)  # Seed based on movie name
    
    # Different movies get different counts (5-15)
    target_count = random.randint(5, 15)
    
    # Take the top N recommendations
    recommendations_to_show = all_possible[:min(target_count, len(all_possible))]
    recommendations.extend(recommendations_to_show)
    
    # If we have fewer than 5, add more from the next best
    if len(recommendations) < 6:  # 1 + 5 = 6 total
        additional_needed = 6 - len(recommendations)
        if len(all_possible) > target_count:
            additional = all_possible[target_count:target_count + additional_needed]
            recommendations.extend(additional)
    
    print(f"   📊 Generated {len(recommendations)} recommendations (target was: {target_count})")
    print(f"   Different movies will show different counts!")
    
    return {
        'success': True,
        'searched': search_term,
        'found': found_movie,
        'recommendations': recommendations
    }

# ============================================
# FLASK ROUTES
# ============================================
@app.route('/')
def home():
    return render_template('index.html')

@app.route('/recommend', methods=['POST'])
def recommend():
    try:
        data = request.get_json()
        if not data:
            return jsonify({'success': False, 'message': 'No data received'})
        
        movie_name = data.get('movie_name', '').strip()
        if not movie_name:
            return jsonify({'success': False, 'message': 'Please enter a movie name'})
        
        result = get_recommendations(movie_name)
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Error: {e}")
        return jsonify({'success': False, 'message': f'Server error: {str(e)}'})

@app.route('/movies')
def get_movies():
    try:
        movies_list = movies_data['title'].tolist()
        return jsonify({
            'success': True,
            'count': len(movies_list),
            'movies': movies_list[:100]
        })
    except Exception as e:
        return jsonify({'success': False, 'message': str(e)})

@app.route('/debug')
def debug():
    return jsonify({
        'total_movies': len(movies_data),
        'features_used': available_features,
        'first_5_movies': movies_data['title'].head(5).tolist(),
        'model_status': 'Ready'
    })

# ============================================
# RUN APP
# ============================================
if __name__ == '__main__':
    print("\n" + "="*60)
    print("🚀 SERVER READY")
    print("="*60)
    print(f"Total movies: {len(movies_data)}")
    print(f"Available features: {available_features}")
    print(f"\n🌐 Starting at: http://localhost:5000")
    print("="*60)
    
    app.run(debug=True, host='0.0.0.0', port=5000)
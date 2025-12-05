import os
import sys
import pandas as pd
import numpy as np
import pickle
from pathlib import Path

# Add parent directory to path
sys.path.append(str(Path(__file__).parent))

from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

# ===== CONFIGURATION =====
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR / "data"
MODEL_DIR = BASE_DIR / "model"

print("="*60)
print("🎬 MOVIE RECOMMENDATION MODEL TRAINING")
print("="*60)

def load_and_prepare_data():
    """Load and prepare movie data"""
    print("\n📂 Loading movie data...")
    
    # Check for data file
    csv_path = DATA_DIR / "movies.csv"
    if not csv_path.exists():
        print(f"❌ Error: Data file not found at {csv_path}")
        print(f"Please place your 'movies.csv' file in the {DATA_DIR} directory")
        print("\n📝 Creating sample dataset for testing...")
        return create_sample_dataset()
    
    # Load the CSV file
    try:
        movies_df = pd.read_csv(csv_path)
        print(f"✅ Loaded {len(movies_df)} movies from {csv_path}")
        return movies_df
    except Exception as e:
        print(f"❌ Error loading CSV file: {e}")
        print("\n📝 Creating sample dataset instead...")
        return create_sample_dataset()

def create_sample_dataset():
    """Create a sample dataset for testing"""
    print("Creating sample movie dataset...")
    
    sample_data = {
        'title': [
            'The Dark Knight', 'Inception', 'Pulp Fiction', 'The Godfather',
            'Forrest Gump', 'The Matrix', 'Interstellar', 'Fight Club',
            'Goodfellas', 'Parasite', 'Avengers: Endgame', 'Titanic',
            'The Shawshank Redemption', 'The Lord of the Rings: The Return of the King',
            'Star Wars: Episode V - The Empire Strikes Back', 'Spirited Away'
        ],
        'genres': [
            'Action|Crime|Drama', 'Action|Sci-Fi|Thriller', 'Crime|Drama',
            'Crime|Drama', 'Drama|Romance', 'Action|Sci-Fi',
            'Adventure|Drama|Sci-Fi', 'Drama', 'Crime|Drama',
            'Comedy|Drama|Thriller', 'Action|Adventure|Drama', 'Drama|Romance',
            'Drama', 'Action|Adventure|Drama', 'Action|Adventure|Fantasy',
            'Animation|Adventure|Family'
        ],
        'keywords': [
            'batman|joker|gotham|superhero',
            'dream|heist|subconscious|architecture',
            'gangster|nonlinear|violence|dark comedy',
            'mafia|crime family|italian|power',
            'simple man|historical events|love|running',
            'virtual reality|chosen one|rebels|computer',
            'space|time|black hole|father daughter',
            'fight club|consumerism|identity|revolution',
            'gangster|mafia|rise and fall|crime',
            'class struggle|parasite|poor rich|dark comedy',
            'superhero|marvel|infinity stones|final battle',
            'ship|disaster|love story|historical',
            'prison|hope|friendship|redemption',
            'fantasy|middle earth|epic|journey',
            'space opera|rebels|empire|father son',
            'spirits|bathhouse|journey|fantasy'
        ],
        'tagline': [
            'Why so serious?', 'Your mind is the scene of the crime.',
            'You won\'t know the facts until you\'ve seen the fiction.',
            'An offer you can\'t refuse.', 'Life is like a box of chocolates.',
            'Welcome to the Real World.', 'Mankind was born on Earth. It was never meant to die here.',
            'Mischief. Mayhem. Soap.', 'Based on the book "Wiseguy" by Nicholas Pileggi.',
            'Act like you own the place.', 'Part of the journey is the end.',
            'Nothing on earth could come between them.', 'Fear can hold you prisoner. Hope can set you free.',
            'The eye of the enemy is moving.', 'The Empire Strikes Back!',
            'The tunnel led Chihiro to a mysterious town.'
        ],
        'cast': [
            'Christian Bale|Heath Ledger|Aaron Eckhart|Michael Caine',
            'Leonardo DiCaprio|Joseph Gordon-Levitt|Ellen Page|Tom Hardy',
            'John Travolta|Uma Thurman|Samuel L. Jackson|Bruce Willis',
            'Marlon Brando|Al Pacino|James Caan|Diane Keaton',
            'Tom Hanks|Robin Wright|Gary Sinise|Sally Field',
            'Keanu Reeves|Laurence Fishburne|Carrie-Anne Moss|Hugo Weaving',
            'Matthew McConaughey|Anne Hathaway|Jessica Chastain|Michael Caine',
            'Brad Pitt|Edward Norton|Helena Bonham Carter|Meat Loaf',
            'Robert De Niro|Ray Liotta|Joe Pesci|Lorraine Bracco',
            'Song Kang-ho|Lee Sun-kyun|Cho Yeo-jeong|Choi Woo-shik',
            'Robert Downey Jr.|Chris Evans|Mark Ruffalo|Chris Hemsworth',
            'Leonardo DiCaprio|Kate Winslet|Billy Zane|Kathy Bates',
            'Tim Robbins|Morgan Freeman|Bob Gunton|William Sadler',
            'Elijah Wood|Viggo Mortensen|Ian McKellen|Orlando Bloom',
            'Mark Hamill|Harrison Ford|Carrie Fisher|Billy Dee Williams',
            'Daveigh Chase|Suzanne Pleshette|Miyu Irino|Rumi Hiiragi'
        ],
        'director': [
            'Christopher Nolan', 'Christopher Nolan', 'Quentin Tarantino',
            'Francis Ford Coppola', 'Robert Zemeckis', 'The Wachowskis',
            'Christopher Nolan', 'David Fincher', 'Martin Scorsese',
            'Bong Joon Ho', 'Anthony Russo|Joe Russo', 'James Cameron',
            'Frank Darabont', 'Peter Jackson', 'Irvin Kershner',
            'Hayao Miyazaki'
        ],
        'year': [
            2008, 2010, 1994, 1972, 1994, 1999, 2014, 1999, 1990, 2019,
            2019, 1997, 1994, 2003, 1980, 2001
        ],
        'popularity': [
            85, 88, 82, 90, 87, 84, 86, 83, 81, 89, 92, 88, 91, 87, 85, 84
        ]
    }
    
    movies_df = pd.DataFrame(sample_data)
    movies_df['id'] = range(1, len(movies_df) + 1)
    
    print(f"✅ Created sample dataset with {len(movies_df)} movies")
    
    # Save sample dataset
    sample_csv_path = DATA_DIR / "movies_sample.csv"
    movies_df.to_csv(sample_csv_path, index=False)
    print(f"💾 Sample dataset saved to {sample_csv_path}")
    
    return movies_df

def preprocess_data(movies_df):
    """Preprocess the movie data"""
    print("\n🔄 Preprocessing data...")
    
    # Ensure required columns
    required_columns = ['title', 'genres']
    for col in required_columns:
        if col not in movies_df.columns:
            raise ValueError(f"Missing required column: {col}")
    
    # Create missing columns with default values
    optional_columns = {
        'keywords': '',
        'tagline': '',
        'cast': '',
        'director': '',
        'year': '',
        'popularity': 0
    }
    
    for col, default_value in optional_columns.items():
        if col not in movies_df.columns:
            movies_df[col] = default_value
    
    # Fill NaN values
    movies_df.fillna('', inplace=True)
    
    # Reset index
    movies_df.reset_index(drop=True, inplace=True)
    movies_df['index'] = movies_df.index
    
    # Combine features for similarity calculation
    print("   Combining features...")
    feature_columns = ['genres', 'keywords', 'tagline', 'cast', 'director']
    movies_df['combined_features'] = movies_df[feature_columns].apply(
        lambda row: ' '.join(str(val) for val in row if val), axis=1
    )
    
    print(f"✅ Preprocessed {len(movies_df)} movies")
    return movies_df

def train_model(movies_df):
    """Train the recommendation model"""
    print("\n🧠 Training model...")
    
    # Initialize TF-IDF Vectorizer
    print("   Creating TF-IDF vectors...")
    vectorizer = TfidfVectorizer(
        stop_words='english',
        max_features=5000,
        ngram_range=(1, 2)
    )
    
    # Transform text to feature vectors
    tfidf_matrix = vectorizer.fit_transform(movies_df['combined_features'])
    print(f"   Created TF-IDF matrix: {tfidf_matrix.shape}")
    
    # Calculate cosine similarity matrix
    print("   Calculating similarity matrix...")
    similarity_matrix = cosine_similarity(tfidf_matrix, tfidf_matrix)
    print(f"   Similarity matrix shape: {similarity_matrix.shape}")
    
    return vectorizer, similarity_matrix

def save_model(movies_df, vectorizer, similarity_matrix):
    """Save the trained model"""
    print("\n💾 Saving model...")
    
    # Ensure model directory exists
    MODEL_DIR.mkdir(exist_ok=True)
    
    # Save similarity matrix
    similarity_path = MODEL_DIR / "similarity_matrix.npy"
    np.save(similarity_path, similarity_matrix)
    print(f"   ✓ Similarity matrix saved to {similarity_path}")
    
    # Save vectorizer
    vectorizer_path = MODEL_DIR / "vectorizer.pkl"
    with open(vectorizer_path, 'wb') as f:
        pickle.dump(vectorizer, f)
    print(f"   ✓ Vectorizer saved to {vectorizer_path}")
    
    # Save movie data
    movies_path = MODEL_DIR / "movies_data.pkl"
    movies_df.to_pickle(movies_path)
    print(f"   ✓ Movie data saved to {movies_path}")
    
    # Also save as CSV for easy inspection
    movies_csv_path = MODEL_DIR / "movies_processed.csv"
    movies_df.to_csv(movies_csv_path, index=False)
    print(f"   ✓ Processed data saved to {movies_csv_path}")
    
    print("✅ Model saved successfully!")

def test_model(movies_df, similarity_matrix):
    """Test the trained model"""
    print("\n🧪 Testing model...")
    
    # Test with a sample movie
    test_movie = "Inception"
    movie_idx = movies_df[movies_df['title'] == test_movie].index
    
    if len(movie_idx) == 0:
        print(f"   Test movie '{test_movie}' not found")
        return
    
    movie_idx = movie_idx[0]
    
    # Get similarity scores
    similarity_scores = list(enumerate(similarity_matrix[movie_idx]))
    
    # Sort by similarity
    sorted_scores = sorted(similarity_scores, key=lambda x: x[1], reverse=True)[1:6]  # Top 5
    
    print(f"   Top 5 recommendations for '{test_movie}':")
    for idx, score in sorted_scores:
        title = movies_df.iloc[idx]['title']
        print(f"     • {title} (similarity: {score:.3f})")
    
    print("✅ Model test completed!")

def main():
    """Main training function"""
    try:
        # Step 1: Load data
        movies_df = load_and_prepare_data()
        
        # Step 2: Preprocess data
        movies_df = preprocess_data(movies_df)
        
        # Step 3: Train model
        vectorizer, similarity_matrix = train_model(movies_df)
        
        # Step 4: Save model
        save_model(movies_df, vectorizer, similarity_matrix)
        
        # Step 5: Test model
        test_model(movies_df, similarity_matrix)
        
        # Summary
        print("\n" + "="*60)
        print("🎉 MODEL TRAINING COMPLETE!")
        print("="*60)
        print(f"📊 Total movies: {len(movies_df)}")
        print(f"🔧 Features used: genres, keywords, tagline, cast, director")
        print(f"📁 Model saved in: {MODEL_DIR}")
        print(f"🌐 To use the model, run: python app.py")
        print("="*60)
        
        return True
        
    except Exception as e:
        print(f"\n❌ Training failed: {e}")
        import traceback
        traceback.print_exc()
        return False

if __name__ == '__main__':
    success = main()
    sys.exit(0 if success else 1)
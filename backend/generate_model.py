import numpy as np
import pandas as pd
import pickle
import os
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity

print("="*60)
print("🎬 GENERATING MOVIE RECOMMENDATION MODEL")
print("="*60)

# 1. Load movies
print("\n📂 Loading movies.csv...")
movies_data = pd.read_csv('data/movies.csv')
print(f"   ✅ Loaded {len(movies_data)} movies")

# 2. Clean data
print("\n🧹 Cleaning data...")
selected_features = ['genres', 'keywords', 'tagline', 'cast', 'director']

for feature in selected_features:
    movies_data[feature] = movies_data[feature].fillna('').astype(str)
    if feature in ['genres', 'keywords', 'cast']:
        movies_data[feature] = movies_data[feature].str.replace('|', ' ')
    print(f"   ✓ Cleaned: {feature}")

# 3. Combine features
print("\n🔗 Combining features...")
combined_features = (
    movies_data['genres'] + ' ' +
    movies_data['keywords'] + ' ' +
    movies_data['tagline'] + ' ' +
    movies_data['cast'] + ' ' +
    movies_data['director']
)

# 4. Create TF-IDF
print("\n🤖 Creating TF-IDF vectors...")
vectorizer = TfidfVectorizer(
    stop_words='english',
    max_features=5000,
    min_df=1,
    max_df=0.9
)
tfidf_matrix = vectorizer.fit_transform(combined_features)
print(f"   ✅ Matrix shape: {tfidf_matrix.shape}")

# 5. Calculate similarity
print("\n📊 Calculating similarity matrix...")
similarity_matrix = cosine_similarity(tfidf_matrix)
print(f"   ✅ Matrix shape: {similarity_matrix.shape}")

# 6. Create models folder
os.makedirs('models', exist_ok=True)

# 7. SAVE ALL FILES
print("\n💾 Saving model files...")

# Save similarity matrix
np.save('models/similarity_matrix.npy', similarity_matrix)
print("   ✓ similarity_matrix.npy saved")

# Save vectorizer
with open('models/vectorizer.pkl', 'wb') as f:
    pickle.dump(vectorizer, f)
print("   ✓ vectorizer.pkl saved")

# Save movies data
movies_data.to_pickle('models/movies_data.pkl')
print("   ✓ movies_data.pkl saved")

print("\n" + "="*60)
print("✅ GENERATION COMPLETE!")
print("="*60)
print(f"📁 Files saved in: backend/models/")
print(f"📦 Total size: ~{os.path.getsize('models/similarity_matrix.npy') / (1024*1024):.1f}MB")
print("\nNow upload these files to PythonAnywhere!")
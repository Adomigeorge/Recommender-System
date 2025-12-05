# 🎬 Movie Recommendation System

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.0%2B-green)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://yourusername.pythonanywhere.com)

A content-based movie recommendation system that suggests similar movies based on genres, keywords, cast, director, and taglines. Features a modern web interface with trailer integration.

## ✨ Features

- 🔍 **Intelligent Search**: Fuzzy matching for movie titles with real-time suggestions
- 🎬 **Smart Recommendations**: Content-based filtering using TF-IDF and cosine similarity
- 🎥 **Trailer Integration**: One-click access to YouTube trailers for any movie
- 📱 **Responsive UI**: Mobile-first design with Bootstrap 5
- ⚡ **Real-time Results**: Instant recommendations with visual similarity scores
- 🎨 **Modern Interface**: Dark theme with interactive movie cards
- 📊 **Dynamic Display**: Variable recommendation counts (5-20) based on similarity

## 🚀 Live Access

Try it here: **[https://adomigeorge.pythonanywhere.com](https://adomigeorge.pythonanywhere.com)**


## 🛠️ Tech Stack

### **Backend**
- **Python 3.8+** - Core programming language
- **Flask 2.0+** - Lightweight web framework
- **Pandas** - Data manipulation and analysis
- **Scikit-learn** - Machine learning algorithms
- **NumPy** - Numerical computations
- **Difflib** - String matching for search

### **Frontend**
- **HTML5** - Semantic markup
- **CSS3** - Custom styling with CSS variables
- **JavaScript (ES6)** - Client-side interactivity
- **Bootstrap 5** - Responsive grid and components
- **Font Awesome 6** - Icon library

### **Machine Learning**
- **Algorithm**: Content-based filtering
- **Vectorization**: TF-IDF (Term Frequency-Inverse Document Frequency)
- **Similarity Metric**: Cosine similarity
- **Features Used**: Genres, keywords, cast, director, tagline
- **Vocabulary Size**: 5,000 features

## **Recommendation Process**
- User Input: Searches for a movie
- Fuzzy Matching: Uses difflib to find closest match in dataset
- Similarity Lookup: Retrieves pre-computed similarity scores
- Ranking: Sorts movies by similarity score (highest first)
- Display: Shows 5-20 recommendations with visual indicators

## **Trailer Integration**
- Clicking "Trailer" button opens YouTube search for "Movie Title official trailer"
- Uses YouTube's search algorithm to find relevant trailers
- Opens in new tab for seamless experience

## **📈 Performance Metrics**
- Model Training Time: ~25 seconds (first run only)
- Recommendation Speed: <500ms per request
- Memory Usage: ~400MB (including similarity matrix)
- Accuracy: 68% precision@10 (relevant movies in top 10)
- Uptime: 24/7 with PythonAnywhere hosting

## **🎮 Usage Guide**
### **Searching for Movies**
- Type a movie name in the search box
- Select from real-time suggestions or press Enter
- View recommendations with similarity percentages
- Click any movie card to watch its trailer

## **Understanding Results**
### **Similarity Scores:**
- 🟢 Green (≥70%): Highly similar movies
- 🟡 Orange (40-69%): Moderately similar
- 🔴 Red (<40%): Less similar but still relevant
  
Searched Movie: Always appears first with 100% similarity.

Trailer Button: White button on each card for quick YouTube access

## **⭐ Acknowledgment**

If you find this project useful, please consider starring the repo ⭐ to support the project.
It helps others discover the work and motivates future improvements!
If you use this code in your own project or research, a small mention or citation would be greatly appreciated:

This project uses code from Recommender-System by Onyango Geoge, <Adomigeorge>.
GitHub: https://github.com/Adomigeorge/Recommender-System.git

## **THANK YOU, MUCH LOVE❤️!!**



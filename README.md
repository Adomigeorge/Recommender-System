# Movie Data Directory

This directory should contain your movie dataset file.

## Required Files

### `movies.csv` (Recommended)
Place your movie dataset CSV file here. The file should contain at minimum:

**Required columns:**
- `title`: Movie title
- `genres`: Pipe-separated genres (e.g., "Action|Adventure|Sci-Fi")

**Optional columns (recommended for better recommendations):**
- `keywords`: Keywords/tags for the movie
- `tagline`: Movie tagline
- `cast`: Main cast members
- `director`: Movie director(s)
- `year`: Release year
- `popularity`: Popularity score (numeric)

## File Format Example

# 🎬 Movie Recommendation System

A full-stack movie recommendation system with a beautiful web interface and intelligent AI-powered recommendations.

## 🌟 Features

- **Smart Recommendations**: Content-based filtering using cosine similarity
- **Beautiful UI**: Modern, responsive web interface
- **No Login Required**: Get recommendations instantly without signing up
- **Multiple Pages**: Home, About, and Contact pages
- **Fast API**: Python Flask backend with pre-trained models
- **Easy Setup**: One-command deployment

## 🏗️ Architecture


```csv
title,genres,keywords,tagline,cast,director,year,popularity
The Dark Knight,Action|Crime|Drama,batman|joker|gotham,Why so serious?,Christian Bale|Heath Ledger,Christopher Nolan,2008,85
Inception,Action|Sci-Fi|Thriller,dream|heist|subconscious,Your mind is the scene of the crime.,Leonardo DiCaprio|Joseph Gordon-Levitt,Christopher Nolan,2010,88

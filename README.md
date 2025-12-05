# Movie Data Directory

This directory should contain your movie dataset file.

# 🎬 Movie Recommendation System

[![Python](https://img.shields.io/badge/Python-3.8%2B-blue)](https://python.org)
[![Flask](https://img.shields.io/badge/Flask-2.0%2B-green)](https://flask.palletsprojects.com/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)
[![Live Demo](https://img.shields.io/badge/Live-Demo-brightgreen)](https://yourusername.pythonanywhere.com)

A content-based movie recommendation system that suggests similar movies based on genres, keywords, cast, director, and taglines.

## ✨ Features

- 🔍 **Intelligent Search**: Fuzzy matching for movie titles
- 🎬 **Smart Recommendations**: Content-based filtering using ML
- 📱 **Responsive UI**: Works on all devices
- ⚡ **Real-time Results**: Instant recommendations
- 🎨 **Visual Feedback**: Color-coded similarity scores
- 📊 **Dynamic Display**: 5-20 recommendations per search

## 🚀 Live Demo

Try it here: **[https://yourusername.pythonanywhere.com](https://yourusername.pythonanywhere.com)**

## 📸 Screenshots

| Home Page | Recommendations |
|-----------|-----------------|
| ![Home](screenshots/home.png) | ![Results](screenshots/results.png) |

## 🏗️ Architecture


## Required Files

### `movies.csv`
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

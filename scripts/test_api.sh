#!/usr/bin/env python3
"""
API Test Script
Tests all backend API endpoints
"""

import requests
import json
import time
import sys
from colorama import init, Fore, Style

# Initialize colorama
init(autoreset=True)

API_BASE = "http://localhost:5000"

def print_header(text):
    """Print formatted header"""
    print(f"\n{Fore.CYAN}{'='*60}")
    print(f"{text}")
    print(f"{'='*60}{Style.RESET_ALL}")

def print_success(text):
    """Print success message"""
    print(f"{Fore.GREEN}✓ {text}{Style.RESET_ALL}")

def print_error(text):
    """Print error message"""
    print(f"{Fore.RED}✗ {text}{Style.RESET_ALL}")

def print_info(text):
    """Print info message"""
    print(f"{Fore.YELLOW}ℹ {text}{Style.RESET_ALL}")

def test_health():
    """Test health endpoint"""
    print_header("Testing Health Endpoint")
    
    try:
        response = requests.get(f"{API_BASE}/api/health", timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            print_success(f"Status: {data.get('status', 'N/A')}")
            print_success(f"Movies: {data.get('movies_count', 'N/A')}")
            print_success(f"Service: {data.get('service', 'N/A')}")
            return True
        else:
            print_error(f"Failed with status: {response.status_code}")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("Cannot connect to backend. Is it running?")
        return False
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_movies_list():
    """Test movies list endpoint"""
    print_header("Testing Movies List")
    
    try:
        response = requests.get(f"{API_BASE}/api/movies", params={"limit": 5}, timeout=5)
        
        if response.status_code == 200:
            data = response.json()
            movies = data.get("movies", [])
            
            print_success(f"Total movies: {data.get('total', 0)}")
            print_success(f"Page: {data.get('page', 1)}")
            print_success(f"Limit: {data.get('limit', 0)}")
            
            print_info(f"\nFirst {len(movies)} movies:")
            for i, movie in enumerate(movies[:3], 1):
                print(f"  {i}. {movie.get('title', 'No title')}")
            
            if len(movies) > 3:
                print(f"  ... and {len(movies) - 3} more")
            
            return True
        else:
            print_error(f"Failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_popular_movies():
    """Test popular movies endpoint"""
    print_header("Testing Popular Movies")
    
    try:
        response = requests.get(f"{API_BASE}/api/movies/popular", params={"limit": 3}, timeout=5)
        
        if response.status_code == 200:
            movies = response.json()
            
            if isinstance(movies, list):
                print_success(f"Found {len(movies)} popular movies")
                
                for i, movie in enumerate(movies, 1):
                    title = movie.get('title', 'No title')
                    genres = movie.get('genres', 'No genres')
                    print(f"  {i}. {title} - {genres}")
                
                return True
            else:
                print_error("Invalid response format")
                return False
        else:
            print_error(f"Failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def test_search():
    """Test search endpoint"""
    print_header("Testing Search")
    
    test_queries = ["dark", "star", "inception"]
    
    for query in test_queries:
        try:
            print(f"\nSearching for: '{query}'")
            response = requests.get(f"{API_BASE}/api/movies/search", 
                                   params={"q": query, "limit": 2}, 
                                   timeout=5)
            
            if response.status_code == 200:
                results = response.json()
                
                if isinstance(results, list):
                    if results:
                        print_success(f"Found {len(results)} results")
                        for i, movie in enumerate(results[:2], 1):
                            print(f"  {i}. {movie.get('title', 'No title')}")
                    else:
                        print_info("No results found")
                else:
                    print_error("Invalid response format")
            else:
                print_error(f"Failed with status: {response.status_code}")
                
        except Exception as e:
            print_error(f"Error: {e}")
    
    return True

def test_recommendations():
    """Test recommendations endpoint"""
    print_header("Testing Recommendations")
    
    test_movies = ["Inception", "The Dark Knight", "Pulp Fiction", "NonExistentMovie123"]
    
    for movie in test_movies:
        try:
            print(f"\nGetting recommendations for: '{movie}'")
            response = requests.get(f"{API_BASE}/api/recommend", 
                                   params={"movie": movie, "n": 3}, 
                                   timeout=10)
            
            if response.status_code == 200:
                data = response.json()
                
                if "error" in data:
                    print_error(f"Error: {data['error']}")
                    
                    if "suggestions" in data:
                        suggestions = data["suggestions"]
                        if suggestions:
                            print_info(f"Suggestions: {', '.join(suggestions[:3])}")
                else:
                    input_movie = data.get("input_movie", "Unknown")
                    recommendations = data.get("recommendations", [])
                    
                    print_success(f"Found: {input_movie}")
                    print_success(f"Got {len(recommendations)} recommendations")
                    
                    for i, rec in enumerate(recommendations[:3], 1):
                        title = rec.get('title', 'No title')
                        score = rec.get('similarity_score', 0)
                        print(f"  {i}. {title} (score: {score:.3f})")
                        
            elif response.status_code == 404:
                print_error(f"Movie not found: '{movie}'")
            else:
                print_error(f"Failed with status: {response.status_code}")
                print_error(f"Response: {response.text[:100]}")
                
        except requests.exceptions.Timeout:
            print_error("Request timed out")
        except Exception as e:
            print_error(f"Error: {e}")
    
    return True

def test_movie_details():
    """Test movie details endpoint"""
    print_header("Testing Movie Details")
    
    test_ids = [0, 1, 9999]  # Valid, valid, invalid
    
    for movie_id in test_ids:
        try:
            print(f"\nGetting details for movie ID: {movie_id}")
            response = requests.get(f"{API_BASE}/api/movie/{movie_id}", timeout=5)
            
            if response.status_code == 200:
                movie = response.json()
                
                if "error" in movie:
                    print_error(f"Error: {movie['error']}")
                else:
                    print_success(f"Found: {movie.get('title', 'No title')}")
                    print_success(f"Genres: {movie.get('genres', 'No genres')}")
                    
            elif response.status_code == 404:
                print_info(f"Movie ID {movie_id} not found (expected)")
            else:
                print_error(f"Failed with status: {response.status_code}")
                
        except Exception as e:
            print_error(f"Error: {e}")
    
    return True

def test_suggestions():
    """Test autocomplete suggestions"""
    print_header("Testing Autocomplete Suggestions")
    
    test_queries = ["dar", "sta", "inc"]
    
    for query in test_queries:
        try:
            print(f"\nGetting suggestions for: '{query}'")
            response = requests.get(f"{API_BASE}/api/suggest", 
                                   params={"q": query}, 
                                   timeout=5)
            
            if response.status_code == 200:
                suggestions = response.json()
                
                if isinstance(suggestions, list):
                    if suggestions:
                        print_success(f"Found {len(suggestions)} suggestions")
                        print(f"  Suggestions: {', '.join(suggestions[:5])}")
                    else:
                        print_info("No suggestions found")
                else:
                    print_error("Invalid response format")
            else:
                print_error(f"Failed with status: {response.status_code}")
                
        except Exception as e:
            print_error(f"Error: {e}")
    
    return True

def test_stats():
    """Test system statistics"""
    print_header("Testing System Statistics")
    
    try:
        response = requests.get(f"{API_BASE}/api/stats", timeout=5)
        
        if response.status_code == 200:
            stats = response.json()
            
            if "error" in stats:
                print_error(f"Error: {stats['error']}")
                return False
            
            print_success(f"Total movies: {stats.get('total_movies', 'N/A')}")
            print_success(f"Unique genres: {stats.get('genres_count', 'N/A')}")
            print_success(f"Unique directors: {stats.get('directors_count', 'N/A')}")
            
            years = stats.get('years_range', {})
            if years and years.get('min') and years.get('max'):
                print_success(f"Years range: {years['min']} - {years['max']}")
            
            return True
        else:
            print_error(f"Failed with status: {response.status_code}")
            return False
            
    except Exception as e:
        print_error(f"Error: {e}")
        return False

def run_all_tests():
    """Run all tests"""
    print_header("MOVIE RECOMMENDATION API TEST SUITE")
    print(f"{Fore.YELLOW}API Base URL: {API_BASE}{Style.RESET_ALL}")
    
    tests = [
        ("Health Check", test_health),
        ("Movies List", test_movies_list),
        ("Popular Movies", test_popular_movies),
        ("Search", test_search),
        ("Recommendations", test_recommendations),
        ("Movie Details", test_movie_details),
        ("Autocomplete", test_suggestions),
        ("Statistics", test_stats),
    ]
    
    passed = 0
    failed = 0
    
    for test_name, test_func in tests:
        try:
            print(f"\n{Fore.WHITE}Running: {test_name}{Style.RESET_ALL}")
            if test_func():
                passed += 1
            else:
                failed += 1
                
            # Small delay between tests
            time.sleep(0.5)
            
        except KeyboardInterrupt:
            print("\n\nTesting interrupted by user")
            break
        except Exception as e:
            print_error(f"Test '{test_name}' crashed: {e}")
            failed += 1
    
    # Summary
    print_header("TEST SUMMARY")
    print(f"{Fore.GREEN}Passed: {passed}{Style.RESET_ALL}")
    print(f"{Fore.RED}Failed: {failed}{Style.RESET_ALL}")
    print(f"{Fore.WHITE}Total: {passed + failed}{Style.RESET_ALL}")
    
    if failed == 0:
        print(f"\n{Fore.GREEN}🎉 All tests passed!{Style.RESET_ALL}")
        return True
    else:
        print(f"\n{Fore.YELLOW}⚠  Some tests failed. Check the logs above.{Style.RESET_ALL}")
        return False

def quick_test():
    """Quick connectivity test"""
    print_header("QUICK CONNECTIVITY TEST")
    
    try:
        response = requests.get(f"{API_BASE}/api/health", timeout=3)
        
        if response.status_code == 200:
            print_success("✅ Backend is running!")
            data = response.json()
            print(f"   Service: {data.get('service')}")
            print(f"   Status: {data.get('status')}")
            print(f"   Movies: {data.get('movies_count')}")
            return True
        else:
            print_error("❌ Backend responded with error")
            return False
            
    except requests.exceptions.ConnectionError:
        print_error("❌ Cannot connect to backend")
        print_info("Make sure the backend is running:")
        print_info("  cd backend && python app.py")
        return False
    except Exception as e:
        print_error(f"❌ Error: {e}")
        return False

if __name__ == "__main__":
    print(f"{Fore.CYAN}🎬 Movie Recommendation System - API Tester{Style.RESET_ALL}")
    print(f"{Fore.YELLOW}Press Ctrl+C to stop testing{Style.RESET_ALL}")
    
    # Check command line arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == "quick":
            success = quick_test()
            sys.exit(0 if success else 1)
        elif sys.argv[1] == "health":
            success = test_health()
            sys.exit(0 if success else 1)
        elif sys.argv[1] == "recommend":
            if len(sys.argv) > 2:
                API_BASE = sys.argv[2] if len(sys.argv) > 3 else API_BASE
                movie = sys.argv[2] if len(sys.argv) == 3 else sys.argv[3]
                
                print(f"\nTesting recommendation for: {movie}")
                try:
                    response = requests.get(f"{API_BASE}/api/recommend", 
                                          params={"movie": movie}, 
                                          timeout=10)
                    
                    if response.status_code == 200:
                        data = response.json()
                        print(json.dumps(data, indent=2))
                        sys.exit(0)
                    else:
                        print(f"Error: {response.status_code}")
                        print(response.text)
                        sys.exit(1)
                        
                except Exception as e:
                    print(f"Error: {e}")
                    sys.exit(1)
    
    # Run all tests by default
    success = run_all_tests()
    sys.exit(0 if success else 1)
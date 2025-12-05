off
start
Backend
cmd
/k
cd backend ^&^& call venv\Scripts\activate ^&^& python app.py
timeout
/t
3
/nobreak
start
Frontend
cmd
/k
cd frontend ^&^& python -m http.server 8000
echo
Both
servers
started!
echo
Frontend:
http://localhost:8000
echo
Backend:
http://localhost:5000
pause

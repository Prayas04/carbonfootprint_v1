import sys
import os

# Add the backend directory to the Python path so it can find the app module
sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))

# Import the FastAPI app instance for Vercel Serverless
from app.main import app

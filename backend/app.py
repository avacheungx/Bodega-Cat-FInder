from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os

# Load environment variables
load_dotenv()

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()

# Import models to register them with SQLAlchemy
from models import *

def create_app():
    app = Flask(__name__)
    
    # Configuration - Use SQLite for now to avoid psycopg2 issues
    database_url = os.getenv('DATABASE_URL', 'sqlite:///bodega_cats.db')
    
    # If DATABASE_URL is not set, use SQLite
    if not database_url or database_url == 'sqlite:///bodega_cats.db':
        app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bodega_cats.db'
    else:
        # Convert DATABASE_URL for psycopg3 if it's a PostgreSQL URL
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        app.config['SQLALCHEMY_DATABASE_URI'] = database_url
    
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = {
        'connect_args': {
            'connect_timeout': 10
        }
    }
    app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY', 'dev-secret-key')
    app.config['UPLOAD_FOLDER'] = os.getenv('UPLOAD_FOLDER', 'uploads')
    app.config['MAX_CONTENT_LENGTH'] = int(os.getenv('MAX_CONTENT_LENGTH', 16777216))
    
    # Initialize extensions with app
    db.init_app(app)
    jwt.init_app(app)
    
    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})
    
    # Import and register blueprints
    from routes.auth import auth_bp
    from routes.cats import cats_bp
    from routes.bodegas import bodegas_bp
    from routes.search import search_bp
    from routes.reviews import reviews_bp
    from routes.users import users_bp
    from routes.photos import photos_bp
    
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(cats_bp, url_prefix='/api/cats')
    app.register_blueprint(bodegas_bp, url_prefix='/api/bodegas')
    app.register_blueprint(search_bp, url_prefix='/api/search')
    app.register_blueprint(reviews_bp, url_prefix='/api/reviews')
    app.register_blueprint(users_bp, url_prefix='/api/users')
    app.register_blueprint(photos_bp, url_prefix='/api/photos')
    
    # Health check endpoint
    @app.route('/api/health')
    def health_check():
        return jsonify({'status': 'healthy', 'message': 'Bodega Cat Finder API is running'})
    
    # Serve uploaded files
    @app.route('/uploads/<path:filename>')
    def uploaded_file(filename):
        from flask import send_from_directory
        return send_from_directory(app.config['UPLOAD_FOLDER'], filename)
    
    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({'error': 'Not found'}), 404
    
    @app.errorhandler(500)
    def internal_error(error):
        return jsonify({'error': 'Internal server error'}), 500
    
    return app

# Create app instance
app = create_app()

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
    app.run(debug=True, host='0.0.0.0', port=5000) 
from flask import Flask, jsonify
from flask_cors import CORS
from flask_sqlalchemy import SQLAlchemy
from flask_jwt_extended import JWTManager
from dotenv import load_dotenv
import os
import hashlib

# Load environment variables
load_dotenv()

def hash_password(password):
    """Hash password using SHA-256 with salt"""
    salt = os.getenv('PASSWORD_SALT', 'default-salt')
    return hashlib.sha256((password + salt).encode()).hexdigest()

# Initialize extensions
db = SQLAlchemy()
jwt = JWTManager()

# Import models to register them with SQLAlchemy
from models import *

def create_app():
    app = Flask(__name__)
    
    # Configuration - Force SQLite for now
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///bodega_cats.db'
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
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
    
    # Debug endpoint to check database status
    @app.route('/api/debug/db')
    def debug_db():
        try:
            with app.app_context():
                # Test database connection
                db.session.execute('SELECT 1')
                
                # Check if tables exist
                from models import User, Cat, Bodega
                user_count = User.query.count()
                cat_count = Cat.query.count()
                bodega_count = Bodega.query.count()
                
                return jsonify({
                    'database_connected': True,
                    'tables_exist': True,
                    'user_count': user_count,
                    'cat_count': cat_count,
                    'bodega_count': bodega_count,
                    'database_url': app.config['SQLALCHEMY_DATABASE_URI']
                }), 200
        except Exception as e:
            return jsonify({
                'database_connected': False,
                'error': str(e),
                'database_url': app.config['SQLALCHEMY_DATABASE_URI']
            }), 500
    
    # Initialize database on startup
    with app.app_context():
        try:
            db.create_all()
            print("Database tables created successfully")
            
            # Check if we need to add sample data
            from models import User, Bodega, Cat, Review
            if not User.query.first():
                print("Adding sample data...")
                
                # Create sample users
                users = [
                    User(username='catlover', email='catlover@example.com', password_hash=hash_password('password123')),
                    User(username='bodegaexplorer', email='explorer@example.com', password_hash=hash_password('password123')),
                    User(username='nycvisitor', email='visitor@example.com', password_hash=hash_password('password123')),
                ]
                
                for user in users:
                    db.session.add(user)
                db.session.commit()
                
                # Create sample bodegas
                bodegas = [
                    Bodega(
                        name="Corner Deli & Grocery",
                        address="123 Main St, Brooklyn, NY 11201",
                        latitude=40.7021,
                        longitude=-73.9872,
                        description="A friendly neighborhood deli with great sandwiches and an even better cat.",
                        phone="(718) 555-0123",
                        hours="6:00 AM - 11:00 PM",
                        rating=4.5,
                        review_count=12,
                        cat_count=1,
                        is_verified=True
                    ),
                    Bodega(
                        name="Sunset Market",
                        address="456 Sunset Ave, Queens, NY 11375",
                        latitude=40.7282,
                        longitude=-73.7949,
                        description="Family-owned market with fresh produce and a resident tabby cat.",
                        phone="(718) 555-0456",
                        hours="7:00 AM - 10:00 PM",
                        rating=4.2,
                        review_count=8,
                        cat_count=1,
                        is_verified=True
                    ),
                    Bodega(
                        name="Downtown Convenience",
                        address="789 Broadway, Manhattan, NY 10003",
                        latitude=40.7308,
                        longitude=-73.9927,
                        description="24/7 convenience store with a sleepy orange cat that loves attention.",
                        phone="(212) 555-0789",
                        hours="24/7",
                        rating=4.0,
                        review_count=15,
                        cat_count=1,
                        is_verified=False
                    ),
                ]
                
                for bodega in bodegas:
                    db.session.add(bodega)
                db.session.commit()
                
                # Create sample cats
                cats = [
                    Cat(
                        name="Whiskers",
                        bodega_id=1,
                        description="A friendly orange tabby who loves to sit by the window and greet customers.",
                        age="3 years",
                        breed="Domestic Shorthair",
                        sex="Male",
                        personality="Friendly, curious, loves attention",
                        color="Orange tabby",
                        weight="12 lbs",
                        is_friendly=True,
                        rating=4.8,
                        review_count=10
                    ),
                    Cat(
                        name="Shadow",
                        bodega_id=2,
                        description="A sleek black cat who patrols the aisles and keeps the mice away.",
                        age="5 years",
                        breed="Domestic Shorthair",
                        sex="Female",
                        personality="Independent, watchful, gentle",
                        color="Black",
                        weight="10 lbs",
                        is_friendly=True,
                        rating=4.5,
                        review_count=7
                    ),
                    Cat(
                        name="Mittens",
                        bodega_id=3,
                        description="A fluffy white cat with black paws who loves to nap in the sun.",
                        age="2 years",
                        breed="Domestic Longhair",
                        sex="Female",
                        personality="Calm, affectionate, sleepy",
                        color="White with black paws",
                        weight="8 lbs",
                        is_friendly=True,
                        rating=4.2,
                        review_count=12
                    ),
                ]
                
                for cat in cats:
                    db.session.add(cat)
                db.session.commit()
                
                print("Sample data added successfully")
            else:
                print("Database already contains data")
        except Exception as e:
            print(f"Database initialization error: {e}")
    
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
from datetime import datetime
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import JSON

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reviews = db.relationship('Review', backref='user', lazy=True)
    saved_cats = db.relationship('SavedCat', backref='user', lazy=True)
    saved_bodegas = db.relationship('SavedBodega', backref='user', lazy=True)
    recently_viewed = db.relationship('RecentlyViewed', backref='user', lazy=True)
    
    def __repr__(self):
        return f'<User {self.username}>'

class Bodega(db.Model):
    __tablename__ = 'bodegas'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    address = db.Column(db.String(500), nullable=False)
    latitude = db.Column(db.Float, nullable=False)
    longitude = db.Column(db.Float, nullable=False)
    description = db.Column(db.Text)
    phone = db.Column(db.String(20))
    hours = db.Column(db.String(200))
    rating = db.Column(db.Float, default=0.0)
    review_count = db.Column(db.Integer, default=0)
    cat_count = db.Column(db.Integer, default=0)
    is_verified = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    cats = db.relationship('Cat', backref='bodega', lazy=True)
    reviews = db.relationship('Review', backref='bodega', lazy=True)
    photos = db.relationship('BodegaPhoto', backref='bodega', lazy=True)
    
    def __repr__(self):
        return f'<Bodega {self.name}>'

class Cat(db.Model):
    __tablename__ = 'cats'
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False)
    bodega_id = db.Column(db.Integer, db.ForeignKey('bodegas.id'), nullable=False)
    description = db.Column(db.Text)
    age = db.Column(db.String(50))
    breed = db.Column(db.String(100))
    sex = db.Column(db.String(10))
    personality = db.Column(db.String(200))
    color = db.Column(db.String(100))
    weight = db.Column(db.String(50))
    is_friendly = db.Column(db.Boolean, default=True)
    is_active = db.Column(db.Boolean, default=True)
    rating = db.Column(db.Float, default=0.0)
    review_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    reviews = db.relationship('Review', backref='cat', lazy=True)
    photos = db.relationship('CatPhoto', backref='cat', lazy=True)
    
    def __repr__(self):
        return f'<Cat {self.name}>'

class Review(db.Model):
    __tablename__ = 'reviews'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bodega_id = db.Column(db.Integer, db.ForeignKey('bodegas.id'), nullable=True)
    cat_id = db.Column(db.Integer, db.ForeignKey('cats.id'), nullable=True)
    rating = db.Column(db.Integer, nullable=False)
    comment = db.Column(db.Text)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def __repr__(self):
        return f'<Review {self.id}>'

class CatPhoto(db.Model):
    __tablename__ = 'cat_photos'
    
    id = db.Column(db.Integer, primary_key=True)
    cat_id = db.Column(db.Integer, db.ForeignKey('cats.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    caption = db.Column(db.String(500))
    is_primary = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<CatPhoto {self.filename}>'

class BodegaPhoto(db.Model):
    __tablename__ = 'bodega_photos'
    
    id = db.Column(db.Integer, primary_key=True)
    bodega_id = db.Column(db.Integer, db.ForeignKey('bodegas.id'), nullable=False)
    filename = db.Column(db.String(255), nullable=False)
    caption = db.Column(db.String(500))
    is_primary = db.Column(db.Boolean, default=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<BodegaPhoto {self.filename}>'

class SavedCat(db.Model):
    __tablename__ = 'saved_cats'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    cat_id = db.Column(db.Integer, db.ForeignKey('cats.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<SavedCat {self.user_id}-{self.cat_id}>'

class SavedBodega(db.Model):
    __tablename__ = 'saved_bodegas'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    bodega_id = db.Column(db.Integer, db.ForeignKey('bodegas.id'), nullable=False)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<SavedBodega {self.user_id}-{self.bodega_id}>'

class RecentlyViewed(db.Model):
    __tablename__ = 'recently_viewed'
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=False)
    cat_id = db.Column(db.Integer, db.ForeignKey('cats.id'), nullable=True)
    bodega_id = db.Column(db.Integer, db.ForeignKey('bodegas.id'), nullable=True)
    viewed_at = db.Column(db.DateTime, default=datetime.utcnow)
    
    def __repr__(self):
        return f'<RecentlyViewed {self.user_id}>' 
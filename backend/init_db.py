#!/usr/bin/env python3
"""
Database initialization script for Bodega Cat Finder
"""

import os
import sys
from app import create_app, db
from models import User, Bodega, Cat, Review

def init_db():
    """Initialize the database with tables and sample data"""
    app = create_app()
    
    with app.app_context():
        # Create all tables
        print("Creating database tables...")
        db.create_all()
        
        # Check if we already have data
        if User.query.first():
            print("Database already contains data. Skipping sample data creation.")
            return
        
        print("Adding sample data...")
        
        # Create sample users
        users = [
            User(username='catlover', email='catlover@example.com', password_hash='dummy_hash'),
            User(username='bodegaexplorer', email='explorer@example.com', password_hash='dummy_hash'),
            User(username='nycvisitor', email='visitor@example.com', password_hash='dummy_hash'),
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
        
        # Create sample reviews
        reviews = [
            Review(
                user_id=1,
                cat_id=1,
                rating=5,
                comment="Whiskers is the sweetest cat! Always greets me when I come in for my morning coffee."
            ),
            Review(
                user_id=2,
                cat_id=1,
                rating=4,
                comment="Great cat, very friendly. The store is clean and well-stocked too."
            ),
            Review(
                user_id=3,
                cat_id=2,
                rating=5,
                comment="Shadow is beautiful and so well-behaved. The store owner takes great care of her."
            ),
            Review(
                user_id=1,
                bodega_id=1,
                rating=5,
                comment="Best deli in the neighborhood! Great sandwiches and friendly staff."
            ),
            Review(
                user_id=2,
                bodega_id=2,
                rating=4,
                comment="Fresh produce and a lovely cat. What more could you ask for?"
            ),
        ]
        
        for review in reviews:
            db.session.add(review)
        db.session.commit()
        
        print("Sample data created successfully!")
        print(f"Created {len(users)} users, {len(bodegas)} bodegas, {len(cats)} cats, and {len(reviews)} reviews")

if __name__ == '__main__':
    init_db() 
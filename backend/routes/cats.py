from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Cat, Bodega, CatPhoto, SavedCat, RecentlyViewed, Review
from marshmallow import Schema, fields, ValidationError
from sqlalchemy import func
import os
from werkzeug.utils import secure_filename

cats_bp = Blueprint('cats', __name__)

class CatSchema(Schema):
    name = fields.Str(required=True)
    bodega_id = fields.Int(required=True)
    description = fields.Str()
    age = fields.Str()
    breed = fields.Str()
    sex = fields.Str()
    personality = fields.Str()
    color = fields.Str()
    weight = fields.Str()
    is_friendly = fields.Bool()

cat_schema = CatSchema()

@cats_bp.route('/', methods=['GET'])
def get_cats():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        
        query = Cat.query.filter(Cat.is_active == True)
        
        if search:
            query = query.filter(
                Cat.name.ilike(f'%{search}%') |
                Cat.description.ilike(f'%{search}%') |
                Cat.breed.ilike(f'%{search}%')
            )
        
        cats = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'cats': [{
                'id': cat.id,
                'name': cat.name,
                'bodega_id': cat.bodega_id,
                'bodega_name': cat.bodega.name,
                'address': cat.bodega.address,
                'description': cat.description,
                'age': cat.age,
                'breed': cat.breed,
                'sex': cat.sex,
                'personality': cat.personality,
                'color': cat.color,
                'weight': cat.weight,
                'is_friendly': cat.is_friendly,
                'rating': cat.rating,
                'review_count': cat.review_count,
                'primary_photo': next((photo.filename for photo in cat.photos if photo.is_primary), None)
            } for cat in cats.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': cats.total,
                'pages': cats.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@cats_bp.route('/<int:cat_id>', methods=['GET'])
def get_cat(cat_id):
    try:
        cat = Cat.query.get_or_404(cat_id)
        
        # Track recently viewed if user is authenticated
        if request.headers.get('Authorization'):
            try:
                from flask_jwt_extended import get_jwt_identity
                user_id = get_jwt_identity()
                recently_viewed = RecentlyViewed(
                    user_id=user_id,
                    cat_id=cat_id
                )
                db.session.add(recently_viewed)
                db.session.commit()
            except:
                pass  # Ignore errors for tracking
        
        return jsonify({
            'cat': {
                'id': cat.id,
                'name': cat.name,
                'bodega_id': cat.bodega_id,
                'bodega_name': cat.bodega.name,
                'address': cat.bodega.address,
                'latitude': cat.bodega.latitude,
                'longitude': cat.bodega.longitude,
                'description': cat.description,
                'age': cat.age,
                'breed': cat.breed,
                'sex': cat.sex,
                'personality': cat.personality,
                'color': cat.color,
                'weight': cat.weight,
                'is_friendly': cat.is_friendly,
                'rating': cat.rating,
                'review_count': cat.review_count,
                'photos': [{
                    'id': photo.id,
                    'filename': photo.filename,
                    'caption': photo.caption,
                    'is_primary': photo.is_primary
                } for photo in cat.photos]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@cats_bp.route('/', methods=['POST'])
@jwt_required()
def create_cat():
    try:
        data = request.get_json()
        validated_data = cat_schema.load(data)
        
        # Verify bodega exists
        bodega = Bodega.query.get(validated_data['bodega_id'])
        if not bodega:
            return jsonify({'error': 'Bodega not found'}), 404
        
        new_cat = Cat(**validated_data)
        db.session.add(new_cat)
        db.session.commit()
        
        # Update bodega cat count
        bodega.cat_count = len(bodega.cats)
        db.session.commit()
        
        return jsonify({
            'message': 'Cat created successfully',
            'cat': {
                'id': new_cat.id,
                'name': new_cat.name,
                'bodega_id': new_cat.bodega_id
            }
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@cats_bp.route('/<int:cat_id>', methods=['PUT'])
@jwt_required()
def update_cat(cat_id):
    try:
        cat = Cat.query.get_or_404(cat_id)
        data = request.get_json()
        
        # Update fields
        for field, value in data.items():
            if hasattr(cat, field):
                setattr(cat, field, value)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Cat updated successfully',
            'cat': {
                'id': cat.id,
                'name': cat.name,
                'bodega_id': cat.bodega_id
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@cats_bp.route('/<int:cat_id>/save', methods=['POST'])
@jwt_required()
def save_cat(cat_id):
    try:
        user_id = get_jwt_identity()
        
        # Check if already saved
        existing = SavedCat.query.filter_by(user_id=user_id, cat_id=cat_id).first()
        if existing:
            return jsonify({'error': 'Cat already saved'}), 400
        
        saved_cat = SavedCat(user_id=user_id, cat_id=cat_id)
        db.session.add(saved_cat)
        db.session.commit()
        
        return jsonify({'message': 'Cat saved successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@cats_bp.route('/<int:cat_id>/save', methods=['DELETE'])
@jwt_required()
def unsave_cat(cat_id):
    try:
        user_id = get_jwt_identity()
        
        saved_cat = SavedCat.query.filter_by(user_id=user_id, cat_id=cat_id).first()
        if not saved_cat:
            return jsonify({'error': 'Cat not saved'}), 404
        
        db.session.delete(saved_cat)
        db.session.commit()
        
        return jsonify({'message': 'Cat removed from saved'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@cats_bp.route('/random', methods=['GET'])
def get_random_cat():
    try:
        cat = Cat.query.filter(Cat.is_active == True).order_by(func.random()).first()
        
        if not cat:
            return jsonify({'error': 'No cats found'}), 404
        
        return jsonify({
            'cat': {
                'id': cat.id,
                'name': cat.name,
                'bodega_id': cat.bodega_id,
                'bodega_name': cat.bodega.name,
                'address': cat.bodega.address,
                'description': cat.description,
                'age': cat.age,
                'breed': cat.breed,
                'sex': cat.sex,
                'personality': cat.personality,
                'color': cat.color,
                'weight': cat.weight,
                'is_friendly': cat.is_friendly,
                'rating': cat.rating,
                'review_count': cat.review_count,
                'primary_photo': next((photo.filename for photo in cat.photos if photo.is_primary), None)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500 
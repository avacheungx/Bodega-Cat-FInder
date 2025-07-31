from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
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
                verify_jwt_in_request()
                user_id = int(get_jwt_identity())
                recently_viewed = RecentlyViewed(
                    user_id=user_id,
                    cat_id=cat_id
                )
                db.session.add(recently_viewed)
                db.session.commit()
            except Exception as e:
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
                'created_by': cat.created_by,
                'creator_username': cat.creator.username if cat.creator else None,
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
        
        # Handle case where bodega_name and address are provided instead of bodega_id
        if 'bodega_name' in data and 'address' in data:
            # Check if bodega exists with this name and address
            bodega = Bodega.query.filter_by(
                name=data['bodega_name'],
                address=data['address']
            ).first()
            
            if not bodega:
                # Create new bodega
                bodega = Bodega(
                    name=data['bodega_name'],
                    address=data['address'],
                    description=data.get('bodega_description', ''),
                    latitude=40.7589,  # Default NYC coordinates
                    longitude=-73.9851,
                    cat_count=1
                )
                db.session.add(bodega)
                db.session.flush()  # Get the ID without committing
        
        # Prepare cat data
        cat_data = {
            'name': data['name'],
            'bodega_id': bodega.id,
            'description': data.get('description', ''),
            'age': data.get('age', ''),
            'breed': data.get('breed', ''),
            'sex': data.get('sex', ''),
            'personality': data.get('personality', ''),
            'color': data.get('color', ''),
            'weight': data.get('weight', ''),
            'is_friendly': data.get('is_friendly', True)
        }
        
        validated_data = cat_schema.load(cat_data)
        
        # Get current user
        user_id = int(get_jwt_identity())
        
        new_cat = Cat(**validated_data, created_by=user_id)
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
                'bodega_id': new_cat.bodega_id,
                'bodega_name': bodega.name
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
        user_id = int(get_jwt_identity())
        
        # Check if user is the creator or admin
        if cat.created_by != user_id:
            return jsonify({'error': 'Unauthorized: You can only edit cats you created'}), 403
        
        data = request.get_json()
        
        # Update fields
        for field, value in data.items():
            if hasattr(cat, field) and field not in ['id', 'created_by', 'created_at']:
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

@cats_bp.route('/<int:cat_id>', methods=['DELETE'])
@jwt_required()
def delete_cat(cat_id):
    try:
        cat = Cat.query.get_or_404(cat_id)
        user_id = int(get_jwt_identity())
        
        # Check if user is the creator
        if cat.created_by != user_id:
            return jsonify({'error': 'Unauthorized: You can only delete cats you created'}), 403
        
        # Get associated bodega to update cat count
        bodega = cat.bodega
        
        # Delete associated photos from filesystem
        for photo in cat.photos:
            try:
                import os
                file_path = os.path.join(current_app.root_path, 'uploads', 'cats', photo.filename)
                if os.path.exists(file_path):
                    os.remove(file_path)
            except Exception as e:
                current_app.logger.error(f"Error deleting photo file: {e}")
        
        # Delete the cat
        db.session.delete(cat)
        db.session.commit()
        
        # Update bodega cat count
        if bodega:
            bodega.cat_count = len(bodega.cats)
            db.session.commit()
        
        return jsonify({'message': 'Cat deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@cats_bp.route('/<int:cat_id>/save', methods=['POST'])
@jwt_required()
def save_cat(cat_id):
    try:
        user_id = int(get_jwt_identity())
        
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
        user_id = int(get_jwt_identity())
        
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
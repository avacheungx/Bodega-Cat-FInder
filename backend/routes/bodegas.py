from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request
from models import db, Bodega, Cat, BodegaPhoto, SavedBodega, RecentlyViewed, Review
from marshmallow import Schema, fields, ValidationError
from sqlalchemy import func
import os
from werkzeug.utils import secure_filename

bodegas_bp = Blueprint('bodegas', __name__)

class BodegaSchema(Schema):
    name = fields.Str(required=True)
    address = fields.Str(required=True)
    latitude = fields.Float(required=True)
    longitude = fields.Float(required=True)
    description = fields.Str()
    phone = fields.Str()
    hours = fields.Str()

bodega_schema = BodegaSchema()

@bodegas_bp.route('/', methods=['GET'])
def get_bodegas():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('search', '')
        
        query = Bodega.query
        
        if search:
            query = query.filter(
                Bodega.name.ilike(f'%{search}%') |
                Bodega.address.ilike(f'%{search}%') |
                Bodega.description.ilike(f'%{search}%')
            )
        
        bodegas = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'bodegas': [{
                'id': bodega.id,
                'name': bodega.name,
                'address': bodega.address,
                'latitude': bodega.latitude,
                'longitude': bodega.longitude,
                'description': bodega.description,
                'phone': bodega.phone,
                'hours': bodega.hours,
                'rating': bodega.rating,
                'review_count': bodega.review_count,
                'cat_count': bodega.cat_count,
                'is_verified': bodega.is_verified,
                'primary_photo': next((photo.filename for photo in bodega.photos if photo.is_primary), None)
            } for bodega in bodegas.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': bodegas.total,
                'pages': bodegas.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@bodegas_bp.route('/<int:bodega_id>', methods=['GET'])
def get_bodega(bodega_id):
    try:
        bodega = Bodega.query.get_or_404(bodega_id)
        
        # Track recently viewed if user is authenticated
        if request.headers.get('Authorization'):
            try:
                verify_jwt_in_request()
                user_id = int(get_jwt_identity())
                recently_viewed = RecentlyViewed(
                    user_id=user_id,
                    bodega_id=bodega_id
                )
                db.session.add(recently_viewed)
                db.session.commit()
            except Exception as e:
                pass  # Ignore errors for tracking
        
        return jsonify({
            'bodega': {
                'id': bodega.id,
                'name': bodega.name,
                'address': bodega.address,
                'latitude': bodega.latitude,
                'longitude': bodega.longitude,
                'description': bodega.description,
                'phone': bodega.phone,
                'hours': bodega.hours,
                'rating': bodega.rating,
                'review_count': bodega.review_count,
                'cat_count': bodega.cat_count,
                'is_verified': bodega.is_verified,
                'cats': [{
                    'id': cat.id,
                    'name': cat.name,
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
                } for cat in bodega.cats if cat.is_active],
                'photos': [{
                    'id': photo.id,
                    'filename': photo.filename,
                    'caption': photo.caption,
                    'is_primary': photo.is_primary
                } for photo in bodega.photos]
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@bodegas_bp.route('/', methods=['POST'])
@jwt_required()
def create_bodega():
    try:
        data = request.get_json()
        validated_data = bodega_schema.load(data)
        
        new_bodega = Bodega(**validated_data)
        db.session.add(new_bodega)
        db.session.commit()
        
        return jsonify({
            'message': 'Bodega created successfully',
            'bodega': {
                'id': new_bodega.id,
                'name': new_bodega.name,
                'address': new_bodega.address
            }
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@bodegas_bp.route('/<int:bodega_id>', methods=['PUT'])
@jwt_required()
def update_bodega(bodega_id):
    try:
        bodega = Bodega.query.get_or_404(bodega_id)
        data = request.get_json()
        
        # Update fields
        for field, value in data.items():
            if hasattr(bodega, field):
                setattr(bodega, field, value)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Bodega updated successfully',
            'bodega': {
                'id': bodega.id,
                'name': bodega.name,
                'address': bodega.address
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@bodegas_bp.route('/<int:bodega_id>/save', methods=['POST'])
@jwt_required()
def save_bodega(bodega_id):
    try:
        user_id = int(get_jwt_identity())
        
        # Check if already saved
        existing = SavedBodega.query.filter_by(user_id=user_id, bodega_id=bodega_id).first()
        if existing:
            return jsonify({'error': 'Bodega already saved'}), 400
        
        saved_bodega = SavedBodega(user_id=user_id, bodega_id=bodega_id)
        db.session.add(saved_bodega)
        db.session.commit()
        
        return jsonify({'message': 'Bodega saved successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@bodegas_bp.route('/<int:bodega_id>/save', methods=['DELETE'])
@jwt_required()
def unsave_bodega(bodega_id):
    try:
        user_id = int(get_jwt_identity())
        
        saved_bodega = SavedBodega.query.filter_by(user_id=user_id, bodega_id=bodega_id).first()
        if not saved_bodega:
            return jsonify({'error': 'Bodega not saved'}), 404
        
        db.session.delete(saved_bodega)
        db.session.commit()
        
        return jsonify({'message': 'Bodega removed from saved'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@bodegas_bp.route('/random', methods=['GET'])
def get_random_bodega():
    try:
        bodega = Bodega.query.order_by(func.random()).first()
        
        if not bodega:
            return jsonify({'error': 'No bodegas found'}), 404
        
        return jsonify({
            'bodega': {
                'id': bodega.id,
                'name': bodega.name,
                'address': bodega.address,
                'latitude': bodega.latitude,
                'longitude': bodega.longitude,
                'description': bodega.description,
                'phone': bodega.phone,
                'hours': bodega.hours,
                'rating': bodega.rating,
                'review_count': bodega.review_count,
                'cat_count': bodega.cat_count,
                'is_verified': bodega.is_verified,
                'primary_photo': next((photo.filename for photo in bodega.photos if photo.is_primary), None)
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@bodegas_bp.route('/nearby', methods=['GET'])
def get_nearby_bodegas():
    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', 5.0, type=float)  # Default 5km radius
        
        if not lat or not lng:
            return jsonify({'error': 'Latitude and longitude are required'}), 400
        
        # Simple distance calculation (for production, use PostGIS or similar)
        from math import radians, cos, sin, asin, sqrt
        
        def haversine_distance(lat1, lon1, lat2, lon2):
            R = 6371  # Earth's radius in kilometers
            
            lat1, lon1, lat2, lon2 = map(radians, [lat1, lon1, lat2, lon2])
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            
            a = sin(dlat/2)**2 + cos(lat1) * cos(lat2) * sin(dlon/2)**2
            c = 2 * asin(sqrt(a))
            distance = R * c
            
            return distance
        
        bodegas = Bodega.query.all()
        nearby_bodegas = []
        
        for bodega in bodegas:
            distance = haversine_distance(lat, lng, bodega.latitude, bodega.longitude)
            if distance <= radius:
                nearby_bodegas.append({
                    'id': bodega.id,
                    'name': bodega.name,
                    'address': bodega.address,
                    'latitude': bodega.latitude,
                    'longitude': bodega.longitude,
                    'description': bodega.description,
                    'rating': bodega.rating,
                    'review_count': bodega.review_count,
                    'cat_count': bodega.cat_count,
                    'distance': round(distance, 2),
                    'primary_photo': next((photo.filename for photo in bodega.photos if photo.is_primary), None)
                })
        
        # Sort by distance
        nearby_bodegas.sort(key=lambda x: x['distance'])
        
        return jsonify({
            'bodegas': nearby_bodegas,
            'search_location': {'lat': lat, 'lng': lng},
            'radius': radius
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500 
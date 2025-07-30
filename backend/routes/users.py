from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, User, SavedCat, SavedBodega, RecentlyViewed, Cat, Bodega
from sqlalchemy import desc

users_bp = Blueprint('users', __name__)

@users_bp.route('/saved/cats', methods=['GET'])
@jwt_required()
def get_saved_cats():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        saved_cats = SavedCat.query.filter_by(user_id=user_id).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'saved_cats': [{
                'id': saved_cat.cat.id,
                'name': saved_cat.cat.name,
                'bodega_id': saved_cat.cat.bodega_id,
                'bodega_name': saved_cat.cat.bodega.name,
                'address': saved_cat.cat.bodega.address,
                'description': saved_cat.cat.description,
                'age': saved_cat.cat.age,
                'breed': saved_cat.cat.breed,
                'sex': saved_cat.cat.sex,
                'personality': saved_cat.cat.personality,
                'color': saved_cat.cat.color,
                'weight': saved_cat.cat.weight,
                'is_friendly': saved_cat.cat.is_friendly,
                'rating': saved_cat.cat.rating,
                'review_count': saved_cat.cat.review_count,
                'primary_photo': next((photo.filename for photo in saved_cat.cat.photos if photo.is_primary), None),
                'saved_at': saved_cat.created_at.isoformat()
            } for saved_cat in saved_cats.items if saved_cat.cat.is_active],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': saved_cats.total,
                'pages': saved_cats.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/saved/bodegas', methods=['GET'])
@jwt_required()
def get_saved_bodegas():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        saved_bodegas = SavedBodega.query.filter_by(user_id=user_id).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'saved_bodegas': [{
                'id': saved_bodega.bodega.id,
                'name': saved_bodega.bodega.name,
                'address': saved_bodega.bodega.address,
                'latitude': saved_bodega.bodega.latitude,
                'longitude': saved_bodega.bodega.longitude,
                'description': saved_bodega.bodega.description,
                'phone': saved_bodega.bodega.phone,
                'hours': saved_bodega.bodega.hours,
                'rating': saved_bodega.bodega.rating,
                'review_count': saved_bodega.bodega.review_count,
                'cat_count': saved_bodega.bodega.cat_count,
                'is_verified': saved_bodega.bodega.is_verified,
                'primary_photo': next((photo.filename for photo in saved_bodega.bodega.photos if photo.is_primary), None),
                'saved_at': saved_bodega.created_at.isoformat()
            } for saved_bodega in saved_bodegas.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': saved_bodegas.total,
                'pages': saved_bodegas.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/recently-viewed', methods=['GET'])
@jwt_required()
def get_recently_viewed():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        recently_viewed = RecentlyViewed.query.filter_by(user_id=user_id).order_by(
            desc(RecentlyViewed.viewed_at)
        ).paginate(page=page, per_page=per_page, error_out=False)
        
        items = []
        for item in recently_viewed.items:
            if item.cat_id and item.cat and item.cat.is_active:
                items.append({
                    'type': 'cat',
                    'id': item.cat.id,
                    'name': item.cat.name,
                    'bodega_id': item.cat.bodega_id,
                    'bodega_name': item.cat.bodega.name,
                    'address': item.cat.bodega.address,
                    'description': item.cat.description,
                    'age': item.cat.age,
                    'breed': item.cat.breed,
                    'sex': item.cat.sex,
                    'personality': item.cat.personality,
                    'color': item.cat.color,
                    'weight': item.cat.weight,
                    'is_friendly': item.cat.is_friendly,
                    'rating': item.cat.rating,
                    'review_count': item.cat.review_count,
                    'primary_photo': next((photo.filename for photo in item.cat.photos if photo.is_primary), None),
                    'viewed_at': item.viewed_at.isoformat()
                })
            elif item.bodega_id and item.bodega:
                items.append({
                    'type': 'bodega',
                    'id': item.bodega.id,
                    'name': item.bodega.name,
                    'address': item.bodega.address,
                    'latitude': item.bodega.latitude,
                    'longitude': item.bodega.longitude,
                    'description': item.bodega.description,
                    'phone': item.bodega.phone,
                    'hours': item.bodega.hours,
                    'rating': item.bodega.rating,
                    'review_count': item.bodega.review_count,
                    'cat_count': item.bodega.cat_count,
                    'is_verified': item.bodega.is_verified,
                    'primary_photo': next((photo.filename for photo in item.bodega.photos if photo.is_primary), None),
                    'viewed_at': item.viewed_at.isoformat()
                })
        
        return jsonify({
            'recently_viewed': items,
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': recently_viewed.total,
                'pages': recently_viewed.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/recently-viewed/cats', methods=['GET'])
@jwt_required()
def get_recently_viewed_cats():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        
        recently_viewed_cats = RecentlyViewed.query.filter_by(
            user_id=user_id,
            cat_id=RecentlyViewed.cat_id.isnot(None)
        ).order_by(desc(RecentlyViewed.viewed_at)).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'recently_viewed_cats': [{
                'id': item.cat.id,
                'name': item.cat.name,
                'bodega_id': item.cat.bodega_id,
                'bodega_name': item.cat.bodega.name,
                'address': item.cat.bodega.address,
                'description': item.cat.description,
                'age': item.cat.age,
                'breed': item.cat.breed,
                'sex': item.cat.sex,
                'personality': item.cat.personality,
                'color': item.cat.color,
                'weight': item.cat.weight,
                'is_friendly': item.cat.is_friendly,
                'rating': item.cat.rating,
                'review_count': item.cat.review_count,
                'primary_photo': next((photo.filename for photo in item.cat.photos if photo.is_primary), None),
                'viewed_at': item.viewed_at.isoformat()
            } for item in recently_viewed_cats.items if item.cat and item.cat.is_active],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': recently_viewed_cats.total,
                'pages': recently_viewed_cats.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_user_stats():
    try:
        user_id = get_jwt_identity()
        
        # Count saved cats
        saved_cats_count = SavedCat.query.filter_by(user_id=user_id).count()
        
        # Count saved bodegas
        saved_bodegas_count = SavedBodega.query.filter_by(user_id=user_id).count()
        
        # Count reviews
        from ..models import Review
        reviews_count = Review.query.filter_by(user_id=user_id).count()
        
        # Count recently viewed items
        recently_viewed_count = RecentlyViewed.query.filter_by(user_id=user_id).count()
        
        return jsonify({
            'stats': {
                'saved_cats': saved_cats_count,
                'saved_bodegas': saved_bodegas_count,
                'reviews': reviews_count,
                'recently_viewed': recently_viewed_count
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@users_bp.route('/clear-recently-viewed', methods=['DELETE'])
@jwt_required()
def clear_recently_viewed():
    try:
        user_id = get_jwt_identity()
        
        RecentlyViewed.query.filter_by(user_id=user_id).delete()
        db.session.commit()
        
        return jsonify({'message': 'Recently viewed items cleared successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500 
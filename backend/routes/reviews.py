from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Review, Cat, Bodega, User
from marshmallow import Schema, fields, ValidationError
from sqlalchemy import func

reviews_bp = Blueprint('reviews', __name__)

class ReviewSchema(Schema):
    rating = fields.Int(required=True, validate=lambda x: 1 <= x <= 5)
    comment = fields.Str()
    cat_id = fields.Int()
    bodega_id = fields.Int()

review_schema = ReviewSchema()

@reviews_bp.route('/', methods=['POST'])
@jwt_required()
def create_review():
    try:
        user_id = get_jwt_identity()
        data = request.get_json()
        validated_data = review_schema.load(data)
        
        # Ensure either cat_id or bodega_id is provided, but not both
        if not validated_data.get('cat_id') and not validated_data.get('bodega_id'):
            return jsonify({'error': 'Either cat_id or bodega_id is required'}), 400
        
        if validated_data.get('cat_id') and validated_data.get('bodega_id'):
            return jsonify({'error': 'Cannot review both cat and bodega in the same review'}), 400
        
        # Check if user already reviewed this cat/bodega
        existing_review = Review.query.filter_by(
            user_id=user_id,
            cat_id=validated_data.get('cat_id'),
            bodega_id=validated_data.get('bodega_id')
        ).first()
        
        if existing_review:
            return jsonify({'error': 'You have already reviewed this item'}), 400
        
        # Create new review
        new_review = Review(
            user_id=user_id,
            **validated_data
        )
        
        db.session.add(new_review)
        db.session.commit()
        
        # Update rating statistics
        if validated_data.get('cat_id'):
            cat = Cat.query.get(validated_data['cat_id'])
            if cat:
                cat_reviews = Review.query.filter_by(cat_id=cat.id).all()
                cat.rating = sum(r.rating for r in cat_reviews) / len(cat_reviews)
                cat.review_count = len(cat_reviews)
        
        if validated_data.get('bodega_id'):
            bodega = Bodega.query.get(validated_data['bodega_id'])
            if bodega:
                bodega_reviews = Review.query.filter_by(bodega_id=bodega.id).all()
                bodega.rating = sum(r.rating for r in bodega_reviews) / len(bodega_reviews)
                bodega.review_count = len(bodega_reviews)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Review created successfully',
            'review': {
                'id': new_review.id,
                'rating': new_review.rating,
                'comment': new_review.comment,
                'cat_id': new_review.cat_id,
                'bodega_id': new_review.bodega_id,
                'created_at': new_review.created_at.isoformat()
            }
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@reviews_bp.route('/<int:review_id>', methods=['PUT'])
@jwt_required()
def update_review(review_id):
    try:
        user_id = get_jwt_identity()
        review = Review.query.get_or_404(review_id)
        
        # Check if user owns this review
        if review.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        data = request.get_json()
        
        # Update fields
        if 'rating' in data:
            if not 1 <= data['rating'] <= 5:
                return jsonify({'error': 'Rating must be between 1 and 5'}), 400
            review.rating = data['rating']
        
        if 'comment' in data:
            review.comment = data['comment']
        
        db.session.commit()
        
        # Update rating statistics
        if review.cat_id:
            cat = Cat.query.get(review.cat_id)
            if cat:
                cat_reviews = Review.query.filter_by(cat_id=cat.id).all()
                cat.rating = sum(r.rating for r in cat_reviews) / len(cat_reviews)
                cat.review_count = len(cat_reviews)
        
        if review.bodega_id:
            bodega = Bodega.query.get(review.bodega_id)
            if bodega:
                bodega_reviews = Review.query.filter_by(bodega_id=bodega.id).all()
                bodega.rating = sum(r.rating for r in bodega_reviews) / len(bodega_reviews)
                bodega.review_count = len(bodega_reviews)
        
        db.session.commit()
        
        return jsonify({
            'message': 'Review updated successfully',
            'review': {
                'id': review.id,
                'rating': review.rating,
                'comment': review.comment,
                'cat_id': review.cat_id,
                'bodega_id': review.bodega_id,
                'updated_at': review.updated_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@reviews_bp.route('/<int:review_id>', methods=['DELETE'])
@jwt_required()
def delete_review(review_id):
    try:
        user_id = get_jwt_identity()
        review = Review.query.get_or_404(review_id)
        
        # Check if user owns this review
        if review.user_id != user_id:
            return jsonify({'error': 'Unauthorized'}), 403
        
        cat_id = review.cat_id
        bodega_id = review.bodega_id
        
        db.session.delete(review)
        db.session.commit()
        
        # Update rating statistics
        if cat_id:
            cat = Cat.query.get(cat_id)
            if cat:
                cat_reviews = Review.query.filter_by(cat_id=cat.id).all()
                if cat_reviews:
                    cat.rating = sum(r.rating for r in cat_reviews) / len(cat_reviews)
                    cat.review_count = len(cat_reviews)
                else:
                    cat.rating = 0
                    cat.review_count = 0
        
        if bodega_id:
            bodega = Bodega.query.get(bodega_id)
            if bodega:
                bodega_reviews = Review.query.filter_by(bodega_id=bodega.id).all()
                if bodega_reviews:
                    bodega.rating = sum(r.rating for r in bodega_reviews) / len(bodega_reviews)
                    bodega.review_count = len(bodega_reviews)
                else:
                    bodega.rating = 0
                    bodega.review_count = 0
        
        db.session.commit()
        
        return jsonify({'message': 'Review deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@reviews_bp.route('/cat/<int:cat_id>', methods=['GET'])
def get_cat_reviews(cat_id):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        reviews = Review.query.filter_by(cat_id=cat_id).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'reviews': [{
                'id': review.id,
                'rating': review.rating,
                'comment': review.comment,
                'user': {
                    'id': review.user.id,
                    'username': review.user.username
                },
                'created_at': review.created_at.isoformat(),
                'updated_at': review.updated_at.isoformat()
            } for review in reviews.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': reviews.total,
                'pages': reviews.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@reviews_bp.route('/bodega/<int:bodega_id>', methods=['GET'])
def get_bodega_reviews(bodega_id):
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        reviews = Review.query.filter_by(bodega_id=bodega_id).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'reviews': [{
                'id': review.id,
                'rating': review.rating,
                'comment': review.comment,
                'user': {
                    'id': review.user.id,
                    'username': review.user.username
                },
                'created_at': review.created_at.isoformat(),
                'updated_at': review.updated_at.isoformat()
            } for review in reviews.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': reviews.total,
                'pages': reviews.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@reviews_bp.route('/user', methods=['GET'])
@jwt_required()
def get_user_reviews():
    try:
        user_id = get_jwt_identity()
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)
        
        reviews = Review.query.filter_by(user_id=user_id).paginate(
            page=page, per_page=per_page, error_out=False
        )
        
        return jsonify({
            'reviews': [{
                'id': review.id,
                'rating': review.rating,
                'comment': review.comment,
                'cat': {
                    'id': review.cat.id,
                    'name': review.cat.name
                } if review.cat else None,
                'bodega': {
                    'id': review.bodega.id,
                    'name': review.bodega.name
                } if review.bodega else None,
                'created_at': review.created_at.isoformat(),
                'updated_at': review.updated_at.isoformat()
            } for review in reviews.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': reviews.total,
                'pages': reviews.pages
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500 
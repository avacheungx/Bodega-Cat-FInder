from flask import Blueprint, request, jsonify
from models import db, Cat, Bodega, Review
from sqlalchemy import func, and_, or_
import math

search_bp = Blueprint('search', __name__)

@search_bp.route('/cats', methods=['GET'])
def search_cats():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('q', '')
        breed = request.args.get('breed', '')
        personality = request.args.get('personality', '')
        min_rating = request.args.get('min_rating', 0, type=float)
        max_rating = request.args.get('max_rating', 5, type=float)
        is_friendly = request.args.get('is_friendly', type=lambda v: v.lower() == 'true')
        
        query = Cat.query.filter(Cat.is_active == True)
        
        # Text search
        if search:
            query = query.filter(
                or_(
                    Cat.name.ilike(f'%{search}%'),
                    Cat.description.ilike(f'%{search}%'),
                    Cat.breed.ilike(f'%{search}%'),
                    Cat.personality.ilike(f'%{search}%'),
                    Cat.bodega.has(Bodega.name.ilike(f'%{search}%')),
                    Cat.bodega.has(Bodega.address.ilike(f'%{search}%'))
                )
            )
        
        # Filters
        if breed:
            query = query.filter(Cat.breed.ilike(f'%{breed}%'))
        
        if personality:
            query = query.filter(Cat.personality.ilike(f'%{personality}%'))
        
        if min_rating > 0:
            query = query.filter(Cat.rating >= min_rating)
        
        if max_rating < 5:
            query = query.filter(Cat.rating <= max_rating)
        
        if is_friendly is not None:
            query = query.filter(Cat.is_friendly == is_friendly)
        
        cats = query.paginate(page=page, per_page=per_page, error_out=False)
        
        return jsonify({
            'cats': [{
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
                'primary_photo': next((photo.filename for photo in cat.photos if photo.is_primary), None)
            } for cat in cats.items],
            'pagination': {
                'page': page,
                'per_page': per_page,
                'total': cats.total,
                'pages': cats.pages
            },
            'filters': {
                'search': search,
                'breed': breed,
                'personality': personality,
                'min_rating': min_rating,
                'max_rating': max_rating,
                'is_friendly': is_friendly
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@search_bp.route('/bodegas', methods=['GET'])
def search_bodegas():
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 20, type=int)
        search = request.args.get('q', '')
        min_cats = request.args.get('min_cats', 0, type=int)
        max_cats = request.args.get('max_cats', 100, type=int)
        min_rating = request.args.get('min_rating', 0, type=float)
        max_rating = request.args.get('max_rating', 5, type=float)
        verified_only = request.args.get('verified_only', type=lambda v: v.lower() == 'true')
        
        query = Bodega.query
        
        # Text search
        if search:
            query = query.filter(
                or_(
                    Bodega.name.ilike(f'%{search}%'),
                    Bodega.address.ilike(f'%{search}%'),
                    Bodega.description.ilike(f'%{search}%')
                )
            )
        
        # Filters
        if min_cats > 0:
            query = query.filter(Bodega.cat_count >= min_cats)
        
        if max_cats < 100:
            query = query.filter(Bodega.cat_count <= max_cats)
        
        if min_rating > 0:
            query = query.filter(Bodega.rating >= min_rating)
        
        if max_rating < 5:
            query = query.filter(Bodega.rating <= max_rating)
        
        if verified_only:
            query = query.filter(Bodega.is_verified == True)
        
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
            },
            'filters': {
                'search': search,
                'min_cats': min_cats,
                'max_cats': max_cats,
                'min_rating': min_rating,
                'max_rating': max_rating,
                'verified_only': verified_only
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@search_bp.route('/nearby', methods=['GET'])
def search_nearby():
    try:
        lat = request.args.get('lat', type=float)
        lng = request.args.get('lng', type=float)
        radius = request.args.get('radius', 5.0, type=float)  # Default 5km radius
        search_type = request.args.get('type', 'both')  # 'cats', 'bodegas', or 'both'
        
        if not lat or not lng:
            return jsonify({'error': 'Latitude and longitude are required'}), 400
        
        # Haversine distance calculation
        def haversine_distance(lat1, lon1, lat2, lon2):
            R = 6371  # Earth's radius in kilometers
            
            lat1, lon1, lat2, lon2 = map(math.radians, [lat1, lon1, lat2, lon2])
            dlat = lat2 - lat1
            dlon = lon2 - lon1
            
            a = math.sin(dlat/2)**2 + math.cos(lat1) * math.cos(lat2) * math.sin(dlon/2)**2
            c = 2 * math.asin(math.sqrt(a))
            distance = R * c
            
            return distance
        
        results = {
            'search_location': {'lat': lat, 'lng': lng},
            'radius': radius,
            'cats': [],
            'bodegas': []
        }
        
        # Search for cats
        if search_type in ['cats', 'both']:
            cats = Cat.query.filter(Cat.is_active == True).all()
            for cat in cats:
                distance = haversine_distance(lat, lng, cat.bodega.latitude, cat.bodega.longitude)
                if distance <= radius:
                    results['cats'].append({
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
                        'distance': round(distance, 2),
                        'primary_photo': next((photo.filename for photo in cat.photos if photo.is_primary), None)
                    })
        
        # Search for bodegas
        if search_type in ['bodegas', 'both']:
            bodegas = Bodega.query.all()
            for bodega in bodegas:
                distance = haversine_distance(lat, lng, bodega.latitude, bodega.longitude)
                if distance <= radius:
                    results['bodegas'].append({
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
                        'distance': round(distance, 2),
                        'primary_photo': next((photo.filename for photo in bodega.photos if photo.is_primary), None)
                    })
        
        # Sort by distance
        results['cats'].sort(key=lambda x: x['distance'])
        results['bodegas'].sort(key=lambda x: x['distance'])
        
        return jsonify(results), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@search_bp.route('/filters', methods=['GET'])
def get_search_filters():
    try:
        # Get unique breeds
        breeds = db.session.query(Cat.breed).filter(
            Cat.breed.isnot(None),
            Cat.breed != '',
            Cat.is_active == True
        ).distinct().all()
        
        # Get unique personalities
        personalities = db.session.query(Cat.personality).filter(
            Cat.personality.isnot(None),
            Cat.personality != '',
            Cat.is_active == True
        ).distinct().all()
        
        # Get rating ranges
        rating_stats = db.session.query(
            func.min(Cat.rating),
            func.max(Cat.rating),
            func.avg(Cat.rating)
        ).filter(Cat.is_active == True).first()
        
        return jsonify({
            'breeds': [breed[0] for breed in breeds if breed[0]],
            'personalities': [personality[0] for personality in personalities if personality[0]],
            'rating_range': {
                'min': float(rating_stats[0]) if rating_stats[0] else 0,
                'max': float(rating_stats[1]) if rating_stats[1] else 5,
                'average': float(rating_stats[2]) if rating_stats[2] else 0
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500 
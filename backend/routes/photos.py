from flask import Blueprint, request, jsonify, current_app
from flask_jwt_extended import jwt_required, get_jwt_identity
from models import db, Cat, Bodega, CatPhoto, BodegaPhoto
from werkzeug.utils import secure_filename
import os
import uuid
from datetime import datetime

photos_bp = Blueprint('photos', __name__)

# Allowed file extensions
ALLOWED_EXTENSIONS = {'png', 'jpg', 'jpeg', 'gif', 'webp'}

def allowed_file(filename):
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

def save_file(file, folder):
    """Save uploaded file with unique filename"""
    if file and allowed_file(file.filename):
        # Generate unique filename
        filename = secure_filename(file.filename)
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        
        # Create upload folder if it doesn't exist
        upload_folder = os.path.join(current_app.root_path, 'uploads', folder)
        os.makedirs(upload_folder, exist_ok=True)
        
        # Save file
        file_path = os.path.join(upload_folder, unique_filename)
        file.save(file_path)
        
        return unique_filename
    return None

@photos_bp.route('/cats/<int:cat_id>/photos', methods=['POST'])
@jwt_required()
def upload_cat_photo(cat_id):
    try:
        user_id = int(get_jwt_identity())
        
        # Check if cat exists
        cat = Cat.query.get_or_404(cat_id)
        
        # Check if file was uploaded
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo file provided'}), 400
        
        file = request.files['photo']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save file
        filename = save_file(file, 'cats')
        if not filename:
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}), 400
        
        # Get caption from form data
        caption = request.form.get('caption', '')
        is_primary = request.form.get('is_primary', 'false').lower() == 'true'
        
        # If this is marked as primary, unmark other photos
        if is_primary:
            CatPhoto.query.filter_by(cat_id=cat_id, is_primary=True).update({'is_primary': False})
        
        # Create photo record
        photo = CatPhoto(
            cat_id=cat_id,
            filename=filename,
            caption=caption,
            is_primary=is_primary
        )
        
        db.session.add(photo)
        db.session.commit()
        
        return jsonify({
            'message': 'Photo uploaded successfully',
            'photo': {
                'id': photo.id,
                'filename': photo.filename,
                'caption': photo.caption,
                'is_primary': photo.is_primary,
                'created_at': photo.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error uploading cat photo: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@photos_bp.route('/bodegas/<int:bodega_id>/photos', methods=['POST'])
@jwt_required()
def upload_bodega_photo(bodega_id):
    try:
        user_id = int(get_jwt_identity())
        
        # Check if bodega exists
        bodega = Bodega.query.get_or_404(bodega_id)
        
        # Check if file was uploaded
        if 'photo' not in request.files:
            return jsonify({'error': 'No photo file provided'}), 400
        
        file = request.files['photo']
        if file.filename == '':
            return jsonify({'error': 'No file selected'}), 400
        
        # Save file
        filename = save_file(file, 'bodegas')
        if not filename:
            return jsonify({'error': 'Invalid file type. Allowed: png, jpg, jpeg, gif, webp'}), 400
        
        # Get caption from form data
        caption = request.form.get('caption', '')
        is_primary = request.form.get('is_primary', 'false').lower() == 'true'
        
        # If this is marked as primary, unmark other photos
        if is_primary:
            BodegaPhoto.query.filter_by(bodega_id=bodega_id, is_primary=True).update({'is_primary': False})
        
        # Create photo record
        photo = BodegaPhoto(
            bodega_id=bodega_id,
            filename=filename,
            caption=caption,
            is_primary=is_primary
        )
        
        db.session.add(photo)
        db.session.commit()
        
        return jsonify({
            'message': 'Photo uploaded successfully',
            'photo': {
                'id': photo.id,
                'filename': photo.filename,
                'caption': photo.caption,
                'is_primary': photo.is_primary,
                'created_at': photo.created_at.isoformat()
            }
        }), 201
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error uploading bodega photo: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@photos_bp.route('/cats/<int:cat_id>/photos/<int:photo_id>', methods=['DELETE'])
@jwt_required()
def delete_cat_photo(cat_id, photo_id):
    try:
        user_id = int(get_jwt_identity())
        
        # Check if cat exists
        cat = Cat.query.get_or_404(cat_id)
        
        # Check if photo exists
        photo = CatPhoto.query.filter_by(id=photo_id, cat_id=cat_id).first_or_404()
        
        # Delete file from filesystem
        file_path = os.path.join(current_app.root_path, 'uploads', 'cats', photo.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from database
        db.session.delete(photo)
        db.session.commit()
        
        return jsonify({'message': 'Photo deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting cat photo: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@photos_bp.route('/bodegas/<int:bodega_id>/photos/<int:photo_id>', methods=['DELETE'])
@jwt_required()
def delete_bodega_photo(bodega_id, photo_id):
    try:
        user_id = int(get_jwt_identity())
        
        # Check if bodega exists
        bodega = Bodega.query.get_or_404(bodega_id)
        
        # Check if photo exists
        photo = BodegaPhoto.query.filter_by(id=photo_id, bodega_id=bodega_id).first_or_404()
        
        # Delete file from filesystem
        file_path = os.path.join(current_app.root_path, 'uploads', 'bodegas', photo.filename)
        if os.path.exists(file_path):
            os.remove(file_path)
        
        # Delete from database
        db.session.delete(photo)
        db.session.commit()
        
        return jsonify({'message': 'Photo deleted successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error deleting bodega photo: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@photos_bp.route('/cats/<int:cat_id>/photos/<int:photo_id>/primary', methods=['PUT'])
@jwt_required()
def set_cat_primary_photo(cat_id, photo_id):
    try:
        user_id = int(get_jwt_identity())
        
        # Check if cat exists
        cat = Cat.query.get_or_404(cat_id)
        
        # Check if photo exists
        photo = CatPhoto.query.filter_by(id=photo_id, cat_id=cat_id).first_or_404()
        
        # Unmark all other photos as primary
        CatPhoto.query.filter_by(cat_id=cat_id, is_primary=True).update({'is_primary': False})
        
        # Mark this photo as primary
        photo.is_primary = True
        db.session.commit()
        
        return jsonify({'message': 'Primary photo updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error setting cat primary photo: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@photos_bp.route('/bodegas/<int:bodega_id>/photos/<int:photo_id>/primary', methods=['PUT'])
@jwt_required()
def set_bodega_primary_photo(bodega_id, photo_id):
    try:
        user_id = int(get_jwt_identity())
        
        # Check if bodega exists
        bodega = Bodega.query.get_or_404(bodega_id)
        
        # Check if photo exists
        photo = BodegaPhoto.query.filter_by(id=photo_id, bodega_id=bodega_id).first_or_404()
        
        # Unmark all other photos as primary
        BodegaPhoto.query.filter_by(bodega_id=bodega_id, is_primary=True).update({'is_primary': False})
        
        # Mark this photo as primary
        photo.is_primary = True
        db.session.commit()
        
        return jsonify({'message': 'Primary photo updated successfully'}), 200
        
    except Exception as e:
        db.session.rollback()
        current_app.logger.error(f"Error setting bodega primary photo: {e}")
        return jsonify({'error': 'Internal server error'}), 500 
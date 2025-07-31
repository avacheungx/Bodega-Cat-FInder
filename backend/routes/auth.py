from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from flask_bcrypt import Bcrypt
from models import db, User
from marshmallow import Schema, fields, ValidationError

auth_bp = Blueprint('auth', __name__)
bcrypt = Bcrypt()

def init_bcrypt(app):
    bcrypt.init_app(app)

class UserSchema(Schema):
    username = fields.Str(required=True, validate=lambda x: len(x) >= 3)
    email = fields.Email(required=True)
    password = fields.Str(required=True, validate=lambda x: len(x) >= 6)

class LoginSchema(Schema):
    username = fields.Str(required=True)
    password = fields.Str(required=True)

user_schema = UserSchema()
login_schema = LoginSchema()

@auth_bp.route('/register', methods=['POST'])
def register():
    try:
        data = request.get_json()
        validated_data = user_schema.load(data)
        
        # Check if user already exists
        if User.query.filter_by(username=validated_data['username']).first():
            return jsonify({'error': 'Username already exists'}), 400
        
        if User.query.filter_by(email=validated_data['email']).first():
            return jsonify({'error': 'Email already exists'}), 400
        
        # Create new user
        hashed_password = bcrypt.generate_password_hash(validated_data['password']).decode('utf-8')
        new_user = User(
            username=validated_data['username'],
            email=validated_data['email'],
            password_hash=hashed_password
        )
        
        db.session.add(new_user)
        db.session.commit()
        
        # Create access token
        access_token = create_access_token(identity=str(new_user.id))
        
        return jsonify({
            'message': 'User created successfully',
            'access_token': access_token,
            'user': {
                'id': new_user.id,
                'username': new_user.username,
                'email': new_user.email
            }
        }), 201
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        validated_data = login_schema.load(data)
        
        # Find user by username or email
        user = User.query.filter(
            (User.username == validated_data['username']) |
            (User.email == validated_data['username'])
        ).first()
        
        if not user or not bcrypt.check_password_hash(user.password_hash, validated_data['password']):
            return jsonify({'error': 'Invalid username or password'}), 401
        
        # Create access token
        access_token = create_access_token(identity=str(user.id))
        
        return jsonify({
            'message': 'Login successful',
            'access_token': access_token,
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
        
    except ValidationError as e:
        return jsonify({'error': 'Validation error', 'details': e.messages}), 400
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/profile', methods=['GET'])
@jwt_required()
def get_profile():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        return jsonify({
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email,
                'created_at': user.created_at.isoformat()
            }
        }), 200
        
    except Exception as e:
        return jsonify({'error': 'Internal server error'}), 500

@auth_bp.route('/profile', methods=['PUT'])
@jwt_required()
def update_profile():
    try:
        user_id = int(get_jwt_identity())
        user = User.query.get(user_id)
        
        if not user:
            return jsonify({'error': 'User not found'}), 404
        
        data = request.get_json()
        
        # Update allowed fields
        if 'username' in data and data['username'] != user.username:
            if User.query.filter_by(username=data['username']).first():
                return jsonify({'error': 'Username already exists'}), 400
            user.username = data['username']
        
        if 'email' in data and data['email'] != user.email:
            if User.query.filter_by(email=data['email']).first():
                return jsonify({'error': 'Email already exists'}), 400
            user.email = data['email']
        
        db.session.commit()
        
        return jsonify({
            'message': 'Profile updated successfully',
            'user': {
                'id': user.id,
                'username': user.username,
                'email': user.email
            }
        }), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Internal server error'}), 500 
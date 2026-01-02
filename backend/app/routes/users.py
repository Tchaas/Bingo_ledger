"""
User profile routes.
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app import db
from app.auth.utils import validate_email
from app.auth.decorators import get_current_user
from app.models import User

users_bp = Blueprint('users', __name__)


@users_bp.route('/me', methods=['GET'])
@jwt_required()
def get_profile():
    """
    Get the current authenticated user's profile.
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({'user': user.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to get user', 'message': str(e)}), 500


@users_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    Update the current authenticated user's profile.

    Request Body:
        {
            "name": "New Name",
            "email": "newemail@example.com"
        }
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400

        if 'name' in data:
            user.name = data['name']

        if 'email' in data:
            new_email = data['email'].lower()
            if not validate_email(new_email):
                return jsonify({'error': 'Invalid email format'}), 400

            existing = User.query.filter_by(email=new_email).first()
            if existing and existing.id != user.id:
                return jsonify({'error': 'Email already in use'}), 409

            user.email = new_email

        user.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({'message': 'Profile updated successfully', 'user': user.to_dict()}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Update failed', 'message': str(e)}), 500

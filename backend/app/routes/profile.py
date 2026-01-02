"""
Profile routes for managing the authenticated user's profile.
"""
from datetime import datetime

from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from app import db
from app.auth.decorators import get_current_user
from app.auth.utils import validate_email
from app.models import User

profile_bp = Blueprint('profile', __name__)


@profile_bp.route('/', methods=['GET'])
@jwt_required()
def get_profile():
    """Get the current user's profile."""
    user = get_current_user()
    if not user:
        return jsonify({'error': 'User not found'}), 404
    return jsonify({'user': user.to_dict()}), 200


@profile_bp.route('/', methods=['PUT'])
@jwt_required()
def update_profile():
    """Update the current user's profile."""
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

    return jsonify({
        'message': 'Profile updated successfully',
        'user': user.to_dict()
    }), 200

"""
Authentication routes for user login, registration, and token management.

Provides endpoints for:
- User registration
- Login/logout
- Token refresh
- Password management
- User profile
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import (
    jwt_required,
    get_jwt_identity,
    create_access_token,
    get_jwt
)
from app import db
from app.models import User, Organization
from app.auth.utils import (
    generate_tokens,
    validate_email,
    validate_password_strength
)
from app.auth.decorators import login_required, get_current_user
from datetime import datetime

auth_bp = Blueprint('auth', __name__)


@auth_bp.route('/register', methods=['POST'])
@auth_bp.route('/signup', methods=['POST'])
def register():
    """
    Register a new user account.

    Request Body:
        {
            "email": "user@example.com",
            "password": "SecurePass123",
            "name": "John Doe",
            "organization_id": 1  # Optional, can be added later
        }

    Returns:
        201: User created successfully with tokens
        400: Validation error
        409: Email already exists
    """
    try:
        data = request.get_json()

        # Validate required fields
        if not data:
            return jsonify({'error': 'Request body required'}), 400

        email = data.get('email')
        password = data.get('password')
        name = data.get('name')
        organization_id = data.get('organization_id')

        # Validate inputs
        if not email or not password or not name:
            return jsonify({
                'error': 'Missing required fields',
                'required': ['email', 'password', 'name']
            }), 400

        # Validate email format
        if not validate_email(email):
            return jsonify({'error': 'Invalid email format'}), 400

        # Validate password strength
        is_valid, error_msg = validate_password_strength(password)
        if not is_valid:
            return jsonify({'error': error_msg}), 400

        # Check if email already exists
        existing_user = User.query.filter_by(email=email.lower()).first()
        if existing_user:
            return jsonify({'error': 'Email already registered'}), 409

        # Validate organization if provided
        if organization_id:
            org = Organization.query.get(organization_id)
            if not org:
                return jsonify({'error': 'Organization not found'}), 404

        # Create new user
        user = User(
            email=email.lower(),
            name=name,
            organization_id=organization_id
        )
        user.set_password(password)

        db.session.add(user)
        db.session.commit()

        # Generate tokens
        access_token, refresh_token = generate_tokens(user.id, organization_id)

        return jsonify({
            'message': 'User registered successfully',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Registration failed', 'message': str(e)}), 500


@auth_bp.route('/login', methods=['POST'])
def login():
    """
    Login with email and password.

    Request Body:
        {
            "email": "user@example.com",
            "password": "SecurePass123"
        }

    Returns:
        200: Login successful with tokens
        400: Validation error
        401: Invalid credentials
    """
    try:
        data = request.get_json()

        if not data:
            return jsonify({'error': 'Request body required'}), 400

        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return jsonify({
                'error': 'Missing required fields',
                'required': ['email', 'password']
            }), 400

        # Find user by email
        user = User.query.filter_by(email=email.lower()).first()

        if not user or not user.check_password(password):
            return jsonify({'error': 'Invalid email or password'}), 401

        # Generate tokens
        access_token, refresh_token = generate_tokens(
            user.id,
            user.organization_id
        )

        # Update last login (if you add this field to the model later)
        user.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Login successful',
            'user': user.to_dict(),
            'access_token': access_token,
            'refresh_token': refresh_token
        }), 200

    except Exception as e:
        return jsonify({'error': 'Login failed', 'message': str(e)}), 500


@auth_bp.route('/refresh', methods=['POST'])
@jwt_required(refresh=True)
def refresh():
    """
    Refresh access token using refresh token.

    Headers:
        Authorization: Bearer <refresh_token>

    Returns:
        200: New access token
        401: Invalid or expired refresh token
    """
    try:
        identity = get_jwt_identity()
        user_id = identity.get('user_id')
        organization_id = identity.get('organization_id')

        # Generate new access token
        access_token = create_access_token(
            identity={'user_id': user_id, 'organization_id': organization_id}
        )

        return jsonify({'access_token': access_token}), 200

    except Exception as e:
        return jsonify({'error': 'Token refresh failed', 'message': str(e)}), 401


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    """
    Get current authenticated user's profile.

    Headers:
        Authorization: Bearer <access_token>

    Returns:
        200: User profile
        401: Not authenticated
    """
    try:
        user = get_current_user()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        return jsonify({'user': user.to_dict()}), 200

    except Exception as e:
        return jsonify({'error': 'Failed to get user', 'message': str(e)}), 500


@auth_bp.route('/me', methods=['PUT'])
@jwt_required()
def update_profile():
    """
    Update current user's profile.

    Request Body:
        {
            "name": "New Name",
            "email": "newemail@example.com"
        }

    Returns:
        200: Profile updated
        400: Validation error
        401: Not authenticated
    """
    try:
        user = get_current_user()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400

        # Update name if provided
        if 'name' in data:
            user.name = data['name']

        # Update email if provided and validate
        if 'email' in data:
            new_email = data['email'].lower()

            if not validate_email(new_email):
                return jsonify({'error': 'Invalid email format'}), 400

            # Check if email is already taken by another user
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

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Update failed', 'message': str(e)}), 500


@auth_bp.route('/change-password', methods=['POST'])
@jwt_required()
def change_password():
    """
    Change user's password.

    Request Body:
        {
            "current_password": "OldPass123",
            "new_password": "NewPass123"
        }

    Returns:
        200: Password changed
        400: Validation error
        401: Invalid current password
    """
    try:
        user = get_current_user()

        if not user:
            return jsonify({'error': 'User not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400

        current_password = data.get('current_password')
        new_password = data.get('new_password')

        if not current_password or not new_password:
            return jsonify({
                'error': 'Missing required fields',
                'required': ['current_password', 'new_password']
            }), 400

        # Verify current password
        if not user.check_password(current_password):
            return jsonify({'error': 'Current password is incorrect'}), 401

        # Validate new password strength
        is_valid, error_msg = validate_password_strength(new_password)
        if not is_valid:
            return jsonify({'error': error_msg}), 400

        # Update password
        user.set_password(new_password)
        user.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({'message': 'Password changed successfully'}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Password change failed', 'message': str(e)}), 500


@auth_bp.route('/logout', methods=['POST'])
@jwt_required()
def logout():
    """
    Logout user (client should discard tokens).

    Note: Since we're using stateless JWT, actual logout happens client-side.
    This endpoint is provided for consistency and future token blacklisting.

    Headers:
        Authorization: Bearer <access_token>

    Returns:
        200: Logout successful
    """
    # In a production app, you might want to:
    # 1. Add token to blacklist/revocation list
    # 2. Store in Redis with TTL matching token expiration
    # For now, we'll just return success

    return jsonify({'message': 'Logout successful'}), 200


# Error handlers for JWT
@auth_bp.errorhandler(401)
def unauthorized(e):
    """Handle unauthorized errors."""
    return jsonify({'error': 'Unauthorized', 'message': str(e)}), 401


@auth_bp.errorhandler(422)
def unprocessable(e):
    """Handle JWT validation errors."""
    return jsonify({'error': 'Invalid token', 'message': str(e)}), 422

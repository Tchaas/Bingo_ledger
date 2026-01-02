"""
Organization profile routes.
"""
from datetime import datetime
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required

from app import db
from app.auth.decorators import get_current_user
from app.models import Organization

organizations_bp = Blueprint('organizations', __name__)


@organizations_bp.route('/<int:organization_id>', methods=['GET'])
@jwt_required()
def get_organization(organization_id: int):
    """
    Get organization details for the authenticated user.
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if user.organization_id != organization_id:
            return jsonify({'error': 'Forbidden'}), 403

        organization = Organization.query.get(organization_id)
        if not organization:
            return jsonify({'error': 'Organization not found'}), 404

        return jsonify({'organization': organization.to_dict()}), 200
    except Exception as e:
        return jsonify({'error': 'Failed to get organization', 'message': str(e)}), 500


@organizations_bp.route('/<int:organization_id>', methods=['PUT'])
@jwt_required()
def update_organization(organization_id: int):
    """
    Update organization details for the authenticated user.
    """
    try:
        user = get_current_user()
        if not user:
            return jsonify({'error': 'User not found'}), 404

        if user.organization_id != organization_id:
            return jsonify({'error': 'Forbidden'}), 403

        organization = Organization.query.get(organization_id)
        if not organization:
            return jsonify({'error': 'Organization not found'}), 404

        data = request.get_json()
        if not data:
            return jsonify({'error': 'Request body required'}), 400

        allowed_fields = {
            'name': 'name',
            'ein': 'ein',
            'address': 'address',
            'city': 'city',
            'state': 'state',
            'zip_code': 'zip_code',
            'phone': 'phone',
            'website': 'website',
            'tax_exempt_status': 'tax_exempt_status'
        }

        if 'ein' in data and data['ein'] != organization.ein:
            existing = Organization.query.filter_by(ein=data['ein']).first()
            if existing and existing.id != organization.id:
                return jsonify({'error': 'EIN already in use'}), 409

        for incoming_key, model_key in allowed_fields.items():
            if incoming_key in data:
                setattr(organization, model_key, data[incoming_key])

        organization.updated_at = datetime.utcnow()
        db.session.commit()

        return jsonify({
            'message': 'Organization updated successfully',
            'organization': organization.to_dict()
        }), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({'error': 'Update failed', 'message': str(e)}), 500

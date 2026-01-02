"""
Form 990 routes for tax form management.
"""
from flask import Blueprint, request, jsonify, abort

from app import db
from app.models import Form990Data, Organization
from app.validation import ValidationError, validate_form990_payload

form990_bp = Blueprint('form990', __name__)


@form990_bp.route('/<int:year>', methods=['GET'])
def get_form990(year):
    """Get Form 990 data for a specific year."""
    organization_id = request.args.get('organization_id', type=int)
    if not organization_id:
        raise ValidationError('Invalid Form 990 request.', {'organization_id': 'Organization ID is required.'})

    form_record = Form990Data.query.filter_by(organization_id=organization_id, tax_year=year).first()
    if not form_record:
        abort(404, description='Form 990 data not found.')

    return jsonify(form_record.to_dict()), 200


@form990_bp.route('/', methods=['POST'])
def save_form990():
    """Create or update Form 990 data."""
    payload = request.get_json(silent=True) or {}
    errors = validate_form990_payload(payload, require_required_fields=True)
    if errors:
        raise ValidationError('Invalid Form 990 payload.', errors)

    organization = Organization.query.get(payload.get('organization_id'))
    if not organization:
        raise ValidationError('Invalid Form 990 payload.', {'organization_id': 'Organization not found.'})

    form_record = Form990Data.query.filter_by(
        organization_id=organization.id,
        tax_year=payload.get('tax_year')
    ).first()

    if form_record:
        form_record.data = payload.get('data')
        form_record.status = payload.get('status') or form_record.status
    else:
        form_record = Form990Data(
            organization_id=organization.id,
            tax_year=payload.get('tax_year'),
            data=payload.get('data'),
            status=payload.get('status') or 'draft'
        )
        db.session.add(form_record)

    db.session.commit()

    return jsonify(form_record.to_dict()), 200


@form990_bp.route('/generate', methods=['POST'])
def generate_form990():
    """Generate PDF/XML for Form 990."""
    payload = request.get_json(silent=True) or {}
    errors = {}
    if payload.get('organization_id') is None:
        errors['organization_id'] = 'Organization ID is required.'
    elif not isinstance(payload.get('organization_id'), int):
        errors['organization_id'] = 'Organization ID must be an integer.'
    if payload.get('tax_year') is None:
        errors['tax_year'] = 'Tax year is required.'
    elif not isinstance(payload.get('tax_year'), int):
        errors['tax_year'] = 'Tax year must be an integer.'
    if errors:
        raise ValidationError('Invalid Form 990 request.', errors)

    form_record = Form990Data.query.filter_by(
        organization_id=payload.get('organization_id'),
        tax_year=payload.get('tax_year')
    ).first()
    if not form_record:
        abort(404, description='Form 990 data not found.')

    return jsonify({
        'message': 'Form 990 generation queued.',
        'form990_id': form_record.id
    }), 200


@form990_bp.route('/validate', methods=['POST'])
def validate_form990():
    """Validate Form 990 data."""
    payload = request.get_json(silent=True) or {}
    errors = validate_form990_payload(payload, require_required_fields=True)
    if errors:
        raise ValidationError('Invalid Form 990 payload.', errors)

    return jsonify({
        'message': 'Form 990 payload is valid.',
        'field_errors': {}
    }), 200

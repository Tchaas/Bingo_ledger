"""
Form 990 routes for tax form management.
"""
from datetime import datetime
import io
import json
import time

from flask import Blueprint, request, jsonify, send_file

from app import db
from app.models import Form990Data, Organization
from app.monitoring import track_form990_generation

form990_bp = Blueprint('form990', __name__)


def _parse_tax_year(value):
    if value in (None, ''):
        return None
    try:
        return int(value)
    except (TypeError, ValueError):
        return None


def _resolve_organization_id(payload):
    org_id = request.args.get('organization_id', type=int)
    if org_id:
        return org_id
    if payload and payload.get('organization_id'):
        return payload.get('organization_id')
    org = Organization.query.order_by(Organization.id.asc()).first()
    return org.id if org else None


def _extract_form_payload(payload):
    if isinstance(payload.get('data'), dict):
        return payload['data']
    return None


def _validate_form_payload(payload):
    errors = {}
    tax_year = _parse_tax_year(
        payload.get('tax_year')
        or payload.get('taxYear')
        or (payload.get('data') or {}).get('taxYear')
    )
    if not tax_year:
        errors['tax_year'] = 'Tax year is required.'

    data = _extract_form_payload(payload)
    if not isinstance(data, dict):
        errors['data'] = 'Form data payload is required.'
        return errors

    required_fields = [
        'organizationName',
        'ein',
        'address',
        'city',
        'state',
        'zipCode'
    ]
    for field in required_fields:
        if not data.get(field):
            errors[field] = f'{field} is required.'

    return errors


@form990_bp.route('/<int:year>', methods=['GET'])
def get_form990(year):
    """Get Form 990 data for a specific year."""
    org_id = request.args.get('organization_id', type=int)
    if not org_id:
        organization = Organization.query.order_by(Organization.id.asc()).first()
        org_id = organization.id if organization else None

    query = Form990Data.query.filter_by(tax_year=year)
    if org_id:
        query = query.filter_by(organization_id=org_id)

    form990 = query.order_by(Form990Data.updated_at.desc()).first()
    if not form990:
        return jsonify({'message': 'Form 990 data not found'}), 404

    return jsonify(form990.to_dict()), 200


@form990_bp.route('/', methods=['POST'])
def save_form990():
    """Create or update Form 990 data."""
    payload = request.get_json(silent=True) or {}
    tax_year = _parse_tax_year(payload.get('tax_year') or payload.get('taxYear'))
    data = _extract_form_payload(payload)
    status = payload.get('status') or 'draft'
    org_id = _resolve_organization_id(payload)

    errors = {}
    if not org_id:
        errors['organization_id'] = 'Organization is required.'
    if not tax_year:
        errors['tax_year'] = 'Tax year is required.'
    if not isinstance(data, dict):
        errors['data'] = 'Form data payload is required.'

    if errors:
        return jsonify({'message': 'Invalid payload', 'errors': errors}), 400

    form990 = Form990Data.query.filter_by(
        organization_id=org_id,
        tax_year=tax_year
    ).first()

    created = False
    if not form990:
        form990 = Form990Data(
            organization_id=org_id,
            tax_year=tax_year,
            data=data,
            status=status
        )
        created = True
    else:
        form990.data = data
        form990.status = status
        form990.updated_at = datetime.utcnow()

    db.session.add(form990)
    db.session.commit()

    return jsonify(form990.to_dict()), 201 if created else 200


@form990_bp.route('/generate', methods=['POST'])
def generate_form990():
    """Generate PDF/XML for Form 990."""
    payload = request.get_json(silent=True) or {}
    tax_year = _parse_tax_year(
        payload.get('tax_year')
        or payload.get('taxYear')
        or (payload.get('data') or {}).get('taxYear')
    )
    org_id = _resolve_organization_id(payload)
    data = _extract_form_payload(payload)

    if not data and org_id and tax_year:
        existing = Form990Data.query.filter_by(
            organization_id=org_id,
            tax_year=tax_year
        ).first()
        if existing:
            data = existing.data

    errors = {}
    if not tax_year:
        errors['tax_year'] = 'Tax year is required.'
    if not isinstance(data, dict):
        errors['data'] = 'Form data payload is required.'
    if errors:
        return jsonify({'message': 'Invalid payload', 'errors': errors}), 400

    start_time = time.monotonic()
    try:
        content = json.dumps({
            'organization_id': org_id,
            'tax_year': tax_year,
            'generated_at': datetime.utcnow().isoformat(),
            'data': data
        }, indent=2)
        buffer = io.BytesIO(content.encode('utf-8'))
        filename = f'form990-{tax_year}.json'
        track_form990_generation('success', time.monotonic() - start_time)
        return send_file(
            buffer,
            mimetype='application/json',
            as_attachment=True,
            download_name=filename
        )
    except Exception:
        track_form990_generation('failure', time.monotonic() - start_time)
        raise


@form990_bp.route('/validate', methods=['POST'])
def validate_form990():
    """Validate Form 990 data."""
    payload = request.get_json(silent=True) or {}
    errors = _validate_form_payload(payload)

    if errors:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 400

    return jsonify({'message': 'Validation successful', 'valid': True}), 200

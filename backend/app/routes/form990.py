"""
Form 990 routes for tax form management.
"""
from datetime import datetime
from decimal import Decimal, InvalidOperation
import re

from flask import Blueprint, request, jsonify

from app import db
from app.models import Form990Data

form990_bp = Blueprint('form990', __name__)


def _parse_decimal(value):
    if value in (None, ''):
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def _parse_date(value):
    if not value:
        return None
    try:
        return datetime.strptime(value, '%Y-%m-%d').date()
    except ValueError:
        return None


def _validate_form990_payload(payload, require_data=True):
    errors = {}

    organization_id = payload.get('organization_id')
    if not organization_id:
        errors['organization_id'] = 'Organization is required.'
    elif not isinstance(organization_id, int):
        try:
            organization_id = int(organization_id)
        except (TypeError, ValueError):
            errors['organization_id'] = 'Organization must be a valid integer.'

    tax_year = payload.get('tax_year')
    if tax_year is None:
        errors['tax_year'] = 'Tax year is required.'
    else:
        try:
            tax_year = int(tax_year)
            if tax_year < 1900 or tax_year > 2100:
                errors['tax_year'] = 'Tax year must be between 1900 and 2100.'
        except (TypeError, ValueError):
            errors['tax_year'] = 'Tax year must be a valid integer.'

    data = payload.get('data')
    if require_data and not isinstance(data, dict):
        errors['data'] = 'Form 990 data must be an object.'

    if isinstance(data, dict):
        if 'organization_name' in data and not str(data.get('organization_name') or '').strip():
            errors['data.organization_name'] = 'Organization name is required.'
        ein_value = data.get('ein')
        if ein_value:
            normalized = str(ein_value).strip()
            if not re.fullmatch(r'\d{2}-?\d{7}', normalized):
                errors['data.ein'] = 'EIN must be in the format 12-3456789.'
        period_start = _parse_date(data.get('tax_period_start'))
        period_end = _parse_date(data.get('tax_period_end'))
        if data.get('tax_period_start') and not period_start:
            errors['data.tax_period_start'] = 'Tax period start must be YYYY-MM-DD.'
        if data.get('tax_period_end') and not period_end:
            errors['data.tax_period_end'] = 'Tax period end must be YYYY-MM-DD.'
        if period_start and period_end and period_start > period_end:
            errors['data.tax_period_range'] = 'Tax period start must be before end.'

        for key in ('total_revenue', 'total_expenses', 'total_assets', 'total_liabilities'):
            if key in data and data.get(key) not in (None, ''):
                if _parse_decimal(data.get(key)) is None:
                    errors[f'data.{key}'] = f'{key.replace("_", " ").title()} must be numeric.'

    return errors


@form990_bp.route('/<int:year>', methods=['GET'])
def get_form990(year):
    """Get Form 990 data for a specific year."""
    organization_id = request.args.get('organization_id', type=int)
    if not organization_id:
        return jsonify({'message': 'organization_id is required'}), 400

    record = (
        Form990Data.query
        .filter_by(organization_id=organization_id, tax_year=year)
        .order_by(Form990Data.updated_at.desc())
        .first()
    )
    if not record:
        return jsonify({'message': 'Form 990 data not found'}), 404

    return jsonify(record.to_dict()), 200


@form990_bp.route('/', methods=['POST'])
def save_form990():
    """Create or update Form 990 data."""
    payload = request.get_json(silent=True) or {}
    errors = _validate_form990_payload(payload, require_data=True)
    if errors:
        return jsonify({'message': 'Validation failed', 'errors': errors}), 400

    organization_id = int(payload['organization_id'])
    tax_year = int(payload['tax_year'])
    status = payload.get('status') or 'draft'
    data = payload.get('data') or {}

    record = Form990Data.query.filter_by(
        organization_id=organization_id,
        tax_year=tax_year
    ).first()

    if record:
        record.data = data
        record.status = status
        db.session.commit()
        return jsonify(record.to_dict()), 200

    record = Form990Data(
        organization_id=organization_id,
        tax_year=tax_year,
        data=data,
        status=status
    )
    db.session.add(record)
    db.session.commit()
    return jsonify(record.to_dict()), 201


@form990_bp.route('/generate', methods=['POST'])
def generate_form990():
    """Generate PDF/XML for Form 990."""
    payload = request.get_json(silent=True) or {}
    tax_year = payload.get('tax_year')

    placeholder_filename = f'form990_{tax_year or "pending"}.pdf'
    return jsonify({
        'status': 'pending',
        'message': 'Form 990 generation is not yet available.',
        'artifact': {
            'filename': placeholder_filename,
            'content_type': 'application/pdf',
            'url': None
        }
    }), 202


@form990_bp.route('/validate', methods=['POST'])
def validate_form990():
    """Validate Form 990 data."""
    payload = request.get_json(silent=True) or {}
    errors = _validate_form990_payload(payload, require_data=True)

    return jsonify({
        'valid': len(errors) == 0,
        'errors': errors
    }), 200

"""
Account routes for chart of accounts management.
"""
from decimal import Decimal, InvalidOperation

from flask import Blueprint, request, jsonify, abort

from app import db
from app.models import Account, Organization
from app.validation import ValidationError, validate_account_payload

accounts_bp = Blueprint('accounts', __name__)


def _parse_decimal(value):
    if value in (None, ''):
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


@accounts_bp.route('/', methods=['GET'])
def list_accounts():
    """List all accounts."""
    organization_id = request.args.get('organization_id', type=int)
    query = Account.query
    if organization_id:
        query = query.filter(Account.organization_id == organization_id)

    accounts = [account.to_dict() for account in query.all()]
    return jsonify({'accounts': accounts, 'total': len(accounts)}), 200


@accounts_bp.route('/', methods=['POST'])
def create_account():
    """Create a new account."""
    payload = request.get_json(silent=True) or {}
    errors = validate_account_payload(payload, require_required_fields=True)
    if errors:
        raise ValidationError('Invalid account payload.', errors)

    organization = Organization.query.get(payload.get('organization_id'))
    if not organization:
        raise ValidationError('Invalid account payload.', {'organization_id': 'Organization not found.'})

    balance = _parse_decimal(payload.get('balance'))
    if payload.get('balance') is not None and balance is None:
        raise ValidationError('Invalid account payload.', {'balance': 'Balance must be a valid number.'})

    account = Account(
        organization_id=organization.id,
        code=payload.get('code'),
        name=payload.get('name'),
        account_type=payload.get('account_type'),
        category_id=payload.get('category_id'),
        balance=balance or Decimal('0')
    )
    db.session.add(account)
    db.session.commit()

    return jsonify(account.to_dict()), 201


@accounts_bp.route('/<int:account_id>', methods=['GET'])
def get_account(account_id):
    """Get a specific account."""
    account = Account.query.get(account_id)
    if not account:
        abort(404, description='Account not found.')
    return jsonify(account.to_dict()), 200


@accounts_bp.route('/<int:account_id>', methods=['PUT'])
def update_account(account_id):
    """Update an account."""
    account = Account.query.get(account_id)
    if not account:
        abort(404, description='Account not found.')

    payload = request.get_json(silent=True) or {}
    errors = validate_account_payload(payload, require_required_fields=False)
    if errors:
        raise ValidationError('Invalid account payload.', errors)

    if 'organization_id' in payload:
        organization = Organization.query.get(payload.get('organization_id'))
        if not organization:
            raise ValidationError('Invalid account payload.', {'organization_id': 'Organization not found.'})
        account.organization_id = organization.id
    if 'code' in payload:
        account.code = payload.get('code')
    if 'name' in payload:
        account.name = payload.get('name')
    if 'account_type' in payload:
        account.account_type = payload.get('account_type')
    if 'category_id' in payload:
        account.category_id = payload.get('category_id')
    if 'balance' in payload:
        balance = _parse_decimal(payload.get('balance'))
        if payload.get('balance') is not None and balance is None:
            raise ValidationError('Invalid account payload.', {'balance': 'Balance must be a valid number.'})
        account.balance = balance or Decimal('0')

    db.session.commit()
    return jsonify(account.to_dict()), 200


@accounts_bp.route('/<int:account_id>', methods=['DELETE'])
def delete_account(account_id):
    """Delete an account."""
    account = Account.query.get(account_id)
    if not account:
        abort(404, description='Account not found.')

    db.session.delete(account)
    db.session.commit()
    return jsonify({'message': 'Account deleted'}), 200

"""
Account routes for chart of accounts management.
"""
from flask import Blueprint, request, jsonify
from sqlalchemy import or_

from app import db
from app.models import Account
from app.utils.form990_categories import FORM_990_CATEGORIES, FORM_990_CATEGORY_LOOKUP

accounts_bp = Blueprint('accounts', __name__)


def _serialize_account(account):
    payload = account.to_dict()
    if account.category_id:
        payload['category'] = FORM_990_CATEGORY_LOOKUP.get(account.category_id)
    else:
        payload['category'] = None
    return payload


@accounts_bp.route('/', methods=['GET'])
def list_accounts():
    """List all accounts."""
    query = Account.query

    organization_id = request.args.get('organization_id', type=int)
    account_type = request.args.get('account_type')
    search = request.args.get('search')

    if organization_id:
        query = query.filter(Account.organization_id == organization_id)
    if account_type:
        query = query.filter(Account.account_type == account_type)
    if search:
        like_term = f'%{search}%'
        query = query.filter(or_(Account.name.ilike(like_term), Account.code.ilike(like_term)))

    accounts = [_serialize_account(account) for account in query.order_by(Account.code.asc()).all()]

    return jsonify({
        'accounts': accounts,
        'total': len(accounts),
        'categories': FORM_990_CATEGORIES
    }), 200


@accounts_bp.route('/', methods=['POST'])
def create_account():
    """Create a new account."""
    # TODO: Implement account creation
    return jsonify({'message': 'Not implemented'}), 501


@accounts_bp.route('/<int:account_id>', methods=['GET'])
def get_account(account_id):
    """Get a specific account."""
    # TODO: Implement account retrieval
    return jsonify({'message': 'Not implemented'}), 501


@accounts_bp.route('/<int:account_id>', methods=['PUT'])
def update_account(account_id):
    """Update an account."""
    account = Account.query.get(account_id)
    if not account:
        return jsonify({'message': 'Account not found'}), 404

    payload = request.get_json(silent=True) or {}
    if 'category_id' not in payload:
        return jsonify({'message': 'category_id is required'}), 400

    category_id = payload.get('category_id')
    if category_id and category_id not in FORM_990_CATEGORY_LOOKUP:
        return jsonify({'message': 'Invalid category_id'}), 400

    account.category_id = category_id
    db.session.commit()

    return jsonify(_serialize_account(account)), 200


@accounts_bp.route('/bulk-category', methods=['PUT'])
def bulk_update_categories():
    """Bulk assign categories to accounts."""
    payload = request.get_json(silent=True) or {}
    updates = payload.get('updates')
    account_ids = payload.get('account_ids')
    category_id = payload.get('category_id')

    if updates is None and not account_ids:
        return jsonify({'message': 'Provide updates or account_ids'}), 400

    if updates is not None:
        if not isinstance(updates, list):
            return jsonify({'message': 'updates must be a list'}), 400
        account_ids = []
        category_map = {}
        for entry in updates:
            if not isinstance(entry, dict):
                return jsonify({'message': 'Each update must be an object'}), 400
            entry_id = entry.get('id')
            entry_category = entry.get('category_id')
            if entry_id is None:
                return jsonify({'message': 'Each update requires id'}), 400
            if entry_category and entry_category not in FORM_990_CATEGORY_LOOKUP:
                return jsonify({'message': f'Invalid category_id for account {entry_id}'}), 400
            account_ids.append(entry_id)
            category_map[entry_id] = entry_category
    else:
        if category_id and category_id not in FORM_990_CATEGORY_LOOKUP:
            return jsonify({'message': 'Invalid category_id'}), 400
        category_map = {account_id: category_id for account_id in account_ids}

    if not account_ids:
        return jsonify({'message': 'No account ids provided'}), 400

    accounts = Account.query.filter(Account.id.in_(account_ids)).all()
    account_index = {account.id: account for account in accounts}
    missing_ids = [account_id for account_id in account_ids if account_id not in account_index]
    if missing_ids:
        return jsonify({'message': 'Accounts not found', 'missing_ids': missing_ids}), 404

    for account_id, new_category in category_map.items():
        account_index[account_id].category_id = new_category

    db.session.commit()

    return jsonify({
        'updated': [_serialize_account(account) for account in accounts],
        'total': len(accounts)
    }), 200


@accounts_bp.route('/<int:account_id>', methods=['DELETE'])
def delete_account(account_id):
    """Delete an account."""
    # TODO: Implement account deletion
    return jsonify({'message': 'Not implemented'}), 501

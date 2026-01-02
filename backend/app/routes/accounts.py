"""
Account routes for chart of accounts management.
"""
from flask import Blueprint, request, jsonify
from app import db
from app.models import Account, Organization

accounts_bp = Blueprint('accounts', __name__)


@accounts_bp.route('/', methods=['GET'])
def list_accounts():
    """List all accounts."""
    organization_id = request.args.get('organization_id', type=int)
    
    query = Account.query
    if organization_id:
        query = query.filter_by(organization_id=organization_id)
        
    accounts = query.order_by(Account.code).all()
    
    return jsonify({
        'accounts': [account.to_dict() for account in accounts],
        'total': len(accounts)
    }), 200


@accounts_bp.route('/', methods=['POST'])
def create_account():
    """Create a new account."""
    payload = request.get_json(silent=True) or {}
    
    required_fields = ['organization_id', 'code', 'name', 'account_type']
    for field in required_fields:
        if not payload.get(field):
            return jsonify({'message': f'{field} is required'}), 400
            
    # Verify organization exists
    org = Organization.query.get(payload['organization_id'])
    if not org:
        return jsonify({'message': 'Organization not found'}), 404
        
    # Check for duplicate code within organization
    existing = Account.query.filter_by(
        organization_id=payload['organization_id'], 
        code=payload['code']
    ).first()
    if existing:
        return jsonify({'message': 'Account code already exists for this organization'}), 409

    account = Account(
        organization_id=payload['organization_id'],
        code=payload['code'],
        name=payload['name'],
        account_type=payload['account_type'],
        category_id=payload.get('category_id'),
        balance=payload.get('balance', 0)
    )
    
    db.session.add(account)
    db.session.commit()
    
    return jsonify(account.to_dict()), 201


@accounts_bp.route('/<int:account_id>', methods=['GET'])
def get_account(account_id):
    """Get a specific account."""
    account = Account.query.get(account_id)
    if not account:
        return jsonify({'message': 'Account not found'}), 404
    return jsonify(account.to_dict()), 200


@accounts_bp.route('/<int:account_id>', methods=['PUT'])
def update_account(account_id):
    """Update an account."""
    account = Account.query.get(account_id)
    if not account:
        return jsonify({'message': 'Account not found'}), 404
        
    payload = request.get_json(silent=True) or {}
    
    if 'code' in payload:
        # Check for duplicate if code is changing
        if payload['code'] != account.code:
            existing = Account.query.filter_by(
                organization_id=account.organization_id, 
                code=payload['code']
            ).first()
            if existing:
                return jsonify({'message': 'Account code already exists'}), 409
        account.code = payload['code']
        
    if 'name' in payload:
        account.name = payload['name']
    if 'account_type' in payload:
        account.account_type = payload['account_type']
    if 'category_id' in payload:
        account.category_id = payload['category_id']
    if 'balance' in payload:
        account.balance = payload['balance']
        
    db.session.commit()
    return jsonify(account.to_dict()), 200


@accounts_bp.route('/<int:account_id>', methods=['DELETE'])
def delete_account(account_id):
    """Delete an account."""
    account = Account.query.get(account_id)
    if not account:
        return jsonify({'message': 'Account not found'}), 404
        
    # Check if used in transactions
    if account.transactions:
        return jsonify({'message': 'Cannot delete account with associated transactions'}), 409
        
    db.session.delete(account)
    db.session.commit()
    return jsonify({'message': 'Account deleted'}), 200

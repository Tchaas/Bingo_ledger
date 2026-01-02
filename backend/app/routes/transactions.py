"""
Transaction routes for managing financial transactions.
"""
from datetime import datetime
from decimal import Decimal, InvalidOperation

from flask import Blueprint, request, jsonify
from app import db
from app.models import Transaction
from app.monitoring import track_transaction_created

transactions_bp = Blueprint('transactions', __name__)


def _parse_decimal(value, field_name):
    if value is None:
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        raise ValueError(f"Invalid {field_name} value")


def _parse_date(value):
    if not value:
        raise ValueError("Date is required")
    try:
        return datetime.fromisoformat(value).date()
    except (ValueError, TypeError):
        raise ValueError("Invalid date format; expected ISO-8601")


def _transaction_from_payload(payload, transaction=None):
    if transaction is None:
        transaction = Transaction()

    transaction.organization_id = payload.get('organization_id', transaction.organization_id)
    transaction.account_id = payload.get('account_id', transaction.account_id)
    transaction.transaction_id = payload.get('transaction_id', transaction.transaction_id)

    if 'date' in payload:
        transaction.date = _parse_date(payload.get('date'))

    if 'description' in payload:
        transaction.description = payload.get('description')

    if 'category_id' in payload:
        transaction.category_id = payload.get('category_id')

    if 'subcategory' in payload:
        transaction.subcategory = payload.get('subcategory')

    if 'debit' in payload:
        transaction.debit = _parse_decimal(payload.get('debit'), 'debit')

    if 'credit' in payload:
        transaction.credit = _parse_decimal(payload.get('credit'), 'credit')

    if 'balance' in payload:
        transaction.balance = _parse_decimal(payload.get('balance'), 'balance')

    if 'status' in payload:
        transaction.status = payload.get('status')

    if 'additional_fields' in payload:
        transaction.additional_fields = payload.get('additional_fields')

    return transaction


@transactions_bp.route('/', methods=['GET'])
def list_transactions():
    """List all transactions with optional filtering."""
    query = Transaction.query

    organization_id = request.args.get('organization_id', type=int)
    account_id = request.args.get('account_id', type=int)
    status = request.args.get('status')
    category_id = request.args.get('category_id')
    start_date = request.args.get('start_date')
    end_date = request.args.get('end_date')

    if organization_id:
        query = query.filter(Transaction.organization_id == organization_id)
    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    if status:
        query = query.filter(Transaction.status == status)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    try:
        if start_date:
            query = query.filter(Transaction.date >= _parse_date(start_date))
        if end_date:
            query = query.filter(Transaction.date <= _parse_date(end_date))
    except ValueError as exc:
        return jsonify({'message': str(exc)}), 400

    transactions = query.order_by(Transaction.date.desc()).all()
    return jsonify({
        'transactions': [transaction.to_dict() for transaction in transactions],
        'total': len(transactions)
    }), 200


@transactions_bp.route('/', methods=['POST'])
def create_transaction():
    """Create a new transaction."""
    payload = request.get_json(silent=True) or {}
    missing_fields = [
        field for field in ('organization_id', 'account_id', 'transaction_id', 'date', 'description')
        if not payload.get(field)
    ]
    if missing_fields:
        return jsonify({'message': 'Missing required fields', 'fields': missing_fields}), 400

    try:
        transaction = _transaction_from_payload(payload)
    except ValueError as exc:
        return jsonify({'message': str(exc)}), 400

    db.session.add(transaction)
    db.session.commit()

    amount = transaction.debit or transaction.credit
    if amount is not None:
        transaction_type = 'debit' if transaction.debit is not None else 'credit'
        track_transaction_created(transaction_type, float(amount))

    return jsonify({'transaction': transaction.to_dict()}), 201


@transactions_bp.route('/<int:transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    """Get a specific transaction."""
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404
    return jsonify({'transaction': transaction.to_dict()}), 200


@transactions_bp.route('/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """Update a transaction."""
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404

    payload = request.get_json(silent=True) or {}
    try:
        transaction = _transaction_from_payload(payload, transaction=transaction)
    except ValueError as exc:
        return jsonify({'message': str(exc)}), 400

    db.session.commit()
    return jsonify({'transaction': transaction.to_dict()}), 200


@transactions_bp.route('/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """Delete a transaction."""
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404

    db.session.delete(transaction)
    db.session.commit()
    return jsonify({'message': 'Transaction deleted'}), 200


@transactions_bp.route('/import-csv', methods=['POST'])
def import_csv():
    """Import transactions from CSV file."""
    # TODO: Implement CSV import with monitoring
    return jsonify({'message': 'Not implemented'}), 501

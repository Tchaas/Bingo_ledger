"""
Transaction routes for managing financial transactions.
"""
import csv
import io
import json
from datetime import datetime
from decimal import Decimal, InvalidOperation

from flask import Blueprint, request, jsonify

from app import db
from app.models import Transaction, Account
from app.services.transactions_service import (
    parse_date as service_parse_date,
    parse_decimal as service_parse_decimal,
    build_transactions_query,
    apply_sort,
    paginate_transactions,
    calculate_totals,
    calculate_running_balances
)

transactions_bp = Blueprint('transactions', __name__)


def _parse_date(value):
    if not value:
        return None
    try:
        return datetime.strptime(value, '%Y-%m-%d').date()
    except ValueError:
        return None


def _parse_decimal(value):
    if value in (None, ''):
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def _parse_additional_fields(value):
    if value is None:
        return None
    if isinstance(value, dict):
        return value
    if isinstance(value, str):
        try:
            return json.loads(value)
        except json.JSONDecodeError:
            return {'value': value}
    return {'value': value}


def _resolve_account(account_id, organization_id):
    if account_id:
        return Account.query.get(account_id)
    if organization_id:
        return Account.query.filter_by(organization_id=organization_id).first()
    return Account.query.first()


def _generate_transaction_id(organization_id):
    year = datetime.utcnow().year
    prefix = f'TXN-{year}-'
    existing = (
        Transaction.query.filter(
            Transaction.organization_id == organization_id,
            Transaction.transaction_id.like(f'{prefix}%')
        )
        .order_by(Transaction.transaction_id.desc())
        .first()
    )
    next_number = 1
    if existing:
        try:
            next_number = int(existing.transaction_id.split('-')[-1]) + 1
        except (IndexError, ValueError):
            next_number = 1
    return f'{prefix}{next_number:03d}'


@transactions_bp.route('/', methods=['GET'])
def list_transactions():
    """List all transactions with optional filtering."""
    filters = {
        'organization_id': request.args.get('organization_id', type=int),
        'account_id': request.args.get('account_id', type=int),
        'category_id': request.args.get('category_id'),
        'status': request.args.get('status'),
        'search': request.args.get('search'),
        'year': request.args.get('year', type=int),
        'month': request.args.get('month', type=int),
        'start_date': service_parse_date(request.args.get('start_date')),
        'end_date': service_parse_date(request.args.get('end_date')),
        'type': request.args.get('type'),
        'min_amount': service_parse_decimal(request.args.get('min_amount')),
        'max_amount': service_parse_decimal(request.args.get('max_amount'))
    }

    base_query = build_transactions_query(filters)

    sort_by = request.args.get('sort_by', 'date')
    sort_dir = request.args.get('sort_dir', 'desc')
    query = apply_sort(base_query, sort_by=sort_by, sort_dir=sort_dir)

    page = max(request.args.get('page', default=1, type=int), 1)
    per_page = min(max(request.args.get('per_page', default=50, type=int), 1), 200)

    balances = calculate_running_balances(base_query)
    pagination = paginate_transactions(query, page=page, per_page=per_page)
    totals = calculate_totals(base_query)

    transactions = []
    for transaction in pagination.items:
        payload = transaction.to_dict()
        if transaction.id in balances:
            payload['balance'] = balances[transaction.id]
        transactions.append(payload)

    return jsonify({
        'transactions': transactions,
        'total': pagination.total,
        'page': page,
        'per_page': per_page,
        'totals': totals
    }), 200


@transactions_bp.route('/', methods=['POST'])
def create_transaction():
    """Create a new transaction."""
    payload = request.get_json(silent=True) or {}

    account = _resolve_account(payload.get('account_id'), payload.get('organization_id'))
    if not account:
        return jsonify({'message': 'Account not found'}), 400

    transaction_date = _parse_date(payload.get('date'))
    if not transaction_date or not payload.get('description'):
        return jsonify({'message': 'Date and description are required'}), 400

    transaction_id = payload.get('transaction_id') or _generate_transaction_id(account.organization_id)

    transaction = Transaction(
        organization_id=account.organization_id,
        account_id=account.id,
        transaction_id=transaction_id,
        date=transaction_date,
        description=payload.get('description'),
        category_id=payload.get('category_id'),
        subcategory=payload.get('subcategory'),
        debit=_parse_decimal(payload.get('debit')),
        credit=_parse_decimal(payload.get('credit')),
        balance=_parse_decimal(payload.get('balance')) or Decimal('0'),
        status=payload.get('status') or 'complete',
        additional_fields=_parse_additional_fields(payload.get('additional_fields'))
    )

    db.session.add(transaction)
    db.session.commit()

    return jsonify(transaction.to_dict()), 201


@transactions_bp.route('/<int:transaction_id>', methods=['GET'])
def get_transaction(transaction_id):
    """Get a specific transaction."""
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404
    return jsonify(transaction.to_dict()), 200


@transactions_bp.route('/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """Update a transaction."""
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404

    payload = request.get_json(silent=True) or {}

    if 'account_id' in payload or 'organization_id' in payload:
        account = _resolve_account(payload.get('account_id'), payload.get('organization_id'))
        if not account:
            return jsonify({'message': 'Account not found'}), 400
        transaction.account_id = account.id
        transaction.organization_id = account.organization_id

    if 'transaction_id' in payload:
        transaction.transaction_id = payload['transaction_id']
    if 'date' in payload:
        parsed_date = _parse_date(payload.get('date'))
        if not parsed_date:
            return jsonify({'message': 'Invalid date format'}), 400
        transaction.date = parsed_date
    if 'description' in payload:
        transaction.description = payload.get('description')
    if 'category_id' in payload:
        transaction.category_id = payload.get('category_id')
    if 'subcategory' in payload:
        transaction.subcategory = payload.get('subcategory')
    if 'debit' in payload:
        transaction.debit = _parse_decimal(payload.get('debit'))
    if 'credit' in payload:
        transaction.credit = _parse_decimal(payload.get('credit'))
    if 'balance' in payload:
        transaction.balance = _parse_decimal(payload.get('balance')) or Decimal('0')
    if 'status' in payload:
        transaction.status = payload.get('status')
    if 'additional_fields' in payload:
        transaction.additional_fields = _parse_additional_fields(payload.get('additional_fields'))

    db.session.commit()

    return jsonify(transaction.to_dict()), 200


@transactions_bp.route('/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """Delete a transaction."""
    transaction = Transaction.query.get(transaction_id)
    if not transaction:
        return jsonify({'message': 'Transaction not found'}), 404

    db.session.delete(transaction)
    db.session.commit()

    return jsonify({'message': 'Transaction deleted'}), 200


@transactions_bp.route('/bulk-recategorize', methods=['POST', 'PATCH'])
def bulk_recategorize():
    """Bulk update transaction categories."""
    payload = request.get_json(silent=True) or {}
    transaction_ids = payload.get('transaction_ids') or payload.get('transactionIds')
    category_id = payload.get('category_id') or payload.get('categoryId')
    subcategory = payload.get('subcategory')
    status = payload.get('status')

    if not transaction_ids or not isinstance(transaction_ids, list):
        return jsonify({'message': 'transaction_ids must be a non-empty list'}), 400

    updates = {}
    if 'category_id' in payload or 'categoryId' in payload:
        updates['category_id'] = category_id
    if 'subcategory' in payload:
        updates['subcategory'] = subcategory
    if 'status' in payload:
        updates['status'] = status

    if not updates:
        return jsonify({'message': 'No updates provided'}), 400

    updated = (
        Transaction.query.filter(Transaction.id.in_(transaction_ids))
        .update(updates, synchronize_session='fetch')
    )
    db.session.commit()

    return jsonify({'message': 'Transactions updated', 'updated': updated}), 200


@transactions_bp.route('/import-csv', methods=['POST'])
def import_csv():
    """Import transactions from CSV file."""
    file = request.files.get('file')
    if not file:
        return jsonify({'message': 'CSV file is required'}), 400

    try:
        content = file.stream.read().decode('utf-8')
    except UnicodeDecodeError:
        return jsonify({'message': 'CSV file must be utf-8 encoded'}), 400

    reader = csv.DictReader(io.StringIO(content))
    rows = []
    errors = []
    for index, row in enumerate(reader, start=1):
        account = _resolve_account(row.get('account_id') or request.form.get('account_id'),
                                   row.get('organization_id') or request.form.get('organization_id'))
        if not account:
            errors.append({'row': index, 'message': 'Account not found'})
            continue

        transaction_date = _parse_date(row.get('date'))
        if not transaction_date or not row.get('description'):
            errors.append({'row': index, 'message': 'Date and description are required'})
            continue

        transaction_id = row.get('transaction_id') or _generate_transaction_id(account.organization_id)
        rows.append({
            'organization_id': account.organization_id,
            'account_id': account.id,
            'transaction_id': transaction_id,
            'date': transaction_date,
            'description': row.get('description'),
            'category_id': row.get('category_id'),
            'subcategory': row.get('subcategory'),
            'debit': _parse_decimal(row.get('debit')),
            'credit': _parse_decimal(row.get('credit')),
            'balance': _parse_decimal(row.get('balance')) or Decimal('0'),
            'status': row.get('status') or 'complete',
            'additional_fields': _parse_additional_fields(row.get('additional_fields'))
        })

    if errors:
        return jsonify({'message': 'CSV import failed', 'errors': errors}), 400

    transactions = [Transaction(**row) for row in rows]
    db.session.add_all(transactions)
    db.session.commit()

    return jsonify({
        'message': 'CSV import complete',
        'count': len(transactions),
        'transactions': [transaction.to_dict() for transaction in transactions]
    }), 201

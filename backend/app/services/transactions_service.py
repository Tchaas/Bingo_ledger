"""Service helpers for transaction query logic."""
from datetime import datetime
from decimal import Decimal, InvalidOperation

from sqlalchemy import or_, func

from app import db
from app.models import Transaction


SORT_MAP = {
    'date': Transaction.date,
    'transaction_id': Transaction.transaction_id,
    'created_at': Transaction.created_at,
    'updated_at': Transaction.updated_at,
    'description': Transaction.description,
}


def parse_date(value):
    if not value:
        return None
    try:
        return datetime.strptime(value, '%Y-%m-%d').date()
    except ValueError:
        return None


def parse_decimal(value):
    if value in (None, ''):
        return None
    try:
        return Decimal(str(value))
    except (InvalidOperation, ValueError, TypeError):
        return None


def build_transactions_query(filters):
    query = Transaction.query

    organization_id = filters.get('organization_id')
    account_id = filters.get('account_id')
    category_id = filters.get('category_id')
    status = filters.get('status')
    search = filters.get('search')
    year = filters.get('year')
    month = filters.get('month')
    start_date = filters.get('start_date')
    end_date = filters.get('end_date')
    transaction_type = filters.get('type')
    min_amount = filters.get('min_amount')
    max_amount = filters.get('max_amount')

    if organization_id:
        query = query.filter(Transaction.organization_id == organization_id)
    if account_id:
        query = query.filter(Transaction.account_id == account_id)
    if category_id:
        query = query.filter(Transaction.category_id == category_id)
    if status:
        query = query.filter(Transaction.status == status)
    if search:
        like_term = f'%{search}%'
        query = query.filter(
            or_(
                Transaction.description.ilike(like_term),
                Transaction.transaction_id.ilike(like_term),
                Transaction.subcategory.ilike(like_term)
            )
        )
    if year:
        query = query.filter(db.extract('year', Transaction.date) == year)
    if month:
        query = query.filter(db.extract('month', Transaction.date) == month)
    if start_date:
        query = query.filter(Transaction.date >= start_date)
    if end_date:
        query = query.filter(Transaction.date <= end_date)
    if transaction_type == 'debit':
        query = query.filter(Transaction.debit.isnot(None))
    if transaction_type == 'credit':
        query = query.filter(Transaction.credit.isnot(None))

    if min_amount is not None and max_amount is not None:
        query = query.filter(
            or_(
                Transaction.debit.between(min_amount, max_amount),
                Transaction.credit.between(min_amount, max_amount)
            )
        )
    elif min_amount is not None:
        query = query.filter(
            or_(
                Transaction.debit >= min_amount,
                Transaction.credit >= min_amount
            )
        )
    elif max_amount is not None:
        query = query.filter(
            or_(
                Transaction.debit <= max_amount,
                Transaction.credit <= max_amount
            )
        )

    return query


def apply_sort(query, sort_by='date', sort_dir='desc'):
    sort_column = SORT_MAP.get(sort_by, Transaction.date)
    if sort_dir == 'asc':
        return query.order_by(sort_column.asc(), Transaction.id.asc())
    return query.order_by(sort_column.desc(), Transaction.id.desc())


def paginate_transactions(query, page, per_page):
    return query.paginate(page=page, per_page=per_page, error_out=False)


def calculate_totals(query):
    totals_query = query.order_by(None).with_entities(
        func.coalesce(func.sum(Transaction.debit), 0),
        func.coalesce(func.sum(Transaction.credit), 0),
        func.count(Transaction.id)
    )
    debit_total, credit_total, count = totals_query.first()
    debit_total = float(debit_total or 0)
    credit_total = float(credit_total or 0)
    return {
        'debit_total': debit_total,
        'credit_total': credit_total,
        'net_total': debit_total - credit_total,
        'transaction_count': count
    }


def calculate_running_balances(query):
    running_balance = Decimal('0')
    balances = {}
    for transaction in query.order_by(None).order_by(Transaction.date.asc(), Transaction.id.asc()).all():
        if transaction.debit:
            running_balance += Decimal(transaction.debit)
        if transaction.credit:
            running_balance -= Decimal(transaction.credit)
        balances[transaction.id] = float(running_balance)
    return balances

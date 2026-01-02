"""
Seed baseline data for UI testing.

Usage:
    python seed_data.py
"""
from datetime import date, timedelta
from decimal import Decimal

from app import create_app, db
from app.models import Account, Organization, Transaction


def get_or_create_organization():
    organization = Organization.query.filter_by(ein='12-3456789').first()
    if organization:
        return organization

    organization = Organization(
        name='Sample Helping Hands',
        ein='12-3456789',
        address='123 Charity Lane',
        city='Springfield',
        state='IL',
        zip_code='62704',
        phone='555-0100',
        website='https://example.org',
        tax_exempt_status='501c3',
    )
    db.session.add(organization)
    db.session.flush()
    return organization


def get_or_create_account(organization, code, name, account_type, category_id=None, balance=Decimal('0.00')):
    account = Account.query.filter_by(organization_id=organization.id, code=code).first()
    if account:
        return account

    account = Account(
        organization_id=organization.id,
        code=code,
        name=name,
        account_type=account_type,
        category_id=category_id,
        balance=balance,
    )
    db.session.add(account)
    db.session.flush()
    return account


def get_or_create_transaction(
    organization,
    account,
    transaction_id,
    txn_date,
    description,
    debit=None,
    credit=None,
    balance=None,
    category_id=None,
    subcategory=None,
    status='complete',
    additional_fields=None,
):
    transaction = Transaction.query.filter_by(transaction_id=transaction_id).first()
    if transaction:
        return transaction

    transaction = Transaction(
        organization_id=organization.id,
        account_id=account.id,
        transaction_id=transaction_id,
        date=txn_date,
        description=description,
        debit=debit,
        credit=credit,
        balance=balance,
        category_id=category_id,
        subcategory=subcategory,
        status=status,
        additional_fields=additional_fields,
    )
    db.session.add(transaction)
    return transaction


def seed():
    organization = get_or_create_organization()

    cash_account = get_or_create_account(
        organization,
        code='1000',
        name='Cash - Operating',
        account_type='asset',
        category_id='cash',
        balance=Decimal('2500.00'),
    )
    donations_account = get_or_create_account(
        organization,
        code='4000',
        name='Donations',
        account_type='revenue',
        category_id='contributions',
        balance=Decimal('12000.00'),
    )
    expenses_account = get_or_create_account(
        organization,
        code='6000',
        name='Program Supplies',
        account_type='expense',
        category_id='program_expenses',
        balance=Decimal('1500.00'),
    )

    today = date.today()
    get_or_create_transaction(
        organization,
        cash_account,
        transaction_id='TXN-1001',
        txn_date=today - timedelta(days=10),
        description='Community fundraiser deposit',
        debit=Decimal('2500.00'),
        balance=Decimal('2500.00'),
        category_id='fundraising',
        subcategory='event',
    )
    get_or_create_transaction(
        organization,
        donations_account,
        transaction_id='TXN-1002',
        txn_date=today - timedelta(days=7),
        description='Monthly donor contributions',
        credit=Decimal('12000.00'),
        balance=Decimal('12000.00'),
        category_id='contributions',
        subcategory='monthly',
    )
    get_or_create_transaction(
        organization,
        expenses_account,
        transaction_id='TXN-1003',
        txn_date=today - timedelta(days=3),
        description='Purchased program supplies',
        debit=Decimal('1500.00'),
        balance=Decimal('1500.00'),
        category_id='program_expenses',
        subcategory='supplies',
        status='needs-review',
        additional_fields={'vendor': 'Springfield Supplies Co.'},
    )

    db.session.commit()


if __name__ == '__main__':
    app = create_app()
    with app.app_context():
        seed()
        print('Seed data created.')

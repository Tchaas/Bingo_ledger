"""
Model tests.
"""
import pytest
from datetime import date, datetime
from app.models import (
    User,
    Organization,
    Account,
    Transaction,
    Form990Data
)


def test_organization_creation(db):
    """Test creating an organization."""
    org = Organization(
        ein='12-3456789',
        name='Test Organization',
        address='123 Test St',
        city='Test City',
        state='CA',
        zip_code='12345'
    )
    db.db.session.add(org)
    db.db.session.commit()

    assert org.id is not None
    assert org.ein == '12-3456789'
    assert org.name == 'Test Organization'


def test_user_creation(db, test_org):
    """Test creating a user."""
    from app.auth.utils import hash_password

    user = User(
        email='testuser@example.com',
        name='Test User',
        password_hash=hash_password('TestPass123'),
        organization_id=test_org.id
    )
    db.session.add(user)
    db.session.commit()

    assert user.id is not None
    assert user.email == 'testuser@example.com'
    assert user.name == 'Test User'
    assert user.organization_id == test_org.id


def test_user_password_methods(db, test_org):
    """Test user password helper methods."""
    user = User(
        email='test@example.com',
        name='Test User',
        password_hash='',
        organization_id=test_org.id
    )

    # Test set_password
    user.set_password('SecurePass123')
    assert user.password_hash != ''
    assert user.password_hash != 'SecurePass123'  # Should be hashed

    # Test check_password
    assert user.check_password('SecurePass123') is True
    assert user.check_password('WrongPassword') is False


def test_account_creation(db, test_org):
    """Test creating an account."""
    account = Account(
        organization_id=test_org.id,
        code='1000',
        name='Cash',
        account_type='asset',
        balance=0
    )
    db.session.add(account)
    db.session.commit()

    assert account.id is not None
    assert account.code == '1000'
    assert account.name == 'Cash'
    assert account.account_type == 'asset'


def test_transaction_creation(db, test_org):
    """Test creating a transaction."""
    # Create account first
    account = Account(
        organization_id=test_org.id,
        code='1000',
        name='Cash',
        account_type='asset'
    )
    db.session.add(account)
    db.session.commit()

    # Create transaction
    transaction = Transaction(
        organization_id=test_org.id,
        account_id=account.id,
        transaction_id='TXN001',
        date=date(2024, 1, 1),
        description='Test transaction',
        debit=100.00,
        status='complete'
    )
    db.session.add(transaction)
    db.session.commit()

    assert transaction.id is not None
    assert transaction.transaction_id == 'TXN001'
    assert transaction.description == 'Test transaction'
    assert float(transaction.debit) == 100.00


def test_form990_data_creation(db, test_org):
    """Test creating Form 990 data."""
    form_data = Form990Data(
        organization_id=test_org.id,
        tax_year=2024,
        data={'revenue': 100000, 'expenses': 50000},
        status='draft'
    )
    db.session.add(form_data)
    db.session.commit()

    assert form_data.id is not None
    assert form_data.tax_year == 2024
    assert form_data.data['revenue'] == 100000
    assert form_data.status == 'draft'


def test_organization_to_dict(db):
    """Test organization serialization."""
    org = Organization(
        ein='12-3456789',
        name='Test Org',
        address='123 Test St',
        city='Test City',
        state='CA',
        zip_code='12345'
    )
    db.session.add(org)
    db.session.commit()

    org_dict = org.to_dict()

    assert org_dict['ein'] == '12-3456789'
    assert org_dict['name'] == 'Test Org'
    assert 'id' in org_dict


def test_user_to_dict(db, test_org):
    """Test user serialization."""
    from app.auth.utils import hash_password

    user = User(
        email='test@example.com',
        name='Test User',
        password_hash=hash_password('TestPass123'),
        organization_id=test_org.id
    )
    db.session.add(user)
    db.session.commit()

    user_dict = user.to_dict()

    assert user_dict['email'] == 'test@example.com'
    assert user_dict['name'] == 'Test User'
    assert 'password_hash' not in user_dict  # Should not expose password
    assert 'id' in user_dict


def test_account_to_dict(db, test_org):
    """Test account serialization."""
    account = Account(
        organization_id=test_org.id,
        code='1000',
        name='Cash',
        account_type='asset',
        balance=500.50
    )
    db.session.add(account)
    db.session.commit()

    account_dict = account.to_dict()

    assert account_dict['code'] == '1000'
    assert account_dict['name'] == 'Cash'
    assert account_dict['account_type'] == 'asset'
    assert account_dict['balance'] == 500.50


def test_transaction_to_dict(db, test_org):
    """Test transaction serialization."""
    account = Account(
        organization_id=test_org.id,
        code='1000',
        name='Cash',
        account_type='asset'
    )
    db.session.add(account)
    db.session.commit()

    transaction = Transaction(
        organization_id=test_org.id,
        account_id=account.id,
        transaction_id='TXN001',
        date=date(2024, 1, 1),
        description='Test',
        debit=100.00
    )
    db.session.add(transaction)
    db.session.commit()

    txn_dict = transaction.to_dict()

    assert txn_dict['transaction_id'] == 'TXN001'
    assert txn_dict['description'] == 'Test'
    assert txn_dict['debit'] == 100.00
    assert 'date' in txn_dict


def test_organization_relationships(db):
    """Test organization relationships with users and accounts."""
    org = Organization(
        ein='12-3456789',
        name='Test Org',
        address='123 Test St',
        city='Test City',
        state='CA',
        zip_code='12345'
    )
    db.session.add(org)
    db.session.commit()

    # Add user
    from app.auth.utils import hash_password
    user = User(
        email='test@example.com',
        name='Test User',
        password_hash=hash_password('TestPass123'),
        organization_id=org.id
    )
    db.session.add(user)

    # Add account
    account = Account(
        organization_id=org.id,
        code='1000',
        name='Cash',
        account_type='asset'
    )
    db.session.add(account)
    db.session.commit()

    # Refresh to load relationships
    db.session.refresh(org)

    assert len(org.users) == 1
    assert org.users[0].email == 'test@example.com'
    assert len(org.accounts) == 1
    assert org.accounts[0].name == 'Cash'

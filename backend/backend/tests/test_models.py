"""
Model tests.
"""
import pytest
from datetime import date
from app.models import (
    Organization,
    AccountingPeriod,
    Account,
    Transaction,
    Form990,
    FormSchedule
)


def test_organization_creation(session):
    """Test creating an organization."""
    org = Organization(
        ein='12-3456789',
        name='Test Organization',
        street='123 Test St',
        city='Test City',
        state='TS',
        zip_code='12345',
        country='US',
        tax_year_end='1231'
    )
    session.add(org)
    session.commit()

    assert org.id is not None
    assert org.ein == '12-3456789'
    assert org.name == 'Test Organization'


def test_accounting_period_creation(session):
    """Test creating an accounting period."""
    org = Organization(
        ein='12-3456789',
        name='Test Org',
        street='123 St',
        city='City',
        state='ST',
        zip_code='12345'
    )
    session.add(org)
    session.commit()

    period = AccountingPeriod(
        organization_id=org.id,
        year=2024,
        start_date=date(2024, 1, 1),
        end_date=date(2024, 12, 31),
        is_closed=False
    )
    session.add(period)
    session.commit()

    assert period.id is not None
    assert period.year == 2024
    assert period.organization_id == org.id


def test_account_creation(session):
    """Test creating an account."""
    org = Organization(
        ein='12-3456789',
        name='Test Org',
        street='123 St',
        city='City',
        state='ST',
        zip_code='12345'
    )
    session.add(org)
    session.commit()

    account = Account(
        organization_id=org.id,
        account_number='1000',
        name='Cash',
        account_type='asset',
        is_active=True
    )
    session.add(account)
    session.commit()

    assert account.id is not None
    assert account.account_number == '1000'
    assert account.name == 'Cash'
    assert account.account_type == 'asset'

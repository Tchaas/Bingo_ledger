import pytest
from app import create_app, db
from app.models import Account, Organization, User

@pytest.fixture
def auth_headers(auth_tokens):
    return {'Authorization': f'Bearer {auth_tokens["access_token"]}'}

def test_list_accounts_empty(client, auth_headers):
    """Test listing accounts when none exist."""
    response = client.get('/api/accounts/', headers=auth_headers)
    assert response.status_code == 200
    assert response.json['total'] == 0
    assert response.json['accounts'] == []

def test_create_account(client, auth_headers, test_org):
    """Test creating a new account."""
    data = {
        'organization_id': test_org.id,
        'code': '1000',
        'name': 'Cash',
        'account_type': 'asset',
        'category_id': 'cash_non_interest',
        'balance': 1000.00
    }
    response = client.post('/api/accounts/', json=data, headers=auth_headers)
    assert response.status_code == 201
    assert response.json['code'] == '1000'
    assert response.json['name'] == 'Cash'
    assert response.json['balance'] == 1000.0

def test_get_account(client, auth_headers, test_org):
    """Test retrieving a specific account."""
    # Create account directly
    account = Account(
        organization_id=test_org.id,
        code='2000',
        name='Accounts Payable',
        account_type='liability'
    )
    db.session.add(account)
    db.session.commit()

    response = client.get(f'/api/accounts/{account.id}', headers=auth_headers)
    assert response.status_code == 200
    assert response.json['code'] == '2000'

def test_update_account(client, auth_headers, test_org):
    """Test updating an account."""
    account = Account(
        organization_id=test_org.id,
        code='3000',
        name='Old Name',
        account_type='equity'
    )
    db.session.add(account)
    db.session.commit()

    data = {'name': 'New Name'}
    response = client.put(f'/api/accounts/{account.id}', json=data, headers=auth_headers)
    assert response.status_code == 200
    assert response.json['name'] == 'New Name'

def test_delete_account(client, auth_headers, test_org):
    """Test deleting an account."""
    account = Account(
        organization_id=test_org.id,
        code='4000',
        name='To Delete',
        account_type='expense'
    )
    db.session.add(account)
    db.session.commit()

    response = client.delete(f'/api/accounts/{account.id}', headers=auth_headers)
    assert response.status_code == 200
    
    # Verify deletion
    deleted = Account.query.get(account.id)
    assert deleted is None

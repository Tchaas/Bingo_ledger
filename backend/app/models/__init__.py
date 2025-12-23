"""
Database models for Tchaas Ledger application.
"""
from app import db
from datetime import datetime


class User(db.Model):
    """User model."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    password_hash = db.Column(db.String(255), nullable=False)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'))
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = db.relationship('Organization', back_populates='users')

    def set_password(self, password):
        """
        Set user password (hashes it automatically).

        Args:
            password: Plain text password
        """
        from app.auth.utils import hash_password
        self.password_hash = hash_password(password)

    def check_password(self, password):
        """
        Verify password against stored hash.

        Args:
            password: Plain text password to verify

        Returns:
            Boolean indicating if password matches
        """
        from app.auth.utils import check_password
        return check_password(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'name': self.name,
            'organization_id': self.organization_id,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Organization(db.Model):
    """Organization model for nonprofit entities."""
    __tablename__ = 'organizations'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)
    ein = db.Column(db.String(20), unique=True, nullable=False, index=True)
    address = db.Column(db.String(200))
    city = db.Column(db.String(100))
    state = db.Column(db.String(2))
    zip_code = db.Column(db.String(10))
    phone = db.Column(db.String(20))
    website = db.Column(db.String(200))
    tax_exempt_status = db.Column(db.String(20), default='501c3')
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    users = db.relationship('User', back_populates='organization')
    transactions = db.relationship('Transaction', back_populates='organization')
    accounts = db.relationship('Account', back_populates='organization')

    def to_dict(self):
        return {
            'id': self.id,
            'name': self.name,
            'ein': self.ein,
            'address': self.address,
            'city': self.city,
            'state': self.state,
            'zip_code': self.zip_code,
            'phone': self.phone,
            'website': self.website,
            'tax_exempt_status': self.tax_exempt_status
        }


class Account(db.Model):
    """Chart of accounts."""
    __tablename__ = 'accounts'

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    code = db.Column(db.String(20), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    account_type = db.Column(db.String(50), nullable=False)  # asset, liability, equity, revenue, expense
    category_id = db.Column(db.String(50))  # Form 990 category
    balance = db.Column(db.Numeric(15, 2), default=0)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = db.relationship('Organization', back_populates='accounts')
    transactions = db.relationship('Transaction', back_populates='account')

    def to_dict(self):
        return {
            'id': self.id,
            'code': self.code,
            'name': self.name,
            'account_type': self.account_type,
            'category_id': self.category_id,
            'balance': float(self.balance) if self.balance else 0
        }


class Transaction(db.Model):
    """Financial transaction model."""
    __tablename__ = 'transactions'

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    account_id = db.Column(db.Integer, db.ForeignKey('accounts.id'), nullable=False)
    transaction_id = db.Column(db.String(50), unique=True, nullable=False, index=True)
    date = db.Column(db.Date, nullable=False, index=True)
    description = db.Column(db.Text, nullable=False)
    category_id = db.Column(db.String(50))
    subcategory = db.Column(db.String(100))
    debit = db.Column(db.Numeric(15, 2))
    credit = db.Column(db.Numeric(15, 2))
    balance = db.Column(db.Numeric(15, 2), default=0)
    status = db.Column(db.String(20), default='complete')  # complete, needs-review, incomplete
    additional_fields = db.Column(db.JSON)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    # Relationships
    organization = db.relationship('Organization', back_populates='transactions')
    account = db.relationship('Account', back_populates='transactions')

    def to_dict(self):
        return {
            'id': self.id,
            'organization_id': self.organization_id,
            'account_id': self.account_id,
            'transaction_id': self.transaction_id,
            'date': self.date.isoformat() if self.date else None,
            'description': self.description,
            'category_id': self.category_id,
            'subcategory': self.subcategory,
            'debit': float(self.debit) if self.debit else None,
            'credit': float(self.credit) if self.credit else None,
            'balance': float(self.balance) if self.balance else 0,
            'status': self.status,
            'additional_fields': self.additional_fields
        }


class Form990Data(db.Model):
    """Form 990 data storage."""
    __tablename__ = 'form990_data'

    id = db.Column(db.Integer, primary_key=True)
    organization_id = db.Column(db.Integer, db.ForeignKey('organizations.id'), nullable=False)
    tax_year = db.Column(db.Integer, nullable=False, index=True)
    data = db.Column(db.JSON, nullable=False)  # Store all form data as JSON
    status = db.Column(db.String(20), default='draft')  # draft, submitted, filed
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def to_dict(self):
        return {
            'id': self.id,
            'organization_id': self.organization_id,
            'tax_year': self.tax_year,
            'data': self.data,
            'status': self.status,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'updated_at': self.updated_at.isoformat() if self.updated_at else None
        }

"""
Route registration for the application.
"""
from flask import Blueprint


def register_routes(app):
    """
    Register all route blueprints with the Flask application.

    Args:
        app: Flask application instance
    """
    # Import blueprints
    from app.routes.auth import auth_bp
    from app.routes.transactions import transactions_bp
    from app.routes.form990 import form990_bp
    from app.routes.accounts import accounts_bp
    from app.routes.profile import profile_bp

    # Register blueprints with /api prefix
    app.register_blueprint(auth_bp, url_prefix='/api/auth')
    app.register_blueprint(transactions_bp, url_prefix='/api/transactions')
    app.register_blueprint(form990_bp, url_prefix='/api/form990')
    app.register_blueprint(accounts_bp, url_prefix='/api/accounts')
    app.register_blueprint(profile_bp, url_prefix='/api/profile')

    app.logger.info("All routes registered successfully")

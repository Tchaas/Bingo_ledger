"""
Flask application factory with integrated monitoring.
"""
from flask import Flask, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from werkzeug.exceptions import HTTPException
from config import get_config
from app.validation import ValidationError

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()


def create_app(config_name=None):
    """
    Application factory pattern for creating Flask app instances.

    Args:
        config_name: Configuration to use (development, production, testing)

    Returns:
        Configured Flask application instance
    """
    app = Flask(__name__)

    # Load configuration
    if config_name:
        app.config.from_object(f'config.{config_name}Config')
    else:
        config = get_config()
        app.config.from_object(config)

    # Initialize extensions
    db.init_app(app)
    migrate.init_app(app, db)
    CORS(app, origins=app.config['CORS_ORIGINS'])

    # Initialize authentication
    from app.auth import init_auth
    init_auth(app)

    # Initialize monitoring if enabled
    if app.config.get('ENABLE_MONITORING', True):
        try:
            from app.monitoring import init_monitoring
            init_monitoring(app)
            app.logger.info("Monitoring initialized successfully")
        except Exception as e:
            app.logger.warning(f"Monitoring initialization failed: {e}")

    # Register blueprints
    from app.routes import register_routes
    register_routes(app)

    error_code_map = {
        400: 'bad_request',
        404: 'not_found',
        422: 'validation_error',
        500: 'internal_server_error'
    }

    def _json_error(status_code, message, field_errors=None):
        return jsonify({
            'code': error_code_map.get(status_code, 'error'),
            'message': message,
            'field_errors': field_errors or {}
        }), status_code

    @app.errorhandler(ValidationError)
    def handle_validation_error(error):
        return _json_error(422, error.message, error.field_errors)

    @app.errorhandler(HTTPException)
    def handle_http_exception(error):
        status_code = error.code or 500
        message = error.description or error.name
        return _json_error(status_code, message)

    @app.errorhandler(Exception)
    def handle_unexpected_error(error):
        app.logger.exception("Unhandled exception: %s", error)
        return _json_error(500, 'An unexpected error occurred.')

    # Health check endpoint
    @app.route('/health')
    def health():
        """Health check endpoint for monitoring."""
        return {'status': 'healthy', 'app': 'tchaas-ledger'}, 200

    # Metrics endpoint (placeholder when monitoring is disabled)
    @app.route('/metrics')
    def metrics():
        """Metrics endpoint for Prometheus."""
        return '# Metrics endpoint\n', 200, {'Content-Type': 'text/plain; charset=utf-8'}

    # Root endpoint
    @app.route('/')
    def index():
        """Root endpoint."""
        return {
            'name': 'Tchaas Ledger API',
            'version': '0.1.0',
            'status': 'running',
            'endpoints': {
                'health': '/health',
                'metrics': '/metrics',
                'api': '/api'
            }
        }, 200

    return app

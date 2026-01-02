"""Category routes for Form 990 mappings."""
from flask import Blueprint, jsonify

from app.utils.form990_categories import FORM_990_CATEGORIES

categories_bp = Blueprint('categories', __name__)


@categories_bp.route('/', methods=['GET'])
def list_categories():
    """List Form 990 categories."""
    return jsonify({'categories': FORM_990_CATEGORIES, 'total': len(FORM_990_CATEGORIES)}), 200

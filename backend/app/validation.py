"""
Request payload validation helpers.
"""
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Any, Dict, Optional


@dataclass
class ValidationError(Exception):
    """Raised when request payload validation fails."""

    message: str = "Validation failed"
    field_errors: Optional[Dict[str, Any]] = None

    def __str__(self) -> str:
        return self.message


DATE_FORMAT = "%Y-%m-%d"


def _is_non_empty_string(value: Any) -> bool:
    return isinstance(value, str) and value.strip() != ""


def _is_valid_date(value: Any) -> bool:
    if not isinstance(value, str):
        return False
    try:
        datetime.strptime(value, DATE_FORMAT)
        return True
    except ValueError:
        return False


def _is_valid_decimal(value: Any) -> bool:
    if value in (None, ""):
        return True
    try:
        Decimal(str(value))
        return True
    except (InvalidOperation, TypeError, ValueError):
        return False


def validate_transaction_payload(payload: Dict[str, Any], require_required_fields: bool = False) -> Dict[str, str]:
    errors: Dict[str, str] = {}

    if require_required_fields or "date" in payload:
        if not payload.get("date"):
            errors["date"] = "Date is required."
        elif not _is_valid_date(payload.get("date")):
            errors["date"] = "Date must be in YYYY-MM-DD format."

    if require_required_fields or "description" in payload:
        if not _is_non_empty_string(payload.get("description")):
            errors["description"] = "Description is required."

    if "transaction_id" in payload and not _is_non_empty_string(payload.get("transaction_id")):
        errors["transaction_id"] = "Transaction ID cannot be empty."

    if "debit" in payload and not _is_valid_decimal(payload.get("debit")):
        errors["debit"] = "Debit must be a valid number."

    if "credit" in payload and not _is_valid_decimal(payload.get("credit")):
        errors["credit"] = "Credit must be a valid number."

    if "balance" in payload and not _is_valid_decimal(payload.get("balance")):
        errors["balance"] = "Balance must be a valid number."

    return errors


def validate_account_payload(payload: Dict[str, Any], require_required_fields: bool = False) -> Dict[str, str]:
    errors: Dict[str, str] = {}

    if require_required_fields or "organization_id" in payload:
        if payload.get("organization_id") is None:
            errors["organization_id"] = "Organization ID is required."
        elif not isinstance(payload.get("organization_id"), int):
            errors["organization_id"] = "Organization ID must be an integer."

    if require_required_fields or "code" in payload:
        if not _is_non_empty_string(payload.get("code")):
            errors["code"] = "Account code is required."

    if require_required_fields or "name" in payload:
        if not _is_non_empty_string(payload.get("name")):
            errors["name"] = "Account name is required."

    if require_required_fields or "account_type" in payload:
        if not _is_non_empty_string(payload.get("account_type")):
            errors["account_type"] = "Account type is required."

    if "balance" in payload and not _is_valid_decimal(payload.get("balance")):
        errors["balance"] = "Balance must be a valid number."

    return errors


def validate_form990_payload(payload: Dict[str, Any], require_required_fields: bool = False) -> Dict[str, str]:
    errors: Dict[str, str] = {}

    if require_required_fields or "organization_id" in payload:
        if payload.get("organization_id") is None:
            errors["organization_id"] = "Organization ID is required."
        elif not isinstance(payload.get("organization_id"), int):
            errors["organization_id"] = "Organization ID must be an integer."

    if require_required_fields or "tax_year" in payload:
        if payload.get("tax_year") is None:
            errors["tax_year"] = "Tax year is required."
        elif not isinstance(payload.get("tax_year"), int):
            errors["tax_year"] = "Tax year must be an integer."

    if require_required_fields or "data" in payload:
        if payload.get("data") is None:
            errors["data"] = "Form 990 data is required."
        elif not isinstance(payload.get("data"), dict):
            errors["data"] = "Form 990 data must be an object."

    return errors

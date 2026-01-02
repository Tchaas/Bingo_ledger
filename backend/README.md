# Backend (Flask)

## Migrations

Flask-Migrate is already initialized in `backend/migrations/`, and the initial schema migration is stored in
`backend/migrations/versions/`.

### Typical workflow

```bash
# From the backend/ directory
export FLASK_APP=run.py
export FLASK_ENV=development

# Create a new migration after model changes
flask db migrate -m "describe your change"

# Apply migrations
flask db upgrade

# (Optional) Roll back the last migration
flask db downgrade -1
```

> If you are setting up the project from scratch and the migrations directory is missing, run:
>
> ```bash
> flask db init
> ```

## Seed data for UI testing

Use the seed script to populate a baseline organization, accounts, and sample transactions:

```bash
# From the backend/ directory
python seed_data.py
```

The script is idempotent: it reuses the sample organization (EIN `12-3456789`) and account codes if they already exist.

# Tchaas Ledger 990 - Nonprofit Financial Management Platform

[![Backend CI](https://github.com/tchaas/tchaasledger/actions/workflows/backend-ci.yml/badge.svg)](https://github.com/tchaas/tchaasledger/actions/workflows/backend-ci.yml)
[![Frontend CI](https://github.com/tchaas/tchaasledger/actions/workflows/frontend-ci.yml/badge.svg)](https://github.com/tchaas/tchaasledger/actions/workflows/frontend-ci.yml)
[![Deploy](https://github.com/tchaas/tchaasledger/actions/workflows/deploy.yml/badge.svg)](https://github.com/tchaas/tchaasledger/actions/workflows/deploy.yml)

A comprehensive platform for nonprofit organizations to manage their financial ledger and generate IRS Form 990 tax returns, with integrated monitoring and analytics.

> **Note**: This project is based on the original [Tchaas Ledger Figma design](https://www.figma.com/design/7BRAKcxNFqyjws9gB1BNb2/Tchaas-Ledger) and has been enhanced with a full-stack implementation including backend API and monitoring.

## 🎯 Project Overview

This project combines:
- **Frontend**: Modern React/TypeScript UI for ledger management and Form 990 completion
- **Backend**: Python Flask API with comprehensive monitoring via Prometheus and GCP Cloud Monitoring
- **Database**: PostgreSQL for persistent data storage
- **Monitoring**: Production-grade observability with metrics, dashboards, and alerts

## 📁 Project Structure

```
tchaas-ledger-990/
├── frontend/          # React/TypeScript application
├── backend/           # Flask API with monitoring
├── docs/              # Documentation
├── scripts/           # Utility scripts
└── monitoring-package/# Original monitoring package files
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.11+
- PostgreSQL 14+
- Google Cloud SDK (for deployment)

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
# App runs at http://localhost:5173
```

### Backend Setup
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Set up database
createdb tchaas_ledger
export DATABASE_URL="postgresql://localhost/tchaas_ledger"
export GCP_PROJECT_ID="tchaas-ledger"

# Run the app
python run.py
# API runs at http://localhost:5000
```

## 📚 Documentation

### Getting Started

- [Get Started Guide](docs/setup/GET_STARTED.md) - Quick start for new developers
- [Setup Complete](docs/setup/SETUP_COMPLETE.md) - Initial setup checklist

### Deployment

- [Final Deployment Steps](docs/deployment/FINAL_DEPLOYMENT_STEPS.md) - Deploy to production
- [Cloud SQL Setup](docs/setup/SETUP_CLOUD_SQL.md) - PostgreSQL database setup
- [GitHub Secrets Setup](docs/setup/GITHUB_SECRETS_SETUP.md) - CI/CD secrets configuration
- [GCP Permissions Fix](docs/deployment/FIX_GCP_PERMISSIONS.md) - Fix IAM permissions

### Project Info

- [Project Status](PROJECT_STATUS.md) - Current status and roadmap
- [File Inventory](FILE_INVENTORY.md) - Complete file listing

### Scripts

- [scripts/run-migrations-manually.sh](scripts/run-migrations-manually.sh) - Run database migrations
- [scripts/fix-gcp-permissions.sh](scripts/fix-gcp-permissions.sh) - Grant GCP IAM permissions

## ✨ Features

### Current Features
- ✅ Transaction ledger management with debit/credit tracking
- ✅ Form 990 data entry and management
- ✅ Category-based expense/revenue tracking
- ✅ Bulk transaction recategorization
- ✅ Smart category suggestions
- ✅ User authentication and profiles

### Monitoring Features
- 📊 Prometheus metrics for all HTTP requests
- 📈 Custom business metrics (transactions, Form 990 operations)
- ☁️ Google Cloud Monitoring integration
- 📉 Grafana-ready dashboards
- 🚨 Alerting capabilities

### Planned Features
- 🔄 CSV import/export
- 📄 PDF generation for Form 990
- 📧 Email notifications
- 🔐 Multi-user organizations
- 📱 Mobile responsive design
- 🧪 Comprehensive test coverage

## 🛠️ Technology Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- React Router (navigation)
- Radix UI (component library)
- Tailwind CSS (styling)
- Recharts (data visualization)
- Sonner (toast notifications)

### Backend
- Python 3.11+
- Flask (web framework)
- SQLAlchemy (ORM)
- PostgreSQL (database)
- Prometheus Client (metrics)
- Google Cloud Monitoring SDK
- Alembic (database migrations)

## 📊 Metrics & Monitoring

Access monitoring endpoints:
- **Prometheus Metrics**: http://localhost:5000/metrics
- **Health Check**: http://localhost:5000/health

Key metrics tracked:
- HTTP request rates and latencies
- Transaction creation/updates
- Form 990 generation success/failure
- Database query performance
- Active user sessions

## 🧪 Testing

```bash
# Frontend tests
cd frontend
npm test

# Backend tests
cd backend
pytest
```

## 🚀 Deployment

### Local Development
Use the provided scripts in `scripts/` directory:
```bash
./scripts/setup_dev_env.sh
```

### Production (Google Cloud Run)
```bash
./scripts/deploy.sh
```

See [deployment documentation](docs/deployment/CLOUD_RUN_DEPLOYMENT.md) for details.

## 📝 Development Workflow

1. **Frontend Development**
   - Make changes in `frontend/src/`
   - Test locally with `npm run dev`
   - Build for production with `npm run build`

2. **Backend Development**
   - Make changes in `backend/app/`
   - Test locally with `python run.py`
   - Create migrations with `flask db migrate`
   - Apply migrations with `flask db upgrade`

3. **Adding Monitoring**
   - Import tracking functions from `app.monitoring`
   - Add metric tracking to your code
   - Test metrics at `/metrics` endpoint

## 🤝 Contributing

This project uses Cursor AI for development assistance. To get started:

1. Open the project in Cursor
2. Reference `@docs/monitoring/01_CURSOR_HANDOFF_START_HERE.md` for full context
3. Follow the development workflow above

## 📄 License

[Your License Here]

## 👤 Author

Tchaas Alexander-Wright

## 🙏 Acknowledgments

- Original UI design from [Figma](https://www.figma.com/design/7BRAKcxNFqyjws9gB1BNb2/Tchaas-Ledger)
- Monitoring package integration
- Form 990 category definitions based on IRS specifications

---

**Status**: Active Development
**Last Updated**: 2025-12-09
**Version**: 0.1.0

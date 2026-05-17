# Finance Ready Backend

Backend modular con FastAPI, SQLModel, Alembic, Ruff y PostgreSQL.

## Comandos

```powershell
cd F:\Code\Finance-Ready\Backend
py -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -e ".[dev]"
uvicorn app.main:app --reload
```

API local:

```txt
http://localhost:8000
http://localhost:8000/docs
```


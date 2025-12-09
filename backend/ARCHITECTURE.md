# Expense Tracker Backend Architecture Guide

This document outlines the architectural principles, code structure, and development guidelines for the Expense Tracker backend. It is designed to help developers (and AI agents) understand where code belongs and how to implement new features while maintaining Clean Architecture and SOLID principles.

## 1. High-Level Architecture

The project follows **Clean Architecture** principles, enforcing a strict separation of concerns into distinct layers.

**Core Principles:**
*   **Separation of Concerns:** Business logic is decoupled from HTTP transport and Data Access details.
*   **Dependency Injection:** Dependencies (Services, Repositories, DB Sessions) are injected, making code unit-testable and modular.
*   **SOLID:**
    *   **SRP (Single Responsibility Principle):** Each class/function has one job (e.g., Routers only parse requests, Services only do logic).
    *   **DIP (Dependency Inversion Principle):** High-level modules (Services) rely on abstractions (Repositories/Providers), not low-level details (Raw SQL).

## 2. Layered Structure

The codebase is organized into the following layers:

### A. Presentation Layer (API Routers)
*   **Location:** `backend/api/routers/`
*   **Responsibility:**
    *   Handle incoming HTTP requests (FastAPI).
    *   Validate input/output schemas (Pydantic).
    *   **Instantiate Services** (dependency injection).
    *   Return HTTP responses.
*   **Rule:** **NO Business Logic.** Routers should be thin wrappers around Services.

Example:
```python
@router.post("/")
def create_item(item: ItemCreate, session: Session = Depends(get_db)):
    service = ItemService(session) # Inject dependencies
    return service.create_item(item) # Delegate
```

### B. Application Layer (Services)
*   **Location:** `backend/services/`
*   **Responsibility:**
    *   Contain **ALL Business Logic**.
    *   Orchestrate data flow between Repositories and external Adapters (AI).
    *   Handle complex calculations and transaction boundaries.
*   **Rule:** Services should be reusable and transport-agnostic (not tied to HTTP).

Example:
```python
class ItemService:
    def __init__(self, session: Session):
        self.repository = ItemRepository(session) # Use Repository

    def create_item(self, item_data: ItemCreate):
        # Business logic here (e.g., validation, calculations)
        return self.repository.create(item_data)
```

### C. Infrastructure Layer (Adapters)
This layer interacts with external systems (Database, AI APIs, File System).

#### 1. Repositories (Database Access)
*   **Location:** `backend/adapters/database/repositories/`
*   **Responsibility:** Encapsulate all database interaction logic (SQLModel/SQLAlchemy).
*   **Pattern:** All repositories inherit from `BaseRepository` for generic CRUD (`get`, `create`, `update`, `delete`).
*   **Rule:** Services never write raw SQL queries; they call Repository methods.

#### 2. AI Adapter (LLM Integration)
*   **Location:** `backend/adapters/ai/`
*   **Components:**
    *   `LLMProvider`: Abstract base class for AI providers.
    *   `LiteLLMProvider`: Concrete implementation using `litellm` (supports OpenAI, Anthropic, Gemini, etc.).
    *   `AIService`: Domain-specific AI logic (e.g., "Generate Budget Suggestions").
*   **Benefit:** Switch AI models easily by changing the Provider configuration.

### D. Domain Layer (Models)
*   **Location:** `backend/core/models.py` (Base classes) & `backend/adapters/database/models.py` (Table definitions).
*   **Responsibility:** Define data structures.

## 3. Developer Guide: How to Add a New Feature

Follow this workflow to add a new feature (e.g., "Goals"):

1.  **Define Domain Model:**
    *   Create `Goal` model in `backend/adapters/database/models.py`.
    *   Create Pydantic schemas (Create/Read/Update) in `backend/api/schemas/`.

2.  **Create Repository:**
    *   Create `backend/adapters/database/repositories/goal_repository.py`.
    *   Inherit from `BaseRepository[Goal]`.
    *   Add custom queries (e.g., `get_goals_by_deadline`).

3.  **Create Service:**
    *   Create `backend/services/goal_service.py`.
    *   Implement methods like `add_goal`, `check_goal_progress`.
    *   Inject `GoalRepository`.

4.  **Create Router:**
    *   Create `backend/api/routers/goals.py`.
    *   Define endpoints `GET /`, `POST /`.
    *   Instantiate `GoalService` and call its methods.

5.  **Register Router:**
    *   Add `api_router.include_router(goals.router)` in `backend/api/main.py` (or equivalent).

## 4. Key Libraries
*   **FastAPI:** Web framework.
*   **SQLModel:** Database ORM (combines SQLAlchemy + Pydantic).
*   **LiteLLM:** Unified interface for calling 100+ LLM APIs.
*   **Pydantic:** Data validation.

## 5. Testing
*   Use `backend/test_final_refactor.py` as a template.
*   We use **In-Memory SQLite** for fast, isolated service testing.
*   Always test the *Service* layer to verify logic independent of the API.

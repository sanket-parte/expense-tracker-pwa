from typing import Generic, TypeVar, Type, List, Optional, Any
from sqlmodel import Session, select, SQLModel

ModelType = TypeVar("ModelType", bound=SQLModel)

class BaseRepository(Generic[ModelType]):
    def __init__(self, session: Session, model: Type[ModelType]):
        self.session = session
        self.model = model

    def get(self, id: Any) -> Optional[ModelType]:
        return self.session.get(self.model, id)

    def get_all(self) -> List[ModelType]:
        statement = select(self.model)
        return self.session.exec(statement).all()

    def create(self, obj_in: ModelType) -> ModelType:
        self.session.add(obj_in)
        self.session.commit()
        self.session.refresh(obj_in)
        return obj_in

    def update(self, db_obj: ModelType, obj_in_data: dict) -> ModelType:
        for key, value in obj_in_data.items():
            setattr(db_obj, key, value)
        self.session.add(db_obj)
        self.session.commit()
        self.session.refresh(db_obj)
        return db_obj

    def delete(self, db_obj: ModelType) -> ModelType:
        self.session.delete(db_obj)
        self.session.commit()
        return db_obj

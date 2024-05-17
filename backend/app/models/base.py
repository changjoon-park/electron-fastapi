from pydantic import BaseModel


class ConnectionStatus(BaseModel):
    status: str
    ip: str
    port: int

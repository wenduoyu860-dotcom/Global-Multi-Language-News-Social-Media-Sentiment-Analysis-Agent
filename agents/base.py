from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from typing import Any, Dict


@dataclass
class AgentContext:
    payload: Dict[str, Any] = field(default_factory=dict)
    shared: Dict[str, Any] = field(default_factory=dict)


class BaseAgent(ABC):
    name: str = "base"

    @abstractmethod
    def run(self, ctx: AgentContext) -> AgentContext:
        raise NotImplementedError


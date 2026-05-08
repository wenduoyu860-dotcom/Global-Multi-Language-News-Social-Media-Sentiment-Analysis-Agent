from typing import Dict, List, Type

from .base import BaseAgent


class AgentRegistry:
    def __init__(self) -> None:
        self._agents: Dict[str, BaseAgent] = {}

    def register(self, agent_cls: Type[BaseAgent]) -> None:
        instance = agent_cls()
        self._agents[instance.name] = instance

    def get(self, name: str) -> BaseAgent:
        return self._agents[name]

    def list_names(self) -> List[str]:
        return list(self._agents.keys())


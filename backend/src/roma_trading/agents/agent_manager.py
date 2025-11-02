"""
Agent Manager - Orchestrates multiple trading agents.

Handles:
- Loading agents from configuration
- Starting/stopping agents
- Providing unified access to agent data
"""

import asyncio
from typing import Dict, List
from pathlib import Path
import yaml
from loguru import logger

from .trading_agent import TradingAgent


class AgentManager:
    """
    Manages multiple trading agents running in parallel.
    
    This enables multi-model competition (e.g., DeepSeek vs Qwen).
    """

    def __init__(self):
        """Initialize agent manager."""
        self.agents: Dict[str, TradingAgent] = {}
        self.tasks: Dict[str, asyncio.Task] = {}
        
        # Global trading lock to prevent concurrent trading
        # This ensures only one agent can execute trades at a time
        self.trading_lock = asyncio.Lock()
        
        logger.info("Initialized AgentManager with trading lock")

    async def load_agents_from_config(self, config_path: str = "config/trading_config.yaml"):
        """
        Load and initialize agents from configuration file.
        
        Args:
            config_path: Path to main trading configuration
        """
        # Load main config
        with open(config_path, "r") as f:
            main_config = yaml.safe_load(f)
        
        # Load each agent
        for agent_spec in main_config.get("agents", []):
            if not agent_spec.get("enabled", True):
                logger.info(f"Skipping disabled agent: {agent_spec['id']}")
                continue
            
            # Load agent-specific config
            config_file = agent_spec["config_file"]
            with open(config_file, "r") as f:
                agent_config = yaml.safe_load(f)
            
            # Merge with environment variables
            self._resolve_env_vars(agent_config)
            
            # Create agent with shared trading lock
            agent = TradingAgent(
                agent_id=agent_spec["id"],
                config=agent_config,
                trading_lock=self.trading_lock
            )
            
            self.agents[agent_spec["id"]] = agent
            logger.info(f"Loaded agent: {agent_spec['id']} ({agent_spec['name']})")
        
        logger.info(f"Loaded {len(self.agents)} agents")

    def _resolve_env_vars(self, config: dict):
        """Resolve ${ENV_VAR} placeholders in config."""
        import os
        import re
        
        def resolve_value(value):
            if isinstance(value, str):
                # Match ${VAR_NAME}
                matches = re.findall(r'\$\{([^}]+)\}', value)
                for match in matches:
                    env_value = os.getenv(match, "")
                    value = value.replace(f"${{{match}}}", env_value)
                return value
            elif isinstance(value, dict):
                return {k: resolve_value(v) for k, v in value.items()}
            elif isinstance(value, list):
                return [resolve_value(item) for item in value]
            return value
        
        for key, value in config.items():
            config[key] = resolve_value(value)

    async def start_all(self):
        """Start all agents in parallel."""
        for agent_id, agent in self.agents.items():
            task = asyncio.create_task(agent.start())
            self.tasks[agent_id] = task
            logger.info(f"Started agent: {agent_id}")
        
        logger.info(f"All {len(self.agents)} agents running")

    async def stop_all(self):
        """Stop all agents."""
        for agent_id, agent in self.agents.items():
            await agent.stop()
            if agent_id in self.tasks:
                self.tasks[agent_id].cancel()
        
        logger.info("All agents stopped")

    def get_agent(self, agent_id: str) -> TradingAgent:
        """Get agent by ID."""
        if agent_id not in self.agents:
            raise ValueError(f"Agent not found: {agent_id}")
        return self.agents[agent_id]

    def get_all_agents(self) -> List[Dict]:
        """Get list of all agents with basic info."""
        result = []
        for agent_id, agent in self.agents.items():
            status = agent.get_status()
            # Flatten the structure for frontend
            result.append({
                "id": agent_id,
                "name": status.get("name", agent.config["agent"]["name"]),
                "is_running": status.get("is_running", False),
                "cycle_count": status.get("cycle_count", 0),
                "runtime_minutes": status.get("runtime_minutes", 0),
            })
        return result


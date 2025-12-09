from abc import ABC, abstractmethod
from typing import List, Dict, Any, Optional
import json
import litellm

class LLMProvider(ABC):
    @abstractmethod
    def generate_text(self, prompt: str, system_prompt: Optional[str] = None, model: str = "gpt-3.5-turbo", temperature: float = 0.7) -> str:
        """Generates text from an LLM."""
        pass

    @abstractmethod
    def generate_json(self, prompt: str, system_prompt: Optional[str] = None, model: str = "gpt-3.5-turbo", temperature: float = 0.0) -> Dict[str, Any]:
        """Generates structured JSON from an LLM."""
        pass

class LiteLLMProvider(LLMProvider):
    def __init__(self, api_key: str):
        self.api_key = api_key
        # litellm can pick up OPENAI_API_KEY env var, but we pass it explicitly if we have it from user settings.
        # However, for different providers, we might need to set standard env vars or pass params.
        # For simplicity here, we assume the user is passing an OpenAI-compatible key or we configure it.
        # If the user wants "all models", they might provide different keys. 
        # But our current app logic retrieves one 'openai_api_key' from user settings.
        # We will set it as environment variable for litellm to be safe if generic.
        import os
        os.environ["OPENAI_API_KEY"] = api_key

    def generate_text(self, prompt: str, system_prompt: Optional[str] = None, model: str = "gpt-3.5-turbo", temperature: float = 0.7) -> str:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            response = litellm.completion(
                model=model,
                messages=messages,
                temperature=temperature,
                api_key=self.api_key
            )
            return response.choices[0].message.content.strip()
        except Exception as e:
            print(f"LiteLLM Text Generation Error: {e}")
            raise e

    def generate_json(self, prompt: str, system_prompt: Optional[str] = None, model: str = "gpt-3.5-turbo", temperature: float = 0.0) -> Dict[str, Any]:
        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        messages.append({"role": "user", "content": prompt})

        try:
            response = litellm.completion(
                model=model,
                messages=messages,
                temperature=temperature,
                response_format={"type": "json_object"}, # litellm abstracts this for supported providers
                api_key=self.api_key
            )
            content = response.choices[0].message.content.strip()
            
            # Simple cleanup just in case provider doesn't strictly support json mode
            if content.startswith("```json"):
                content = content[7:]
            if content.endswith("```"):
                content = content[:-3]
                
            return json.loads(content.strip())
        except Exception as e:
            print(f"LiteLLM JSON Generation Error: {e}")
            # Logic to handle JSON parsing error if needed, but let's raise for now
            raise e

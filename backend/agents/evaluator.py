import requests
import logging

class EvaluatorAgent:
    """
    Automated Project Evaluator.
    Uses piston API (or local docker) to sandbox and evaluate code submissions.
    """
    def __init__(self):
        self.piston_api_url = "https://emkc.org/api/v2/piston/execute"
        self.logger = logging.getLogger(__name__)

    async def evaluate_code(self, language: str, source_code: str, test_cases: list):
        # Call piston API for sandboxed execution
        payload = {
            "language": language,
            "version": "*", # Get latest version
            "files": [
                {"content": source_code}
            ]
        }
        
        try:
            response = requests.post(self.piston_api_url, json=payload)
            result = response.json()
            output = result.get('run', {}).get('output', '')
            
            # Here we would use an LLM to evaluate the architecture, correctness, and math
            # Matrix scoring mockup
            score = {
                "Code Correctness": 8,
                "Architectural Efficiency": 7,
                "Mathematical Accuracy": 9
            }
            return {
                "execution_output": output,
                "score": score,
                "feedback": "Code executed successfully. Consider optimizing the data structures."
            }
            
        except Exception as e:
            self.logger.error(f"Execution failed: {e}")
            return {
                "error": "Failed to execute code in sandbox."
            }

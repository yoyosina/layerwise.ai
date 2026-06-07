class SupervisorAgent:
    """
    Supervisor & Guardrail Agent.
    Inspects user inputs for prompt injections and blocks toxic output.
    Must operate under <200ms latency.
    """
    def __init__(self):
        pass

    async def validate_input(self, text: str) -> bool:
        # Mock logic: block anything containing "ignore previous instructions"
        if "ignore previous instructions" in text.lower():
            return False
        return True

    async def validate_output(self, text: str) -> bool:
        # Mock logic
        return True

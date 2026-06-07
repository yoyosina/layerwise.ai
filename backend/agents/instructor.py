class InstructorAgent:
    """
    Contextual Explainer & Tutor.
    Socratic method tutor. Breaks down code or equations without giving direct answers.
    """
    def __init__(self):
        pass

    async def get_response(self, user_query: str, current_context: dict):
        # Use RAG to query the vector DB for context
        # Provide a socratic response
        # Mock response:
        return {
            "response": "Think about how the loss function is calculated. What happens during the backward pass if the gradient explodes?",
            "latex_support": True
        }

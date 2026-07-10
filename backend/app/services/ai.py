import logging
from openai import OpenAI
from app.core.config import settings

logger = logging.getLogger(__name__)

# Initialize OpenAI client pointing to the configurable OpenAI-compatible base URL
if settings.AI_API_KEY:
    try:
        # If the API key is not configured, we catch it gracefully or raise on call.
        client = OpenAI(
            base_url=settings.AI_API_BASE_URL,
            api_key=settings.AI_API_KEY,
        )
        logger.info(f"Initialized OpenAI-compatible client for base_url: {settings.AI_API_BASE_URL}")
    except Exception as e:
        logger.error(f"Failed to initialize OpenAI-compatible client: {str(e)}")
        client = None
else:
    logger.warning("AI_API_KEY is not configured. AI requests will fail.")
    client = None

def generate_code_explanation(code_input: str, language: str = None) -> str:
    """
    Calls the OpenAI-compatible endpoint using the configured model (e.g., Nemotron-3)
    to generate a comprehensive markdown explanation of the provided code block.
    """
    if not client:
        logger.error("AI client is not initialized due to missing API key configuration.")
        raise RuntimeError("AI_API_KEY is not configured on the backend server.")

    lang_context = f" written in {language}" if language else ""

    system_prompt = (
        "You are CodeMentor AI, a senior developer and teaching assistant.\n"
        "Explain the provided code block in a clear, comprehensive, and pedagogical way.\n"
        "Your response MUST be in well-formatted Markdown. Use bold text, bulleted lists, and code highlighting.\n"
        "Please structure your response strictly with the following sections:\n"
        "1. **Overview**: A high-level explanation of what the code does.\n"
        "2. **Line-by-Line Breakdown**: Explain the key parts of the logic.\n"
        "3. **Key Concepts**: Point out any algorithms, libraries, or patterns used.\n"
        "4. **Potential Optimizations/Improvements**: Mention any bugs, performance issues, or best practices that can be improved."
    )

    user_prompt = (
        f"Explain the following code{lang_context}:\n\n"
        f"```\n{code_input}\n```"
    )

    try:
        logger.info(f"Sending code explanation request to model: {settings.AI_MODEL_NAME}...")
        response = client.chat.completions.create(
            model=settings.AI_MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2, # Low temperature for analytical consistency
        )
        
        explanation = response.choices[0].message.content
        if not explanation:
            raise RuntimeError("API returned an empty message content response.")

        logger.info("Successfully generated explanation response from AI model.")
        return explanation

    except Exception as e:
        logger.error(f"Error communicating with OpenAI-compatible endpoint: {str(e)}")
        raise RuntimeError(f"Failed to generate explanation from AI service: {str(e)}")

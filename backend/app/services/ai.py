import logging
import json
import re
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

def generate_code_review(code_input: str, language: str = None) -> dict:
    """
    Calls the OpenAI-compatible endpoint using the configured model (e.g., Nemotron-3)
    to perform a detailed code quality review, returning a structured JSON response.
    """
    if not client:
        logger.error("AI client is not initialized due to missing API key configuration.")
        raise RuntimeError("AI_API_KEY is not configured on the backend server.")

    lang_context = f" written in {language}" if language else ""

    system_prompt = (
        "You are CodeMentor AI, an expert senior software engineer performing a professional code review.\n"
        "Analyze the provided code block for readability, overall code quality, naming conventions, maintainability, performance, security vulnerabilities, best practices, SOLID principles, code smells, and bugs.\n"
        "Do not explain what the code does; evaluate its design and construct a structured code review.\n"
        "You MUST respond ONLY with a raw JSON object string matching the schema below. Do not wrap the JSON object inside markdown fences (like ```json ... ```). Your response must start with '{' and end with '}':\n"
        "{\n"
        "  \"overall_score\": <integer between 0 and 100 representing general quality rating>,\n"
        "  \"readability_score\": <integer between 0 and 100>,\n"
        "  \"performance_score\": <integer between 0 and 100>,\n"
        "  \"maintainability_score\": <integer between 0 and 100>,\n"
        "  \"security_score\": <integer between 0 and 100>,\n"
        "  \"summary\": \"<paragraph summarizing findings, general patterns, and overall feedback>\",\n"
        "  \"suggestions\": [\"concrete suggestion 1\", \"concrete suggestion 2\", ...],\n"
        "  \"refactored_code\": \"<complete refactored code block with improvements implemented, or null if no code improvements are necessary>\",\n"
        "  \"interview_tips\": [\"interview question or tip 1\", \"interview question or tip 2\", ...]\n"
        "}"
    )

    user_prompt = (
        f"Perform a code review on this code{lang_context}:\n\n"
        f"{code_input}"
    )

    try:
        logger.info(f"Sending code review request to model: {settings.AI_MODEL_NAME}...")
        response = client.chat.completions.create(
            model=settings.AI_MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1, # Extremely low temperature for strict json structural compliance
        )
        
        raw_content = response.choices[0].message.content
        if not raw_content:
            raise RuntimeError("API returned an empty message content response.")

        # Clean markdown code fences if appended by the LLM
        cleaned = raw_content.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        # Parse JSON
        review_data = json.loads(cleaned)
        
        # Verify required keys and provide fallbacks
        required_keys = [
            "overall_score", "readability_score", "performance_score",
            "maintainability_score", "security_score", "summary",
            "suggestions", "refactored_code", "interview_tips"
        ]
        
        for key in required_keys:
            if key not in review_data:
                if "score" in key:
                    review_data[key] = 70 # Safe default
                elif key in ["suggestions", "interview_tips"]:
                    review_data[key] = []
                else:
                    review_data[key] = ""
                    
        return review_data

    except json.JSONDecodeError as jde:
        logger.error(f"Failed to decode JSON from AI model response. Raw: {raw_content}. Error: {str(jde)}")
        raise RuntimeError(f"The AI service returned an invalid response structure. Details: {str(jde)}")
    except Exception as e:
        logger.error(f"Error communicating with OpenAI-compatible endpoint: {str(e)}")
        raise RuntimeError(f"Failed to generate code review from AI service: {str(e)}")

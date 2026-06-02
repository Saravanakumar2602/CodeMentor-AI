import google.generativeai as genai
from app.core.config import settings

# Configure the Google GenAI SDK
if settings.GEMINI_API_KEY:
    genai.configure(api_key=settings.GEMINI_API_KEY)

def generate_code_explanation(code_input: str, language: str = None) -> str:
    """
    Calls the Gemini API to get a detailed explanation of the provided code.
    Returns the explanation formatted as Markdown.
    """
    if not settings.GEMINI_API_KEY:
        raise RuntimeError("GEMINI_API_KEY is not configured on the backend server.")

    # Using the fast, stable, and highly performant gemini-1.5-flash model
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    lang_context = f" written in {language}" if language else ""
    
    # Constructing a structured prompt to guide the AI explanation quality
    prompt = (
        "You are CodeMentor AI, a senior developer and teaching assistant.\n"
        f"Explain the following code{lang_context} in a clear, comprehensive, and helpful way.\n"
        "Your response MUST be in well-formatted Markdown. Use bold text, lists, and inline code highlightings.\n"
        "Please structure your response with the following sections:\n"
        "1. **Overview**: A high-level explanation of what the code does.\n"
        "2. **Line-by-Line Breakdown**: Explain the key parts of the logic.\n"
        "3. **Key Concepts**: Point out any algorithms, libraries, or patterns used.\n"
        "4. **Potential Optimizations/Improvements**: Mention any bugs, performance issues, or best practices that can be improved.\n\n"
        "Here is the code to explain:\n"
        f"```\n{code_input}\n```"
    )

    try:
        response = model.generate_content(prompt)
        return response.text
    except Exception as e:
        raise RuntimeError(f"Failed to generate explanation from Gemini API: {str(e)}")

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

def generate_learning_roadmap(code_input: str, language: str = None) -> dict:
    """
    Calls the OpenAI-compatible endpoint using the configured model (e.g., Nemotron-3)
    to generate a personalized learning roadmap based on a code block, returning JSON.
    """
    if not client:
        logger.error("AI client is not initialized due to missing API key configuration.")
        raise RuntimeError("AI_API_KEY is not configured on the backend server.")

    lang_context = f" written in {language}" if language else ""

    system_prompt = (
        "You are CodeMentor AI, a personal programming mentor.\n"
        "Analyze the provided code and generate a personalized learning roadmap.\n"
        "You MUST respond ONLY with a raw JSON object string matching the schema below. Do not wrap the JSON object inside markdown fences (like ```json ... ```). Your response must start with '{' and end with '}':\n"
        "{\n"
        "  \"difficulty_level\": \"<Difficulty Level rating, e.g. Beginner, Intermediate, or Advanced>\",\n"
        "  \"estimated_learning_time\": \"<Estimated learning time frame to master these concepts, e.g. 5 Hours, 3 Days>\",\n"
        "  \"interview_readiness_score\": <integer between 0 and 100 representing readiness score index>,\n"
        "  \"mentor_advice\": \"<General mentoring advice text detailing pedagogical direction>\",\n"
        "  \"concepts_detected\": [\"concept 1\", \"concept 2\", ...],\n"
        "  \"prerequisites\": [\"prerequisite topic 1\", \"prerequisite topic 2\", ...],\n"
        "  \"knowledge_gaps\": [\"potential gap 1\", \"potential gap 2\", ...],\n"
        "  \"recommended_next_topics\": [\"next topic 1\", \"next topic 2\", ...],\n"
        "  \"practice_plan\": [\"step 1 of practice plan\", \"step 2 of practice plan\", ...],\n"
        "  \"suggested_resources\": [\"study resource or problem link 1\", \"study resource or problem link 2\", ...]\n"
        "}"
    )

    user_prompt = (
        f"Generate a personalized learning path and roadmap based on this code{lang_context}:\n\n"
        f"{code_input}"
    )

    try:
        logger.info(f"Sending learning roadmap request to model: {settings.AI_MODEL_NAME}...")
        response = client.chat.completions.create(
            model=settings.AI_MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.2,
        )
        
        raw_content = response.choices[0].message.content
        if not raw_content:
            raise RuntimeError("API returned an empty message response.")

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
        roadmap_data = json.loads(cleaned)
        
        # Verify required keys and provide fallbacks
        required_keys = [
            "difficulty_level", "estimated_learning_time", "interview_readiness_score",
            "mentor_advice", "concepts_detected", "prerequisites", "knowledge_gaps",
            "recommended_next_topics", "practice_plan", "suggested_resources"
        ]
        
        for key in required_keys:
            if key not in roadmap_data:
                if key == "interview_readiness_score":
                    roadmap_data[key] = 50
                elif key in ["concepts_detected", "prerequisites", "knowledge_gaps", "recommended_next_topics", "practice_plan", "suggested_resources"]:
                    roadmap_data[key] = []
                else:
                    roadmap_data[key] = "N/A"
                    
        return roadmap_data

    except json.JSONDecodeError as jde:
        logger.error(f"Failed to decode JSON from AI model response. Raw: {raw_content}. Error: {str(jde)}")
        raise RuntimeError(f"The AI service returned an invalid response structure. Details: {str(jde)}")
    except Exception as e:
        logger.error(f"Error communicating with OpenAI-compatible endpoint: {str(e)}")
        raise RuntimeError(f"Failed to generate learning roadmap from AI service: {str(e)}")


def generate_personalized_practice(
    user_id: str,
    topic: str,
    difficulty: str,
    language: str,
    question_type: str,
    company: str = None
) -> dict:
    """
    Fetches previous user context (learning path & code reviews) and invokes LLM
    to generate a personalized coding question, multiple choice problem, bug fix,
    output prediction, or fill in the blank.
    """
    if not client:
        logger.error("AI client is not initialized due to missing API key configuration.")
        raise RuntimeError("AI_API_KEY is not configured on the backend server.")

    # 1. Fetch user context locally to avoid circular import issues
    from app.services.supabase import get_user_learning_history, get_user_code_reviews
    
    past_reviews = []
    past_learning = []
    
    try:
        past_reviews = get_user_code_reviews(user_id)
    except Exception as e:
        logger.warning(f"Failed to fetch past reviews for personalization: {str(e)}")
        
    try:
        past_learning = get_user_learning_history(user_id)
    except Exception as e:
        logger.warning(f"Failed to fetch past learning history for personalization: {str(e)}")

    # Extract weaknesses context
    weakness_context = ""
    if past_reviews:
        recent_suggestions = []
        for r in past_reviews[:3]: # check last 3 reviews
            suggs = r.get("suggestions", [])
            if suggs:
                recent_suggestions.extend(suggs[:2])
        if recent_suggestions:
            weakness_context += "Suggestions user received in past code reviews:\n"
            for sug in set(recent_suggestions):
                weakness_context += f"- {sug}\n"

    if past_learning:
        gaps = []
        for l in past_learning[:3]: # check last 3 paths
            g = l.get("knowledge_gaps", [])
            if g:
                gaps.extend(g[:2])
        if gaps:
            weakness_context += "User's recognized knowledge gaps in learning path:\n"
            for gap in set(gaps):
                weakness_context += f"- {gap}\n"

    personalization_prompt = ""
    if weakness_context:
        personalization_prompt = (
            f"Please personalize this question to help the user practice and overcome these weaknesses/gaps:\n"
            f"{weakness_context}\n"
            "Integrate elements into the question or code context that test these concepts directly."
        )

    company_context = f" focused on {company} interview style" if company else ""
    
    system_prompt = (
        "You are CodeMentor AI, an expert programming coach.\n"
        "Your task is to generate a personalized practice question for a user.\n"
        "You MUST respond ONLY with a raw JSON object string matching the schema below. Do not wrap the JSON object inside markdown fences (like ```json ... ```). Your response must start with '{' and end with '}':\n"
        "{\n"
        "  \"title\": \"<A short, descriptive, engaging question title>\",\n"
        "  \"description\": \"<A comprehensive description of the problem or task. Use Markdown for formatting. Describe requirements, input/output constraints, and clear examples.>\",\n"
        "  \"code_context\": \"<Starter code template if coding/find_the_bug/fill_in_the_blank, or a code block to analyze for output_prediction. Null if not needed.>\",\n"
        "  \"options\": [\"Option A\", \"Option B\", \"Option C\", \"Option D\"], // MUST include exactly 4 strings if question_type is 'mcq'. Empty array otherwise.\n"
        "  \"correct_answer\": \"<The correct option text for mcq, correct code block for coding/fill_in_the_blank, or correct output text for output_prediction/find_the_bug>\",\n"
        "  \"hints\": [\n"
        "    \"Hint 1: A general progressive conceptual hint.\",\n"
        "    \"Hint 2: A more specific implementation/logical hint.\",\n"
        "    \"Hint 3: A detailed hint showing pseudocode or close strategy.\",\n"
        "    \"Final Solution: A complete explanation of the correct solution, detailing the logic and code if applicable.\"\n"
        "  ] // Hints array MUST contain exactly 4 elements matching these progressive levels.\n"
        "}"
    )

    user_prompt = (
        f"Generate a practice question with the following parameters:\n"
        f"- Programming Language: {language}\n"
        f"- Topic: {topic}\n"
        f"- Difficulty Level: {difficulty}\n"
        f"- Question Type: {question_type}\n"
        f"{company_context}\n\n"
        f"{personalization_prompt}\n"
    )

    try:
        logger.info(f"Sending practice generation request to model: {settings.AI_MODEL_NAME}...")
        response = client.chat.completions.create(
            model=settings.AI_MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.4,
        )
        
        raw_content = response.choices[0].message.content
        if not raw_content:
            raise RuntimeError("API returned an empty message response.")
            
        cleaned = raw_content.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        question_data = json.loads(cleaned)
        
        required_keys = ["title", "description", "code_context", "options", "correct_answer", "hints"]
        for key in required_keys:
            if key not in question_data:
                if key == "options":
                    question_data[key] = []
                elif key == "hints":
                    question_data[key] = ["Hint 1", "Hint 2", "Hint 3", "Final Solution"]
                else:
                    question_data[key] = ""
                    
        return question_data

    except json.JSONDecodeError as jde:
        logger.error(f"Failed to decode JSON from AI practice generation response. Raw: {raw_content}. Error: {str(jde)}")
        raise RuntimeError(f"The AI service returned an invalid response structure: {str(jde)}")
    except Exception as e:
        logger.error(f"Error communicating with OpenAI-compatible endpoint: {str(e)}")
        raise RuntimeError(f"Failed to generate practice question from AI service: {str(e)}")


def evaluate_practice_submission(question_data: dict, user_answer: str) -> dict:
    """
    Evaluates a user's answer submission via LLM analysis, grading correctness,
    logic, complexity, readability, strengths, weaknesses, and alternative solutions.
    """
    if not client:
        logger.error("AI client is not initialized due to missing API key configuration.")
        raise RuntimeError("AI_API_KEY is not configured on the backend server.")

    system_prompt = (
        "You are CodeMentor AI, an expert interviewer and code reviewer.\n"
        "Your task is to evaluate the user's answer to a practice question.\n"
        "You MUST respond ONLY with a raw JSON object string matching the schema below. Do not wrap the JSON object inside markdown fences (like ```json ... ```). Your response must start with '{' and end with '}':\n"
        "{\n"
        "  \"is_correct\": <boolean: true if the answer is logic-wise/code-wise correct and meets the criteria, false otherwise>,\n"
        "  \"overall_score\": <integer between 0 and 100 representing the score of their answer>,\n"
        "  \"logic_evaluation\": \"<detailed analysis of the correctness and correctness logic>\",\n"
        "  \"time_complexity\": \"<time complexity of user's code, or N/A if not applicable>\",\n"
        "  \"space_complexity\": \"<space complexity of user's code, or N/A if not applicable>\",\n"
        "  \"readability\": \"<readability assessment of their code/answer, or N/A if not applicable>\",\n"
        "  \"edge_cases\": \"<evaluation of edge cases handled/missed in their code/answer>\",\n"
        "  \"strengths\": [\"strength 1\", \"strength 2\", ...],\n"
        "  \"weaknesses\": [\"weakness 1\", \"weakness 2\", ...],\n"
        "  \"suggestions\": [\"concrete suggestion 1\", \"concrete suggestion 2\", ...],\n"
        "  \"alternative_solution\": \"<a complete optimal alternative solution with explanations, formatted as markdown. Write out full code if a coding question.>\",\n"
        "  \"interview_tips\": [\"interview question tip 1\", \"interview question tip 2\", ...]\n"
        "}"
    )

    user_prompt = (
        f"Evaluate the user's submission for the following question:\n\n"
        f"--- Question Title ---\n"
        f"{question_data.get('title')}\n\n"
        f"--- Question Description ---\n"
        f"{question_data.get('description')}\n\n"
        f"--- Question Type ---\n"
        f"{question_data.get('question_type')}\n\n"
        f"--- Programming Language ---\n"
        f"{question_data.get('programming_language')}\n\n"
        f"--- Correct/Expected Answer Reference ---\n"
        f"{question_data.get('correct_answer')}\n\n"
        f"--- User's Submitted Answer ---\n"
        f"{user_answer}\n"
    )

    try:
        logger.info(f"Sending practice evaluation request to model: {settings.AI_MODEL_NAME}...")
        response = client.chat.completions.create(
            model=settings.AI_MODEL_NAME,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.1,
        )
        
        raw_content = response.choices[0].message.content
        if not raw_content:
            raise RuntimeError("API returned an empty message response.")
            
        cleaned = raw_content.strip()
        if cleaned.startswith("```json"):
            cleaned = cleaned[7:]
        elif cleaned.startswith("```"):
            cleaned = cleaned[3:]
        if cleaned.endswith("```"):
            cleaned = cleaned[:-3]
        cleaned = cleaned.strip()

        eval_data = json.loads(cleaned)
        
        required_keys = [
            "is_correct", "overall_score", "logic_evaluation", "time_complexity",
            "space_complexity", "readability", "edge_cases", "strengths",
            "weaknesses", "suggestions", "alternative_solution", "interview_tips"
        ]
        for key in required_keys:
            if key not in eval_data:
                if key == "is_correct":
                    eval_data[key] = False
                elif key == "overall_score":
                    eval_data[key] = 0
                elif key in ["strengths", "weaknesses", "suggestions", "interview_tips"]:
                    eval_data[key] = []
                else:
                    eval_data[key] = "N/A"
                    
        return eval_data

    except json.JSONDecodeError as jde:
        logger.error(f"Failed to decode JSON from AI practice evaluation response. Raw: {raw_content}. Error: {str(jde)}")
        raise RuntimeError(f"The AI service returned an invalid response structure: {str(jde)}")
    except Exception as e:
        logger.error(f"Error communicating with OpenAI-compatible endpoint: {str(e)}")
        raise RuntimeError(f"Failed to evaluate practice submission from AI service: {str(e)}")


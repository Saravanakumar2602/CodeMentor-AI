from fastapi import APIRouter, Depends, HTTPException, status
from app.models.schemas import CodeExplanationRequest, CodeExplanationResponse
from app.core.security import get_current_user
from app.services.gemini import generate_code_explanation
from app.services.supabase import create_chat_history_entry

router = APIRouter()

@router.post("", response_model=CodeExplanationResponse, status_code=status.HTTP_201_CREATED)
def explain_code(
    request: CodeExplanationRequest,
    current_user: dict = Depends(get_current_user)
):
    """
    Endpoint to explain a block of code.
    1. Authenticates the user using Supabase JWT.
    2. Sends code to Gemini API for explanation.
    3. Saves code and explanation to Supabase chat_history.
    4. Returns the database record.
    """
    try:
        # Step 1: Request code explanation from Gemini service
        explanation = generate_code_explanation(
            code_input=request.code_input,
            language=request.language
        )
        
        # Step 2: Store explanation details in Supabase chat_history
        new_entry = create_chat_history_entry(
            user_id=current_user["id"],
            code_input=request.code_input,
            ai_response=explanation
        )
        
        if not new_entry:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to record chat history to database."
            )
            
        return new_entry
        
    except RuntimeError as err:
        # Catch errors from services (Gemini or Supabase) and return descriptive API errors
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=str(err)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An unexpected error occurred during explanation: {str(e)}"
        )

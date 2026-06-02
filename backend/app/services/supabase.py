from supabase import create_client, Client
from app.core.config import settings

# Initialize the Supabase Python client
supabase_client: Client = create_client(settings.SUPABASE_URL, settings.SUPABASE_KEY)

def get_user_chat_history(user_id: str) -> list:
    """
    Fetch chat history records from Supabase for a given user.
    Ordered by creation date descending (newest first).
    """
    try:
        response = supabase_client.table("chat_history") \
            .select("*") \
            .eq("user_id", user_id) \
            .order("created_at", desc=True) \
            .execute()
        return response.data
    except Exception as e:
        # Log or raise exception to be handled by the route
        raise RuntimeError(f"Database error while fetching history: {str(e)}")

def create_chat_history_entry(user_id: str, code_input: str, ai_response: str) -> dict:
    """
    Insert a new chat explanation entry into the database.
    """
    try:
        data = {
            "user_id": user_id,
            "code_input": code_input,
            "ai_response": ai_response
        }
        response = supabase_client.table("chat_history").insert(data).execute()
        
        if response.data and len(response.data) > 0:
            return response.data[0]
        else:
            raise RuntimeError("Database insert operation returned no data.")
    except Exception as e:
        raise RuntimeError(f"Database error while creating entry: {str(e)}")

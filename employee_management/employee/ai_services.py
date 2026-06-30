from decouple import config
from langchain_google_genai import ChatGoogleGenerativeAI
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=config("GEMINI_API_KEY"),
    temperature=0.3,
)

def ask_ai(question, user):
    context = f"""
    User Name: {user.username}
    Department: {getattr(user, 'department', 'N/A')}
    """

    full_prompt = context + "\n\nQuestion:\n" + question

    try:
        response = llm.invoke(full_prompt)
        return response.content
    except Exception as e:
        print(e)
        return "Sorry, I couldn't generate a response at the moment."
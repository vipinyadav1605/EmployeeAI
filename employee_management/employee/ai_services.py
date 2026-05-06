from langchain_openai import ChatOpenAI
from langchain_core.messages import HumanMessage
import os
from langchain_huggingface import HuggingFaceEndpoint
from decouple import config
llm = HuggingFaceEndpoint(
    # repo_id="google/flan-t5-base",
    repo_id="google/flan-t5-base",
    temperature=0.3,
    max_new_tokens=512,
    huggingfacehub_api_token=config("HUGGINGFACEHUB_API_TOKEN")
)

def ask_ai(question, user):
    context = f"""
    User Name: {user.username}
    Department: {getattr(user, 'department', 'N/A')}
    """

    full_prompt = context + "\n\n" + question

    # response = llm.invoke(full_prompt)

    # return response.content
    return "hi here is your answer at this time api is not working properly"
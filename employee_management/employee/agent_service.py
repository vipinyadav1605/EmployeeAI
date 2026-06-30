from langgraph.graph import StateGraph, END

from langchain_core.messages import HumanMessage
from .agent_tools import apply_leave_tool, get_employee_info
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.llms import HuggingFaceHub
from langgraph.graph import StateGraph, END
from langchain_core.messages import HumanMessage
from .agent_tools import apply_leave_tool, get_employee_info

from decouple import config

from typing import TypedDict
from langchain_google_genai import ChatGoogleGenerativeAI
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    google_api_key=config("GEMINI_API_KEY"),
    temperature=0.3,
)

#  Define state
class AgentState(TypedDict):
    input: str
    action: str
    result: str
    user_id: int

#  Step 1: LLM decides action
def decide_action(state:AgentState):
    user_input = state["input"]
    prompt = f"""
    You must return ONLY one word:

    - apply_leave
    - get_employee
    - respond

    Input: {user_input}
    """

    response = llm.invoke(prompt)
    state["action"] = response.strip()
    return state

#  Step 2: Execute tool
def execute_action(state:AgentState):
    action = state["action"]
    user_id = state.get("user_id", 1)

    if "apply_leave" in action:
        result = apply_leave_tool(user_id, "2026-04-15")
    elif "get_employee" in action:
        result = get_employee_info(user_id)
    else:
        result = "No action needed"

    state["result"] = result
    return state

#  Step 3: Final response
def final_response(state:AgentState):
    return {"output": str(state["result"])}

#  Build graph
def build_agent():
    graph = StateGraph(AgentState)

    graph.add_node("decide", decide_action)
    graph.add_node("execute", execute_action)
    graph.add_node("final", final_response)

    graph.set_entry_point("decide")

    graph.add_edge("decide", "execute")
    graph.add_edge("execute", "final")
    graph.add_edge("final", END)

    return graph.compile()

agent = build_agent()

#  Step 1: LLM decides action
def decide_action(state:AgentState):
    # user_input = state["input"]
    print("State received in decide_action:", state)
    user_input = state.get("input")
    prompt = f"""
    Decide action based on input:

    Input: {user_input}

    If leave → return: apply_leave
    If employee info → return: get_employee
    Otherwise → return: respond
    """

    response = llm.invoke(prompt)

    state["action"] = str(response).strip()
    return state

#  Step 2: Execute tool
def execute_action(state):
    action = state["action"]
    user_id = state.get("user_id", 1)

    if "apply_leave" in action:
        result = apply_leave_tool(user_id, "2026-04-15")
    elif "get_employee" in action:
        result = get_employee_info(user_id)
    else:
        result = "No action needed"

    state["result"] = result
    return state

#  Step 3: Final response
def final_response(state):
    return {"output": str(state["result"])}

#  Build graph
def build_agent():
    graph = StateGraph(AgentState)

    graph.add_node("decide", decide_action)
    graph.add_node("execute", execute_action)
    graph.add_node("final", final_response)

    graph.set_entry_point("decide")

    graph.add_edge("decide", "execute")
    graph.add_edge("execute", "final")
    graph.add_edge("final", END)

    return graph.compile()

agent = build_agent()
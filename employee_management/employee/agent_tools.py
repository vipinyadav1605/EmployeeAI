import requests

def apply_leave_tool(user_id, date):
    response = requests.post(
        "http://127.0.0.1:8000/api/leaves/",
        json={
            "employee": user_id,
            "start_date": date,
            "end_date": date,
            "reason": "Applied via AI"
        }
    )

    return response.json()
def get_employee_info(user_id):
    # temporary dummy implementation
    return f"Employee info for user {user_id}"
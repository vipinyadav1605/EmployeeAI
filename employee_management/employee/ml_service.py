import joblib
import numpy as np

import os
import joblib
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
model_path = os.path.join(BASE_DIR, "attrition_model.pkl")

# Load model (no dict now, just model)
data = joblib.load(model_path)
model=data['model']
threshold = data.get("threshold", 0.5)

def predict_attrition(salary, years, performance):
    try:
        # Convert to float
        salary = float(salary)
        years = float(years)
        performance = float(performance)
    except:
        return {"error": "Invalid input values"}

    # Create input array (order matters!)
    input_array = np.array([[salary, years, performance]])

    prob = model.predict_proba(input_array)[0][1]
    pred = int(prob >= 0.5)

    return {
        "will_leave": bool(pred),
        "probability": round(prob * 100, 1)
    }

def get_feature_importance():
    importance = model.feature_importances_

    features = ["MonthlyIncome", "YearsAtCompany", "PerformanceRating"]

    return {
        feature: round(float(score), 3)
        for feature, score in zip(features, importance)
    }
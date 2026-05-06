import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Dummy data
data = pd.DataFrame({
    "salary": [20000, 50000, 30000, 80000],
    "years": [1, 5, 2, 8],
    "performance": [2, 5, 3, 4],
    "left": [1, 0, 1, 0]
})

X = data[["salary", "years", "performance"]]
y = data["left"]

model = RandomForestClassifier()
model.fit(X, y)

# SAVE MODEL
joblib.dump(model, "attrition_model.pkl")

print("Model saved ")
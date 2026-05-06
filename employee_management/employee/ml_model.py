import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import joblib

#  Better dataset (extend later)
data = pd.DataFrame({
    "salary": [20000, 50000, 30000, 80000, 25000, 60000, 45000],
    "years": [1, 5, 2, 8, 1, 6, 4],
    "performance": [2, 5, 3, 4, 2, 4, 3],
    "left": [1, 0, 1, 0, 1, 0, 0]
})

X = data[["salary", "years", "performance"]]
y = data["left"]

#  Train/Test split (important)
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Random Forest model
model = RandomForestClassifier(
    n_estimators=100,
    max_depth=5,
    random_state=42
)

model.fit(X_train, y_train)

# Save model
joblib.dump(model, "attrition_model.pkl")

print("Model trained & saved")
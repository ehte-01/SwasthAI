import joblib
import os

# Source folder where your .sav files are
source_folder = "models/Multiple-Disease-Prediction-System-main"

# Destination folder for .pkl files
dest_folder = "models"
os.makedirs(dest_folder, exist_ok=True)

# List of model files
model_files = [
    "diabetes_model.sav",
    "heart_disease_model.sav",
    "parkinsons_model.sav"
]

for file in model_files:
    sav_path = os.path.join(source_folder, file)
    pkl_name = file.replace(".sav", ".pkl")
    pkl_path = os.path.join(dest_folder, pkl_name)
    
    # Load .sav model
    model = joblib.load(sav_path)
    
    # Save as .pkl
    joblib.dump(model, pkl_path)
    print(f"Converted {file} → {pkl_name}")

print("All models converted successfully!")


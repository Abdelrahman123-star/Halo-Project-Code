import os
from dotenv import load_dotenv
from inference_sdk import InferenceHTTPClient, InferenceConfiguration

# Load ROBOFLOW_API_KEY from .env file
load_dotenv()

api_key = os.getenv("ROBOFLOW_API_KEY", "YOUR_API_KEY")

CLIENT = InferenceHTTPClient(
    api_url="https://serverless.roboflow.com",
    api_key=api_key,
).configure(
    InferenceConfiguration(
        api_key_transport="header"  # header-based auth (inference v1.5.0+)
    )
)

# Run inference on sample image
result = CLIENT.infer("sample_fashion.jpg", model_id="deepfashion2-m-10k/2")

print(result)

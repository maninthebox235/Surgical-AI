import json
import os
import tempfile
from typing import Any, Dict, List, Optional, Tuple, cast

import cv2
import numpy as np
import requests
import torch
import torchvision
from sqlalchemy.orm import Session

from app.models.models import Analysis, Video, VideoStatus

try:
    from slowfast.config.defaults import get_cfg
    from slowfast.models import build_model
except ImportError:  # pragma: no cover - optional model stack for local/CI unit tests
    get_cfg = None
    build_model = None

# Define surgical steps and their descriptions
SURGICAL_STEPS = {
    "incision": "Making the initial incision",
    "dissection": "Dissecting tissue layers",
    "hemostasis": "Controlling bleeding",
    "exposure": "Exposing the surgical site",
    "instrument_handling": "Handling surgical instruments",
    "suturing": "Performing suturing",
    "closure": "Closing the incision",
}


def load_model() -> Any:
    """
    Load the pre-trained SlowFast model and surgical step classifier
    """
    if get_cfg is None or build_model is None:
        raise ImportError("slowfast is required to load the surgical analysis model")

    cfg = get_cfg()
    cfg.MODEL.MODEL_NAME = "slowfast"
    cfg.MODEL.NUM_CLASSES = len(SURGICAL_STEPS)  # Number of surgical steps
    cfg.MODEL.DROPOUT_RATE = 0.5
    cfg.MODEL.HEAD_ACT = "softmax"

    model = build_model(cfg)
    # Load pre-trained weights
    weights_path = os.getenv("MODEL_WEIGHTS_PATH") or ""
    checkpoint = torch.load(weights_path, map_location="cpu")
    model.load_state_dict(checkpoint["model_state_dict"])
    model.eval()
    return model


def preprocess_video(video_path: str) -> Tuple[torch.Tensor, List[float]]:
    """
    Preprocess video for model input and extract timestamps
    """
    cap = cv2.VideoCapture(video_path)
    frames: List[Any] = []
    timestamps = []
    fps = cap.get(cv2.CAP_PROP_FPS)

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        # Resize frame
        frame = cv2.resize(frame, (224, 224))
        # Convert to RGB
        frame = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        frames.append(frame)

        # Calculate timestamp
        timestamp = len(frames) / fps
        timestamps.append(timestamp)

    cap.release()

    # Convert to tensor
    tensor_frames = torch.tensor(np.array(frames))
    # Normalize
    tensor_frames = tensor_frames.float() / 255.0
    # Add batch dimension
    tensor_frames = tensor_frames.unsqueeze(0)

    return tensor_frames, timestamps


def analyze_surgical_technique(frame: np.ndarray) -> Dict[str, float]:
    """
    Analyze surgical technique in a single frame
    Returns scores for different aspects of technique
    """
    # This is a placeholder for actual technique analysis
    # In a real implementation, this would use a separate model
    return {
        "instrument_handling": 0.8,
        "tissue_handling": 0.7,
        "precision": 0.75,
        "efficiency": 0.65,
    }


def generate_feedback(
    step_predictions: List[Dict[str, float]],
    timestamps: List[float],
    technique_scores: List[Dict[str, float]],
) -> Dict:
    """
    Generate detailed feedback based on model predictions and technique analysis
    """
    feedback: Dict[str, Any] = {
        "steps": [],
        "technique_analysis": {},
        "recommendations": [],
    }

    # Process step predictions
    for i, pred in enumerate(step_predictions):
        if max(pred.values()) > 0.5:  # Confidence threshold
            step = max(pred.items(), key=lambda x: x[1])
            feedback["steps"].append(
                {
                    "step": step[0],
                    "confidence": float(step[1]),
                    "timestamp": timestamps[i],
                    "description": SURGICAL_STEPS[step[0]],
                }
            )

    # Calculate average technique scores
    avg_technique = {
        key: sum(score[key] for score in technique_scores) / len(technique_scores)
        for key in technique_scores[0].keys()
    }
    feedback["technique_analysis"] = avg_technique

    # Generate recommendations based on technique scores
    if avg_technique["instrument_handling"] < 0.7:
        feedback["recommendations"].append(
            "Consider improving instrument handling technique. Practice proper grip and movement control."
        )
    if avg_technique["tissue_handling"] < 0.7:
        feedback["recommendations"].append(
            "Work on gentler tissue handling. Minimize trauma to surrounding tissues."
        )
    if avg_technique["precision"] < 0.7:
        feedback["recommendations"].append(
            "Focus on improving precision in movements. Consider practicing with simulation tools."
        )
    if avg_technique["efficiency"] < 0.7:
        feedback["recommendations"].append(
            "Look for opportunities to improve efficiency. Plan movements ahead and minimize unnecessary steps."
        )

    return feedback


async def analyze_video(video_id: int, video_url: str, db: Session) -> Any:
    """
    Analyze a surgical video and generate comprehensive feedback
    """
    try:
        # Download video
        response = requests.get(video_url)
        with tempfile.NamedTemporaryFile(suffix=".mp4", delete=False) as temp_file:
            temp_file.write(response.content)
            temp_path = temp_file.name

        # Load model
        model = load_model()

        # Preprocess video
        video_tensor, timestamps = preprocess_video(temp_path)

        # Get predictions for each frame
        step_predictions = []
        technique_scores = []

        with torch.no_grad():
            for i in range(video_tensor.size(1)):  # Iterate through frames
                frame = video_tensor[0, i].numpy()

                # Get step prediction
                frame_tensor = video_tensor[:, i : i + 1]
                pred = model(frame_tensor)
                pred = torch.softmax(pred, dim=1)
                step_predictions.append(
                    {step: float(pred[0][i]) for i, step in enumerate(SURGICAL_STEPS.keys())}
                )

                # Analyze technique
                technique_score = analyze_surgical_technique(frame)
                technique_scores.append(technique_score)

        # Generate comprehensive feedback
        feedback = generate_feedback(step_predictions, timestamps, technique_scores)

        # Update database
        video = db.query(Video).filter(Video.id == video_id).first()
        if video:
            setattr(video, "status", VideoStatus.COMPLETED)
            setattr(video, "progress", 100)

            analysis = Analysis(video_id=video_id, feedback=json.dumps(feedback))
            db.add(analysis)
            db.commit()

        # Clean up
        os.unlink(temp_path)

    except Exception as e:
        # Update video status to failed
        video = db.query(Video).filter(Video.id == video_id).first()
        if video:
            setattr(video, "status", VideoStatus.FAILED)
            db.commit()
        raise e

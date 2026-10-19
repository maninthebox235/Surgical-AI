from unittest.mock import Mock, patch

import numpy as np
import pytest
import torch

from app.models.models import Video, VideoStatus
from app.utils.analysis import analyze_video, generate_feedback, preprocess_video


@pytest.fixture
def mock_video():
    return Video(
        id=1,
        title="test_video.mp4",
        file_path="videos/1/test.mp4",
        status=VideoStatus.PENDING,
        user_id=1,
    )


@pytest.fixture
def mock_db(mock_video):
    db = Mock()
    db.query.return_value.filter.return_value.first.return_value = mock_video
    return db


def test_preprocess_video():
    with patch("cv2.VideoCapture") as mock_cap:
        mock_frames = [np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8) for _ in range(10)]

        mock_cap.return_value.read.side_effect = [(True, frame) for frame in mock_frames] + [
            (False, None)
        ]
        mock_cap.return_value.isOpened.return_value = True
        mock_cap.return_value.get.return_value = 30.0

        result, timestamps = preprocess_video("test.mp4")

        assert isinstance(result, torch.Tensor)
        assert result.shape[0] == 1  # batch dimension
        assert result.shape[1] == 10  # number of frames
        assert result.shape[2] == 224  # height
        assert result.shape[3] == 224  # width
        assert result.shape[4] == 3  # channels
        assert len(timestamps) == 10


def test_generate_feedback():
    step_predictions = [
        {"incision": 0.9, "suturing": 0.1},
        {"suturing": 0.8, "incision": 0.1},
        {"hemostasis": 0.7, "incision": 0.1},
    ]
    timestamps = [0.0, 1.0, 2.0]
    technique_scores = [
        {
            "instrument_handling": 0.8,
            "tissue_handling": 0.8,
            "precision": 0.8,
            "efficiency": 0.8,
        }
    ]

    feedback = generate_feedback(step_predictions, timestamps, technique_scores)
    assert "steps" in feedback
    assert any(step["step"] == "incision" for step in feedback["steps"])
    assert any(step["step"] == "suturing" for step in feedback["steps"])
    assert any(step["step"] == "hemostasis" for step in feedback["steps"])

    low_predictions = [{"incision": 0.3, "suturing": 0.2}]
    low_feedback = generate_feedback(low_predictions, [0.0], technique_scores)
    assert low_feedback["steps"] == []


@pytest.mark.asyncio
async def test_analyze_video(mock_db):
    with (
        patch("requests.get") as mock_get,
        patch("app.utils.analysis.load_model") as mock_load_model,
        patch("app.utils.analysis.preprocess_video") as mock_preprocess,
        patch("app.utils.analysis.analyze_surgical_technique") as mock_technique,
        patch("app.utils.analysis.generate_feedback") as mock_feedback,
        patch("tempfile.NamedTemporaryFile") as mock_temp_file,
        patch("builtins.open", create=True),
        patch("os.unlink"),
    ):
        mock_get.return_value.content = b"fake video content"

        mock_model = Mock()
        mock_model.eval.return_value = None
        # One logit per surgical step
        mock_model.return_value = torch.zeros(1, 7)
        mock_load_model.return_value = mock_model

        mock_preprocess.return_value = (torch.zeros(1, 1, 224, 224, 3), [0.0])
        mock_technique.return_value = {
            "instrument_handling": 0.8,
            "tissue_handling": 0.8,
            "precision": 0.8,
            "efficiency": 0.8,
        }
        mock_feedback.return_value = {
            "steps": [],
            "technique_analysis": {},
            "recommendations": [],
        }

        mock_temp_file.return_value.__enter__.return_value.name = "temp.mp4"
        mock_temp_file.return_value.__enter__.return_value.write = Mock()

        await analyze_video(1, "http://example.com/video.mp4", mock_db)

        mock_db.commit.assert_called()
        mock_db.add.assert_called_once()

        video = mock_db.query.return_value.filter.return_value.first.return_value
        assert video.status == VideoStatus.COMPLETED
        assert video.progress == 100

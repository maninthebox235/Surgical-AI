import pytest
from unittest.mock import Mock, patch
import torch
import numpy as np
from app.utils.analysis import preprocess_video, generate_feedback, analyze_video
from app.models.models import Video, Analysis, VideoStatus

@pytest.fixture
def mock_video():
    return Video(
        id=1,
        title="test_video.mp4",
        file_path="videos/1/test.mp4",
        status=VideoStatus.PENDING,
        user_id=1
    )

@pytest.fixture
def mock_db():
    db = Mock()
    db.query.return_value.filter.return_value.first.return_value = mock_video()
    return db

def test_preprocess_video():
    # Create a test video file
    with patch('cv2.VideoCapture') as mock_cap:
        # Mock video frames
        mock_frames = [
            np.random.randint(0, 255, (480, 640, 3), dtype=np.uint8)
            for _ in range(10)
        ]
        
        # Mock video capture
        mock_cap.return_value.read.side_effect = [(True, frame) for frame in mock_frames] + [(False, None)]
        mock_cap.return_value.isOpened.return_value = True
        
        # Test preprocessing
        result = preprocess_video("test.mp4")
        
        # Check output shape and type
        assert isinstance(result, torch.Tensor)
        assert result.shape[0] == 1  # batch dimension
        assert result.shape[1] == 10  # number of frames
        assert result.shape[2] == 224  # height
        assert result.shape[3] == 224  # width
        assert result.shape[4] == 3  # channels

def test_generate_feedback():
    # Test with high confidence predictions
    predictions = {
        "incision": 0.9,
        "suturing": 0.8,
        "clamping": 0.7
    }
    feedback = generate_feedback(predictions)
    assert "incision" in feedback
    assert "suturing" in feedback
    assert "clamping" in feedback
    
    # Test with low confidence predictions
    predictions = {
        "incision": 0.3,
        "suturing": 0.2
    }
    feedback = generate_feedback(predictions)
    assert feedback == "No significant surgical actions detected"

@pytest.mark.asyncio
async def test_analyze_video(mock_db):
    with patch('requests.get') as mock_get, \
         patch('app.utils.analysis.load_model') as mock_load_model, \
         patch('torch.load') as mock_load_weights, \
         patch('tempfile.NamedTemporaryFile') as mock_temp_file:
        
        # Mock video download
        mock_get.return_value.content = b"fake video content"
        
        # Mock model
        mock_model = Mock()
        mock_model.eval.return_value = None
        mock_model.return_value = torch.tensor([[0.8, 0.2]])  # Mock predictions
        mock_load_model.return_value = mock_model
        
        # Mock temporary file
        mock_temp_file.return_value.__enter__.return_value.name = "temp.mp4"
        
        # Test analysis
        await analyze_video(1, "http://example.com/video.mp4", mock_db)
        
        # Verify database updates
        mock_db.commit.assert_called()
        mock_db.add.assert_called_once()
        
        # Verify video status update
        video = mock_db.query.return_value.filter.return_value.first.return_value
        assert video.status == VideoStatus.COMPLETED
        assert video.progress == 100 
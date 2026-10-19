from pathlib import Path

import cv2
import numpy as np
from PIL import Image

from app.utils.video_processor import generate_thumbnail


def test_generate_thumbnail_opens_and_resizes_with_pillow(tmp_path: Path) -> None:
    video_path = tmp_path / "sample.avi"
    thumb_path = tmp_path / "thumb.jpg"

    fourcc = cv2.VideoWriter_fourcc(*"MJPG")
    writer = cv2.VideoWriter(str(video_path), fourcc, 5.0, (64, 48))
    assert writer.isOpened()
    frame = np.zeros((48, 64, 3), dtype=np.uint8)
    frame[:, :] = (40, 80, 160)
    for _ in range(5):
        writer.write(frame)
    writer.release()

    assert generate_thumbnail(str(video_path), str(thumb_path), size=(32, 24)) is True
    assert thumb_path.exists()

    with Image.open(thumb_path) as image:
        assert image.format == "JPEG"
        assert image.size == (32, 24)

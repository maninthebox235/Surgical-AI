from fastapi import FastAPI, File, Form, UploadFile
from fastapi.testclient import TestClient


app = FastAPI()


@app.post("/upload-form")
async def upload_form(
    title: str = Form(...),
    file: UploadFile = File(...),
) -> dict[str, str | int | None]:
    contents = await file.read()
    return {
        "title": title,
        "filename": file.filename,
        "content_type": file.content_type,
        "size": len(contents),
    }


client = TestClient(app)


def test_python_multipart_form_and_file_upload() -> None:
    response = client.post(
        "/upload-form",
        data={"title": "laparoscopic-demo"},
        files={"file": ("clip.mp4", b"\x00\x00fake-video-bytes", "video/mp4")},
    )

    assert response.status_code == 200
    body = response.json()
    assert body["title"] == "laparoscopic-demo"
    assert body["filename"] == "clip.mp4"
    assert body["content_type"] == "video/mp4"
    assert body["size"] == len(b"\x00\x00fake-video-bytes")

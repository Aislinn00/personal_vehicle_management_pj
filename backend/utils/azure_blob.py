import os
import uuid
from functools import lru_cache
from azure.storage.blob import BlobServiceClient
from werkzeug.utils import secure_filename

@lru_cache(maxsize=1)
def _get_container_client():
    account_name = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
    account_key = os.getenv("AZURE_STORAGE_ACCOUNT_KEY")
    container_name = os.getenv("AZURE_CONTAINER_NAME")

    if not account_name or not account_key or not container_name:
        # Do NOT crash the app at import time
        raise RuntimeError("Azure Blob env vars missing: AZURE_STORAGE_ACCOUNT_NAME / AZURE_STORAGE_ACCOUNT_KEY / AZURE_CONTAINER_NAME")

    service = BlobServiceClient(
        account_url=f"https://{account_name}.blob.core.windows.net",
        credential=account_key,
    )
    return service.get_container_client(container_name)

def upload_to_blob(file, vehicle_id: int) -> str:
    """
    Upload an image to Azure Blob Storage and return the blob URL.
    """
    original = secure_filename(file.filename or "")
    ext = os.path.splitext(original)[1].lower()

    # Optional: enforce extensions server-side too
    if ext not in {".jpg", ".jpeg", ".png", ".webp"}:
        raise ValueError("Unsupported file extension")

    unique_name = f"{uuid.uuid4().hex}{ext}"
    blob_path = f"vehicles/{vehicle_id}/{unique_name}"

    container_client = _get_container_client()
    blob_client = container_client.get_blob_client(blob_path)

    # Use stream (safer than passing FileStorage object)
    blob_client.upload_blob(
        data=file.stream,
        overwrite=False,
        content_type=file.content_type,
    )

    return blob_client.url

import os
import uuid
from azure.storage.blob import BlobServiceClient
from werkzeug.utils import secure_filename

ACCOUNT_NAME = os.getenv("AZURE_STORAGE_ACCOUNT_NAME")
ACCOUNT_KEY = os.getenv("AZURE_STORAGE_ACCOUNT_KEY")
CONTAINER_NAME = os.getenv("AZURE_CONTAINER_NAME")

if not ACCOUNT_NAME or not ACCOUNT_KEY or not CONTAINER_NAME:
    raise RuntimeError("Azure Blob environment variables are missing")

blob_service_client = BlobServiceClient(
    account_url=f"https://{ACCOUNT_NAME}.blob.core.windows.net",
    credential=ACCOUNT_KEY
)

container_client = blob_service_client.get_container_client(CONTAINER_NAME)


def upload_to_blob(file, vehicle_id):
    """
    Uploads image to Azure Blob Storage and returns public URL.
    """

    original = secure_filename(file.filename)
    ext = os.path.splitext(original)[1]

    # Prevent overwrite
    unique_name = f"{uuid.uuid4()}{ext}"
    blob_path = f"vehicles/{vehicle_id}/{unique_name}"

    blob_client = container_client.get_blob_client(blob_path)

    blob_client.upload_blob(
        file,
        overwrite=False,
        content_type=file.content_type
    )

    return blob_client.url

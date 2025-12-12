import os
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


def upload_vehicle_image(file, vehicle_id):
    #Uploads image to Azure Blob Storage and returns public URL

    filename = secure_filename(file.filename)
    blob_path = f"vehicles/{vehicle_id}/{filename}"

    blob_client = container_client.get_blob_client(blob_path)
    blob_client.upload_blob(file, overwrite=True)

    return blob_client.url

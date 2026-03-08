import os
import hvac


VAULT_URL = "http://localhost:8200"
VAULT_TOKEN = os.getenv("VAULT_TOKEN")


def load_secrets() -> dict:
    client = hvac.Client(
        url=VAULT_URL,
        token=VAULT_TOKEN
    )

    if not client.is_authenticated():
        raise RuntimeError("Vault authentication failed")

    secrets = {}

    response = client.secrets.kv.v2.read_secret_version(
        path="application",
        mount_point="secret"
    )

    data = response["data"]["data"]
    secrets.update(data)

    return secrets

VAULT_SECRETS = load_secrets()
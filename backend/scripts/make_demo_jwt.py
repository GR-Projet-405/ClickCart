import hmac
import hashlib
import base64

secret = b"clickcart-local-dev-secret-please-change-32"

def b64(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode()

def token(sub: str, name: str) -> str:
    header = b64(b'{"alg":"HS256","typ":"JWT"}')
    payload = b64(
        f'{{"sub":"{sub}","role":"SERVICE_PROVIDER","name":"{name}","exp":1893456000}}'.encode()
    )
    body = f"{header}.{payload}"
    sig = b64(hmac.new(secret, body.encode(), hashlib.sha256).digest())
    return f"{body}.{sig}"

print(token("provider-a", "Kavinda Silva"))
print(token("provider-b", "Provider B"))

export const toBase64 = (buffer) => {
  const bytes = buffer instanceof ArrayBuffer ? new Uint8Array(buffer) : buffer;

  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }

  return btoa(binary);
};

export const fromBase64 = (b64) => {
  if (!b64 || typeof b64 !== "string") return new Uint8Array();

  try {
    const normalized = b64
      .replace(/-/g, "+")
      .replace(/_/g, "/")
      .padEnd(Math.ceil(b64.length / 4) * 4, "=");

    const binary = atob(normalized);
    const bytes = new Uint8Array(binary.length);

    for (let i = 0; i < binary.length; i++) {
      bytes[i] = binary.charCodeAt(i);
    }

    return bytes;
  } catch (err) {
    console.warn("Invalid base64 string:", b64);
    return new Uint8Array();
  }
};

export const importX25519PublicKey = async (base64Key) => {
  const raw = fromBase64(base64Key);

  return crypto.subtle.importKey(
    "raw",
    raw.buffer,
    { name: "X25519" },
    false,
    []
  );
};

export const importEd25519PublicKey = async (base64Key) => {
  const raw = fromBase64(base64Key);

  return crypto.subtle.importKey(
    "raw",
    raw.buffer,
    { name: "Ed25519" },
    false,
    ["verify"]
  );
};

export const verifySignedPrekey = async ({
  identityKeyPubBase64,
  signedPrekeyPubBase64,
  signedPrekeySigBase64,
}) => {
  const identityPubkey = await importEd25519PublicKey(identityKeyPubBase64);

  const signedPrekeyPub = fromBase64(signedPrekeyPubBase64);
  const signature = fromBase64(signedPrekeySigBase64);

  return crypto.subtle.verify(
    "Ed25519",
    identityPubkey,
    signature,
    signedPrekeyPub.buffer,
    signedPrekeyPub.buffer
  );
};

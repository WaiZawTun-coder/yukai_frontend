import { toBase64 } from "@/helpers/Base64";
import { openDB, STORE_NAME } from "@/helpers/indexDB";
import { loadKey, saveKey } from "./storage";

/* ---------------- Helpers ---------------- */

function keyName(userId, name) {
  return `${name}:${userId}`;
}

/* ---------------- Key Generation ---------------- */

export async function generateDeviceKeys(userId) {
  // Identity key (Ed25519)
  const identityKeyPair = await crypto.subtle.generateKey(
    { name: "Ed25519" },
    true,
    ["sign", "verify"]
  );

  // Signed prekey (X25519)
  const signedPrekeyPair = await crypto.subtle.generateKey(
    { name: "X25519" },
    true,
    ["deriveBits"]
  );

  // Export public keys
  const identityPub = await crypto.subtle.exportKey(
    "raw",
    identityKeyPair.publicKey
  );

  const signedPrekeyPub = await crypto.subtle.exportKey(
    "raw",
    signedPrekeyPair.publicKey
  );

  // Sign signed-prekey
  const signedPrekeySig = await crypto.subtle.sign(
    "Ed25519",
    identityKeyPair.privateKey,
    signedPrekeyPub
  );

  const signedPrekeyId = crypto.getRandomValues(new Uint32Array(1))[0];
  const registrationId = crypto.getRandomValues(new Uint16Array(1))[0];

  // Persist keys per user
  await saveUserKey(userId, "identity_private", identityKeyPair.privateKey);
  await saveUserKey(userId, "identity_public", identityKeyPair.publicKey);
  await saveUserKey(
    userId,
    "signed_prekey_private",
    signedPrekeyPair.privateKey
  );
  await saveUserKey(userId, "signed_prekey_public", signedPrekeyPair.publicKey);

  return {
    identity_key_pub: toBase64(identityPub),
    signed_prekey_pub: toBase64(signedPrekeyPub),
    signed_prekey_sig: toBase64(signedPrekeySig),
    signed_prekey_id: signedPrekeyId,
    registration_id: registrationId,
  };
}

/* ---------------- Load Keys ---------------- */

export async function loadDeviceKeys(userId) {
  const identityPrivate = await loadUserKey(
    userId,
    "identity_private",
    { name: "Ed25519" },
    ["sign"]
  );

  const signedPrekeyPrivate = await loadUserKey(
    userId,
    "signed_prekey_private",
    { name: "X25519" },
    ["deriveBits"]
  );

  const signedPrekeyPublic = await loadUserKey(
    userId,
    "signed_prekey_public",
    { name: "X25519" },
    []
  );

  let signedPrekeyPubBase64 = null;

  if (signedPrekeyPublic) {
    const raw = await crypto.subtle.exportKey("raw", signedPrekeyPublic);
    signedPrekeyPubBase64 = toBase64(raw);
  }

  return {
    identityPrivate,
    signedPrekeyPrivate,
    signedPrekeyPubBase64,
  };
}

/* ---------------- Storage Wrappers ---------------- */

export async function saveUserKey(userId, name, key) {
  return saveKey(keyName(userId, name), key);
}

export async function loadUserKey(userId, name, algo, usage) {
  return loadKey(keyName(userId, name), algo, usage);
}

/* ---------------- Clear Keys ---------------- */

export async function clearUserKeys(userId) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);

    const keys = [
      "identity_private",
      "identity_public",
      "signed_prekey_private",
      "signed_prekey_public",
    ];

    for (const k of keys) {
      store.delete(keyName(userId, k));
    }

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

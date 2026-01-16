import { openDB } from "@/helpers/indexDB";

export async function saveKey(name, key) {
  const db = await openDB();

  const jwk = await crypto.subtle.exportKey("jwk", key);

  return new Promise((resolve, reject) => {
    const tx = db.transaction("keys", "readwrite");
    const store = tx.objectStore("keys");

    store.put({ name, jwk });

    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function loadKey(name, algo, usage) {
  const db = await openDB();

  return new Promise((resolve, reject) => {
    const tx = db.transaction("keys", "readonly");
    const store = tx.objectStore("keys");
    const request = store.get(name);

    request.onsuccess = async () => {
      if (!request.result) return resolve(null);

      try {
        const key = await crypto.subtle.importKey(
          "jwk",
          request.result.jwk,
          algo,
          true,
          usage
        );
        resolve(key);
      } catch (err) {
        reject(err);
      }
    };

    request.onerror = () => reject(request.error);
  });
}

// usage example
// // Generate identity key
// const keyPair = await crypto.subtle.generateKey(
//     { name: "Ed25519" },
//     true,
//     ["sign", "verify"]
//   );

//   // Save private & public keys
//   await saveKey(keyPair.privateKey, "identity_priv");
//   await saveKey(keyPair.publicKey, "identity_pub");

//   // Load keys later
//   const priv = await loadKey("identity_priv", ["sign"], { name: "Ed25519" });
//   const pub = await loadKey("identity_pub", ["verify"], { name: "Ed25519" });

"use client";

import { createContext, useContext, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

import { getBackendUrl } from "@/utilities/url";
import {
  clearUserKeys,
  generateDeviceKeys,
  loadDeviceKeys,
} from "@/utilities/deviceKeys";

import {
  fromBase64,
  importX25519PublicKey,
  toBase64,
  verifySignedPrekey,
} from "@/helpers/Base64";

/* ------------------------------------------------------------------ */

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

/* ------------------------------------------------------------------ */

function getDeviceId() {
  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}

/* ------------------------------------------------------------------ */

export const AuthProvider = ({ children }) => {
  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasKeys, setHasKeys] = useState(false);

  // Private + Public Key Refs
  const identityPrivRef = useRef(null);
  const signedPrekeyPrivRef = useRef(null);
  const signedPrekeyPubRef = useRef(null); // ✅ needed for payload
  const signedPrekeyId = useRef(null);
  const registrationId = useRef(null);

  const router = useRouter();

  /* ===================== INIT AUTH ===================== */

  useEffect(() => {
    (async () => {
      try {
        const token = await refreshToken();
        if (token) await getUser(token);
      } catch {
        setAccessToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* ===================== INIT DEVICE KEYS ===================== */

  useEffect(() => {
    if (!accessToken || !user) return;

    (async () => {
      const deviceId = getDeviceId();

      const loaded = await loadDeviceKeys(user.user_id);

      if (!loaded.identityPrivate || !loaded.signedPrekeyPrivate) {
        const publicBundle = await generateDeviceKeys(user.user_id);

        await fetch(getBackendUrl() + "/api/register-device", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...publicBundle,
            device_id: deviceId,
            platform: "web",
          }),
        });

        const reloaded = await loadDeviceKeys(user.user_id);

        identityPrivRef.current = reloaded.identityPrivate;
        signedPrekeyPrivRef.current = reloaded.signedPrekeyPrivate;
        signedPrekeyPubRef.current = reloaded.signedPrekeyPubBase64;
        signedPrekeyId.current = reloaded.signedPrekeyId;
        registrationId.current = reloaded.registrationId;
      } else {
        identityPrivRef.current = loaded.identityPrivate;
        signedPrekeyPrivRef.current = loaded.signedPrekeyPrivate;
        signedPrekeyPubRef.current = loaded.signedPrekeyPubBase64;
        signedPrekeyId.current = loaded.signedPrekeyId;
        registrationId.current = loaded.registrationId;
      }

      setHasKeys(true);
    })();
  }, [accessToken, user]);

  /* ===================== CRYPTO HELPERS ===================== */

  const deriveSharedSecret = async (remoteSignedPrekeyPubBase64) => {
    const remotePub = await importX25519PublicKey(remoteSignedPrekeyPubBase64);

    return crypto.subtle.deriveBits(
      { name: "X25519", public: remotePub },
      signedPrekeyPrivRef.current,
      256
    );
  };

  const deriveAESKey = async (sharedSecret) => {
    const hkdfKey = await crypto.subtle.importKey(
      "raw",
      sharedSecret,
      "HKDF",
      false,
      ["deriveKey"]
    );

    return crypto.subtle.deriveKey(
      {
        name: "HKDF",
        hash: "SHA-256",
        salt: new Uint8Array(32),
        info: new TextEncoder().encode("e2ee-message"),
      },
      hkdfKey,
      { name: "AES-GCM", length: 256 },
      false,
      ["encrypt", "decrypt"]
    );
  };

  const encryptMessage = async (aesKey, plainText) => {
    const iv = crypto.getRandomValues(new Uint8Array(12));

    const cipherBuffer = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      aesKey,
      new TextEncoder().encode(plainText)
    );

    return {
      iv: toBase64(iv),
      ciphertext: toBase64(cipherBuffer),
    };
  };

  const decryptMessage = async (aesKey, ivB64, cipherB64) => {
    const iv = fromBase64(ivB64);
    const cipher = fromBase64(cipherB64);

    if (iv.length !== 12) {
      throw new Error("Invalid IV length: " + iv.length);
    }

    if (cipher.length < 16) {
      throw new Error("Ciphertext too short (probably truncated)");
    }

    const plainBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      aesKey,
      cipher.buffer // ✅ always pass ArrayBuffer
    );

    return new TextDecoder().decode(plainBuffer);
  };

  /* ===================== MULTI-DEVICE ENCRYPT ===================== */

  const encryptForDevices = async ({ plainText, recipientDevices }) => {
    const payloads = [];

    for (const device of recipientDevices) {
      const valid = await verifySignedPrekey({
        identityKeyPubBase64: device.identity_key_pub,
        signedPrekeyPubBase64: device.signed_prekey_pub,
        signedPrekeySigBase64: device.signed_prekey_sig,
      });

      if (!valid) continue;

      // Diffie-Hellman
      const sharedSecret = await deriveSharedSecret(device.signed_prekey_pub);

      const aesKey = await deriveAESKey(sharedSecret);
      const encrypted = await encryptMessage(aesKey, plainText);

      payloads.push({
        device_id: device.device_id,
        signed_prekey_id: device.signed_prekey_id,
        iv: encrypted.iv,
        ciphertext: encrypted.ciphertext,

        // critical fix
        sender_signed_prekey_pub: signedPrekeyPubRef.current,
      });
    }

    return payloads;
  };

  /* ===================== MESSAGE DECRYPT ===================== */

  const decryptPayload = async ({
    ciphertext,
    iv,
    sender_signed_prekey_pub,
  }) => {
    if (!signedPrekeyPrivRef.current) {
      throw new Error("Device keys not ready");
    }

    const senderPub = await importX25519PublicKey(sender_signed_prekey_pub);

    // DH: receiverPrivate × senderPublic
    const sharedSecret = await crypto.subtle.deriveBits(
      { name: "X25519", public: senderPub },
      signedPrekeyPrivRef.current,
      256
    );

    const aesKey = await deriveAESKey(sharedSecret);

    return decryptMessage(aesKey, iv, ciphertext);
  };

  /* ===================== AUTH ===================== */

  const login = async (username, password) => {
    const res = await fetch(getBackendUrl() + "/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setAccessToken(data.data.access_token);
    setUser(data.data);
  };

  const logout = async () => {
    identityPrivRef.current = null;
    signedPrekeyPrivRef.current = null;
    signedPrekeyPubRef.current = null;

    if (user) await clearUserKeys(user.user_id);

    setAccessToken(null);
    setUser(null);
    setHasKeys(false);

    await fetch(getBackendUrl() + "/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    router.replace("/login");
  };

  const refreshToken = async () => {
    const res = await fetch(getBackendUrl() + "/auth/refresh", {
      method: "POST",
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok || !data.status) throw new Error();

    setAccessToken(data.data.access_token);
    return data.data.access_token;
  };

  const getUser = async (token) => {
    const res = await fetch(getBackendUrl() + "/api/profile", {
      headers: { Authorization: `Bearer ${token}` },
      credentials: "include",
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.message);

    setUser(data.data);
  };

  /* ===================== CONTEXT ===================== */

  return (
    <AuthContext.Provider
      value={{
        user,
        accessToken,
        loading,
        hasKeys,
        isLoggedIn: !!accessToken,

        login,
        logout,
        refreshToken,

        encryptForDevices,
        decryptPayload,
        getDeviceId,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

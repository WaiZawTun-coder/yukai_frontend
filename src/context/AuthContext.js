"use client";

import { useRouter } from "next/navigation";
import { createContext, useContext, useEffect, useRef, useState } from "react";

import {
  clearUserKeys,
  generateDeviceKeys,
  loadDeviceKeys,
} from "@/utilities/deviceKeys";
import { getBackendUrl } from "@/utilities/url";

import {
  fromBase64,
  importX25519PublicKey,
  toBase64,
  verifySignedPrekey,
} from "@/helpers/Base64";

import {
  connectSocket,
  disconnectSocket,
  setSocketAuth,
  socket,
} from "@/utilities/socket";

/* ------------------------------------------------------------------ */

const AuthContext = createContext(null);
export const useAuth = () => useContext(AuthContext);

/* ------------------------------------------------------------------ */

function getDeviceId() {
  if (typeof window === "undefined") return null;

  let id = localStorage.getItem("device_id");
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem("device_id", id);
  }
  return id;
}

/* ------------------------------------------------------------------ */

export const AuthProvider = ({ children }) => {
  const router = useRouter();

  const [accessToken, setAccessToken] = useState(null);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [hasKeys, setHasKeys] = useState(false);

  // Crypto refs
  const identityPrivRef = useRef(null);
  const signedPrekeyPrivRef = useRef(null);
  const signedPrekeyPubRef = useRef(null);
  const signedPrekeyIdRef = useRef(null);
  const registrationIdRef = useRef(null);

  const socketConnectedRef = useRef(false);

  /* ===================== INIT AUTH ===================== */

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const token = await refreshToken();
        if (!alive || !token) return;
        await getUser(token);
      } catch {
        if (!alive) return;
        setAccessToken(null);
        setUser(null);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  /* ===================== INIT DEVICE KEYS ===================== */

  const initRef = useRef(false);

  useEffect(() => {
    if (!accessToken || !user) return;
    if (initRef.current) return;
    initRef.current = true;

    let alive = true;
    const controller = new AbortController();

    const getDeviceStatus = async (deviceId) => {
      const res = await fetch(
        getBackendUrl() + `/api/device-status?device_id=${deviceId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          signal: controller.signal,
        }
      );

      if (!res.ok) {
        throw new Error("Failed to fetch device status");
      }

      return res.json();
    };

    function extractPublicBundle(loaded) {
      return {
        identityKey: loaded.identityPubBase64,
        signedPrekeyId: loaded.signedPrekeyId,
        signedPrekey: loaded.signedPrekeyPubBase64,
        registrationId: loaded.registrationId,
      };
    }

    (async () => {
      try {
        const deviceId = getDeviceId();
        if (!deviceId) throw new Error("Missing deviceId");

        const deviceStatus = await getDeviceStatus(deviceId);
        let loaded = await loadDeviceKeys(user.user_id);

        const hasLocalKeys =
          loaded.identityPrivate && loaded.signedPrekeyPrivate;

        // CASE 1: clean state
        if (!hasLocalKeys && !deviceStatus.exists) {
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
            signal: controller.signal,
          });

          loaded = await loadDeviceKeys(user.user_id);
        }

        // CASE 2: backend has device, local lost keys → STOP
        else if (!hasLocalKeys && deviceStatus.exists) {
          throw new Error(
            "Device exists on server but local keys are missing. Reset device required."
          );
        }

        // CASE 3: local keys exist but backend lost device → re-register
        else if (hasLocalKeys && !deviceStatus.exists) {
          await fetch(getBackendUrl() + "/api/register-device", {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              ...extractPublicBundle(loaded),
              device_id: deviceId,
              platform: "web",
            }),
            signal: controller.signal,
          });
        }

        if (!alive) return;

        identityPrivRef.current = loaded.identityPrivate;
        signedPrekeyPrivRef.current = loaded.signedPrekeyPrivate;
        signedPrekeyPubRef.current = loaded.signedPrekeyPubBase64;
        signedPrekeyIdRef.current = loaded.signedPrekeyId;
        registrationIdRef.current = loaded.registrationId;

        setHasKeys(true);
      } catch (err) {
        if (err.name !== "AbortError") {
          console.error("❌ Device key init failed:", err);
        }
      }
    })();

    return () => {
      alive = false;
      controller.abort();
    };
  }, [accessToken, user]);

  /* ===================== AUTO SOCKET CONNECT ===================== */

  useEffect(() => {
    if (!accessToken || !user || !hasKeys) return;

    const deviceId = getDeviceId();
    if (!deviceId) return;

    setSocketAuth({
      token: accessToken,
      deviceId,
      username: user.username,
    });

    connectSocket();

    const onConnect = () => {
      console.log("🟢 AuthProvider socket connected");
      socketConnectedRef.current = true;
    };

    const onDisconnect = () => {
      console.log("🔴 AuthProvider socket disconnected");
      socketConnectedRef.current = false;
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
    };
  }, [accessToken, user, hasKeys]);

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

    if (!(iv instanceof Uint8Array)) {
      throw new Error("IV not Uint8Array");
    }
    if (!(cipher instanceof Uint8Array)) {
      throw new Error("Cipher not Uint8Array");
    }

    if (iv.byteLength !== 12) {
      throw new Error("Invalid IV length: " + iv.byteLength);
    }

    const plainBuffer = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      aesKey,
      cipher // ✅ correct
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

      if (!valid) {
        console.warn("Invalid signed prekey for device", device.device_id);
        continue;
      }

      const sharedSecret = await deriveSharedSecret(device.signed_prekey_pub);
      const aesKey = await deriveAESKey(sharedSecret);
      const encrypted = await encryptMessage(aesKey, plainText);

      payloads.push({
        device_id: device.device_id,
        signed_prekey_id: device.signed_prekey_id,
        iv: encrypted.iv,
        ciphertext: encrypted.ciphertext,
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
    disconnectSocket();
    socketConnectedRef.current = false;

    initRef.current = false;

    identityPrivRef.current = null;
    signedPrekeyPrivRef.current = null;
    signedPrekeyPubRef.current = null;
    signedPrekeyIdRef.current = null;
    registrationIdRef.current = null;

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

        socket,

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

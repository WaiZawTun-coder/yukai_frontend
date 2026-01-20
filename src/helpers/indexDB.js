const STORE_NAME = "yukai-e2ee-keys";

function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(STORE_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains("keys")) {
        db.createObjectStore("keys", { keyPath: "name" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export { openDB, STORE_NAME };

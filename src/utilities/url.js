const getBackendUrl = () => {
  const environment = process.env.ENVIRONMENT;
  if (environment == "cloud") {
    return "https://yukai-backend.onrender.com";
  }
  return "http://localhost/yukai_backend/public";
};

export { getBackendUrl };

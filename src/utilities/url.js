const getBackendUrl = () => {
  const environment = process.env.ENVIRONMENT;
  console.log({ environment });
  if (environment == "Production" || environment == "Preview") {
    return "https://yukai-backend.onrender.com";
  }
  return "http://localhost/yukai_backend/public";
};

export { getBackendUrl };

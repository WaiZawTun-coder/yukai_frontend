const getBackendUrl = () => {
  console.log({ url: process.env.NEXT_PUBLIC_BACKEND_URL });
  return process.env.NEXT_PUBLIC_BACKEND_URL;
};

export { getBackendUrl };

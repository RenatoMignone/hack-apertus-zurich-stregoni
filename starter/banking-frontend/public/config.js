// Runtime configuration of the e-banking. Edit this file for local development;
// in Docker it is regenerated at container start from the API_URL and TRUSTROOM_URL variables.
window.TRUSTROOM_CONFIG = {
  // Absolute URL of the banking API, also passed to the TrustRoom iframe as `api`.
  apiUrl: "http://localhost:8000/api",
  // URL of your TrustRoom solution. Empty = built-in placeholder.
  trustroomUrl: "http://localhost:3000",
};

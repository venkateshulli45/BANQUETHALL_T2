// /utils/cookieHelper.js

export const getCookie = (name) => {
    const cookies = document.cookie.split("; ");
    for (let cookie of cookies) {
      const [key, value] = cookie.split("=");
      if (key === name) {
        return decodeURIComponent(value); // Decode URI to handle special characters
      }
    }
    return null; // Return null if cookie is not found
  };
  
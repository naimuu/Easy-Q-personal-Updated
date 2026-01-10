const setLocalStorage = (key: string, value: string) => {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(key, value);
  } else {
    console.warn("LocalStorage is not available");
  }
};

const getLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    return window.localStorage.getItem(key);
  } else {
    console.warn("LocalStorage is not available");
    return null;
  }
};

export { getLocalStorage, setLocalStorage };
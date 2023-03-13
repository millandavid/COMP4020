// The key to access our data in local storage
const LOCAL_STORAGE_KEY = "video";

//==========================================================================================
// Get and Set methods
//==========================================================================================

//-----------------------------
// High Level
//-----------------------------

const getLocalStorage = () => JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY));

const setLocalStorage = (obj) => localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(obj));

// Helper function
const setStorageComponent = (path, value) => {
  const storage = { ...getLocalStorage() };
  set(storage, path, value);
  setLocalStorage(storage);
};

//-----------------------------
// Specific Getters and Setters
//-----------------------------

// --- Saved Words---

const getSavedWords = () => get(getLocalStorage(), "savedWords");

const setSavedWords = (savedWords) => {
  setStorageComponent("savedWords", savedWords);
};

const addSavedWord = (word) => {
  setSavedWords([...getSavedWords, word]);
};

//==========================================================================================
// Utility Methods
//==========================================================================================

const clearLocalStorage = () => setLocalStorage({});

const printLocalStorage = () => console.log(getLocalStorage());

//===========================================================================================

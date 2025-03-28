// src/services/conversation/mockAsyncStorage.js

// Simple in-memory storage for testing in Node.js
const memoryStorage = {};

// Mock AsyncStorage for testing in Node environment
const mockAsyncStorage = {
  setItem: async (key, value) => {
    memoryStorage[key] = value;
    return true;
  },
  getItem: async (key) => {
    return memoryStorage[key] || null;
  },
  removeItem: async (key) => {
    delete memoryStorage[key];
    return true;
  },
  clear: async () => {
    Object.keys(memoryStorage).forEach(key => {
      delete memoryStorage[key];
    });
    return true;
  },
  getAllKeys: async () => {
    return Object.keys(memoryStorage);
  }
};

module.exports = mockAsyncStorage;
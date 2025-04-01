import { useState, useEffect, Dispatch, SetStateAction, useRef } from 'react';

function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, Dispatch<SetStateAction<T>>] {
  const isMounted = useRef(false);
  // State to store our value
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  // Load from localStorage once the component mounts
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const item = window.localStorage.getItem(key);
      if (item) {
        setStoredValue(JSON.parse(item));
      }
    } catch (error) {
      console.error(error);
    }
    isMounted.current = true;
  }, [key]);

  // Return a wrapped version of useState's setter function that...
  // ... persists the new value to localStorage.
  const setValue: Dispatch<SetStateAction<T>> = (value) => {
    try {
      // Allow value to be a function so we have same API as useState
      const valueToStore =
        value instanceof Function ? value(storedValue) : value;
      // Save state
      setStoredValue(valueToStore);
      // Save to local storage only if component is mounted
      if (typeof window !== 'undefined' && isMounted.current) {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(error);
    }
  };

  // Sync between tabs/windows
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key) {
        try {
          setStoredValue(
            e.newValue ? JSON.parse(e.newValue) : initialValue
          );
        } catch (error) {
          console.error(error);
        }
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue];
}

export default useLocalStorage;
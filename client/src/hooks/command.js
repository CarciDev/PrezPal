import { useState, useEffect, useRef } from "react";

const useCommand = () => {
  const [command, setCommand] = useState(null);
  const [error, setError] = useState(null);
  const [isPolling, setIsPolling] = useState(true);
  const abortControllerRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let timeoutId = null;

    const fetchData = async () => {
      try {
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        const response = await fetch("/api/next-sentence", {
          signal: abortControllerRef.current.signal,
        });

        const newData = await response.json();

        if (mounted) {
          setCommand(newData);
          setError(null);

          if (isPolling) {
            timeoutId = setTimeout(fetchData, 0);
          }
        }
      } catch (error) {
        if (error.name === "AbortError") return;

        if (mounted) {
          setError(error);
          if (isPolling) {
            timeoutId = setTimeout(fetchData, 5000);
          }
        }
      }
    };

    timeoutId = setTimeout(fetchData, 1000);

    return () => {
      mounted = false;
      if (timeoutId) clearTimeout(timeoutId);
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [isPolling]);

  // Return control methods along with state
  return {
    command,
    error,
    isPolling,
    startPolling: () => setIsPolling(true),
    stopPolling: () => setIsPolling(false),
  };
};

export default useCommand;

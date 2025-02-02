import { useCallback, useRef } from "react";
import { SLIDE_COMMANDS } from "../utils/slideCommands";

export const useSlideCommands = (slideActions) => {
  // Add a ref to track the last processed command
  const lastCommandRef = useRef(null);

  const processCommand = useCallback(
    (command) => {
      if (!command?.sentence) return false;

      const normalizedInput = command.sentence.toLowerCase().trim();

      // If this is the same command as last time, ignore it
      if (lastCommandRef.current === normalizedInput) {
        return false;
      }

      for (const [_, commandConfig] of Object.entries(SLIDE_COMMANDS)) {
        if (normalizedInput.includes(commandConfig.trigger)) {
          // Store this command to prevent reprocessing
          lastCommandRef.current = normalizedInput;

          // Add a small delay before clearing the last command
          setTimeout(() => {
            lastCommandRef.current = null;
          }, 1000); // 1 second delay

          return commandConfig.handler(slideActions);
        }
      }

      return false;
    },
    [slideActions]
  );

  return { processCommand };
};

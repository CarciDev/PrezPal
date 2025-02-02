import { useCallback, useRef } from "react";
import { SLIDE_COMMANDS } from "../utils/slideCommands";

export const useSlideCommands = (slideActions) => {
  const lastCommandRef = useRef(null);

  const processCommand = useCallback(
    (command) => {
      if (!command?.sentence) return false;

      const normalizedInput = command.sentence.toLowerCase().trim();

      if (lastCommandRef.current === normalizedInput) {
        return false;
      }

      if (normalizedInput.includes(SLIDE_COMMANDS.GOTO_SLIDE.trigger)) {
        const result = SLIDE_COMMANDS.GOTO_SLIDE.handler({
          ...slideActions,
          lastCommand: normalizedInput,
        });

        if (result.success) {
          lastCommandRef.current = normalizedInput;
          setTimeout(() => {
            lastCommandRef.current = null;
          }, 1000);
          return true;
        }
      }

      for (const [_, commandConfig] of Object.entries(SLIDE_COMMANDS)) {
        if (
          commandConfig !== SLIDE_COMMANDS.GOTO_SLIDE &&
          normalizedInput.includes(commandConfig.trigger)
        ) {
          lastCommandRef.current = normalizedInput;
          setTimeout(() => {
            lastCommandRef.current = null;
          }, 1000);
          return commandConfig.handler(slideActions).success;
        }
      }

      return false;
    },
    [slideActions]
  );

  return { processCommand };
};

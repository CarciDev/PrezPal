const wordToNumber = {
  one: 1,
  two: 2,
  three: 3,
  four: 4,
  five: 5,
  six: 6,
  seven: 7,
  eight: 8,
  nine: 9,
  ten: 10,
  first: 1,
  second: 2,
  third: 3,
  fourth: 4,
  fifth: 5,
  sixth: 6,
  seventh: 7,
  eighth: 8,
  ninth: 9,
  tenth: 10,
};

export const SLIDE_COMMANDS = {
  NEW_SLIDE: {
    trigger: "create slide",
    handler: (slideActions) => {
      slideActions.addEmptySlide();
      return {
        success: true,
        message: "Created new slide",
      };
    },
  },
  NEXT_SLIDE: {
    trigger: "next slide",
    handler: (slideActions) => {
      slideActions.setCurrentSlideIndex((curr) =>
        Math.min(curr + 1, slideActions.totalSlides - 1)
      );
      return {
        success: true,
        message: "Moved to next slide",
      };
    },
  },
  PREVIOUS_SLIDE: {
    trigger: "previous slide",
    handler: (slideActions) => {
      slideActions.setCurrentSlideIndex((curr) => Math.max(curr - 1, 0));
      return {
        success: true,
        message: "Moved to previous slide",
      };
    },
  },
  DELETE_SLIDE: {
    trigger: "delete slide",
    handler: (slideActions) => {
      slideActions.deleteCurrentSlide();
      return {
        success: true,
        message: "Deleted current slide",
      };
    },
  },

  GOTO_SLIDE: {
    trigger: "slide",
    handler: (slideActions) => {
      let match = slideActions.lastCommand?.match(/(?:go to )?slide (\d+)/i);
      let slideNumber;

      if (match) {
        slideNumber = parseInt(match[1]);
      } else {
        match = slideActions.lastCommand?.match(
          /(?:go to )?slide (one|two|three|four|five|six|seven|eight|nine|ten|first|second|third|fourth|fifth|sixth|seventh|eighth|ninth|tenth)/i
        );
        if (match) {
          slideNumber = wordToNumber[match[1].toLowerCase()];
        }
      }

      if (slideNumber) {
        const slideIndex = slideNumber - 1;
        if (slideIndex >= 0 && slideIndex < slideActions.totalSlides) {
          slideActions.setCurrentSlideIndex(slideIndex);
          return {
            success: true,
            message: `Moved to slide ${slideNumber}`,
          };
        }
        return {
          success: false,
          message: `Invalid slide number: ${slideNumber}`,
        };
      }
      return { success: false, message: "Invalid slide command" };
    },
  },
};

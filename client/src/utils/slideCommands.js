export const SLIDE_COMMANDS = {
  NEW_SLIDE: {
    trigger: "create slide",
    handler: (slideActions) => {
      slideActions.addSlide();
      return {
        success: true,
        message: "Created new slide",
      };
    },
  },
  NEXT_SLIDE: {
    trigger: "next slide",
    handler: (slideActions) => {
      slideActions.setCurrentSlide((curr) =>
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
      slideActions.setCurrentSlide((curr) => Math.max(curr - 1, 0));
      return {
        success: true,
        message: "Moved to previous slide",
      };
    },
  },
  DELETE_SLIDE: {
    trigger: "delete slide",
    handler: (slideActions) => {
      slideActions.deleteSlide();
      return {
        success: true,
        message: "Deleted current slide",
      };
    },
  },
};

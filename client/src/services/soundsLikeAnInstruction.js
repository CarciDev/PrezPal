export function soundsLikeAnInstruction(instruction) {
  const instructionWords = instruction
    .toLowerCase()
    .replace(/[^a-z\s]/g, "")
    .split(" ");
  const wordSet = new Set(instructionWords);
  console.log(wordSet);

  const instructionKeywords = [
    "go",
    "move",
    "navigate",
    "jump",
    "skip",
    "advance",
    "see",
    "show",
    "change",
    "make",
    "create",
    "put",
    "update",
    "alter",
    "fix",
    "modify",
    "remove",
    "delete",
    "add",
    "insert",
    "replace",
    "switch",
    "turn",
    "set",
    "adjust",
    "transform",
    "convert",
    "write",
    "undo",
    "nevermind",
  ];
  if (instructionKeywords.some((keyword) => wordSet.has(keyword))) {
    console.log("Command passes basic filter.");
    return true;
  }

  return false;
}

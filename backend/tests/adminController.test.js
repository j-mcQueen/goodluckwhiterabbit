test("randomly generates a code with 2 specials, 2 lower letters, 2 upper letters, 2 numbers, with a hyphen at index 4", () => {
  const createCode = () => {
    // create a user login code that contains 2 specials, 2 numbers, 2 lowercase letters, 2 uppercase letters, and a hyphen at index 4
    let code = "";
    const characterCounts = {
      0: 0,
      1: 0,
      2: 0,
      3: 0,
    };
    const characters = [
      "@#$%&!",
      "0123456789",
      "abcdefghijklmnopqrstuvwxyz",
      "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    ];

    const generateIndex = (arr) => {
      return Math.floor(Math.random() * arr.length);
    };

    while (code.length < 9) {
      // while the code is still being created
      if (code.length === 4) code += "-";

      const randomIndex = generateIndex(characters); // select a character set at random
      if (characterCounts[randomIndex] < 2) {
        // if we have not yet reached the character set threshold
        const randomSubIndex = generateIndex(characters[randomIndex]); // select a character within the chosen character set at random
        characterCounts[randomIndex]++;
        code += characters[randomIndex][randomSubIndex];
      }
    }

    return code;
  };

  expect(createCode()).toMatch(
    /^(?=(.*[0-9]){2})(?=(.*[A-Z]){2})(?=(.*[a-z]){2})(?=(.*[@#$%&!]){2}).{4}-.{4}$/
  );
});

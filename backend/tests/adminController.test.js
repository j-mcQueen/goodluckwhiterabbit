const { createCode } = require("../controllers/utils/createCode");

test("randomly generates a code with 2 specials, 2 lower letters, 2 upper letters, 2 numbers, with a hyphen at index 4", () => {
  expect(createCode()).toMatch(
    /^(?=(.*[0-9]){2})(?=(.*[A-Z]){2})(?=(.*[a-z]){2})(?=(.*[@#$%&!]){2}).{4}-.{4}$/
  );
});

test("Ensures an array is correctly populated", () => {
  // mock population of array used to delete target files from S3
  const deleted = {
    files: { sneaks: true, full: false, socials: false },
    _id: "123",
  };
  const objects = {
    Contents: [
      { Key: "123/sneaks/A" },
      { Key: "123/sneaks/B" },
      { Key: "456/full/B" },
      { Key: "789/socials/C" },
      { Key: "123/sneaks/C" },
    ],
  };
  const fn = (arr, object, deleted, imageset) => {
    if (
      deleted.files[imageset] === true &&
      object.Key.includes(deleted._id) &&
      object.Key.includes(imageset)
    ) {
      return arr.push({ Key: object.Key });
    }
  };

  const arr = [];
  for (let i = 0; i < objects.Contents.length; i++) {
    fn(arr, objects.Contents[i], deleted, "sneaks");
    fn(arr, objects.Contents[i], deleted, "socials");
    fn(arr, objects.Contents[i], deleted, "full");
  }

  expect(arr).toStrictEqual([
    { Key: "123/sneaks/A" },
    { Key: "123/sneaks/B" },
    { Key: "123/sneaks/C" },
  ]);
});

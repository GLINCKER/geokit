/** @type {import('@commitlint/types').UserConfig} */
module.exports = {
  extends: ["@commitlint/config-conventional"],
  rules: {
    "type-enum": [
      2,
      "always",
      [
        "feat",
        "fix",
        "perf",
        "refactor",
        "revert",
        "docs",
        "style",
        "chore",
        "test",
        "build",
        "ci",
      ],
    ],
    "subject-case": [0],
    "body-max-line-length": [0],
  },
};

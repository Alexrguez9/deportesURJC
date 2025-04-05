# 🚀 Merge Guidelines

This repository uses branch protection rules to ensure the stability of the `main` branch.

## 🔐 Branch Protection Rules

The following rules are enforced on the `main` branch:

- ✅ Pull requests are required before merging.
- ✅ CI/CD checks (tests + Docker build) must pass.
- ✅ At least 1 approval is required to merge.
- ✅ Branch must be up to date with `main` before merging.

## 👤 Who can approve?

- This project is currently maintained by **a single developer (@Alexrguez9)**.
- Therefore, **the pull request author may approve and merge their own PR** using the "Bypass rules and merge" button if:
  - All required checks have passed.
  - The PR is properly documented and justified.
  - A thorough self-review of the code has been completed.

> Although GitHub doesn't allow approving your own PR officially, this is considered acceptable here as long as the above conditions are met.

## 🧪 Recommended Workflow

1. Create a new branch from `main`.
2. Commit changes with clear and descriptive messages.
3. Open a pull request targeting `main`.
4. Ensure that:
   - CI (tests) passes successfully.
   - CD (Docker build/push) passes successfully.
5. If everything is OK, merge using the **"Bypass rules and merge"** button.
6. Optionally, delete the branch after merging.

## 📝 Notes

- This file serves as a formal record of the merge policy used in this project.
- If the project grows to include more collaborators, this policy should be revised to require external code reviews.

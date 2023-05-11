# Reduck Contributing Guide

Thanks for that you are interested in contributing to Reduck.

## Developing

To develop locally:

1. [Fork](https://help.github.com/articles/fork-a-repo/) this repository to your
   own GitHub account and then
   [clone](https://help.github.com/articles/cloning-a-repository/) it to your
   local.
2. Create a new branch:

    ```zsh
    git checkout -b MY_BRANCH_NAME
    ```

3. Install pnpm:

    ```zsh
    npm install -g pnpm
    ```

4. Install the dependencies with:

    ```zsh
    pnpm run setup
    ```

5. Go into package which you want to contribute.

    ```zsh
    cd ./packages/
    ```

6. Start developing.


## Building

You can build single package, with:

```zsh
cd ./packages/*
pnpm build
```

build all packages, with:

```zsh
pnpm -r prepare
```

If you need to clean all `node_modules/*` the project for any reason, with

```zsh
pnpm reset
```

## Testing

You need write new test cases for new feature or modify existing test cases for changes.

We wish you write unit tests at `PACKAGE_DIR/__test__`. Test syntax is based on [jest](https://jestjs.io/).

### Run Testing

```sh
pnpm -r test
```

## Linting

To check the formatting of your code:

```zsh
pnpm lint
```

## Publishing

We use **Modern.js Monorepo Solution** to manage version and changelog.

Repository maintainers can publish a new version of all packages to npm.

1. Fetch newest code at branch `main`.
2. Install

    ```zsh
    pnpm run setup
    ```

3. Add changeset

   ```zsh
   pnpm change
   ```

4. Bump version

   ```zsh
   pnpm bump
   ```

5. Commit version change. The format of commit message should be `chore: va.b.c` which is the main version of current release.

    ```zsh
    git add .
    git commit -m "chore: va.b.c"
    ```

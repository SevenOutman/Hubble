![Screenshot](https://i.loli.net/2018/04/06/5ac6740996ec9.png)

### Features
- Reveal a repository's star history (no more than 6,000 stars).

### Motivation

I want to know how many stars I've earned this year.

## FAQ

### Access Token

> **Note:** Hubble stores access tokens in your browser local storage and never transmits it anywhere.

Hubble uses [GitHub GraphQL API](https://developer.github.com/v4/) to retrieve repository stargazers. The API requires requests to be authenticated,
so Hubble will ask for your [GitHub personal access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use).
If you don't already have one, [create one](https://github.com/settings/tokens/new), then copy and paste it into the textbox.
Note that the minimal scopes that should be granted are `public_repo` and `repo` (if you need access to private repositories).

![Screenshot](https://i.loli.net/2018/04/06/5ac6740996ec9.png)

### Features
- Reveal a repository's star history.
- How many stars have I earned this year?

### Motivation

I want to know how many stars I've earned this year.

## Let me know

The initial repo to query is [js-org/dns.js.org](https://github.com/js-org/dns.js.org) by default, as my gratitude to its domain name service. Besides, a random repo from a preset repo list may also be chosen as the initial repo. If your project has over 1k stars and wants to join the list, [Let me know](https://github.com/SevenOutman/Hubble/issues/2)!

## FAQ

### Access Token

> **Note:** Hubble stores access tokens in your browser local storage and never transmits it anywhere.

#### Why is it required?

Hubble uses [GitHub GraphQL API](https://developer.github.com/v4/) to retrieve repository stargazers. The API requires requests to be authenticated,
so Hubble will ask for your [GitHub personal access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use).
If you don't already have one, [create one](https://github.com/settings/tokens/new), then copy and paste it into the textbox.
Note that the minimal scopes that should be granted are `public_repo` and `repo` (if you need access to private repositories).

#### Why is access token preferred rather than "Login with GitHub"?

Hubble's OAuth service is provided by Netlify on a free plan basis, which has a 1,000 total users limit.

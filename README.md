![Screenshot](https://i.loli.net/2018/04/06/5ac64e91a2ea3.png)

### Features
- Reveal a repository's star history (no more than 6,000 stars).

### Motivation

I want to know how many stars I've earned this year.

## FAQ

### Access Token (quoted from [Octotree](https://github.com/buunguyen/octotree#access-token))

__Note for the paranoids (like me!)__: Hubble stores access tokens in your browser local storage and never transmits it anywhere.

#### GitHub
Hubble uses [GitHub API](https://developer.github.com/v3/) to retrieve repository stargazers. By default, it makes unauthenticated requests to the GitHub API. However, there are two situations when requests must be authenticated:

* You access a private repository
* You exceed the [rate limit of unauthenticated requests](https://developer.github.com/v3/#rate-limiting)

When that happens, Hubble will ask for your [GitHub personal access token](https://help.github.com/articles/creating-an-access-token-for-command-line-use). If you don't already have one, [create one](https://github.com/settings/tokens/new), then copy and paste it into the textbox. Note that the minimal scopes that should be granted are `public_repo` and `repo` (if you need access to private repositories).

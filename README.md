# Reddit Managed Component

Find out more about Managed Components [here](https://blog.cloudflare.com/zaraz-open-source-managed-components-and-webcm/) for inspiration and motivation details.

[![Released under the Apache license.](https://img.shields.io/badge/license-apache-blue.svg)](./LICENSE)
[![PRs welcome!](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](./CONTRIBUTING.md)
[![code style: prettier](https://img.shields.io/badge/code_style-prettier-ff69b4.svg?style=flat-square)](https://github.com/prettier/prettier)
[![All Contributors](https://img.shields.io/github/all-contributors/managed-components/snapchat?color=ee8449&style=flat-square)](#contributors)

## 🚀 Quickstart local dev environment

1. Make sure you're running node version >=18.
2. Install dependencies with `npm i`
3. Run unit test watcher with `npm run test:dev`

## ⚙️ Tool Settings

> Settings are used to configure the tool in a Component Manager config file

### Account ID `string` _required_

The account `id` is the unique identifier of your Reddit Ads account. [Learn more](https://www.reddit.com/r/redditads/comments/ngrifr/how_to_get_account_ids_of_ads_accounts_that_i/)

## 🧱 Fields Description

### Event Type `string` _required_

`event` the type of event can be one of:

- PageVisit
- ViewContent
- Search
- AddToCart
- AddToWishlist
- Purchase
- Lead
- SignUp

Its value will determine how Reddit will process it.

## 📝 License

Licensed under the [Apache License](./LICENSE).

## 💜 Thanks

Thanks to everyone contributing in any manner for this repo and to everyone working on Open Source in general.

## Contributors ✨

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->
<table>
  <tbody>
    <tr>
      <td align="center" valign="top" width="14.28%"><a href="http://www.tomklein.me"><img src="https://avatars.githubusercontent.com/u/21014430?v=4?s=75" width="75px;" alt="Tom Klein"/><br /><sub><b>Tom Klein</b></sub></a><br /><a href="https://github.com/managed-components/reddit/commits?author=tomkln" title="Code">💻</a></td>
    </tr>
  </tbody>
</table>

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind welcome!

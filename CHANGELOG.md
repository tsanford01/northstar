# Changelog

## [1.1.0](https://github.com/tsanford01/northstar/compare/v1.0.0...v1.1.0) (2026-10-30)


### Features

* add kanban board ([120a867](https://github.com/tsanford01/northstar/commit/120a8679951edbceee586d7a08906356673bc41a))
* add notes to kanban cards ([1410f31](https://github.com/tsanford01/northstar/commit/1410f31b165d47cdf177505d5179c9a0a23170d3))
* add postgres and auth methods ([4e9be39](https://github.com/tsanford01/northstar/commit/4e9be39609fc0097e57affbfd4a1860642ad0752))
* add project button ([1618bb2](https://github.com/tsanford01/northstar/commit/1618bb25ac5f05f45ae3bfbf7b94a40e15cd5af2))
* add saml sso ([e308258](https://github.com/tsanford01/northstar/commit/e308258c76e3508d6d41ad76d72739a6096ead5f))
* API reference and a limit on failed token auth ([#18](https://github.com/tsanford01/northstar/issues/18)) ([7c48c14](https://github.com/tsanford01/northstar/commit/7c48c14d752d7a49475fa78f1a12336ff5e434b4))
* API token authorizes project CRUD and moves ([#1](https://github.com/tsanford01/northstar/issues/1)) ([1f2217c](https://github.com/tsanford01/northstar/commit/1f2217cda03f2374d458c9266d548d3e164cee53))
* API tokens can download status exports and backups ([#16](https://github.com/tsanford01/northstar/issues/16)) ([5c84d76](https://github.com/tsanford01/northstar/commit/5c84d768695b8f4fc431c5d0b6504a250f260769))
* API tokens manage teams and capacity ([#11](https://github.com/tsanford01/northstar/issues/11)) ([9fa3a59](https://github.com/tsanford01/northstar/commit/9fa3a5909414b6c441fc48516689cdb9f5eeced3))
* archive cards, card source, and tag/source filters ([#25](https://github.com/tsanford01/northstar/issues/25)) ([8dbf243](https://github.com/tsanford01/northstar/commit/8dbf243c120e07b7d6cb4ad4d9e18bcef7de5a24))
* card update, decision, assignee and archive events in activity ([#15](https://github.com/tsanford01/northstar/issues/15)) ([66243e6](https://github.com/tsanford01/northstar/commit/66243e6a887033505e97cebca11455a3b8a307d3))
* Docs page renders the API and MCP guides in the app ([#28](https://github.com/tsanford01/northstar/issues/28)) ([bffa6ba](https://github.com/tsanford01/northstar/commit/bffa6baf489f14b630e8241cd1bfd8a830c222b1))
* GET /api/activity feed of project and card events ([#9](https://github.com/tsanford01/northstar/issues/9)) ([9bd5d53](https://github.com/tsanford01/northstar/commit/9bd5d538d2e7bd5ed2503be06b8dfe5f1803e03a))
* kanban card assignee with board filter ([#2](https://github.com/tsanford01/northstar/issues/2)) ([d900011](https://github.com/tsanford01/northstar/commit/d90001165b350aed044540a7ed8a38e5fa742718))
* live updates for the matrix, kanban and teams pages ([#17](https://github.com/tsanford01/northstar/issues/17)) ([ab56a63](https://github.com/tsanford01/northstar/commit/ab56a631cfe01784ae1a70c0b1098b9027abb901))
* lookup and idempotent upsert by projectId or externalUrl ([#8](https://github.com/tsanford01/northstar/issues/8)) ([85e7b43](https://github.com/tsanford01/northstar/commit/85e7b43a6bce36e9c164d70da067df45b8d11cd7))
* MCP server for agents (stdio, over the HTTP API) ([#20](https://github.com/tsanford01/northstar/issues/20)) ([367e0f8](https://github.com/tsanford01/northstar/commit/367e0f846397599fa911fd402234789df4349c12))
* named, scoped API tokens with revoke and last use ([#7](https://github.com/tsanford01/northstar/issues/7)) ([d190345](https://github.com/tsanford01/northstar/commit/d1903452e3c88f9807332d2bec17438d52749fad))
* next step and decision on kanban cards ([#10](https://github.com/tsanford01/northstar/issues/10)) ([94c1356](https://github.com/tsanford01/northstar/commit/94c13561d7b2a80b612080863d373a466fe27190))
* optional external link on kanban cards ([#3](https://github.com/tsanford01/northstar/issues/3)) ([38de15b](https://github.com/tsanford01/northstar/commit/38de15ba3292981d275f968944f45c13800ee90b))
* optional unique card key for lookup and upsert ([#23](https://github.com/tsanford01/northstar/issues/23)) ([e0aa450](https://github.com/tsanford01/northstar/commit/e0aa450ff7e01752ab62631d46c0216ec1cee95d))
* record project status, archive, team and capacity changes in activity ([#13](https://github.com/tsanford01/northstar/issues/13)) ([72fdb37](https://github.com/tsanford01/northstar/commit/72fdb3794291a4416ae92a7ff18eb91294ff687e))
* strict CSP on pages and a limit on failed sign-ins ([#19](https://github.com/tsanford01/northstar/issues/19)) ([8bdbfb4](https://github.com/tsanford01/northstar/commit/8bdbfb42c70d3c40169a3437964926da24583b1c))
* ui configure sso ([a7161a3](https://github.com/tsanford01/northstar/commit/a7161a377e5ea2e4878ab90e04cf11b1a08afd1a))


### Bug Fixes

* add kanban project filter tag ([402919c](https://github.com/tsanford01/northstar/commit/402919c5e8bc49e89b42a28ee75e07b51c1c49bf))
* add project name hover ([c287775](https://github.com/tsanford01/northstar/commit/c2877754bc081d6f0e948d4bdda4138c0477944e))
* docker build ([5621787](https://github.com/tsanford01/northstar/commit/562178764e163456651d9ddfd2b6f007e93e9550))
* draw guest display names without modulo bias ([#14](https://github.com/tsanford01/northstar/issues/14)) ([a558a34](https://github.com/tsanford01/northstar/commit/a558a3410e4b206679408f167cbada3f7512ed0e))
* kanban tags and links ([510acbe](https://github.com/tsanford01/northstar/commit/510acbe09a414acbc22e65f9aa1fc2981270c3bd))
* keep project and card change history across backup restore ([#27](https://github.com/tsanford01/northstar/issues/27)) ([3f8478f](https://github.com/tsanford01/northstar/commit/3f8478f3343780fbf77ae6946931fd4270ed9433))
* project permissions dark mode ([f24cc3a](https://github.com/tsanford01/northstar/commit/f24cc3a860c199c90b66d5ef85ba550e7c11a967))
* update api ([d7250ab](https://github.com/tsanford01/northstar/commit/d7250abbd2f1556e5eb62740f3d34547a9af6ee8))

# Changelog

## [2.4.0](https://github.com/HeyPuter/puter/compare/v2.3.0...v2.4.0) (2024-06-16)


### Features

* add /share/file-by-username endpoint ([5d214c7](https://github.com/HeyPuter/puter/commit/5d214c7b52887b594af6be497f1892baf7d77679))
* add /show urls ([079e25a](https://github.com/HeyPuter/puter/commit/079e25a9fe8e179f26d72378856058eb656e2314))
* add cross-server event broadcasting ([1207a15](https://github.com/HeyPuter/puter/commit/1207a158bdc88a90b14d31d03387ce353c176a9c))
* add external mod loading ([eb05fbd](https://github.com/HeyPuter/puter/commit/eb05fbd2dc4877553b5118a069a9afdc32bea137))
* add mark-read endpoint ([0101f42](https://github.com/HeyPuter/puter/commit/0101f425d480705c20df4919a76f66e987f5790f))
* add readdir delegate for shares in a user directory ([8424d44](https://github.com/HeyPuter/puter/commit/8424d446099ac30ccf829c57d43eef1f235618e4))
* add readdir delegate for sharing user homedirs ([19a5eb0](https://github.com/HeyPuter/puter/commit/19a5eb00763f3ac31df8483fb59cb7a96c448745))
* add service for notifications ([a1e6887](https://github.com/HeyPuter/puter/commit/a1e6887bf93da21b9482040b3e30ee083fb23477))
* **backend:** add script service ([30550fc](https://github.com/HeyPuter/puter/commit/30550fcddda18469735499546de502d29b85e2ad))
* **backend:** add tip of day ([2d8e624](https://github.com/HeyPuter/puter/commit/2d8e6240c61dc6301f49cbdcd1c3b04736f9ca93))
* **backend:** allow services to provide user properties ([522664d](https://github.com/HeyPuter/puter/commit/522664d415c33342500defec309c2ff15bc94804))
* **backend:** allow services to provide whoami values ([fccabf1](https://github.com/HeyPuter/puter/commit/fccabf1bc0c4418f3599222616dd63bf98c14fe1))
* **backend:** improve logger and reduce logs ([4bdad75](https://github.com/HeyPuter/puter/commit/4bdad75766d0617a164024b39b79bf5373c495a6))
* introduce notification selection via driver ([c5334b0](https://github.com/HeyPuter/puter/commit/c5334b0e19cf9762f536ec482c3ff872e9c12399))
* **parsely:** Add a fail() parser ([5656d9d](https://github.com/HeyPuter/puter/commit/5656d9d42f76202a534ad640d3a4e287e0e40418))
* **parsely:** Add stringUntil() parser ([d46b043](https://github.com/HeyPuter/puter/commit/d46b043c5d16f1205d61de3f3ba43ed8ad7bff93))
* **phoenix:** Add --dump and --file options to sed ([f250f86](https://github.com/HeyPuter/puter/commit/f250f86446a506f24fa2ad396328e3a2212a68d0))
* **phoenix:** Add more commands to sed, including labels and branching ([306014a](https://github.com/HeyPuter/puter/commit/306014adc77a7ca155feb95d1146cb46ee075b52))
* **phoenix:** Expose parsed arg tokens to apps that request them ([4067c82](https://github.com/HeyPuter/puter/commit/4067c82486c99cad20f41927ad39ebea438b717f))
* **phoenix:** Implement parsing of sed scripts ([0d4f907](https://github.com/HeyPuter/puter/commit/0d4f907b6675b15bd50a55f50aa28f0803b18b7b))
* re-send unreads on login ([02fc4d8](https://github.com/HeyPuter/puter/commit/02fc4d86b7166fb4803be5d28e2a593d6b7d9785))
* send notification when file gets shared ([2f6c428](https://github.com/HeyPuter/puter/commit/2f6c428a403a006f7878861d2f0356c3294519be))
* **ui:** add new components ([577bd59](https://github.com/HeyPuter/puter/commit/577bd59b6cc94810e851ad544f8234e25a4e6e27))
* **ui:** add new components ([38ba425](https://github.com/HeyPuter/puter/commit/38ba42575ce9f3506f8ce219b9580202b3ed9993))
* **ui:** allow component-based settings tabs ([1245960](https://github.com/HeyPuter/puter/commit/124596058a286241b51dd87ce2fc1a68478cb5b8))


### Bug Fixes

* **backend:** remove a bad thing that really doesn't work ([8d22276](https://github.com/HeyPuter/puter/commit/8d22276f13106f7642d11da30b1500817a20ad43))
* check subdomain earlier for /apps ([4e3a24e](https://github.com/HeyPuter/puter/commit/4e3a24e6093e279e210765e07e436f4e63b74072))
* fix typo ([ce328b7](https://github.com/HeyPuter/puter/commit/ce328b7245ad741b64c5885f64f806fc98a55d84))
* handle subpaths under another user ([d128cee](https://github.com/HeyPuter/puter/commit/d128ceed6f4928fa0793815feb2e2715cd273ff8))
* incorrect error from suggested_apps ([b648817](https://github.com/HeyPuter/puter/commit/b648817f2743c2b6214ebe4177d921c9b9027594))
* **parsely:** Make Repeat parser work when no separator is given ([9b4d16f](https://github.com/HeyPuter/puter/commit/9b4d16fbe9d5698c57f9da725a22b528a7d7cac2))
* **phoenix:** Add missing newlines to sed command output ([e047b0b](https://github.com/HeyPuter/puter/commit/e047b0bf302284da61e677432e4cc25b531b24f2))
* remove last component when share URL is file ([1166e69](https://github.com/HeyPuter/puter/commit/1166e69c76688d1811701c56cd4df9d38e286793))
* remove legacy permission check in stat ([f2c6e01](https://github.com/HeyPuter/puter/commit/f2c6e01296e4214336e63bc2d69bcbf17f59890f))
* **ui:** improve Component base class ([f8780d0](https://github.com/HeyPuter/puter/commit/f8780d032b10138851c22af53b8610c578139acc))

## 2.3.0 (2024-05-22)


### Features

* add /healthcheck endpoint ([c166560](https://github.com/HeyPuter/puter/commit/c166560ff4ab5a453d3ec4f97326c995deb7f522))
* Add command names to phoenix tab-completion ([cf0eee1](https://github.com/HeyPuter/puter/commit/cf0eee1fa35328e05aefc8a425b5977efe5f4ec9))
* add option to change desktop background to default ([03f05f3](https://github.com/HeyPuter/puter/commit/03f05f316f11e8afe5fcee40b2b80a0de5e6826f))
* allow apps to add a menubar via puter.js ([331d9e7](https://github.com/HeyPuter/puter/commit/331d9e75428ec7609394f59b1755374c7340f83e))
* Allow querying puter-apps driver by partial app names ([dc5b010](https://github.com/HeyPuter/puter/commit/dc5b010d0913d2151b4851f8da5df72d2c8f42e7))
* Display upload errors in UIWindowProgress dialog ([edebbee](https://github.com/HeyPuter/puter/commit/edebbee9e7e9efbb33bf709b637c103be40d15a8))
* Implement 'Like' predicate in entity storage ([a854a0d](https://github.com/HeyPuter/puter/commit/a854a0dc0aa79a31695db833184c5ca3698632a9))
* improve password recovery experience ([04432df](https://github.com/HeyPuter/puter/commit/04432df5540811710ce1cc47ce6c136e5453bccb))
* **security:** add ip rate limiting ([ccf1afc](https://github.com/HeyPuter/puter/commit/ccf1afc93c24ee7f9a126216209a185d6b4d9fe4))
* Show "Deleting /foo" in progress window when deleting files ([f07c13a](https://github.com/HeyPuter/puter/commit/f07c13a50cee790eec44bce2f6e56fbcbf73f9b0))


### Bug Fixes

* Add missing file extension to 0009_app-prefix-fix.sql in DB init ([a8160a8](https://github.com/HeyPuter/puter/commit/a8160a8cdcdd6aff98728a6f1643d93386e6bb5a))
* Add missing TextEncoder to PTT ([8d4a1e0](https://github.com/HeyPuter/puter/commit/8d4a1e0ed3872e2c82b9e4be9b6d8b359e9cea09))
* Correct APIError imports ([062e23b](https://github.com/HeyPuter/puter/commit/062e23b5c9673db1f8b0ff0469289d52dd1e3f99))
* Correct grep output when asking for line numbers ([c8a20ca](https://github.com/HeyPuter/puter/commit/c8a20cadbfd539d185d32f4558916825fcf265ba))
* Correct inverted instanceof check in SignalReader.read() ([d4c2b49](https://github.com/HeyPuter/puter/commit/d4c2b492ef4864804776d3cb7d24797fdc536886))
* Correct variables used in errors in sign.js ([fa7c6be](https://github.com/HeyPuter/puter/commit/fa7c6bee9699527028be0ae9759155bc67c52324))
* Eliminates duplicate translation keys ([5800350](https://github.com/HeyPuter/puter/commit/5800350b253994dea410afff64e3df2a171e7775))
* fix error handling for outdated node versions ([4c1d5a4](https://github.com/HeyPuter/puter/commit/4c1d5a4b6d009ce075897d499d3517219bd745a4))
* Fix phoenix app prefix and TokenService test ([afb9d86](https://github.com/HeyPuter/puter/commit/afb9d866b5091058711db931cde904947e661c15))
* increase QR code size ([d2de46e](https://github.com/HeyPuter/puter/commit/d2de46edfbc05d132d5c929f6935b82515fbbda0))
* Make PathCommandProvider reject queries with path separators ([d733119](https://github.com/HeyPuter/puter/commit/d73311945610417a1ebc7bb0723ced0a599594b4))
* Make url variable accessible to all users of it ([2f30ae7](https://github.com/HeyPuter/puter/commit/2f30ae7a825adcd8da95888c38fe39c34acee0ff))
* Only run Component initialization functions once ([5b43358](https://github.com/HeyPuter/puter/commit/5b43358219402bee3eadf4a0f184a4b924d3293b))
* Parse octal echo escapes ([6ad8f5e](https://github.com/HeyPuter/puter/commit/6ad8f5e06abd050d319271f818d72debf5bc8e44))
* reduce token lengths ([5a76bad](https://github.com/HeyPuter/puter/commit/5a76bad28dfd8ec89a309941e410a54927fae22d))
* reliability issue :bug: ([1d546d9](https://github.com/HeyPuter/puter/commit/1d546d9ef70ef9066ad5838e9782ae330d289f29))
* Remove null or duplicate app entries from suggest_app_for_fsentry() ([6900233](https://github.com/HeyPuter/puter/commit/6900233c5aaa2d1a49f495e9f9a060796757a91e))
* **security:** always use application/octet-stream ([74e213a](https://github.com/HeyPuter/puter/commit/74e213a534dbf2844c8cebeee7eb59ec70de306e))
* **security:** Fix session revocation ([eb166a6](https://github.com/HeyPuter/puter/commit/eb166a67a9f0caf4fd77f9e27dc8209c2fc51f4c))
* **security:** Move token for socket.io to request body ([49b257e](https://github.com/HeyPuter/puter/commit/49b257ecffbb1e12090b86a67528a5ad09da69db))
* **security:** Prevent email enumeration ([ed70314](https://github.com/HeyPuter/puter/commit/ed703146863f896df76c98fad7127c6748c0ef9b))
* **security:** skip cache when checking old passwd ([7800ef6](https://github.com/HeyPuter/puter/commit/7800ef61029c8d1ba47491b4028a0cb972298725))
* **Terminal:** Accept input from Chrome on Android ([4ef3e53](https://github.com/HeyPuter/puter/commit/4ef3e53de34f0097950a7e707ca2483863beafb5))
* test release-please action [#3](https://github.com/HeyPuter/puter/issues/3) ([8fb0a66](https://github.com/HeyPuter/puter/commit/8fb0a66ef21921990e564e5f61c0e80e7f929dc7))
* test release-please action [#4](https://github.com/HeyPuter/puter/issues/4) ([f392de7](https://github.com/HeyPuter/puter/commit/f392de722a5232b622ed91b656a31cdc443c2e84))
* typographical error :bug: ([2949f71](https://github.com/HeyPuter/puter/commit/2949f71691eb0a258888c5d2a5bb496d2fe64a23))
* typographical errors :bug: ([4d30740](https://github.com/HeyPuter/puter/commit/4d30740198402cd1cc61b9ea4c45e006b69ec87e))
* Use correct variable for version number ([52d5299](https://github.com/HeyPuter/puter/commit/52d52993744dffa9f7f59a232da5df9077560731))
* use primary read in signup ([30f17ad](https://github.com/HeyPuter/puter/commit/30f17ade3a893d2283316e581836607e2029f9b9))

## [2.2.0](https://github.com/HeyPuter/puter/compare/v2.1.1...v2.2.0) (2024-04-23)


### Features

* add /healthcheck endpoint ([c166560](https://github.com/HeyPuter/puter/commit/c166560ff4ab5a453d3ec4f97326c995deb7f522))
* allow apps to add a menubar via puter.js ([331d9e7](https://github.com/HeyPuter/puter/commit/331d9e75428ec7609394f59b1755374c7340f83e))

## [2.1.1](https://github.com/HeyPuter/puter/compare/v2.1.0...v2.1.1) (2024-04-22)


### Bug Fixes

* test release-please action [#3](https://github.com/HeyPuter/puter/issues/3) ([8fb0a66](https://github.com/HeyPuter/puter/commit/8fb0a66ef21921990e564e5f61c0e80e7f929dc7))
* test release-please action [#4](https://github.com/HeyPuter/puter/issues/4) ([f392de7](https://github.com/HeyPuter/puter/commit/f392de722a5232b622ed91b656a31cdc443c2e84))

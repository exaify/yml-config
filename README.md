<h1 align="center">@exaify/yml-config</h1>
<p align="center" >
  <a href="https://github.com/exaify" target="blank">
    <img src="https://ucarecdn.com/eac2c945-177d-4fc9-8bc1-fa2be48ad3a2/lotolab_golden.svg" width="100" alt="exaify Logo" />
  </a>
</p>

<p align="center">
  <a href="https://www.npmjs.com/~exaify" target="_blank"><img src="https://img.shields.io/npm/l/%40exaify%2Fyml-config?color=%2303A9F4&label=License" alt="License" /></a>
  <a href="https://discord.gg/lotolab" target="_blank"><img src="https://img.shields.io/badge/discord-online-brightgreen.svg" alt="Discord"/></a>
  <a href="https://x.com/lamborghini171" target="_blank"><img src="https://img.shields.io/twitter/follow/nestframework.svg?style=social&label=Follow" alt="Follow us on Twitter"></a>
  <a href="https://www.npmjs.com/~exaify" target="_blank"><img src="https://img.shields.io/npm/v/%40exaify%2Fyml-config" alt="xnest-config" /></a>
  <a href="https://www.npmjs.com/~exaify" target="_blank"><img src="https://img.shields.io/npm/dy/%40exaify%2Fyml-config?style=flat&logoColor=%23FA0809" alt="Downloads" /></a>
</p>

## Description

> The yml-config extending from @nestjs/config,support yaml configuration and typeorm options wrapper.

## Installation

```
$ npm install -g @exaify/yml-config
```

## Usage

> The yml-config module providers : yamlConfigLoader ,PostgresOptionsFactory factory and MysqlOptionsFactory

- yamlConfigLoader : a environment yaml configuration files loader tool

### Configuration forRoot

```ts
import { yamlConfigLoader } from 'exaify@yml-config'
@Module(
  imports:[
    YmlConfigModule.forRoot({isGlobal:true}), // some to @nestjs/config
    ... // others
  ]
)

```

### Configuration forRoot

```ts
import { yamlConfigLoader } from 'exaify@yml-config'
@Module(
  imports:[
    YmlConfigModule.forRoot({
        ymlBase: '.conf', // update your yml configuration files OR SET YML_CONF_BASE in process.env
        load:[yamlConfigLoader]
    })
    ... // others
  ]
)
```

:boom: :boom: :boom: :star2: :star2: :two_hearts: :two_hearts: :two_hearts:

<h4 align="left">
Congratulations, you have use ConfigService get all yml configurations in your modules.
</h4>

:star: :star: :star: :star: :star: :star: :star: :star:

Learn more usages in the source [yaml-config docs](https://github.com/xdify/xnest-config/tree/main/docs)

---

## Stay in touch

- Twitter - [@lamborghini171](https://twitter.com/lamborghini171)

:revolving_hearts::revolving_hearts::revolving_hearts: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand::raising_hand::raising_hand::revolving_hearts::revolving_hearts::revolving_hearts:

<font color="#ff8f00"><h3>Sincerely invite experts to improve the project functions together !</h3></font>

:revolving_hearts::revolving_hearts::revolving_hearts: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand: :raising_hand::raising_hand::raising_hand::revolving_hearts: :revolving_hearts::revolving_hearts:

## License

The @xaify/yaml-config packages is [MIT licensed](LICENSE).

> Give me a cup of coffee? Thanks much.

![Wechat QRCode](https://github.com/xdify/.github/blob/8ab3536552b8eec4165e1763e480cd786ad4fc4e/wechat-toll.png)

![Etherum](https://github.com/xdify/.github/blob/8ab3536552b8eec4165e1763e480cd786ad4fc4e/0x01dc42c9a940a2517b23fd9a3c26c2f30935da59.png)

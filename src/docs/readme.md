# Docs
This is a static site generator aimed to produce very readable html and css code.

## Build
```bash
webpack
```

## Usage
See the [webpack config](./webpack.config.ts) for an example of using the configuration builder. You must install `webpack`, `webpack-cli`, `react`, and `react-dom` as dependencies. If you want to use a typescript configuration file, you must install `ts-node`. See the `tsconfig.json` and `ts-node` property.

## Html
To create html content, you create react components and use some of the provided helpers located in the [webpack-static-site](../webpack-static-site/components) package.

You may wish to create a page template for use accross all the pages. See [pageTemplate](pages/pageTemplate.tsx). For including `sass`, you must import the sass file in your react page and then include it as an href in the special [Link](../webpack-static-site/components/link.tsx) component.


## Styles
This builder supports [sass](https://sass-lang.com/) for styling.
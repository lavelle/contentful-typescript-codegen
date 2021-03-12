import render from './renderers/render';
import path from 'path';
import { outputFileSync } from 'fs-extra';
import meow from 'meow';

const cli = meow(
    `
  Usage
    $ contentful-typescript-codegen --output <file> <options>

  Options
    --output,      -o  Where to write to
    --namespace N, -n  Wrap types in namespace N (disabled by default)
    --localization -l  Output fields with localized values

  Examples
    $ contentful-typescript-codegen -o src/@types/generated/contentful.d.ts
`,
    {
        flags: {
            output: {
                type: 'string',
                alias: 'o',
                required: true,
            },
            namespace: {
                type: 'string',
                alias: 'n',
                required: false,
            },
            localization: {
                type: 'boolean',
                alias: 'l',
                required: false,
            },
        },
    },
);

async function runCodegen(outputFile: string) {
    const getEnvironmentPath = path.resolve(process.cwd(), './getContentfulEnvironment.js');
    const getEnvironment = require(getEnvironmentPath);
    const environment = await getEnvironment();
    const contentTypes = await environment.getContentTypes({ limit: 1000 });
    const outputPath = path.resolve(process.cwd(), outputFile);

    const output = await render(contentTypes.items, { namespace: cli.flags.namespace });

    outputFileSync(outputPath, output);
}

runCodegen(cli.flags.output).catch((error) => {
    console.error(error);
    process.exit(1);
});

import { ContentType } from 'contentful';

import { format, resolveConfig } from 'prettier';

import renderContentfulImports from './contentful/renderContentfulImports';
import renderContentType from './contentful-fields-only/renderContentType';
import renderNamespace from './contentful/renderNamespace';
import _ from 'lodash';

interface Options {
    namespace?: string;
}

function renderEnum(contentTypes: ContentType[]) {
    const out = [`export enum ContentType {`];

    contentTypes.forEach((contentType) => {
        const id = _.upperFirst(_.camelCase(contentType.sys.id));
        out.push(`'${id}' = '${contentType.sys.id}',`);
    });

    out.push('}');

    return out.join('\n');
}

export default async function renderFieldsOnly(
    contentTypes: ContentType[],
    { namespace }: Options = {},
) {
    const sortedContentTypes = contentTypes.sort((a, b) => a.sys.id.localeCompare(b.sys.id));

    console.log(sortedContentTypes);

    const typingsSource = renderAllContentTypes(sortedContentTypes);

    const contentTypesEnum = renderEnum(sortedContentTypes);

    const source = [
        renderContentfulImports(false),
        contentTypesEnum,
        renderNamespace(typingsSource, namespace),
    ].join('\n\n');

    const prettierConfig = await resolveConfig(process.cwd());

    return format(source, { ...prettierConfig, parser: 'typescript' });
}

function renderAllContentTypes(contentTypes: ContentType[]): string {
    return contentTypes.map((contentType) => renderContentType(contentType)).join('\n\n');
}

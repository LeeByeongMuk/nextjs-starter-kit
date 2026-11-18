import { dirname, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const SLICE_LAYERS = ['views', 'widgets', 'features', 'entities'];
const SOURCE_ROOT = fileURLToPath(new URL('../src', import.meta.url));
const IMPORT_PATH_REGEX = new RegExp(`^@(${SLICE_LAYERS.join('|')})/([^/]+)`);

function getLocation(filename) {
  const [layer, slice] = relative(SOURCE_ROOT, filename).split(sep);
  if (SLICE_LAYERS.includes(layer) && slice) return `${layer}/${slice}`;
  if (layer === 'proxy.ts' || layer === 'proxy') return 'app';
  if (['app', 'shared', 'styles'].includes(layer)) return layer;
}

/** @type {import('eslint').Rule.RuleModule} */
const fsdRelativeImportsRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        '같은 FSD 슬라이스에서는 상대 경로를, 경계 밖에서는 alias를 사용하도록 강제',
    },
    messages: {
      useRelativeImport:
        '같은 슬라이스({{layer}}/{{slice}}) 내에서는 상대 경로를 사용하세요. "@{{layer}}/{{slice}}/..." 대신 "./" 또는 "../"를 사용하세요.',
      useAlias:
        '다른 FSD 슬라이스나 레이어로 이동하는 상대 경로 대신 경로 별칭과 공개 API를 사용하세요.',
    },
    schema: [],
  },
  create(context) {
    const filename = context.physicalFilename;
    const location = getLocation(filename);
    if (!location) return {};

    const checkSource = sourceNode => {
      const source =
        sourceNode?.type === 'TemplateLiteral' && !sourceNode.expressions.length
          ? sourceNode.quasis[0].value.cooked
          : sourceNode?.value;
      if (typeof source !== 'string') return;

      if (/^\.{1,2}(\/|$)/.test(source)) {
        const target = getLocation(resolve(dirname(filename), source));
        if (target !== location) {
          context.report({ node: sourceNode, messageId: 'useAlias' });
        }
        return;
      }

      const importMatch = source.match(IMPORT_PATH_REGEX);
      if (!importMatch) return;

      const [, layer, slice] = importMatch;
      if (`${layer}/${slice}` === location) {
        context.report({
          node: sourceNode,
          messageId: 'useRelativeImport',
          data: { layer, slice },
        });
      }
    };

    return {
      ImportDeclaration: node => checkSource(node.source),
      ExportNamedDeclaration: node => checkSource(node.source),
      ExportAllDeclaration: node => checkSource(node.source),
      ImportExpression: node => checkSource(node.source),
      TSImportType: node => checkSource(node.source),
      TSExternalModuleReference: node => checkSource(node.expression),
      CallExpression: node => {
        const { callee } = node;
        const isRequire =
          callee.type === 'Identifier' && callee.name === 'require';
        const isJestCall =
          callee.type === 'MemberExpression' &&
          callee.object.type === 'Identifier' &&
          callee.object.name === 'jest';
        if (isRequire || isJestCall) {
          checkSource(node.arguments[0]);
        }
      },
    };
  },
};

/** FSD 슬라이스 경계에 맞는 상대 경로와 alias를 강제하는 ESLint 플러그인 */
const plugin = {
  rules: { 'relative-imports': fsdRelativeImportsRule },
};

export default plugin;

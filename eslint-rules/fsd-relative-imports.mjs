// 같은 FSD 슬라이스 내부에서 자기 슬라이스를 alias로 import하는 것을 금지하고 상대 경로를 강제하는 커스텀 ESLint 룰
const FSD_LAYERS = ['views', 'widgets', 'features', 'entities'];

const FILE_PATH_REGEX = new RegExp(`src/(${FSD_LAYERS.join('|')})/([^/]+)`);
const IMPORT_PATH_REGEX = new RegExp(`^@(${FSD_LAYERS.join('|')})/([^/]+)`);

/** @type {import('eslint').Rule.RuleModule} */
const fsdRelativeImportsRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        '같은 FSD 슬라이스 내에서는 alias 대신 상대 경로 import를 사용하도록 강제',
    },
    messages: {
      useRelativeImport:
        '같은 슬라이스({{layer}}/{{slice}}) 내에서는 상대 경로를 사용하세요. "@{{layer}}/{{slice}}/..." 대신 "./" 또는 "../"를 사용하세요.',
    },
    schema: [],
  },
  create(context) {
    const fileMatch = context.filename.match(FILE_PATH_REGEX);
    if (!fileMatch) {
      return {};
    }

    const [, fileLayer, fileSlice] = fileMatch;

    const checkSource = sourceNode => {
      if (!sourceNode || typeof sourceNode.value !== 'string') {
        return;
      }

      const importMatch = sourceNode.value.match(IMPORT_PATH_REGEX);
      if (!importMatch) {
        return;
      }

      const [, importLayer, importSlice] = importMatch;
      if (importLayer === fileLayer && importSlice === fileSlice) {
        context.report({
          node: sourceNode,
          messageId: 'useRelativeImport',
          data: { layer: fileLayer, slice: fileSlice },
        });
      }
    };

    return {
      // import ... from '...'
      ImportDeclaration: node => checkSource(node.source),
      // export { x } from '...' / export * from '...'
      ExportNamedDeclaration: node => checkSource(node.source),
      ExportAllDeclaration: node => checkSource(node.source),
      // 동적 import('...')
      ImportExpression: node =>
        node.source.type === 'Literal' ? checkSource(node.source) : undefined,
      // require('...') / jest.mock('...') 류
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

const plugin = {
  rules: { 'relative-imports': fsdRelativeImportsRule },
};

export default plugin;

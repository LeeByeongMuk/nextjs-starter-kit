const SEPARATOR_REGEX = /[-─—=*_]{4,}/;
const TODO_REGEX = /\bTODO\b/i;
const TODO_WITH_KEY_REGEX = /\bTODO\([^)]+\):/;

/** @type {import('eslint').Rule.RuleModule} */
const commentConventionsRule = {
  meta: {
    type: 'problem',
    docs: {
      description:
        '주석 컨벤션 강제 — 파일 헤더 주석·구분선 주석·추적키 없는 TODO 금지 (code-conventions.md §2.2)',
    },
    messages: {
      noFileHeader:
        '파일 헤더 주석 금지 — export 대상의 JSDoc 한 줄이 역할 설명을 대신합니다 (§2.2)',
      noSeparator:
        '구분선 주석 금지 — 코드 구조는 export 순서·들여쓰기로 충분합니다 (§2.2)',
      todoNeedsKey: 'TODO는 "TODO(추적키): 사유" 형식만 허용합니다 (§2.2)',
    },
    schema: [],
  },
  create(context) {
    const { sourceCode } = context;

    return {
      Program(program) {
        const firstStatement = program.body[0];
        const comments = sourceCode.getAllComments();

        // 첫 구문 위에 빈 줄 없이 연달아 붙은 주석 줄들은 그 구문의 주석이지 파일 헤더가 아니다
        const attachedLines = new Set();
        if (firstStatement) {
          let line = firstStatement.loc.start.line - 1;
          const commentLines = new Set(
            comments.flatMap(c => {
              const lines = [];
              for (let l = c.loc.start.line; l <= c.loc.end.line; l += 1) {
                lines.push(l);
              }
              return lines;
            })
          );
          while (commentLines.has(line)) {
            attachedLines.add(line);
            line -= 1;
          }
        }

        for (const comment of comments) {
          const text = comment.value;

          if (text.includes('eslint-') || text.startsWith('/')) {
            continue;
          }

          if (SEPARATOR_REGEX.test(text)) {
            context.report({ loc: comment.loc, messageId: 'noSeparator' });
            continue;
          }

          if (TODO_REGEX.test(text) && !TODO_WITH_KEY_REGEX.test(text)) {
            context.report({ loc: comment.loc, messageId: 'todoNeedsKey' });
            continue;
          }

          const isBeforeAnyCode =
            !firstStatement || comment.range[1] <= firstStatement.range[0];
          if (
            comment.type === 'Line' &&
            isBeforeAnyCode &&
            !attachedLines.has(comment.loc.start.line)
          ) {
            context.report({ loc: comment.loc, messageId: 'noFileHeader' });
          }
        }
      },
    };
  },
};

/** 주석 컨벤션(§2.2)을 기계 강제하는 ESLint 플러그인 */
const plugin = {
  rules: { 'comment-conventions': commentConventionsRule },
};

export default plugin;

import { SourcePosition, Token, TokenType } from './types';

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  const len = input.length;
  let offset = 0;
  let line = 1;
  let column = 1;

  function getPos(): SourcePosition {
    return { offset, line, column };
  }

  function advance(count = 1): string {
    let result = '';
    for (let i = 0; i < count && offset < len; i++) {
      const ch = input[offset];
      result += ch;
      offset++;
      if (ch === '\n') {
        line++;
        column = 1;
      } else {
        column++;
      }
    }
    return result;
  }

  function peek(ahead = 0): string {
    return offset + ahead < len ? input[offset + ahead] : '';
  }

  while (offset < len) {
    const startPos = getPos();
    const ch = peek();

    // 1. Whitespace
    if (/\s/.test(ch)) {
      let ws = '';
      while (offset < len && /\s/.test(peek())) {
        ws += advance();
      }
      tokens.push({
        type: 'Whitespace',
        value: ws,
        start: startPos,
        end: getPos(),
        raw: ws,
      });
      continue;
    }

    // 2. Comments (// or /* */)
    if (ch === '/' && peek(1) === '/') {
      let comment = advance(2);
      while (offset < len && peek() !== '\n') {
        comment += advance();
      }
      tokens.push({
        type: 'Comment',
        value: comment,
        start: startPos,
        end: getPos(),
        raw: comment,
      });
      continue;
    }

    if (ch === '/' && peek(1) === '*') {
      let comment = advance(2);
      while (offset < len) {
        if (peek() === '*' && peek(1) === '/') {
          comment += advance(2);
          break;
        }
        comment += advance();
      }
      tokens.push({
        type: 'Comment',
        value: comment,
        start: startPos,
        end: getPos(),
        raw: comment,
      });
      continue;
    }

    // 3. Structural delimiters
    if (ch === '{') {
      advance();
      tokens.push({ type: 'OpenBrace', value: '{', start: startPos, end: getPos(), raw: '{' });
      continue;
    }
    if (ch === '}') {
      advance();
      tokens.push({ type: 'CloseBrace', value: '}', start: startPos, end: getPos(), raw: '}' });
      continue;
    }
    if (ch === '[') {
      advance();
      tokens.push({ type: 'OpenBracket', value: '[', start: startPos, end: getPos(), raw: '[' });
      continue;
    }
    if (ch === ']') {
      advance();
      tokens.push({ type: 'CloseBracket', value: ']', start: startPos, end: getPos(), raw: ']' });
      continue;
    }
    if (ch === ':') {
      advance();
      tokens.push({ type: 'Colon', value: ':', start: startPos, end: getPos(), raw: ':' });
      continue;
    }
    if (ch === ',') {
      advance();
      tokens.push({ type: 'Comma', value: ',', start: startPos, end: getPos(), raw: ',' });
      continue;
    }

    // 4. Double-quoted Strings
    if (ch === '"') {
      let str = advance(); // include opening quote
      let isEscaped = false;
      let closed = false;

      while (offset < len) {
        const cur = peek();
        str += advance();

        if (isEscaped) {
          isEscaped = false;
        } else if (cur === '\\') {
          isEscaped = true;
        } else if (cur === '"') {
          closed = true;
          break;
        }
      }

      tokens.push({
        type: 'String',
        value: str,
        start: startPos,
        end: getPos(),
        raw: str,
      });
      continue;
    }

    // 5. Single-quoted Strings
    if (ch === "'") {
      let str = advance(); // include opening quote
      let isEscaped = false;

      while (offset < len) {
        const cur = peek();
        str += advance();

        if (isEscaped) {
          isEscaped = false;
        } else if (cur === '\\') {
          isEscaped = true;
        } else if (cur === "'") {
          break;
        }
      }

      tokens.push({
        type: 'SingleQuoteString',
        value: str,
        start: startPos,
        end: getPos(),
        raw: str,
      });
      continue;
    }

    // 6. Numbers (including negative, decimals, exponents)
    if (ch === '-' || (ch >= '0' && ch <= '9') || (ch === '+' && /[0-9]/.test(peek(1)))) {
      let num = advance();
      while (offset < len && /^[0-9a-fA-FxXeE\.\+\-]$/.test(peek())) {
        num += advance();
      }
      tokens.push({
        type: 'Number',
        value: num,
        start: startPos,
        end: getPos(),
        raw: num,
      });
      continue;
    }

    // 7. Words / Identifiers / Literals
    if (/[a-zA-Z_$]/.test(ch)) {
      let word = advance();
      while (offset < len && /[a-zA-Z0-9_$\-]/.test(peek())) {
        word += advance();
      }

      let type: TokenType = 'Identifier';
      if (word === 'true' || word === 'false') {
        type = 'Boolean';
      } else if (word === 'null') {
        type = 'Null';
      } else if (
        word === 'True' ||
        word === 'False' ||
        word === 'None' ||
        word === 'TRUE' ||
        word === 'FALSE' ||
        word === 'NULL'
      ) {
        type = 'PythonLiteral';
      }

      tokens.push({
        type,
        value: word,
        start: startPos,
        end: getPos(),
        raw: word,
      });
      continue;
    }

    // 8. Unknown / fallback character
    const unknownChar = advance();
    tokens.push({
      type: 'Unknown',
      value: unknownChar,
      start: startPos,
      end: getPos(),
      raw: unknownChar,
    });
  }

  tokens.push({
    type: 'EOF',
    value: '',
    start: getPos(),
    end: getPos(),
    raw: '',
  });

  return tokens;
}

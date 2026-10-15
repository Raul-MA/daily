

export function evaluateScoreExpression(rawValue) {
  const expression = String(rawValue ?? "").replace(/\s+/g, "");
  if (!expression) return { valid: true, value: 0 };
  let index = 0;

  function parseExpression() {
    let value = parseTerm();
    if (value === null) return null;
    while (expression[index] === "+" || expression[index] === "-") {
      const operator = expression[index++];
      const right = parseTerm();
      if (right === null) return null;
      value = operator === "+" ? value + right : value - right;
    }
    return value;
  }

  function parseTerm() {
    let value = parseFactor();
    if (value === null) return null;
    while (expression[index] === "*" || expression[index] === "/") {
      const operator = expression[index++];
      const right = parseFactor();
      if (right === null || (operator === "/" && right === 0)) return null;
      value = operator === "*" ? value * right : value / right;
    }
    return value;
  }

  function parseFactor() {
    let sign = 1;
    while (expression[index] === "+" || expression[index] === "-") {
      if (expression[index] === "-") sign *= -1;
      index += 1;
    }
    const start = index;
    while (/[0-9.]/.test(expression[index] || "")) index += 1;
    const token = expression.slice(start, index);
    return signedNumber(token, sign);
  }

  const value = parseExpression();
  if (value === null || index !== expression.length || !Number.isFinite(value)) return { valid: false, value: 0 };
  return { valid: true, value: Math.trunc(value) };
}

function signedNumber(token, sign) {
    if (!token || token === "." || token.split(".").length > 2) return null;
    const value = Number(token);
    return Number.isFinite(value) ? sign * value : null;
}

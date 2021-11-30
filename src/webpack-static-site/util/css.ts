/**
 * This function is a tagged template function meant to concatenate strings. It
 * is called css to enable syntax highlighting in supported IDE environments
 *
 * @see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Template_literals
 * - Tagged templates
 *
 * @param strings - String array
 * @param expressions - Template expressions
 */
export const css = (strings, ...expressions) => {
    let result = "";

    for (const [index, value] of strings.entries()) {
        result += value + (expressions[index] ?? "");
    }

    return result.trim();
};

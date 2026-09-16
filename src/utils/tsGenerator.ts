export function jsonToTypeScript(data: any, rootName = 'RootObject'): string {
  const interfaces: string[] = [];
  const generatedNames = new Set<string>();

  function toPascalCase(str: string): string {
    return str
      .replace(/[^a-zA-Z0-9]/g, ' ')
      .split(' ')
      .filter(Boolean)
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join('') || 'Item';
  }

  function getType(value: any, keyHint: string): string {
    if (value === null) return 'null';
    if (Array.isArray(value)) {
      if (value.length === 0) return 'any[]';
      const itemTypes = Array.from(new Set(value.map((v) => getType(v, keyHint))));
      if (itemTypes.length === 1) {
        return `${itemTypes[0]}[]`;
      }
      return `(${itemTypes.join(' | ')})[]`;
    }
    if (typeof value === 'object') {
      const interfaceName = toPascalCase(keyHint);
      generateInterface(value, interfaceName);
      return interfaceName;
    }
    return typeof value;
  }

  function generateInterface(obj: Record<string, any>, name: string) {
    if (generatedNames.has(name)) return;
    generatedNames.add(name);

    const lines: string[] = [];
    lines.push(`export interface ${name} {`);

    for (const [key, val] of Object.entries(obj)) {
      const cleanKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
      const typeStr = getType(val, key);
      lines.push(`  ${cleanKey}: ${typeStr};`);
    }

    lines.push('}');
    interfaces.unshift(lines.join('\n'));
  }

  if (Array.isArray(data)) {
    if (data.length > 0 && typeof data[0] === 'object' && data[0] !== null) {
      generateInterface(data[0], `${rootName}Item`);
      return `${interfaces.join('\n\n')}\n\nexport type ${rootName} = ${rootName}Item[];`;
    }
    return `export type ${rootName} = any[];`;
  }

  if (typeof data === 'object' && data !== null) {
    generateInterface(data, rootName);
    return interfaces.join('\n\n');
  }

  return `export type ${rootName} = ${typeof data};`;
}

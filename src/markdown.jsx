/**
 * Convierte un subconjunto pequeño de Markdown en elementos de React (sin librerías ni HTML crudo):
 * comentarios <!-- --> (se ocultan), # ## ### títulos, párrafos, listas con "- " o "1. ", **negritas** y [texto](enlace).
 */

function renderInline(text) {
  const parts = [];
  const pattern = /\*\*(.+?)\*\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  let match;
  while ((match = pattern.exec(text)) !== null) {
    if (match.index > last) parts.push(text.slice(last, match.index));
    if (match[1] !== undefined) {
      parts.push(<strong key={match.index}>{match[1]}</strong>);
    } else {
      const href = match[3];
      const external = /^https?:/.test(href);
      parts.push(
        <a key={match.index} href={href} {...(external ? { target: '_blank', rel: 'noreferrer' } : {})}>
          {match[2]}
        </a>,
      );
    }
    last = pattern.lastIndex;
  }
  if (last < text.length) parts.push(text.slice(last));
  return parts;
}

function parseBlocks(markdown) {
  const lines = markdown.replace(/<!--[\s\S]*?-->/g, '').replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let current = null;

  function flush() {
    if (current) blocks.push(current);
    current = null;
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flush();
      continue;
    }
    const heading = line.match(/^(#{1,3})\s+(.*)$/);
    if (heading) {
      flush();
      blocks.push({ type: 'h', level: heading[1].length, text: heading[2] });
      continue;
    }
    const bullet = line.match(/^[-*]\s+(.*)$/);
    const numbered = line.match(/^\d+\.\s+(.*)$/);
    if (bullet || numbered) {
      const type = bullet ? 'ul' : 'ol';
      if (!current || current.type !== type) {
        flush();
        current = { type, items: [] };
      }
      current.items.push((bullet || numbered)[1]);
      continue;
    }
    if (current && (current.type === 'ul' || current.type === 'ol') && /^\s+/.test(raw)) {
      // Continuación (sangrada) del elemento anterior de la lista.
      current.items[current.items.length - 1] += ` ${line.trim()}`;
      continue;
    }
    if (current && current.type === 'p') {
      current.text += ` ${line.trim()}`;
    } else {
      flush();
      current = { type: 'p', text: line.trim() };
    }
  }
  flush();
  return blocks;
}

export default function Markdown({ source }) {
  const blocks = parseBlocks(source);
  return (
    <>
      {blocks.map((block, index) => {
        if (block.type === 'h') {
          const Tag = `h${block.level}`;
          return <Tag key={index}>{renderInline(block.text)}</Tag>;
        }
        if (block.type === 'ul' || block.type === 'ol') {
          const List = block.type;
          return (
            <List key={index}>
              {block.items.map((item, itemIndex) => (
                <li key={itemIndex}>{renderInline(item)}</li>
              ))}
            </List>
          );
        }
        return <p key={index}>{renderInline(block.text)}</p>;
      })}
    </>
  );
}

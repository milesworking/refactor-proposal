export const surrounding = (target: string, context: { from: string, diameter: number }): string => {
  const lines = context.from.split('\n')
  const targetIndex = lines.findIndex(line => line.includes(target))

  if (targetIndex === -1)
    return ''

  return lines.slice(
    Math.max(0, targetIndex - context.diameter),
    Math.min(lines.length - 1, targetIndex + context.diameter) + 1
  ).join('\n')
}

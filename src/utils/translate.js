export function parseResult(result) {
  const {
    sentences,
    dict,
    synsets,
    definitions: definitionList,
    examples: exampleList,
    src,
  } = result
  const trans = sentences?.[0]?.trans
  const orig = sentences?.[0]?.orig
  const translit = sentences?.[1]?.src_translit

  const definitions = definitionList?.[0]?.entry?.map((def) => ({
    gloss: def?.gloss,
    example: def?.example,
    synonyms:
      synsets?.[0]?.entry?.find((e) => e.definition_id === def?.definition_id)?.synonym || [],
  }))
  const examples = exampleList?.example?.map((ex) => ex.text)
  return {
    trans,
    dict,
    orig,
    translit,
    examples,
    definitions,
    src,
  }
}

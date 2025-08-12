export function parseResult(result) {
  const { sentences, dict, synsets, definitions, examples: exampleList, src } = result
  const trans = sentences?.[0]?.trans
  const orig = sentences?.[0]?.orig
  const translit = sentences?.[1]?.src_translit
  const synonyms = synsets?.[0]?.entry?.[0]?.synonym
  const definition = definitions?.[0]?.entry?.[0]?.gloss
  const examples = exampleList?.example?.map((ex) => ex.text)
  return {
    trans,
    dict,
    orig,
    translit,
    examples,
    definition,
    synonyms,
    src,
  }
}

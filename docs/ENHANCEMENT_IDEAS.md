# Speech Practice - Enhancement Ideas

## Grammar Mode Verification Improvements

### Current Implementation (2026-03-15)
Smart verification with:
1. **Levenshtein distance** ≤ 3 characters allowed
2. **Kanji strict** - kanji must match exactly (meaning-critical)
3. **Kana lenient** - small differences accepted (は↔が, です↔だ, etc.)
4. **85% similarity threshold** - using edit distance calculation

### Accepted Examples
| User Answer | Correct | Result | Why |
|-------------|---------|--------|-----|
| `写真を撮ってもいいですか` | `写真を撮ってもいいですか。` | ✅ | Punctuation only |
| `写真を撮ってもいいですが` | `写真を撮ってもいいですか` | ✅ | か↔が (1 char) |
| `今日はいい天気ですね` | `今日はいい天気です` | ✅ | Similarity ≥ 85% |

### Rejected Examples
| User Answer | Correct | Result | Why |
|-------------|---------|--------|-----|
| `しゃしんをとってもいいですか` | `写真を撮ってもいいですか` | ❌ | Kanji changed |
| `写真を食べてもいいですか` | `写真を撮ってもいいですか` | ❌ | Different kanji (撮↔食) |
| `昨日はいい天気です` | `今日はいい天気です` | ❌ | Kanji mismatch (今↔昨) |

---

## Future Enhancement: Semantic Verification (Option 4)

### Concept
Use OpenAI embeddings for semantic similarity comparison:
- Convert both user answer and correct answer to embeddings
- Compare cosine similarity
- Accept if meaning is equivalent, even if words differ

### Use Cases
| User Answer | Correct | Traditional | Semantic |
|-------------|---------|-------------|----------|
| `写真を撮っていい？` | `写真を撮ってもいいですか` | ❌ Too short | ✅ Same meaning |
| `写真撮っていいですか` | `写真を撮ってもいいですか` | ❌ Missing を | ✅ Same meaning |
| `お写真を撮らせていただけますか` | `写真を撮ってもいいですか` | ❌ Different words | ✅ Same meaning (polite) |
| `写真を撮ってもいいでしょうか` | `写真を撮ってもいいですか` | ❌ Different ending | ✅ Same meaning |

### Implementation Notes
- **Cost**: ~$0.0001 per comparison (text-embedding-3-small)
- **Latency**: +50-100ms per check
- **Offline fallback**: Keep current Levenshtein method as fallback

### Code Sketch
```typescript
import { openai } from '../services/openai';

async function semanticVerify(user: string, correct: string): Promise<boolean> {
  const [userEmbedding, correctEmbedding] = await Promise.all([
    openai.embeddings.create({ input: user, model: 'text-embedding-3-small' }),
    openai.embeddings.create({ input: correct, model: 'text-embedding-3-small' })
  ]);
  
  const similarity = cosineSimilarity(
    userEmbedding.data[0].embedding,
    correctEmbedding.data[0].embedding
  );
  
  return similarity >= 0.92; // 92% semantic similarity threshold
}
```

### Pros/Cons
**Pros:**
- Accepts valid variations (polite/formal, dialects, abbreviations)
- Focuses on communication, not exact wording
- Reduces frustration for natural language use

**Cons:**
- Requires internet connection
- Small API cost
- Slightly slower feedback
- May accept truly wrong answers if meaning accidentally similar

### Recommendation
Keep current Levenshtein + Kanji/Kana method as default (fast, offline).
Add semantic verification as optional "Lenient Mode" toggle for advanced learners.

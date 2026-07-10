# Thai Dress — Photo Model Generation Prompts

Target garment: **ไทยร่วมสมัย (thai-contemporary)** — the look shown in `design-mockup.jpg`.
Mandarin collar (คอจีน), long sleeves, wood buttons, decorative trim, no pocket.

Goal: **24 images** — the same model/pose/lighting/outfit shape, varying only **fabric pattern**
(6) × **color** (4 curated colors, reused across every pattern for a consistent, comparable set).

Generate these with whatever image tool you're using (Midjourney, DALL·E, kie.ai/nanobanana, Firefly, etc).
If your tool supports a **fixed seed** or **consistent character/reference image** feature, use it across
all 24 prompts — that's the single biggest lever for making these look like one photoshoot instead of
24 different women in 24 different rooms.

## Shared setup (keep identical across all 24 generations)

- **Model**: Thai woman, mid-20s to early-30s, warm skin tone, hair in a low bun, minimal jewelry (small gold earrings only), natural makeup, calm confident expression, direct eye contact with camera.
- **Pose**: standing, three-quarter turn toward camera, weight on back leg, hands relaxed at sides, full body visible head-to-mid-thigh (matches the mockup's framing).
- **Framing/camera**: studio portrait, medium shot, eye-level camera, 85mm lens look, shallow depth of field with subject in sharp focus.
- **Lighting**: soft diffused studio key light from front-left, gentle fill from front-right, subtle rim light separating subject from background — no harsh shadows.
- **Background**: seamless neutral warm-grey studio backdrop (matches `design-mockup.jpg`), no props.
- **Garment fit**: tailored, structured shoulders, fitted through the waist, fabric drapes naturally with visible weave/texture — not flat or illustrated, must read as real woven fabric.
- **Consistency anchor line** (append to every prompt): `same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI`

## Naming convention

Save each output as:
```
frontend/public/studio/thai-dress/thai-contemporary_{patternId}_{colorSlug}.webp
```
Where `patternId` and `colorSlug` already match `catalog.json` so the app can map them directly — no renaming needed later. Every fabric below gets all 4 colors below (6 × 4 = 24):

**patternId (6 fabrics):**
| patternId | Thai fabric name |
|---|---|
| plain | เรียบ (ไม่มีลาย) |
| cotton | ฝ้ายทอมือ |
| thaisilk | ไหมไทย |
| mudmee | มัดหมี่ |
| indigo | ครามสกลนคร |
| linen | ลินิน |

**colorSlug (4 colors, used for every fabric above):**
| colorSlug | hex | Thai color name |
|---|---|---|
| gold | #C9A227 | ทอง |
| red | #8B1A2D | แดงเข้ม |
| navy | #1B2A4A | กรมท่า |
| cream | #F5E6D3 | ครีม |

---

## Prompts

### เรียบ (ไม่มีลาย) / plain — smooth solid fabric, no woven pattern

**1. `thai-contemporary_plain_gold.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from smooth solid gold-colored fabric (#C9A227), no pattern or texture beyond natural fabric sheen, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**2. `thai-contemporary_plain_red.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from smooth solid deep red fabric (#8B1A2D), no pattern or texture beyond natural fabric sheen, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**3. `thai-contemporary_plain_navy.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from smooth solid navy blue fabric (#1B2A4A), no pattern or texture beyond natural fabric sheen, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**4. `thai-contemporary_plain_cream.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from smooth solid cream fabric (#F5E6D3), no pattern or texture beyond natural fabric sheen, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

### ฝ้ายทอมือ / cotton — handwoven cotton, visible thread texture, small subtle weave grid

**5. `thai-contemporary_cotton_gold.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from handwoven Thai cotton fabric in gold (#C9A227), visible fine cross-thread weave texture typical of handloom cotton, matte finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**6. `thai-contemporary_cotton_red.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from handwoven Thai cotton fabric in deep red (#8B1A2D), visible fine cross-thread weave texture typical of handloom cotton, matte finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**7. `thai-contemporary_cotton_navy.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from handwoven Thai cotton fabric in navy blue (#1B2A4A), visible fine cross-thread weave texture typical of handloom cotton, matte finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**8. `thai-contemporary_cotton_cream.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from handwoven Thai cotton fabric in cream (#F5E6D3), visible fine cross-thread weave texture typical of handloom cotton, matte finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

### ไหมไทย / thaisilk — Thai silk, glossy sheen, diagonal diamond weave pattern

**9. `thai-contemporary_thaisilk_gold.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from lustrous Thai silk in gold (#C9A227), subtle diagonal diamond weave pattern catching the light, glossy sheen characteristic of genuine Thai silk, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**10. `thai-contemporary_thaisilk_red.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from lustrous Thai silk in deep red (#8B1A2D), subtle diagonal diamond weave pattern catching the light, glossy sheen characteristic of genuine Thai silk, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**11. `thai-contemporary_thaisilk_navy.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from lustrous Thai silk in navy blue (#1B2A4A), subtle diagonal diamond weave pattern catching the light, glossy sheen characteristic of genuine Thai silk, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**12. `thai-contemporary_thaisilk_cream.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from lustrous Thai silk in cream (#F5E6D3), subtle diagonal diamond weave pattern catching the light, glossy sheen characteristic of genuine Thai silk, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

### มัดหมี่ / mudmee — Mudmee ikat, bold diamond/geometric tie-dye weave pattern

**13. `thai-contemporary_mudmee_gold.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from Mudmee ikat fabric with bold geometric diamond tie-dye weave pattern rendered in gold tones (#C9A227) against the base fabric, traditional Isan textile motif, matte-to-semi-gloss finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**14. `thai-contemporary_mudmee_red.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from Mudmee ikat fabric with bold geometric diamond tie-dye weave pattern rendered in deep red tones (#8B1A2D) against the base fabric, traditional Isan textile motif, matte-to-semi-gloss finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**15. `thai-contemporary_mudmee_navy.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from Mudmee ikat fabric with bold geometric diamond tie-dye weave pattern rendered in navy blue tones (#1B2A4A) against the base fabric, traditional Isan textile motif, matte-to-semi-gloss finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**16. `thai-contemporary_mudmee_cream.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from Mudmee ikat fabric with bold geometric diamond tie-dye weave pattern rendered in cream tones (#F5E6D3) against the base fabric, traditional Isan textile motif, matte-to-semi-gloss finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

### ครามสกลนคร / indigo — natural indigo-dyed, slightly irregular hand-dyed texture

**17. `thai-contemporary_indigo_gold.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from naturally hand-dyed fabric with subtle irregular tonal variation typical of natural indigo dyeing, base tone shifted to gold (#C9A227) for this variant while retaining the soft mottled hand-dyed texture, matte finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**18. `thai-contemporary_indigo_red.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from naturally hand-dyed fabric with subtle irregular tonal variation typical of natural indigo dyeing, base tone shifted to deep red (#8B1A2D) for this variant while retaining the soft mottled hand-dyed texture, matte finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**19. `thai-contemporary_indigo_navy.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from naturally hand-dyed fabric with subtle irregular tonal variation typical of natural indigo dyeing, deep classic indigo navy tone (#1B2A4A), soft mottled hand-dyed texture, matte finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**20. `thai-contemporary_indigo_cream.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from naturally hand-dyed fabric with subtle irregular tonal variation typical of natural indigo dyeing, base tone shifted to light cream (#F5E6D3) for this variant while retaining the soft mottled hand-dyed texture, matte finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

### ลินิน / linen — linen weave, visible slubby texture, breathable look

**21. `thai-contemporary_linen_gold.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from breathable linen fabric in gold (#C9A227), visible natural slubby linen texture with slight looseness in the weave, soft matte finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**22. `thai-contemporary_linen_red.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from breathable linen fabric in deep red (#8B1A2D), visible natural slubby linen texture with slight looseness in the weave, soft matte finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**23. `thai-contemporary_linen_navy.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from breathable linen fabric in navy blue (#1B2A4A), visible natural slubby linen texture with slight looseness in the weave, soft matte finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

**24. `thai-contemporary_linen_cream.webp`**
> Thai woman wearing a tailored mandarin-collar blouse with long sleeves and wood buttons, made from breathable linen fabric in cream (#F5E6D3), visible natural slubby linen texture with slight looseness in the weave, soft matte finish, decorative trim along the collar edge. Same model, same pose, same studio lighting and background as reference, photorealistic fashion photography, not illustration, not CGI.

---

## After generating

Drop all 24 files into `frontend/public/studio/thai-dress/` using the exact filenames above (or tell me
whatever names you actually used) — the app will map `(pattern, color)` selections directly to
`thai-contemporary_{patternId}_{colorSlug}.webp` and swap the displayed photo on click, no regeneration
needed at runtime.

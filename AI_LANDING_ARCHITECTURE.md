# Vitrine — AI landing architecture

## Product direction

Vitrine should feel like a landing page that builds itself. The customer provides a short setup and up to 7 compressed photos. GPT-5.5 Vision analyzes the business context and images, then returns a safe JSON configuration that Vitrine renders with existing components.

## Minimal customer setup

The customer should only provide what the AI cannot reliably infer from photos:

- Business name
- Business type/category
- Short introduction in plain language
- City/address
- WhatsApp, email or booking link
- Opening hours
- Up to 7 photos

The short introduction is important because photos alone can be ambiguous. The setup gives truth/context; photos give visual style, evidence and layout clues.

## Image rules

- Compress in the browser before upload.
- Convert to WebP where possible.
- Target less than 200KB per image.
- Keep enough dimensions for web display.
- Store compressed assets in Supabase Storage.
- Save image metadata in `business_assets`.

## AI generation flow

1. Customer completes the small setup.
2. Customer uploads up to 7 photos.
3. Frontend compresses images.
4. Images are stored and registered as `business_assets`.
5. API creates an `ai_generation_logs` row with status `processing`.
6. GPT-5.5 Vision receives:
	 - setup summary,
	 - business category,
	 - contact goals,
	 - image URLs or base64 thumbnails,
	 - strict JSON schema instructions.
7. AI returns a JSON page config.
8. Server validates the JSON before saving.
9. Valid config is saved in `business_page_configs`.
10. Customer sees a preview and can edit before publishing/payment.

## Safe JSON contract

The model should not return HTML or arbitrary code. It should return structured configuration only:

```json
{
	"template": "food",
	"style": {
		"primaryColor": "#0F172A",
		"accentColor": "#D4AF37",
		"mood": "premium_warm"
	},
	"sections": ["hero", "about", "menu", "gallery", "reviews", "hours", "contact"],
	"copy": {
		"headline": "Fresh local flavor in a warm, welcoming space",
		"subheadline": "Reserve a table or message us on WhatsApp in seconds.",
		"primaryCta": "Book now",
		"secondaryCta": "View menu"
	},
	"photoRoles": {
		"hero": "asset-id-1",
		"about": "asset-id-2",
		"gallery": ["asset-id-3", "asset-id-4"]
	},
	"recommendations": [
		"Use the dining room image as the hero photo.",
		"Place menu highlights before reviews.",
		"Keep WhatsApp as the primary CTA."
	]
}
```

## OCR/menu flow

If uploaded images include a menu/cardápio:

1. AI detects the menu image.
2. AI extracts menu items into structured rows.
3. Server saves rows into `menu_items` with `source = 'ai_menu_ocr'`.
4. Customer reviews/edit items before publishing.

OCR output should support:

- item name,
- description,
- price,
- category,
- optional linked photo.

## Google Places flow

Google Places should be optional and cached:

1. Customer connects/searches a Google Place.
2. Store `place_id` in `google_places_connections`.
3. Fetch rating/reviews periodically.
4. Cache selected review data in Supabase.
5. Render cached reviews on the landing page.

Do not call Google Places on every public page view.

## Pricing model

- Base subscription: €12.90/month
- Extra page: €3/month
- AI generation/update: €1/use

Every AI generation should create an `ai_generation_logs` row with `cost_cents = 100`, even if billing is applied later. This keeps usage auditable.

## Current database additions

The Supabase schema now includes the foundation for this direction:

- `customers`
- `subscriptions`
- `business_assets`
- `business_page_configs`
- `ai_generation_logs`
- `menu_items`
- `google_places_connections`

## Implementation order

1. Apply updated `supabase-schema.sql` in Supabase.
2. Add image compression WebP target under 200KB.
3. Add upload UI limit of 7 photos.
4. Create API endpoint for asset registration.
5. Create AI generation endpoint.
6. Validate and save AI JSON config.
7. Render landing from `business_page_configs`.
8. Add menu OCR review screen.
9. Add Google Places cache.
10. Connect usage billing to `ai_generation_logs`.

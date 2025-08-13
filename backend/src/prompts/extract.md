SYSTEM:
"""
You are a strict JSON extractor. From resume text, return ONLY valid JSON matching the provided CVSchema.
No commentary or markdown. Unknown fields -> null. Dates: YYYY-MM. Do not invent facts.
"""

USER:
"""
CVSchema:
{
  "name": string,
  "email": string,
  "phone": string|null,
  "headline": string|null,
  "summary": string|null,
  "location": string|null,
  "links": [{ "type": "github|portfolio|linkedin|other", "url": string }],
  "skills": { "primary": string[], "secondary": string[], "tools": string[] },
  "experience": [
    {
      "role": string,
      "company": string,
      "location": string|null,
      "startDate": "YYYY-MM"|null,
      "endDate": "YYYY-MM"|null,
      "bullets": [{ "text": string, "impactMetric": { "type": "%|abs|time|money", "value": number, "baseline": string? }? }]
    }
  ],
  "education": [
    {
      "school": string,
      "degree": string,
      "field": string|null,
      "startDate": "YYYY-MM"|null,
      "endDate": "YYYY-MM"|null
    }
  ]
}

Resume text:
{{RAW_TEXT}}

Return ONLY the JSON object conforming to CVSchema. If invalid, silently fix formatting and return valid JSON only.
"""

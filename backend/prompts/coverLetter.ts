export function buildCoverLetterPrompt({
  lang,
  targetRole,
  company
}: {
  lang: "tr" | "en"
  targetRole: string
  company?: string
}) {
  if (lang === "tr") {
    return `Sen profesyonel bir kariyer koçu ve CV/ön yazı yazarı olarak hareket ediyorsun.
Kurallar:
- Yalnızca CV'deki gerçekleri kullan; yeni bilgi/iddia üretme.
- 3–4 paragraf, yalın ve profesyonel üslup; buzzword kullanma.
- Her paragraf somut, özgül; gereksiz süsleme yok.
- Dil tamamen Türkçe olmalı.

Amaç:
- Hedef rol: ${targetRole}
- ${company ? `Şirket: ${company}` : "Şirket: (genel)"}

Çıkış:
- Sadece düz metin ön yazı; başka bir şey ekleme.`
  }
  return `You are a professional career coach and cover letter writer.
Rules:
- Use only facts present in the CV; do not invent new information.
- 3–4 short paragraphs, professional and specific; avoid buzzwords.
- Each paragraph should be concrete and relevant to the role.
- Language must be English.

Goal:
- Target role: ${targetRole}
- ${company ? `Company: ${company}` : "Company: (general)"}

Output:
- Plain text cover letter only; nothing else.`
}

#!/usr/bin/env python3
"""
scale² Blog Build Script
Konvertiert Markdown-Artikel aus posts/ in fertige HTML-Seiten.
Generiert die Blog-Übersichtsseite und aktualisiert die Sitemap.
"""

import os
import re
import yaml
import markdown
from datetime import datetime
from pathlib import Path

# Pfade
BLOG_DIR = Path(__file__).parent
POSTS_DIR = BLOG_DIR / "posts"
TEMPLATE_PATH = BLOG_DIR / "template.html"
INDEX_TEMPLATE_PATH = BLOG_DIR / "index-template.html"
INDEX_OUTPUT_PATH = BLOG_DIR / "index.html"
SITEMAP_PATH = BLOG_DIR.parent / "sitemap.xml"
BASE_URL = "https://scale-square.com"


def parse_frontmatter(content: str) -> tuple[dict, str]:
    """Parsed YAML-Frontmatter und gibt Metadaten + Body zurück."""
    match = re.match(r'^---\s*\n(.*?)\n---\s*\n(.*)', content, re.DOTALL)
    if not match:
        raise ValueError("Kein gültiges Frontmatter gefunden")
    meta = yaml.safe_load(match.group(1))
    body = match.group(2)
    return meta, body


def format_date(date_str: str) -> str:
    """Konvertiert YYYY-MM-DD in deutsches Datumsformat."""
    dt = datetime.strptime(date_str, "%Y-%m-%d")
    months = [
        "Januar", "Februar", "März", "April", "Mai", "Juni",
        "Juli", "August", "September", "Oktober", "November", "Dezember"
    ]
    return f"{dt.day}. {months[dt.month - 1]} {dt.year}"


def estimate_reading_time(text: str) -> int:
    """Schätzt die Lesedauer in Minuten (200 Wörter/Min)."""
    words = len(text.split())
    return max(1, round(words / 200))


def build_article(md_path: Path, template: str) -> dict:
    """Baut einen einzelnen Artikel und gibt Metadaten zurück."""
    content = md_path.read_text(encoding="utf-8")
    meta, body = parse_frontmatter(content)

    # Markdown → HTML
    html_content = markdown.markdown(
        body,
        extensions=["extra", "codehilite", "toc", "smarty"],
        extension_configs={
            "smarty": {"smart_quotes": False}
        }
    )

    # Platzhalter ersetzen
    date_formatted = format_date(meta["date"])
    date_iso = meta["date"]
    reading_time = estimate_reading_time(body)

    html = template
    html = html.replace("{{title}}", meta["title"])
    html = html.replace("{{slug}}", meta["slug"])
    html = html.replace("{{description}}", meta["description"])
    html = html.replace("{{keywords}}", meta.get("keywords", ""))
    html = html.replace("{{category}}", meta.get("category", "Allgemein"))
    html = html.replace("{{date}}", date_formatted)
    html = html.replace("{{date_iso}}", date_iso)
    html = html.replace("{{content}}", html_content)

    # HTML-Datei schreiben
    output_path = BLOG_DIR / f"{meta['slug']}.html"
    output_path.write_text(html, encoding="utf-8")
    print(f"  ✓ {meta['slug']}.html ({reading_time} Min. Lesezeit)")

    return {
        "title": meta["title"],
        "slug": meta["slug"],
        "date": meta["date"],
        "date_formatted": date_formatted,
        "description": meta["description"],
        "category": meta.get("category", "Allgemein"),
        "keywords": meta.get("keywords", ""),
        "reading_time": reading_time,
    }


def build_article_card(article: dict) -> str:
    """Generiert eine Blog-Karte für die Übersichtsseite."""
    return f'''            <a href="{article['slug']}.html" class="blog-card reveal">
                <div class="blog-card-image-placeholder">
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
                        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                        <polyline points="14 2 14 8 20 8"/>
                        <line x1="16" y1="13" x2="8" y2="13"/>
                        <line x1="16" y1="17" x2="8" y2="17"/>
                        <polyline points="10 9 9 9 8 9"/>
                    </svg>
                </div>
                <div class="blog-card-body">
                    <div class="blog-card-meta">
                        <span class="blog-card-category">{article['category']}</span>
                        <span class="blog-card-date">{article['date_formatted']}</span>
                    </div>
                    <h2 class="blog-card-title">{article['title']}</h2>
                    <p class="blog-card-description">{article['description']}</p>
                    <div class="blog-card-footer">
                        <span class="blog-card-readtime">{article['reading_time']} Min. Lesezeit</span>
                        <svg class="blog-card-arrow" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </div>
                </div>
            </a>'''


def build_index(articles: list, template: str):
    """Generiert die Blog-Übersichtsseite."""
    # Artikel nach Datum sortieren (neueste zuerst)
    articles_sorted = sorted(articles, key=lambda a: a["date"], reverse=True)

    cards_html = "\n".join(build_article_card(a) for a in articles_sorted)
    html = template.replace("{{articles}}", cards_html)

    INDEX_OUTPUT_PATH.write_text(html, encoding="utf-8")
    print(f"  ✓ index.html ({len(articles)} Artikel)")


def update_sitemap(articles: list):
    """Aktualisiert die Sitemap mit Blog-URLs."""
    if not SITEMAP_PATH.exists():
        print("  ⚠ Keine sitemap.xml gefunden, überspringe...")
        return

    sitemap = SITEMAP_PATH.read_text(encoding="utf-8")
    today = datetime.now().strftime("%Y-%m-%d")

    # Bestehende Blog-Einträge entfernen
    sitemap = re.sub(
        r'\s*<url>\s*<loc>https://scale-square\.com/blog/.*?</url>',
        '',
        sitemap,
        flags=re.DOTALL
    )

    # Neue Blog-Einträge vor </urlset> einfügen
    blog_entries = []

    # Blog-Übersichtsseite
    blog_entries.append(f"""    <url>
        <loc>{BASE_URL}/blog/</loc>
        <lastmod>{today}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
    </url>""")

    # Einzelne Artikel
    for article in sorted(articles, key=lambda a: a["date"], reverse=True):
        blog_entries.append(f"""    <url>
        <loc>{BASE_URL}/blog/{article['slug']}.html</loc>
        <lastmod>{article['date']}</lastmod>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
    </url>""")

    entries_str = "\n".join(blog_entries)
    sitemap = sitemap.replace("</urlset>", f"{entries_str}\n</urlset>")

    SITEMAP_PATH.write_text(sitemap, encoding="utf-8")
    print(f"  ✓ sitemap.xml aktualisiert ({len(blog_entries)} Blog-URLs)")


def main():
    print("\n🔨 scale² Blog Build\n" + "=" * 40)

    # Templates laden
    if not TEMPLATE_PATH.exists():
        print("❌ template.html nicht gefunden!")
        return
    if not INDEX_TEMPLATE_PATH.exists():
        print("❌ index-template.html nicht gefunden!")
        return

    template = TEMPLATE_PATH.read_text(encoding="utf-8")
    index_template = INDEX_TEMPLATE_PATH.read_text(encoding="utf-8")

    # Markdown-Dateien finden
    md_files = sorted(POSTS_DIR.glob("*.md"))
    if not md_files:
        print("⚠ Keine Markdown-Dateien in posts/ gefunden.")
        return

    print(f"\n📝 {len(md_files)} Artikel gefunden\n")

    # Artikel bauen
    articles = []
    for md_path in md_files:
        try:
            article = build_article(md_path, template)
            articles.append(article)
        except Exception as e:
            print(f"  ✗ Fehler bei {md_path.name}: {e}")

    # Index generieren
    print(f"\n📋 Übersichtsseite generieren\n")
    build_index(articles, index_template)

    # Sitemap aktualisieren
    print(f"\n🗺️  Sitemap aktualisieren\n")
    update_sitemap(articles)

    print(f"\n✅ Build abgeschlossen! {len(articles)} Artikel generiert.\n")


if __name__ == "__main__":
    main()

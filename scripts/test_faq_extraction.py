import unittest
from types import SimpleNamespace
from unittest.mock import patch

from faq_extraction import chunk_sections, extract_html, extract_pdf, require_official_url, Section
from ingest_faq import assess, sources


class FaqExtractionTest(unittest.TestCase):
    def test_collapsed_answer_beats_duplicate_jsonld_and_excludes_navigation(self):
        source = b"""
        <script type="application/ld+json">
        {"@type":"FAQPage","mainEntity":[{"name":"What is the allowance?",
        "acceptedAnswer":{"text":"Duplicated summary"}}]}
        </script>
        <main><h1>Travel FAQ</h1><nav><p>Unrelated navigation</p></nav>
        <div class="cmp-accordion__item"><button class="cmp-accordion__button">
        What is the allowance?</button><div aria-hidden="true" hidden><p>It varies by route.</p>
        <table><tr><th>Cabin</th><th>Weight</th></tr>
        <tr><td>Economy</td><td>7 kg</td></tr></table></div></div></main>
        """
        sections = extract_html(source, "Travel FAQ")
        self.assertEqual(len(sections), 1)
        self.assertTrue(sections[0].question)
        self.assertIn("It varies by route.", sections[0].text)
        self.assertIn("Cabin: Economy | Weight: 7 kg", sections[0].text)
        self.assertNotIn("Duplicated summary", sections[0].text)
        self.assertNotIn("Unrelated navigation", sections[0].text)

    def test_cargo_button_heading_keeps_the_answer(self):
        source = b"""
        <body><p>Promotional chrome</p><h1>FAQ</h1><h2>Booking</h2>
        <h3 class="accordion-header"><button class="accordion-button">How do I book?</button></h3>
        <div class="collapse"><p>Contact the cargo booking team.</p></div></body>
        """
        self.assertEqual(extract_html(source, "Cargo"), [
            Section("How do I book?", "Contact the cargo booking team.", question=True),
        ])

    def test_pdf_keeps_page_number_and_article_heading(self):
        pages = [
            SimpleNamespace(extract_text=lambda **_: "Table of contents"),
            SimpleNamespace(extract_text=lambda **_: (
                "Air India Limited - Conditions of Carriage\nArticle 11 - REFUNDS\n"
                "11.3 INVOLUNTARY REFUNDS\nThis paragraph describes the conditions for a refund after a disruption.\nPage 2 of 3"
            )),
            SimpleNamespace(extract_text=lambda **_: (
                "This continuation gives further details about refund eligibility and acceptable forms of proof."
            )),
        ]
        with patch("faq_extraction.PdfReader", return_value=SimpleNamespace(is_encrypted=False, pages=pages)):
            chunks = chunk_sections(extract_pdf(b"unused", "Conditions", {1}))
        self.assertEqual([chunk["page_number"] for chunk in chunks], [2, 3])
        self.assertTrue(all(chunk["section_title"] == "11.3 INVOLUNTARY REFUNDS" for chunk in chunks))
        self.assertNotIn("Page 2 of 3", chunks[0]["content"])

    def test_pdf_rejects_page_with_no_text_layer(self):
        page = SimpleNamespace(extract_text=lambda **_: None)
        with patch("faq_extraction.PdfReader", return_value=SimpleNamespace(is_encrypted=False, pages=[page])):
            with self.assertRaisesRegex(ValueError, "page 1"):
                extract_pdf(b"unused", "Scan", set())

    def test_manifest_covers_cargo_articles_instead_of_the_directory(self):
        manifest, _ = sources()
        ids = {item["id"] for item in manifest}
        self.assertIn("cargo-booking", ids)
        self.assertIn("cargo-tracking", ids)
        self.assertIn("conditions-of-carriage", ids)
        self.assertNotIn("cargo", ids)
        self.assertEqual(len(ids), len(manifest))

    def test_coverage_rejects_an_index_page_with_no_answers(self):
        with self.assertRaisesRegex(ValueError, "complete FAQ questions"):
            assess({"id": "booking"}, {
                "questions": 0,
                "chunks": [{"section_title": "Booking", "content": "Navigation item " * 20, "page_number": None}],
            })

    def test_foreign_redirect_destination_is_not_approved(self):
        with self.assertRaises(ValueError):
            require_official_url("https://www.airindia.com.example.test/faq.html")

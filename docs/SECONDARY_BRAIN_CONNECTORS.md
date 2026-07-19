# Exovia NeuroCanvas — Secondary Brain Connectors

Status: IMPLEMENTED / RUNTIME VALIDATION PENDING

## Goal

Unify research, personal notes, linked Markdown vaults and PDF evidence inside NeuroCanvas without copying the external products themselves. Exovia uses their strongest interoperability patterns as input mechanisms while keeping its own graph, persistence, audit and evidence model.

## Wikipedia connector

- Searches Wikipedia through the MediaWiki REST API.
- Imports article text through the MediaWiki Action API.
- Stores language, page ID, canonical URL, retrieval timestamp and attribution metadata.
- Places imported articles under a dedicated research collection.
- Requires an internet connection.
- Imported content remains locally navigable after it enters the project and is saved.

## Joplin-compatible Markdown import

Joplin can export notebooks as Markdown directories. NeuroCanvas imports those files as a collection while preserving:

- note title;
- relative folder path;
- hashtags;
- original Markdown text;
- source format metadata.

JEX archives are not parsed directly in the browser. Export them from Joplin as Markdown first, or unpack them using a trusted desktop workflow.

## Obsidian-compatible vault import

NeuroCanvas imports a selected Markdown directory and reconstructs common Obsidian-style `[[wikilinks]]` as graph edges.

Current support:

- Markdown and text files;
- nested directory paths through `webkitRelativePath`;
- headings as note titles;
- hashtags;
- wikilinks with aliases and heading fragments;
- graph connections between notes whose titles match link targets.

Planned hardening:

- YAML front matter;
- embeds and transclusions;
- block references;
- aliases from front matter;
- unresolved-link nodes;
- backlink panel.

## Interactive PDF knowledge

The PDF workspace uses PDF.js when network access allows the pinned module to load.

Implemented flow:

1. Select a local PDF.
2. Render pages in-browser.
3. Navigate previous and next pages.
4. Extract page text locally through PDF.js.
5. Create one parent PDF node.
6. Create one evidence node per page.
7. Store filename and exact page number in metadata.
8. Search and navigate extracted page evidence through NeuroCanvas.

Fallback:

If PDF.js cannot load, NeuroCanvas attempts a native browser PDF preview and can attach the source metadata, but it cannot guarantee text extraction.

## Privacy and safety

- Markdown and PDF files are processed locally in the browser.
- Wikipedia is the only connector in this module that sends a query to a remote service.
- No Joplin or Obsidian account credentials are requested.
- No external vault is modified.
- Imported notes are copied into the active NeuroCanvas project; source files remain untouched.
- Source metadata must remain visible and auditable.

## Validation matrix

- [ ] Wikipedia search works in Spanish and English.
- [ ] Imported article includes URL and attribution metadata.
- [ ] Markdown directory import works on Chromium desktop.
- [ ] Mobile browsers expose a usable directory or multi-file fallback.
- [ ] Wikilinks become graph edges.
- [ ] Joplin Markdown export preserves notebook paths.
- [ ] PDF renders at least one page.
- [ ] PDF text extraction creates one node per page.
- [ ] Search finds text from an imported PDF page.
- [ ] Imported source persists after reload.
- [ ] Export and re-import preserve source metadata.
- [ ] Offline mode clearly distinguishes cached knowledge from unavailable network connectors.

## Official interoperability references

- MediaWiki Action and REST APIs.
- Joplin Markdown import/export documentation.
- Obsidian Markdown vault and wikilink conventions.
- Mozilla PDF.js display layer and viewer guidance.

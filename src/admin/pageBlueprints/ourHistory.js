/**
 * Our History — an opening account, then the roadmap of phases below it.
 *
 * Both halves live in the one `milestones` section because they are one piece
 * of content: the account sets up the phases that follow it.
 */
const story = {
  key: "story",
  type: "group",
  label: "Opening account",
  hint: "The opening account appears above the dark, horizontally scrollable timeline.",
  fields: [
    { key: "eyebrow", type: "text", label: "Small line above the heading" },
    { key: "heading", type: "text", label: "Heading", placeholder: "The Journey So Far" },
    { key: "subheading", type: "textarea", label: "Line under the heading", rows: 2 },
    {
      key: "lead",
      type: "textarea",
      label: "Opening sentence",
      rows: 3,
      hint: "Set larger and darker than the rest, as the way into the page.",
    },
    {
      key: "paras",
      type: "textlist",
      label: "Paragraphs",
      rows: 6,
      hint: "The first one gets the large green initial, so long as it runs past a couple of lines.",
    },
    { key: "quote", type: "textarea", label: "Pull quote", rows: 4 },
    { key: "quoteAttrib", type: "text", label: "Who said it" },
    {
      key: "stats",
      type: "list",
      label: "Figures beside the heading",
      itemNoun: "figure",
      itemTitle: (item, i) => item.value || `Figure ${i + 1}`,
      blank: () => ({ value: "", label: "" }),
      fields: [
        { key: "value", type: "text", label: "Figure", placeholder: "$34m" },
        { key: "label", type: "text", label: "What it counts", placeholder: "Programme value" },
      ],
    },
  ],
};

export default {
  label: "Our History",
  summary:
    "An opening account with its heading pinned to the left, then the roadmap of phases running down a single line below it.",
  sections: [
    {
      type: "milestones",
      label: "The page",
      fields: [
        { key: "heroImage", type: "image", label: "Opening image" },
        story,
        { key: "timelineEyebrow", type: "text", label: "Small line above the roadmap" },
        { key: "timelineHeading", type: "textarea", label: "Roadmap heading", rows: 2 },
        {
          key: "milestones",
          type: "list",
          label: "Phases",
          itemNoun: "phase",
          hint: "Phases appear as animated cards in the horizontally scrollable roadmap. Add, remove, reorder, and edit each phase here.",
          itemTitle: (item, i) => item.title || item.year || `Phase ${i + 1}`,
          blank: () => ({ title: "", image: null, paras: [""] }),
          fields: [
            {
              key: "title",
              type: "text",
              label: "Title",
              hint: "Left empty — or left as “Phase 3” — only the numbered label shows.",
            },
            {
              key: "year",
              type: "text",
              label: "Year",
              hint: "Fill this in only for the closing phase. It is set large and green, across the full width.",
            },
            {
              key: "image",
              type: "image",
              label: "Image",
              hint: "Shown beside the phase text. If left empty, the timeline uses the first phase image as a shared placeholder.",
            },
            { key: "paras", type: "textlist", label: "Text", rows: 5 },
          ],
        },
        {
          key: "links",
          type: "list",
          label: "Links below the roadmap",
          itemNoun: "link",
          itemTitle: (item, i) => item.label || `Link ${i + 1}`,
          blank: () => ({ label: "", url: "" }),
          fields: [
            { key: "label", type: "textarea", label: "Label", rows: 2 },
            { key: "url", type: "text", label: "Link", placeholder: "/knowledge-hub" },
          ],
        },
      ],
    },
  ],
};

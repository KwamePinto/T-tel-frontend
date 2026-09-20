/**
 * Who We Are — the three bands below the hero, in the order they appear.
 */
export default {
  label: "Who We Are",
  summary: "The three bands below the hero, in the order they appear on the page.",
  sections: [
    {
      type: "identity",
      label: "Opening statement",
      fields: [
        { key: "eyebrow", type: "text", label: "Small line above the heading" },
        { key: "heading", type: "textarea", label: "Heading", rows: 2 },
        {
          key: "highlight",
          type: "text",
          label: "Word to pick out in green",
          hint: "Must match a word in the heading exactly, or nothing is highlighted.",
        },
        {
          key: "lead",
          type: "textarea",
          label: "Opening paragraph",
          rows: 4,
          hint: "The bold paragraph in the right-hand column.",
        },
        { key: "body", type: "textlist", label: "Paragraphs after it", rows: 4 },
      ],
    },
    {
      type: "visionMission",
      label: "Vision & Mission",
      fields: [
        { key: "visionEyebrow", type: "text", label: "Vision label" },
        { key: "vision", type: "textarea", label: "Vision", rows: 2 },
        { key: "missionEyebrow", type: "text", label: "Mission label" },
        { key: "mission", type: "textarea", label: "Mission", rows: 3 },
        {
          key: "steps",
          type: "textlist",
          label: "Supporting points",
          itemNoun: "point",
          rows: 2,
        },
      ],
    },
    {
      type: "principles",
      label: "Operating principles",
      fields: [
        { key: "eyebrow", type: "text", label: "Small line above the heading" },
        { key: "heading", type: "text", label: "Heading" },
        {
          key: "principles",
          type: "list",
          label: "Principles",
          itemNoun: "principle",
          itemTitle: (item, i) => item.title || `Principle ${i + 1}`,
          blank: () => ({ title: "", body: "" }),
          fields: [
            { key: "title", type: "textarea", label: "Title", rows: 2 },
            { key: "body", type: "textarea", label: "Text", rows: 4 },
          ],
        },
      ],
    },
  ],
};

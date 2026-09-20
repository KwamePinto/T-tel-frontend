/**
 * Our History — the phase-by-phase timeline rendered by HistoryPhases.
 */
export default {
  label: "Our History",
  summary:
    "The timeline down the middle of the page. Each phase is a step on the bracket; hovering one on the site opens its panel.",
  sections: [
    {
      type: "milestones",
      label: "Timeline",
      fields: [
        {
          key: "heroImage",
          type: "image",
          label: "Opening image",
          hint: "Sits above the timeline, at the top of the page.",
        },
        {
          key: "milestones",
          type: "list",
          label: "Phases",
          itemNoun: "phase",
          itemTitle: (item, i) => item.title || `Phase ${i + 1}`,
          blank: () => ({ title: "", image: null, paras: [""] }),
          fields: [
            { key: "title", type: "text", label: "Title", placeholder: "Phase 1" },
            {
              key: "image",
              type: "image",
              label: "Image",
              hint: "Shown in the panel that opens on hover. Leave empty for a text-only phase.",
            },
            {
              key: "paras",
              type: "textlist",
              label: "Text",
              rows: 5,
              hint: "One box per paragraph.",
            },
          ],
        },
        {
          key: "links",
          type: "list",
          label: "Links below the timeline",
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

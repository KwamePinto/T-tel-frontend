import aboutUs from "./aboutUs";
import ourHistory from "./ourHistory";

/**
 * What each special page's editor shows.
 *
 * A special page is one with a coded component of its own, so its editor can
 * only honestly offer the fields that component actually reads — the promise
 * being that anything you can edit here changes something on the page, and
 * anything on the page that an admin can change is editable here. A blueprint
 * is how that promise is written down.
 *
 * ── Adding a special page ──────────────────────────────────────────────────
 *  1. Build the component and give it a route in App.jsx.
 *  2. Have it read its content from its Page record — structured content from
 *     `sections`, hero and SEO from `heroImage`/`meta` (CmsHero does the
 *     latter for you).
 *  3. Add a blueprint here, keyed by slug, describing those fields.
 *  4. Add the slug to SPECIAL_SLUGS in the backend's scripts/classifyPages.js
 *     and run it.
 *
 * Field types available: text, textarea, richtext, image, textlist (a list of
 * strings) and list (a list of objects, each with its own `fields`). See
 * BlueprintFields.jsx.
 *
 * A blueprint describes only the fields worth showing. Anything stored but not
 * declared is left untouched on save, so a component can keep reading values
 * that nobody edits by hand.
 */

const defaults = {
  /** hero image and hero text in the rail — every page has a hero */
  hero: true,
  /** the Content rich-text box. Off for special pages: their text lives in
   *  `sections`, and a box that renders nowhere is exactly the confusion this
   *  split exists to end. */
  body: false,
  sections: [],
  managedIn: [],
  /** Every special page falls back to an image chosen in its design when none
   *  is set here, so an empty hero image is a real state rather than a gap. */
  heroNote: "With no image chosen, the page keeps the one from its design.",
};

/** A page that is a list of something kept elsewhere — documents, people,
 *  posts. Its own editable content is the hero, and the rest is a signpost so
 *  nobody hunts for the cards on the wrong screen. */
const listing = (label, { of, to, summary }) => ({
  label,
  summary:
    summary ||
    `This page only controls the page shell: the hero, heading, SEO and top-level layout. The actual ${of.toLowerCase()} are edited in Posts and must be created/updated there.`,
  managedIn: [{ label: of, to }],
});

const BLUEPRINTS = {
  "about-us": aboutUs,
  "about-us/our-history": ourHistory,

  "about-us/our-partners": {
    label: "Our Partners",
    summary: "Edit the introduction and the headings/order of partner groups. Partner cards are managed in Partners.",
    sections: [
      {
        type: "partnerIntro",
        label: "Working Together introduction",
        fields: [
          { key: "eyebrow", type: "text", label: "Small line above the text" },
          { key: "body", type: "textarea", label: "Introduction", rows: 4 },
        ],
      },
      {
        type: "partnerGroups",
        label: "Partner group presentation",
        hint: "The groups and partner records are editable from Partner Groups and Partners.",
        fields: [
          {
            key: "items",
            type: "list",
            label: "Groups shown on this page",
            itemNoun: "group",
            itemTitle: (item, i) => item.title || `Group ${i + 1}`,
            blank: () => ({ key: "", title: "" }),
            fields: [
              { key: "key", type: "text", label: "Group slug", hint: "Must match the Partner Group slug." },
              { key: "title", type: "text", label: "Heading shown on the page" },
            ],
          },
        ],
      },
    ],
    managedIn: [
      { label: "Partner Groups", to: "/admin/partner-groups" },
      { label: "Partners", to: "/admin/partners" },
    ],
  },

  "about-us/our-people": listing("Our People", { of: "People", to: "/admin/people" }),
  "about-us/our-policies": listing("Our Policies", { of: "Documents", to: "/admin/documents" }),
  "focus-areas": listing("Focus Areas", { of: "Focus Areas", to: "/admin/posts" }),
  programmes: listing("Programmes", { of: "Programmes", to: "/admin/posts" }),
  "knowledge-hub": listing("Knowledge Hub", { of: "Documents", to: "/admin/documents" }),
  "news-and-media": listing("News & Media", { of: "Posts", to: "/admin/posts" }),
  "contact-us": listing("Contact Us", {
    of: "Contact details",
    to: "/admin/theme",
    summary:
      "The hero at the top of the page. The address, phone numbers and map come from Theme settings, and messages sent through the form arrive under Forms.",
  }),
  "join-us": {
    label: "Join Us",
    summary: "The hero at the top of the page. The rest of this page is fixed in the design.",
      sections: [
        {
          type: "joinIntro",
          label: "Careers introduction",
          fields: [
            { key: "eyebrow", type: "text", label: "Eyebrow" },
            { key: "title", type: "text", label: "Title" },
            { key: "accent", type: "text", label: "Highlighted title word" },
            { key: "lead", type: "textarea", label: "Introduction", rows: 4 },
          ],
        },
        {
          type: "joinValues",
          label: "What we value",
          fields: [
            {
              key: "items", type: "list", label: "Values", itemNoun: "value",
              itemTitle: (item, i) => item.title || `Value ${i + 1}`,
              blank: () => ({ n: "", accent: "green", title: "", body: "" }),
              fields: [
                { key: "n", type: "text", label: "Number" },
                { key: "accent", type: "text", label: "Colour token" },
                { key: "title", type: "text", label: "Title" },
                { key: "body", type: "textarea", label: "Text", rows: 3 },
              ],
            },
          ],
        },
        {
          type: "joinRoles",
          label: "Available positions",
          fields: [
            {
              key: "groups", type: "list", label: "Role groups", itemNoun: "group",
              itemTitle: (item, i) => item.group || `Group ${i + 1}`,
              blank: () => ({ group: "", roles: [""] }),
              fields: [
                { key: "group", type: "text", label: "Group name" },
                { key: "roles", type: "textlist", label: "Roles", itemNoun: "role", rows: 2 },
              ],
            },
          ],
        },
        {
          type: "joinSafeguarding",
          label: "Safeguarding commitment",
          fields: [
            { key: "title", type: "text", label: "Title" },
            { key: "body", type: "textarea", label: "Text", rows: 5 },
          ],
        },
        {
          type: "joinCta",
          label: "Closing note",
          fields: [{ key: "spec", type: "textarea", label: "Speculative application note", rows: 3 }],
        },
      ],
  },

  home: {
    label: "Home",
    summary:
      "The home page is built from Theme settings rather than from this record — the hero video and heading, the Who We Are band, the strategic objective cards and every section heading are all there. The articles, focus areas and funders it lists come from their own sections.",
    hero: false,
    managedIn: [
      { label: "Theme settings", to: "/admin/theme" },
      { label: "Posts", to: "/admin/posts" },
      { label: "Partners", to: "/admin/partners" },
    ],
  },
};

export function getBlueprint(slug) {
  const blueprint = BLUEPRINTS[slug];
  return blueprint ? { ...defaults, ...blueprint } : null;
}

export default BLUEPRINTS;

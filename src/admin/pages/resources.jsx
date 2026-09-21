import { api } from "../lib/api";
import ResourceManager, { col } from "../components/ResourceManager";

/* Every straightforward CRUD screen is declared here rather than hand-written,
   so the labels, ordering and behaviour stay identical across the dashboard. */

const PUBLISH_PILLS = [
  { value: "all", label: "All" },
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

/* ------------------------------------------------------------ Content Types */
export const ContentTypes = () => (
  <ResourceManager
    config={{
      title: "Content Types",
      subtitle: "Post types such as Blog, Focus Areas and Programmes.",
      singular: "Content Type",
      resource: api.contentTypes,
      columns: [
        { key: "name", label: "Name", render: col.title("name", "slug") },
        { key: "description", label: "Description", render: col.text("description") },
        { key: "isActive", label: "Status", render: (i) => col.bool("isActive", "Active", "Inactive")(i) },
      ],
      fields: [
        { name: "name", label: "Name", required: true, placeholder: "Focus Areas" },
        { name: "slug", label: "Slug", hint: "Used in URLs. Leave blank to generate it from the name." },
        { name: "description", label: "Description", type: "textarea", rows: 3 },
        { name: "isActive", label: "Active", type: "toggle", hint: "Inactive types are hidden from the post editor." },
      ],
      defaults: { isActive: true },
    }}
  />
);

/* -------------------------------------------------------------- Our People */
export const People = () => (
  <ResourceManager
    config={{
      title: "Our People",
      subtitle: "Board, leadership and team profiles.",
      singular: "Person",
      resource: api.people,
      statusPills: PUBLISH_PILLS,
      pageSize: 30,
      filters: [{ key: "group", label: "All groups", source: "personGroups" }],
      columns: [
        { key: "photo", label: "", render: col.image("photo") },
        { key: "name", label: "Name", render: col.title("name", "position") },
        { key: "group", label: "Group", render: col.ref("group") },
        { key: "tag", label: "Tag", render: col.text("tag") },
        { key: "status", label: "Status", render: col.status() },
      ],
      fields: [
        { name: "name", label: "Full name", required: true },
        { name: "position", label: "Position", placeholder: "Chief Executive Officer" },
        { name: "group", label: "Group", type: "ref", source: "personGroups", required: true },
        { name: "photo", label: "Photo", type: "media" },
        { name: "bio", label: "Biography", type: "richtext", placeholder: "A short profile…" },
        { name: "email", label: "Email", type: "email" },
        { name: "linkedin", label: "LinkedIn URL", type: "url" },
        { name: "tag", label: "Ribbon label", hint: "Optional badge on the card, e.g. “Leadership”." },
        { name: "sortOrder", label: "Sort order", type: "number", hint: "Lower numbers appear first." },
        { name: "status", label: "Status", type: "select", options: ["draft", "published"] },
      ],
      defaults: { status: "published", sortOrder: 0 },
    }}
  />
);

export const PersonGroups = () => (
  <ResourceManager
    config={{
      title: "People Groups",
      subtitle: "The sections Our People is split into.",
      singular: "Group",
      resource: api.personGroups,
      columns: [
        { key: "name", label: "Name", render: col.title("name", "slug") },
        { key: "description", label: "Description", render: col.text("description") },
        { key: "sortOrder", label: "Order" },
      ],
      fields: [
        { name: "name", label: "Name", required: true, placeholder: "Board of Directors" },
        { name: "description", label: "Description", type: "textarea", rows: 3 },
        { name: "sortOrder", label: "Sort order", type: "number" },
      ],
    }}
  />
);

/* --------------------------------------------------------------- Partners */
export const Partners = () => (
  <ResourceManager
    config={{
      title: "Partners",
      subtitle: "Funders and collaborating institutions.",
      singular: "Partner",
      resource: api.partners,
      pageSize: 30,
      filters: [{
        key: "groups",
        label: "All groups",
        source: "partnerGroups", sourceValue: "slug",
      }],
      columns: [
        { key: "logo", label: "", render: col.image("logo") },
        { key: "name", label: "Name", render: col.title("name") },
        { key: "groups", label: "Groups", render: col.list("groups") },
        { key: "showOnHome", label: "On homepage", render: col.bool("showOnHome") },
        { key: "url", label: "Website", render: col.text("url") },
      ],
      fields: [
        { name: "name", label: "Name", required: true },
        {
          name: "groups",
          label: "Groups",
          type: "checkboxes",
          source: "partnerGroups",
          sourceValue: "slug",
          legacy: "group",
          required: true,
          hint: "Tick every section this partner belongs to — one partner can appear under several.",
        },
        { name: "logo", label: "Logo", type: "media", hint: "A transparent PNG or SVG works best." },
        { name: "description", label: "Description", type: "textarea", rows: 3 },
        { name: "url", label: "Website", type: "url", placeholder: "https://" },
        { name: "isPrincipal", label: "Principal partner", type: "toggle", hint: "Shown larger, ahead of the others." },
        { name: "showOnHome", label: "Show on the homepage", type: "toggle" },
        { name: "sortOrder", label: "Sort order", type: "number" },
      ],
      defaults: { groups: ["funder"], showOnHome: true },
    }}
  />
);

export const PartnerGroups = () => (
  <ResourceManager
    config={{
      title: "Partner Groups",
      subtitle: "The sections used to organize partners on the website.",
      singular: "Partner group",
      resource: api.partnerGroups,
      columns: [
        { key: "name", label: "Name", render: col.title("name", "slug") },
        { key: "description", label: "Description", render: col.text("description") },
        { key: "sortOrder", label: "Order" },
      ],
      fields: [
        { name: "name", label: "Name", required: true },
        { name: "description", label: "Description", type: "textarea", rows: 3 },
        { name: "sortOrder", label: "Sort order", type: "number" },
      ],
      defaults: { sortOrder: 0 },
    }}
  />
);

/* ---------------------------------------------------------- Knowledge Hub */
export const Documents = () => (
  <ResourceManager
    config={{
      title: "Knowledge Hub",
      subtitle: "Reports, toolkits and policy documents available for download.",
      singular: "Document",
      resource: api.documents,
      statusPills: PUBLISH_PILLS,
      pageSize: 30,
      filters: [{ key: "category", label: "All collections", source: "documentCategories" }],
      columns: [
        { key: "thumbnail", label: "", render: col.image("thumbnail") },
        { key: "title", label: "Title", render: col.title("title") },
        { key: "category", label: "Collection", render: col.ref("category") },
        { key: "year", label: "Year" },
        { key: "downloads", label: "Downloads" },
        { key: "status", label: "Status", render: col.status() },
      ],
      fields: [
        { name: "title", label: "Title", required: true },
        { name: "category", label: "Collection", type: "ref", source: "documentCategories" },
        { name: "file", label: "File (PDF)", type: "media", hint: "Upload the PDF through the Media Library." },
        { name: "thumbnail", label: "Cover image", type: "media" },
        { name: "description", label: "Description", type: "textarea", rows: 4 },
        { name: "year", label: "Year", type: "number", placeholder: "2025" },
        { name: "sortOrder", label: "Sort order", type: "number" },
        { name: "status", label: "Status", type: "select", options: ["draft", "published"] },
      ],
      defaults: { status: "published" },
    }}
  />
);

export const DocumentCategories = () => (
  <ResourceManager
    config={{
      title: "Collections",
      subtitle: "How Knowledge Hub documents are grouped.",
      singular: "Collection",
      resource: api.documentCategories,
      columns: [
        { key: "name", label: "Name", render: col.title("name", "slug") },
        { key: "description", label: "Description", render: col.text("description") },
        { key: "sortOrder", label: "Order" },
      ],
      fields: [
        { name: "name", label: "Name", required: true },
        { name: "parent", label: "Parent collection", type: "ref", source: "documentCategories",
          hint: "Leave empty for a top-level collection. Teacher Education holds the B.Ed. and college collections." },
        { name: "description", label: "Description", type: "textarea", rows: 3 },
        { name: "sortOrder", label: "Sort order", type: "number" },
      ],
    }}
  />
);

/* ----------------------------------------------------------------- Events */
export const Events = () => (
  <ResourceManager
    config={{
      title: "All Events",
      subtitle: "Workshops, launches and convenings.",
      singular: "Event",
      resource: api.events,
      pageSize: 30,
      statusPills: [
        { value: "all", label: "All" },
        { value: "published", label: "Published" },
        { value: "draft", label: "Draft" },
        { value: "cancelled", label: "Cancelled" },
      ],
      filters: [{ key: "category", label: "All categories", source: "eventCategories" }],
      columns: [
        { key: "title", label: "Title", render: col.title("title", "location") },
        { key: "category", label: "Category", render: col.ref("category") },
        { key: "startAt", label: "Starts", render: col.date("startAt") },
        { key: "isFeatured", label: "Featured", render: col.bool("isFeatured") },
        { key: "status", label: "Status", render: col.status() },
      ],
      fields: [
        { name: "title", label: "Title", required: true },
        { name: "category", label: "Category", type: "ref", source: "eventCategories" },
        { name: "startAt", label: "Starts", type: "datetime", required: true },
        { name: "endAt", label: "Ends", type: "datetime" },
        { name: "location", label: "Location", placeholder: "Accra, Ghana" },
        { name: "address", label: "Address", type: "textarea", rows: 2 },
        { name: "coverImage", label: "Cover image", type: "media" },
        { name: "excerpt", label: "Summary", type: "textarea", rows: 3 },
        { name: "description", label: "Description", type: "richtext" },
        { name: "capacity", label: "Capacity", type: "number" },
        {
          name: "regType", label: "Registration", type: "select",
          options: [
            { value: "none", label: "No registration" },
            { value: "form", label: "Use a form on the site" },
            { value: "url", label: "Link to an external page" },
          ],
        },
        { name: "form", label: "Registration form", type: "ref", source: "forms", when: (f) => f.regType === "form" },
        { name: "registrationUrl", label: "Registration URL", type: "url", when: (f) => f.regType === "url" },
        { name: "isFeatured", label: "Feature this event", type: "toggle" },
        { name: "status", label: "Status", type: "select", options: ["draft", "published", "cancelled"] },
      ],
      defaults: { status: "draft", regType: "none" },
    }}
  />
);

export const EventCategories = () => (
  <ResourceManager
    config={{
      title: "Categories",
      subtitle: "Event categories.",
      singular: "Category",
      resource: api.eventCategories,
      columns: [
        { key: "name", label: "Name", render: col.title("name", "slug") },
        { key: "description", label: "Description", render: col.text("description") },
      ],
      fields: [
        { name: "name", label: "Name", required: true },
        { name: "description", label: "Description", type: "textarea", rows: 3 },
      ],
    }}
  />
);

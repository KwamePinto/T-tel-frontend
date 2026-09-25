import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminIcon from "../components/AdminIcon";
import { PageHead } from "../components/ui";
import s from "./AdminFAQ.module.css";

const FAQS = [
  {
    category: "Getting started",
    question: "What can I do from the dashboard?",
    where: ["Sidebar", "MAIN", "Dashboard"],
    answer: "The dashboard is the control centre for the whole T-TEL website. Everything a visitor sees on the public site — pages, posts, people, partners, Knowledge Hub documents, menus, forms and site-wide settings — is created and edited here, then reflected live on the public pages once it is published. The left sidebar is split into groups (MAIN, CONTENT, T-TEL, ADMINISTRATION); which groups you see depends on your account's role, covered in the Account section below.",
    steps: [
      "Sign in, which lands you on /admin/dashboard by default.",
      "Read the summary cards at the top for a quick count of posts, pages, people and documents, plus anything waiting in Trash.",
      "Use the sidebar on the left to choose a work area — click a group label to see its items, or click an item directly.",
      "Inside any list page, look for a New / Add / Upload button (usually top-right) to create something, or Edit on an existing row to change it.",
      "Use the quick-action cards on the dashboard itself as shortcuts to the most common tasks (new post, new page, upload media).",
    ],
    links: [{ label: "Open dashboard", to: "/admin/dashboard" }],
  },
  {
    category: "Getting started",
    question: "How do I find an admin area quickly?",
    where: ["Top bar", "Search"],
    answer: "There are two different search boxes in the dashboard, and they search different things. The Search button in the top bar (or Ctrl+K / Cmd+K) opens a command palette that jumps between dashboard sections — it does not search your content. The search box inside a list page (Posts, People, Documents, and so on) searches the records in that list instead.",
    steps: [
      "Press Ctrl+K (Windows/Linux) or Cmd+K (Mac) anywhere in the dashboard, or click Search… in the top bar.",
      "Type part of a section name, such as \"people\", \"media\", or \"theme\".",
      "Use the arrow keys to move the highlight, or click a result directly.",
      "Press Enter, or click the result, to navigate straight to that section.",
      "Press Escape at any time to close the palette without navigating.",
    ],
    links: [{ label: "Open dashboard", to: "/admin/dashboard" }],
  },
  {
    category: "Getting started",
    question: "How is searching inside a list different from Ctrl+K?",
    where: ["Any list page", "search box above the table"],
    answer: "Every resource list (Posts, People, Partners, Documents, Users, and so on) has its own search input directly above the table, next to any status pills or dropdown filters. Typing there filters the rows in that specific list by title or name as you type — it never leaves the page. This is the tool to use when you know which section holds the record but not exactly where it is in a long list.",
    steps: [
      "Open the relevant list, for example Posts or Knowledge Hub.",
      "Click the search field above the table and type a keyword from the title or name.",
      "Combine it with the status pills (All / Published / Draft) or the dropdown filter next to it, where available, to narrow further.",
      "Clear the search field to see the full list again.",
    ],
    links: [{ label: "Manage posts", to: "/admin/posts" }, { label: "Manage documents", to: "/admin/documents" }],
  },
  {
    category: "Content",
    question: "How do I create, edit, publish, or delete a post?",
    where: ["Sidebar", "CONTENT", "Posts"],
    answer: "Posts hold every item-level piece of content that isn't a static page: news articles, Focus Areas, Programmes, and any other entry defined in Content Types. Each post has a Content Type, which decides where it belongs on the public site, and a status of Draft, Published, or Scheduled. Opening a post takes you to its own full editor page (not a popup), where the title, body, image, tags and status live side by side.",
    steps: [
      "Open Posts from the sidebar.",
      "Click New Post to start one, or click any row to open its existing content in the editor.",
      "Set the title, choose the Content Type (this decides which public section it appears under), and write the body using the rich text editor.",
      "Add a featured image and any tags in the side panel.",
      "Choose a status: Draft keeps it hidden, Published makes it live immediately, Scheduled publishes it automatically at a future date/time you set.",
      "Click Save while working, or Publish in the editor header once it's ready to go live.",
      "To remove a post, use Delete from the list (via the row's action menu) or from inside the editor — this moves it to Trash rather than deleting it outright.",
    ],
    links: [{ label: "Manage posts", to: "/admin/posts" }, { label: "Create a post", to: "/admin/posts/new" }],
  },
  {
    category: "Content",
    question: "Where do I edit Focus Areas and Programmes?",
    where: ["Sidebar", "CONTENT", "Pages", "and", "Posts"],
    answer: "These two areas are split deliberately: Pages controls the shell of the Focus Areas or Programmes landing page — its hero image, intro text, and SEO details, i.e. the page a visitor sees before drilling into one specific item. Posts controls each individual Focus Area or Programme itself, using Content Type to mark which of the two it is. A visitor browsing the public site is really moving between one Page (the landing view) and many Posts (the individual entries) without noticing the difference.",
    steps: [
      "To change the landing page itself (its intro copy or hero image), open Pages and select the Focus Areas or Programmes page.",
      "To add or edit one specific Focus Area or Programme, open Posts instead.",
      "Click New Post, or open an existing item, and set its Content Type field to Focus Areas or Programmes.",
      "Fill in the item's own title, body and image, then save or publish it.",
      "Refresh the public landing page to confirm the new or edited item appears in the list.",
    ],
    links: [{ label: "Open pages", to: "/admin/pages" }, { label: "Open posts", to: "/admin/posts" }],
  },
  {
    category: "Content",
    question: "How do I create or edit a page?",
    where: ["Sidebar", "CONTENT", "Pages"],
    answer: "Pages are page-level shells rather than list items. Two kinds exist: a special page has its own purpose-built editor screen because a real React component already renders it on the site (the homepage, for example) — its address (slug) is fixed and cannot be changed here. A custom page uses the generic title/hero/body/SEO editor and can be placed at whatever address you choose. Whether a page shows up in a site menu is controlled separately by its own Show in navigation toggle, not by the Menus section.",
    steps: [
      "Open Pages and click Add a page for a new custom page, or click an existing row (including a special page) to edit it.",
      "For a custom page, set the title, address (slug), template and body content.",
      "For a special page, only the fields its blueprint exposes are editable — the address is fixed to its code-defined route.",
      "Toggle Show in navigation on if the page should appear in a site menu automatically, and set its order if so.",
      "Fill in the SEO tab (meta title/description) so the page shares and searches well.",
      "Save as Draft while working; use the View link to preview the public result before switching the status to Published.",
    ],
    links: [{ label: "Manage pages", to: "/admin/pages" }, { label: "Add a page", to: "/admin/pages/new" }],
  },
  {
    category: "Content",
    question: "How do Content Types and Tags work?",
    where: ["Sidebar", "CONTENT", "Content Types"],
    answer: "A Content Type is a label attached to a post that decides which part of the public site it belongs to — Blog, Focus Areas, Programmes, or any other type an editor has defined. Content Types can be marked Active or Inactive; an inactive type is hidden from the post editor's dropdown but existing posts using it are left untouched. Tags are a separate, lighter-weight label: free text entered directly on a post, with no dedicated management screen — typing a new tag name on a post creates it automatically, and the same name reuses the existing tag.",
    steps: [
      "Open Content Types to see the full list, or click New Content Type to add one (name, optional slug, description).",
      "Toggle Active off for a type that should no longer be offered for new posts, without touching posts that already use it.",
      "Open Posts, create or edit an item, and choose the Content Type from its dropdown.",
      "In the same editor, type tag names into the Tags field — press Enter or comma to confirm each one.",
    ],
    links: [{ label: "Manage content types", to: "/admin/content-types" }, { label: "Manage posts", to: "/admin/posts" }],
  },
  {
    category: "Media",
    question: "How do I upload and reuse images, videos, and files?",
    where: ["Sidebar", "CONTENT", "Media"],
    answer: "Media is the one shared library behind every image, PDF or video used anywhere in the CMS — pages, posts, people's photos, partner logos, Knowledge Hub covers and PDFs, Theme settings, all of it. A file is uploaded once here (or directly from inside a field, see below) and then referenced from as many places as needed; deleting the original from Media removes it everywhere it was used, so replace a file rather than delete-and-re-upload if it's already linked somewhere.",
    steps: [
      "Open Media and click Upload media.",
      "Choose one or more files from your computer (optionally into a folder, for organisation).",
      "Wait for the thumbnail to appear, confirming the upload finished.",
      "Anywhere you see a Media field in another editor (a photo, a logo, a cover image, a PDF file field), click Select from Media Library or Browse instead of leaving that screen.",
      "Pick the file from the library grid — search or scroll if the library is large — and confirm the selection.",
      "Save the record you were editing; the field now shows the chosen file.",
    ],
    links: [{ label: "Open media library", to: "/admin/media" }, { label: "Upload media", to: "/admin/media" }],
  },
  {
    category: "People and partners",
    question: "How do I manage Our People and their groups?",
    where: ["Sidebar", "T-TEL", "Our People"],
    answer: "A person's profile always belongs to exactly one Group (Board of Directors, Secretariat, and so on) — Groups are what actually creates the sections on the public Our People page, so a new section needs its own group created first. Within Our People, clicking New Person or Edit opens a panel over the current list (not a separate page); Group, photo and biography use the same Media Library and dropdown patterns described above and below. The Sort order number decides placement within the group: lower numbers appear first, and ties fall back to whatever order the database returns.",
    steps: [
      "If this person needs a brand new section, open People Groups first and add it (name, short description, optional intro paragraph, sort order).",
      "Open Our People and click Add a person.",
      "Fill in full name, position, and choose the Group from the dropdown — this is required.",
      "Add a photo via Select from Media Library, and write the biography in the rich text field.",
      "Optionally add an email and LinkedIn URL, and set Sort order to control where this person appears within their group.",
      "Set status to Published to make the profile live, or Draft to hold it back, then save.",
      "Open the public Our People page for that group to confirm placement and photo.",
    ],
    links: [{ label: "Manage people", to: "/admin/people" }, { label: "Manage people groups", to: "/admin/people/groups" }],
  },
  {
    category: "People and partners",
    question: "How do I manage Partners and partner groups?",
    where: ["Sidebar", "T-TEL", "Partners", "and", "Partner Groups"],
    answer: "Unlike Our People, a partner can belong to several Partner Groups at once — its Groups field is a set of checkboxes, so tick every section it should appear under (for example both \"Funder\" and \"Technical partner\"). Principal partner shows the logo larger and ahead of the rest; Show on the homepage additionally surfaces it on the public homepage's partner strip, independent of which groups it belongs to.",
    steps: [
      "Open Partner Groups first if a new grouping is needed (name, description, sort order).",
      "Open Partners and click New Partner, or open an existing row to edit it.",
      "Enter the name, tick every relevant group in the Groups checklist, and add the website URL.",
      "Upload or select the logo — a transparent PNG or SVG renders best against the page background.",
      "Toggle Principal partner if it should be shown larger, and Show on the homepage if it should appear there too.",
      "Set Sort order to control its position, save, and check both the public partner page and the homepage strip if relevant.",
    ],
    links: [{ label: "Manage partners", to: "/admin/partners" }, { label: "Manage partner groups", to: "/admin/partner-groups" }],
  },
  {
    category: "Knowledge Hub",
    question: "How do I add a Knowledge Hub document?",
    where: ["Sidebar", "T-TEL", "Knowledge Hub"],
    answer: "A document needs a title and a PDF file at minimum; Collection, cover image, description, and year are optional but strongly recommended, since Collection is what places the document under a category on the public Knowledge Hub, and the cover image is what shows in its card there (a document with no cover falls back to a plain \"PDF\" placeholder on the public page). File and Cover image are both Media fields, so upload or pick them the same way as any other media.",
    steps: [
      "Upload the PDF (and the cover image, if you have one) in Media first, or do it inline from the document form using Select from Media Library.",
      "If the right Collection doesn't exist yet, open Collections and create it there first.",
      "Open Knowledge Hub and click New Document.",
      "Set the title, choose the Collection, and attach the PDF via the File field.",
      "Add the cover image, description, and year if known, and set Sort order for its position within the collection.",
      "Set status to Published, save, and open the public Knowledge Hub page for that collection to confirm it downloads correctly.",
    ],
    links: [{ label: "Manage documents", to: "/admin/documents" }, { label: "Manage collections", to: "/admin/documents/collections" }, { label: "Open media library", to: "/admin/media" }],
  },
  {
    category: "Knowledge Hub",
    question: "How do Knowledge Hub Collections work, and can they be nested?",
    where: ["Sidebar", "T-TEL", "Knowledge Hub", "Collections"],
    answer: "Collections are the categories the public Knowledge Hub is organised into, and they can be nested one level deep using the Parent collection field: leaving it empty makes a top-level collection (shown directly in the Knowledge Hub's main list), while choosing a parent nests it as a sub-collection under that one — this is how, for example, a broader Teacher Education collection can hold narrower ones underneath it. Sort order controls the position of collections at the same level, independent of any other level.",
    steps: [
      "Open Collections from the Knowledge Hub area.",
      "Click New Collection for a top-level category, and leave Parent collection empty.",
      "For a sub-collection, click New Collection again and choose the broader collection in Parent collection.",
      "Set a description if the collection should show introductory text on its public page, and set Sort order to position it among its siblings.",
      "Save, then open Knowledge Hub itself and confirm the Collection dropdown offers the new entry when adding or editing a document.",
    ],
    links: [{ label: "Manage collections", to: "/admin/documents/collections" }, { label: "Manage documents", to: "/admin/documents" }],
  },
  {
    category: "Forms and messages",
    question: "How do I build a form for the public site?",
    where: ["Sidebar", "CONTENT", "Forms"],
    answer: "A form is a reusable definition of fields (name, email, message, dropdowns, and so on) that visitors fill in; once created, it has to be placed somewhere for anyone to see it — either dropped into a page's content, or wired into a Theme setting such as the contact form, or attached to an Event's registration. A form on its own, with nothing pointing at it, is invisible on the public site.",
    steps: [
      "Open Forms and click New Form.",
      "Add at least one field (choose its type — text, email, textarea, select, and so on — and mark it required if needed).",
      "Set the success message shown after a visitor submits, and the form's status.",
      "Save the form, then attach it where it belongs: inside a page's content block, in the relevant Theme settings tab, or as an Event's registration form.",
      "Submit a test entry from the public page to confirm it arrives under View messages.",
    ],
    links: [{ label: "Manage forms", to: "/admin/forms" }],
  },
  {
    category: "Forms and messages",
    question: "Where do form submissions go, and how do I manage them?",
    where: ["Sidebar", "CONTENT", "Forms", "row action", "View messages"],
    answer: "Every submission a visitor sends through a form is stored against that specific form — there is no single combined inbox, so open the form itself to see its messages. Unread submissions are highlighted; opening one marks it read. Deleting a submission removes that message only, it does not affect the form definition or any other message.",
    steps: [
      "Open Forms.",
      "Find the relevant form in the list and use its View messages action.",
      "Click a submission to read its full content and mark it read.",
      "Use Delete on a submission once it's been actioned and no longer needs to stay in the list.",
      "Check back periodically, or watch the unread banner shown across the dashboard, which flags forms with unread messages.",
    ],
    links: [{ label: "Manage forms", to: "/admin/forms" }],
  },
  {
    category: "Navigation",
    question: "How do I change the website menus?",
    where: ["Sidebar", "CONTENT", "Menus"],
    answer: "A menu is a named list of items shown in a specific navigation area — the header and footer are the main ones. Each item in a menu points at one of: a plain URL you type in, or a managed record (a specific page, post, person or content type) picked from a dropdown, so that if that record's own address ever changes, the menu link can be re-pointed without retyping a URL. Reordering, adding and removing items all happen inside the one menu editor; there is no separate list of individual menu items.",
    steps: [
      "Open Menus and choose the menu to edit (for example Header or Footer).",
      "Click Add item to append a new link, or use the existing rows to reorder, edit or remove items.",
      "For each item, choose its link type (URL, or a managed page/post/person/content type) and fill in the matching field.",
      "Set the label shown to visitors, and whether the link opens in the same tab or a new one.",
      "Save the menu, then use View site to click through the live header or footer and confirm the change.",
    ],
    links: [{ label: "Manage menus", to: "/admin/menus" }],
  },
  {
    category: "Settings",
    question: "How do I change site-wide theme settings?",
    where: ["Sidebar", "ADMINISTRATION", "Theme"],
    answer: "Theme brings together everything global that isn't tied to one specific page or post: contact details, social links, homepage section content, which menus and forms feed which slot on the site, and shared visual tokens. Its fields are grouped into tabs along the top of the page; only one tab's fields are shown and saved at a time, so switching tabs without saving discards unsaved changes on the tab you're leaving. The Save changes button only becomes active once something has actually been edited.",
    steps: [
      "Open Theme.",
      "Choose the relevant tab along the top — the tabs available depend on what the site currently exposes as configurable.",
      "Change only the fields relevant to the task at hand; where a field expects a menu, form, or media item, pick it from the matching dropdown or Media Library picker.",
      "Click Save changes once it becomes active — it stays greyed out until a field has actually changed.",
      "Refresh the relevant public page (homepage, footer, contact page) to confirm the change took effect.",
    ],
    links: [{ label: "Open Theme", to: "/admin/theme" }],
  },
  {
    category: "Settings",
    question: "How do I manage authentication settings?",
    where: ["Sidebar", "ADMINISTRATION", "Authentication"],
    answer: "Authentication holds settings that affect how accounts are created and how sign-in behaves site-wide — for example whether self-registration is allowed. It is separate from Users (which manages individual accounts) and from a single account's own Edit profile screen. Only administrators can open this page.",
    steps: [
      "Open Authentication.",
      "Review each setting on the page before changing it — these apply immediately to every account, not just one.",
      "Change only the value the task requires, and save.",
      "Test the affected flow directly (for example, try registering or signing in) to confirm the new behaviour.",
    ],
    links: [{ label: "Open Authentication", to: "/admin/authentication" }],
  },
  {
    category: "Account",
    question: "How do I edit my own name, email, or password?",
    where: ["Top bar", "account menu (your name, top-right)", "Edit profile"],
    answer: "Your own account details are separate from the Users list — Edit profile changes only the account you're currently signed in as, and does not require the Users permission that managing other accounts does, so every signed-in user (including editors) can reach it.",
    steps: [
      "Click your name in the top-right corner of the dashboard to open the account menu.",
      "Choose Edit profile.",
      "Update your name, email, or password fields as needed.",
      "Save the change; if you changed your password, use it the next time you sign in.",
    ],
    links: [{ label: "Edit profile", to: "/admin/profile" }],
  },
  {
    category: "Account",
    question: "Why do I see fewer sidebar options than another user?",
    where: ["Sidebar"],
    answer: "The sidebar is filtered by role. Administrators see every group, including ADMINISTRATION (Users, Authentication, Theme). Editors see everything except the ADMINISTRATION group. Any other signed-in role sees the same as an editor minus Menus, Sliders, Forms, and Content Types, which are considered advanced/structural areas. This affects only what's shown in the sidebar and command palette — a couple of routes (Theme, for instance) additionally check the role directly when opened, so reaching a page isn't only a matter of it being visible in the menu.",
    steps: [
      "Check your role in the account menu, next to your name in the top-right corner.",
      "If a section you need is missing, ask an administrator to either change your role in Users or open that section on your behalf.",
      "Administrators: open Users, edit the account, and change its Role field to grant broader sidebar access.",
    ],
    links: [{ label: "Manage users", to: "/admin/users" }, { label: "Edit profile", to: "/admin/profile" }],
  },
  {
    category: "Administration",
    question: "How do I add or manage dashboard users?",
    where: ["Sidebar", "ADMINISTRATION", "Users"],
    answer: "Users are the actual sign-in accounts for the dashboard, distinct from Our People (which are public-facing profiles with no login). Give each person the lowest role that lets them do their job — see the sidebar-visibility answer above for exactly what each role can reach. Only administrators can open this page at all.",
    steps: [
      "Open Users and click New User.",
      "Enter the person's name, email and a temporary password, and choose their role (admin, editor, or another available role).",
      "Save the account and share the sign-in details with them directly — there is no automatic invitation email.",
      "Use Edit on an existing row to change a name, email, or role; use Delete to remove an account entirely.",
    ],
    links: [{ label: "Manage users", to: "/admin/users" }],
  },
  {
    category: "Administration",
    question: "What happens when I delete a record, and how does Sort order work?",
    where: ["Sidebar", "CONTENT", "Trash"],
    answer: "Most content types (posts, pages, people, partners, documents, and so on) are soft-deleted: choosing Delete moves the record to Trash rather than erasing it, so a mistaken deletion is always recoverable until someone empties it from there. A handful of simpler records (categories/groups in some areas) delete immediately, which the confirmation dialog says explicitly before you confirm. Separately, most lists also use a Sort order number field to control display position on the public site: lower numbers appear first, and it has nothing to do with deletion — it's the same mechanic behind ordering people within a group, partners within a group, and documents within a collection.",
    steps: [
      "Use Delete on the record you want to remove; read the confirmation dialog, since it tells you whether the item goes to Trash or is removed immediately.",
      "Open Trash to review everything currently deleted.",
      "Choose Restore on a record to return it to its original list, exactly as it was.",
      "Choose Permanent delete only once you're certain a record should never come back — this cannot be undone.",
      "To change display order anywhere, open the record's editor and set its Sort order field to a lower number to move it earlier.",
    ],
    links: [{ label: "Open Trash", to: "/admin/trash" }],
  },
  {
    category: "Administration",
    question: "How do I check a change before publishing it?",
    where: ["Any editor", "Save as Draft, then View"],
    answer: "Every post and page can be saved as Draft while you work on it — a draft is never shown on the public site, no matter how long it sits there. The View / View site link opens the exact public route for that record in a new tab, using its real address, so you're checking precisely what a visitor would see rather than a preview approximation.",
    steps: [
      "While editing, keep the status set to Draft and click Save (not Publish).",
      "Use the View link inside the editor, where available, to open the public page in a new tab.",
      "Check images, links, and the layout at a mobile width as well as desktop.",
      "Return to the editor, make any corrections, and save again.",
      "Only switch the status to Published once the content is confirmed correct.",
    ],
    links: [{ label: "Open dashboard", to: "/admin/dashboard" }, { label: "Open pages", to: "/admin/pages" }, { label: "Open posts", to: "/admin/posts" }],
  },
  {
    category: "Advanced content",
    question: "Can I manage Events and Sliders?",
    where: ["Sidebar", "T-TEL", "Events", "and", "Event Categories"],
    answer: "Events, Event Categories, and Sliders are fully built and working in both the API and this dashboard — you can create, edit and delete records in all three — but they are hidden from the sidebar by default because the public site doesn't currently render a page for either one. Content added there today would be saved correctly but invisible to visitors until a public component is built to display it, so don't rely on it for anything time-sensitive.",
    steps: [
      "Only use Events or Event Categories once a public events page or listing exists to show them.",
      "Only use Sliders once a public component is wired up to display slides.",
      "Reach either area directly by its address, since it isn't in the sidebar by default.",
      "If a public destination is added later, ask a developer to restore the sidebar entries in AdminLayout so they're reachable normally again.",
    ],
    links: [{ label: "Open events", to: "/admin/events" }, { label: "Open event categories", to: "/admin/event-categories" }, { label: "Open sliders", to: "/admin/sliders" }],
  },
];

const CATEGORIES = ["All", ...new Set(FAQS.map((item) => item.category))];

export default function AdminFAQ() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("All");
  const [open, setOpen] = useState(null);

  const results = useMemo(() => {
    const terms = query.trim().toLowerCase().split(/\s+/).filter(Boolean);
    return FAQS.filter((item) => {
      if (category !== "All" && item.category !== category) return false;
      if (!terms.length) return true;
      const text = [item.category, item.question, item.answer, ...item.steps, ...(item.where || [])].join(" ").toLowerCase();
      return terms.every((term) => text.includes(term));
    });
  }, [category, query]);

  return (
    <div className={s.page}>
      <PageHead title="Admin FAQ" subtitle="Find the right dashboard action and go straight to the place where it is done." />

      <section className={s.hero}>
        <div className={s.heroCopy}>
          <span className={s.eyebrow}><AdminIcon name="help" size={15} /> T-TEL help centre</span>
          <h2>Everything you can do in the CMS.</h2>
          <p>Search by task, content type, or dashboard area. Each answer explains where the feature lives, how it behaves, and gives step-by-step instructions plus a direct link to finish the task.</p>
        </div>
        <div className={s.heroStat}><strong>{FAQS.length}</strong><span>workflow guides</span></div>
      </section>

      <section className={s.controls} aria-label="Search and filter FAQ">
        <label className={s.search}>
          <AdminIcon name="search" size={18} />
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search activities, content, or settings…" aria-label="Search admin FAQ" />
          {query && <button type="button" className={s.clear} onClick={() => setQuery("")} aria-label="Clear search">×</button>}
        </label>
        <div className={s.filters} role="list" aria-label="FAQ categories">
          {CATEGORIES.map((item) => (
            <button key={item} type="button" className={`${s.filter} ${category === item ? s.filterOn : ""}`} onClick={() => setCategory(item)}>{item}</button>
          ))}
        </div>
      </section>

      <div className={s.resultLine}>
        <strong>{results.length} {results.length === 1 ? "guide" : "guides"}</strong>
        {(query || category !== "All") && <button type="button" onClick={() => { setQuery(""); setCategory("All"); }}>Clear filters</button>}
      </div>

      <section className={s.list}>
        {results.map((item, index) => {
          const id = `${item.category}-${item.question}`;
          const isOpen = open === id || (open === null && !query && index === 0);
          return (
            <article className={`${s.item} ${isOpen ? s.itemOpen : ""}`} key={id}>
              <button type="button" className={s.question} onClick={() => setOpen(isOpen ? null : id)} aria-expanded={isOpen}>
                <span className={s.questionText}><span className={s.category}>{item.category}</span>{item.question}</span>
                <span className={s.chevron}><AdminIcon name="chevronDown" size={17} /></span>
              </button>
              {isOpen && (
                <div className={s.answer}>
                  {item.where?.length > 0 && (
                    <div className={s.where} aria-label="Where this feature lives">
                      {item.where.map((crumb, i) => (
                        <span key={`${crumb}-${i}`} className={s.whereCrumb}>
                          {i > 0 && <AdminIcon name="chevronRight" size={12} />}
                          {crumb}
                        </span>
                      ))}
                    </div>
                  )}
                  <p>{item.answer}</p>
                  <div className={s.detailGrid}>
                    <div>
                      <h3>How to do it</h3>
                      <ol>{item.steps.map((step) => <li key={step}>{step}</li>)}</ol>
                    </div>
                    <div>
                      <h3>Go to</h3>
                      <div className={s.links}>{item.links.map((link) => <Link key={link.to} to={link.to} className={s.link}>{link.label}<AdminIcon name="chevronRight" size={15} /></Link>)}</div>
                    </div>
                  </div>
                </div>
              )}
            </article>
          );
        })}
        {!results.length && <div className={s.empty}><AdminIcon name="search" size={22} /><strong>No guides match that search.</strong><span>Try a broader term such as posts, media, people, or settings.</span></div>}
      </section>
    </div>
  );
}

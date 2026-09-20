import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminIcon from "../components/AdminIcon";
import { PageHead } from "../components/ui";
import s from "./AdminFAQ.module.css";

const FAQS = [
  {
    category: "Getting started",
    question: "What can I do from the dashboard?",
    answer: "The dashboard is the control centre for the T-TEL website. You can publish and organise content, manage people and partners, upload Knowledge Hub resources, edit site settings, review contact messages, manage navigation, and restore or permanently remove records.",
    steps: ["Use the sidebar to choose a work area.", "Use New, Add, or Upload actions to create content.", "Use Edit on an existing row to change it.", "Use the dashboard cards and quick actions for common tasks."],
    links: [{ label: "Open dashboard", to: "/admin/dashboard" }],
  },
  {
    category: "Getting started",
    question: "How do I find an admin area quickly?",
    answer: "Use the Search button in the top bar or press Ctrl+K on Windows. Search matches dashboard sections and takes you directly to the selected area.",
    steps: ["Open Search in the top bar.", "Type a section name such as People, Posts, or Theme.", "Select a result to open that section."],
    links: [{ label: "Open dashboard", to: "/admin/dashboard" }],
  },
  {
    category: "Content",
    question: "How do I create, edit, publish, or delete a post?",
    answer: "Posts hold news, Focus Areas, Programmes, and other item-level content. A post can be saved as a draft, published, scheduled, or moved to Trash.",
    steps: ["Open Posts and choose New Post, or open an existing row.", "Set the title, Content Type, body, image, tags, and status.", "Choose Save or Publish in the editor header.", "Use Delete from the list or editor to move the record to Trash."],
    links: [{ label: "Manage posts", to: "/admin/posts" }, { label: "Create a post", to: "/admin/posts/new" }],
  },
  {
    category: "Content",
    question: "Where do I edit Focus Areas and Programmes?",
    answer: "Pages controls the shell of the Focus Areas or Programmes landing page: hero, title, SEO, and page-level layout. Posts controls the actual individual Focus Area or Programme entries shown on the website.",
    steps: ["For the landing page, open Pages and choose the Focus Areas or Programmes page.", "For an individual item, open Posts and choose an existing item or New Post.", "Set Content Type to Focus Areas or Programmes, then edit the item fields and save."],
    links: [{ label: "Open pages", to: "/admin/pages" }, { label: "Open posts", to: "/admin/posts" }],
  },
  {
    category: "Content",
    question: "How do I create or edit a page?",
    answer: "Pages are for page shells and custom pages. Special pages have their own structured editor; custom pages use the regular title, hero, SEO, and content fields.",
    steps: ["Open Pages and choose Add a page, or select an existing page.", "Complete the title, section, template, hero, and content fields.", "Set navigation visibility, order, and publication status.", "Save the page, then use View to check the public result."],
    links: [{ label: "Manage pages", to: "/admin/pages" }, { label: "Add a page", to: "/admin/pages/new" }],
  },
  {
    category: "Content",
    question: "How do Content Types and Tags work?",
    answer: "Content Types classify posts and determine where item content belongs, such as Blog, Focus Areas, or Programmes. Tags are reusable labels that help organise and filter content.",
    steps: ["Open Content Types to add or edit a post type.", "Open Posts and select the Content Type while editing an item.", "Enter tags in the post editor as needed; matching tag records are created automatically."],
    links: [{ label: "Manage content types", to: "/admin/content-types" }, { label: "Manage posts", to: "/admin/posts" }],
  },
  {
    category: "Media",
    question: "How do I upload and reuse images, videos, and files?",
    answer: "Media is the shared library for files used by pages, posts, people, partners, settings, and Knowledge Hub records. Upload a file once, then select it from the Media Library wherever a media field appears.",
    steps: ["Open Media and choose Upload media.", "Select one or more files and optionally choose a folder.", "Open an editor and choose Select from Media Library or Browse.", "Select the file and save the record using it."],
    links: [{ label: "Open media library", to: "/admin/media" }, { label: "Upload media", to: "/admin/media" }],
  },
  {
    category: "People and partners",
    question: "How do I manage Our People and their groups?",
    answer: "People are individual profiles shown on the public Our People pages. Groups control the sections and categories in which those profiles appear.",
    steps: ["Create or edit a group first if a new section is needed.", "Open Our People and choose Add a person or Edit.", "Set the name, position, group, photo, biography, contact details, order, and status.", "Save and check the public Our People page."],
    links: [{ label: "Manage people", to: "/admin/people" }, { label: "Manage people groups", to: "/admin/people/groups" }],
  },
  {
    category: "People and partners",
    question: "How do I manage Partners and partner groups?",
    answer: "Partners are the institutions shown on the public partner page. Partner Groups control how they are organised and filtered.",
    steps: ["Open Partner Groups to create or edit a grouping.", "Open Partners and create or edit the institution.", "Choose its group, logo, website, homepage visibility, principal status, and order.", "Save and verify the public partner page."],
    links: [{ label: "Manage partners", to: "/admin/partners" }, { label: "Manage partner groups", to: "/admin/partner-groups" }],
  },
  {
    category: "Knowledge Hub",
    question: "How do I add a Knowledge Hub document?",
    answer: "A document needs a title, a PDF from the Media Library, and optionally a collection, cover image, description, year, and status. Collections are the categories used to organise the library.",
    steps: ["Upload the PDF and cover image in Media first.", "Create or choose a collection in Collections.", "Open Knowledge Hub and choose New Document.", "Select the PDF, complete the metadata, choose a status, and save."],
    links: [{ label: "Manage documents", to: "/admin/documents" }, { label: "Manage collections", to: "/admin/documents/collections" }, { label: "Open media library", to: "/admin/media" }],
  },
  {
    category: "Forms and messages",
    question: "How do I create a form and read submissions?",
    answer: "Forms define the fields visitors complete on the website. Submissions are the messages received through each form and can be marked as read or deleted by an editor.",
    steps: ["Open Forms and choose New Form.", "Add at least one field, then configure the status and success message.", "Save the form and place it in the relevant page or Theme setting.", "Use View messages beside a form to read incoming submissions."],
    links: [{ label: "Manage forms", to: "/admin/forms" }],
  },
  {
    category: "Navigation",
    question: "How do I change the website menus?",
    answer: "Menus control navigation areas such as the header and footer. Menu items can point to a URL or to a managed page, post, person, or content type.",
    steps: ["Open Menus and choose the menu to edit.", "Add, remove, or reorder items in the menu editor.", "Set each label, destination, link type, and opening behaviour.", "Save the menu, then use View site to check the result."],
    links: [{ label: "Manage menus", to: "/admin/menus" }],
  },
  {
    category: "Settings",
    question: "How do I change site-wide theme settings?",
    answer: "Theme settings control global content and presentation such as contact details, social links, homepage sections, menus, forms, and visual tokens. Only the fields shown in each tab should be changed.",
    steps: ["Open Theme and select the relevant settings tab.", "Change the values or choose a related menu, form, or media item.", "Save changes when the Save changes button becomes active.", "Refresh the public page to confirm the result."],
    links: [{ label: "Open Theme", to: "/admin/theme" }],
  },
  {
    category: "Settings",
    question: "How do I manage authentication settings?",
    answer: "Authentication controls registration and account-related settings. These settings affect who can create accounts and how the site handles sign-in behaviour.",
    steps: ["Open Authentication.", "Review the settings tab and change only the required values.", "Save changes and test the affected sign-in or registration flow."],
    links: [{ label: "Open Authentication", to: "/admin/authentication" }],
  },
  {
    category: "Administration",
    question: "How do I add or manage dashboard users?",
    answer: "Users are dashboard accounts. Administrators can create accounts, change roles, update details, and remove accounts. Give each person only the role they need.",
    steps: ["Open Users and choose New User.", "Enter the name, email, password, and role.", "Save the account and tell the user to sign in.", "Use Edit to change the account or Delete to remove it."],
    links: [{ label: "Manage users", to: "/admin/users" }],
  },
  {
    category: "Administration",
    question: "What happens when I delete a record?",
    answer: "Most content is moved to Trash first, so it can be restored. Permanent deletion removes the record and should only be used when you are certain it is no longer needed.",
    steps: ["Use Delete on the record you want to remove.", "Open Trash to review deleted records.", "Choose Restore to return a record to its original area.", "Choose Permanent delete only for records that should never return."],
    links: [{ label: "Open Trash", to: "/admin/trash" }],
  },
  {
    category: "Administration",
    question: "How do I check a change before publishing it?",
    answer: "Save content as a draft while working, then use View or View site to inspect published pages. Check the relevant public route, images, links, and mobile layout before changing the status to Published.",
    steps: ["Save the record as Draft while editing.", "Review the fields and use View where it is available.", "Check the public page and related links.", "Return to the editor and publish only when the content is ready."],
    links: [{ label: "Open dashboard", to: "/admin/dashboard" }, { label: "Open pages", to: "/admin/pages" }, { label: "Open posts", to: "/admin/posts" }],
  },
  {
    category: "Advanced content",
    question: "Can I manage Events and Sliders?",
    answer: "The CMS API supports Events, Event Categories, and Sliders. They are available to administrators through their direct routes, but they are not currently shown in the main sidebar because the public site does not yet render these records.",
    steps: ["Use Events or Event Categories only when the corresponding public section is available.", "Use Sliders only when a public component is ready to display them.", "Do not add important public content there until it has a visible destination."],
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
      const text = [item.category, item.question, item.answer, ...item.steps].join(" ").toLowerCase();
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
          <p>Search by task, content type, or dashboard area. Each answer includes the exact route for completing the task.</p>
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

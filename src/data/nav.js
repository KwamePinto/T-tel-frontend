export const NAV_ITEMS = [
  {
    label: "About Us",
    to: "/about-us",
    children: [
      { label: "Our History", to: "/about-us/our-history" },
      { label: "Who We Are", to: "/about-us" },
      {
        label: "Our People",
        to: "/about-us/our-people",
        children: [
          { label: "Subscribers", to: "/about-us/our-people/subscribers" },
          { label: "Board of Directors", to: "/about-us/our-people/board-of-directors" },
          { label: "Key Advisors", to: "/about-us/our-people/key-advisors" },
          { label: "Senior Management Team", to: "/about-us/our-people/senior-management" },
          { label: "Technical Pool", to: "/about-us/our-people/technical-pool" },
          { label: "Finance & Operations", to: "/about-us/our-people/finance-and-operations" },
        ],
      },
      { label: "Our Partners", to: "/about-us/our-partners" },
      { label: "Our Policies", to: "/about-us/our-policies" },
      { label: "Join Us", to: "/join-us" },
    ],
  },
  {
    label: "Focus Areas",
    to: "/focus-areas",
    children: [
      { label: "Curriculum and Assessment", to: "/focus-areas/curriculum-and-assessment" },
      { label: "ICT and Digital Literacy", to: "/focus-areas/ict-and-digital-literacy" },
      {
        label: "Monitoring, Evaluation, Research and Learning",
        to: "/focus-areas/monitoring-evaluation-research-and-learning",
      },
      {
        label: "Gender Equality & Social Inclusion",
        to: "/focus-areas/gender-equality-and-social-inclusion",
      },
      { label: "Leadership Capacity Development", to: "/focus-areas/leadership-capacity-development" },
      { label: "Teacher Professional Development", to: "/focus-areas/teacher-professional-development" },
      {
        label: "Quality Assurance and Accountability",
        to: "/focus-areas/quality-assurance-and-accountability",
      },
      { label: "Inclusive Education", to: "/focus-areas/inclusive-education" },
      { label: "Youth Engagement", to: "/focus-areas/youth-engagement" },
    ],
  },
  {
    label: "Programmes",
    to: "/programmes",
    children: [
      { label: "Secondary Education Reform (Leaders in Teaching)", to: "/programmes/t-shel" },
      { label: "Ghana District Change Project", to: "/programmes/gdcp" },
      { label: "DeliverEd", to: "/programmes/delivered" },
      { label: "EdTech Hub", to: "/programmes/edtech-hub" },
    ],
  },
  {
    label: "Knowledge Hub",
    to: "/knowledge-hub",
    children: [
      { label: "Basic Education", to: "/knowledge-hub" },
      { label: "Secondary Education", to: "/knowledge-hub" },
      { label: "TVET", to: "/knowledge-hub" },
      { label: "Teacher Education", to: "/knowledge-hub" },
      { label: "T-TEL Reports & Publications", to: "/knowledge-hub" },
    ],
  },
  { label: "News & Media", to: "/news-and-media" },
];

export const HEADER_CTA = { label: "Contact Us", to: "/contact-us" };

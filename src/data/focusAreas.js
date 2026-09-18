export const FOCUS_AREAS = [
  {
    slug: "curriculum-and-assessment",
    number: "01",
    tag: "Curriculum",
    accent: "orange",
    title: "Curriculum and Assessment",
    blurb:
      "Curriculum reform is one of our key focus areas. We support the development and enhancement of curricula and assessment frameworks across Ghana's education system.",
    image: "/images/focus/library-review.jpg",
    body: [
      "T-TEL works with the National Council for Curriculum and Assessment (NaCCA) and the Ghana Tertiary Education Commission (GTEC) to design, review and roll out curricula that are fit for Ghana's development ambitions.",
      "Our support spans the full cycle — from framework design and materials development through to the assessment instruments that tell teachers and policymakers whether learning is actually improving.",
    ],
  },
  {
    slug: "ict-and-digital-literacy",
    number: "02",
    tag: "EdTech",
    accent: "teal",
    title: "ICT and Digital Literacy",
    blurb:
      "ICT and digital literacy are essential for preparing learners for further education, the world of work and full participation in a digital economy.",
    image: "/images/focus/students-laptops.jpg",
    body: [
      "We help colleges, schools and district offices build the digital capability they need — devices and connectivity, but more importantly the confidence and pedagogy to use them well.",
      "Our work includes digital learning platforms, teacher digital-skills programmes and low-bandwidth tools designed for the realities of Ghanaian classrooms.",
    ],
  },
  {
    slug: "monitoring-evaluation-research-and-learning",
    number: "03",
    tag: "Evidence",
    accent: "orange",
    title: "Monitoring, Evaluation, Research and Learning",
    blurb:
      "MERL encompasses tracking progress, measuring outcomes and generating the evidence that drives continuous improvement across the education system.",
    image: "/images/focus/data-dashboard.jpg",
    body: [
      "T-TEL's MERL practice turns routine data into decisions. We build dashboards, run surveys and publish research that helps government partners see what is working — and what is not.",
      "Evidence is only useful when it reaches the people who can act on it, so we invest heavily in making findings accessible to district officers, tutors and school leaders.",
    ],
  },
  {
    slug: "gender-equality-and-social-inclusion",
    number: "04",
    tag: "Equity",
    accent: "teal",
    title: "Gender Equality & Social Inclusion",
    blurb:
      "T-TEL partners with the Ministry of Education and the Ghana Education Service to make every classroom safe, equitable and genuinely inclusive.",
    image: "/images/focus/books-children.jpg",
    body: [
      "Gender equality and social inclusion (GESI) is not a separate workstream — it runs through every programme we deliver, from curriculum content to recruitment practice.",
      "We support institutions to develop GESI policies, strengthen safeguarding, and remove the barriers that keep girls and learners with disabilities out of school.",
    ],
  },
  {
    slug: "leadership-capacity-development",
    number: "05",
    tag: "Leadership",
    accent: "orange",
    title: "Leadership Capacity Development",
    blurb:
      "Strong school leadership is central to improving teaching and learning outcomes at every level of the system.",
    image: "/images/focus/leadership-conference.jpg",
    body: [
      "We work with headteachers, college principals and district directors to build the management and instructional-leadership skills that make schools work.",
      "Our leadership programmes combine structured training with on-the-job coaching and peer learning networks that continue long after a workshop ends.",
    ],
  },
  {
    slug: "teacher-professional-development",
    number: "06",
    tag: "Teaching",
    accent: "teal",
    title: "Teacher Professional Development",
    blurb:
      "Teacher Professional Development is at the core of Ghana's educational reform and of everything T-TEL does.",
    image: "/images/focus/laptop-review.jpg",
    body: [
      "T-TEL has supported the rollout of continuous professional development across Ghana's Colleges of Education and basic schools, reaching tens of thousands of teachers and tutors.",
      "Professional Learning Community (PLC) sessions, subject-specific handbooks and tutor coaching form the backbone of this work.",
    ],
  },
  {
    slug: "quality-assurance-and-accountability",
    number: "07",
    tag: "Quality",
    accent: "orange",
    title: "Quality Assurance and Accountability",
    blurb:
      "External assessment of the new curriculum and of teachers' pedagogical practice, alongside the accountability systems that sustain quality.",
    image: "/images/focus/library-review.jpg",
    body: [
      "We help regulators including GTEC, NaSIA and the National Teaching Council strengthen the standards, inspection regimes and licensing systems that underpin education quality.",
      "Accountability works best when it is transparent, so we support the public reporting of results at institution and district level.",
    ],
  },
  {
    slug: "inclusive-education",
    number: "08",
    tag: "Inclusion",
    accent: "teal",
    title: "Inclusive Education",
    blurb:
      "Every learner — including those with special educational needs and disabilities — deserves an education that works for them.",
    image: "/images/focus/sign-language.jpg",
    body: [
      "T-TEL supports the development of inclusive teaching practice, accessible learning materials and specialist provision such as Ghanaian Sign Language instruction.",
      "We work with colleges to ensure the next generation of teachers graduates equipped to teach every child in their classroom.",
    ],
  },
  {
    slug: "youth-engagement",
    number: "09",
    tag: "Voice",
    accent: "orange",
    title: "Youth Engagement",
    blurb:
      "Young people are not just beneficiaries of education reform — they are partners in shaping it.",
    image: "/images/focus/books-children.jpg",
    body: [
      "Our youth engagement work creates structured channels for students and recent graduates to inform policy, evaluate programmes and hold institutions to account.",
      "This includes youth advisory panels, participatory research and communications campaigns led by young Ghanaians.",
    ],
  },
];

export function getFocusArea(slug) {
  return FOCUS_AREAS.find((f) => f.slug === slug);
}

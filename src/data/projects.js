export const PROJECTS = [
  {
    slug: "t-shel",
    title: "Secondary Education Reform (Leaders in Teaching)",
    partner: "In partnership with Mastercard Foundation",
    image: "/images/work/t-shel.jpg",
    summary:
      "A programme with the Ministry of Education and Ghana Education Service, funded by Mastercard Foundation, focused on improving the quality of teaching and learning in secondary schools and strengthening school leadership.",
    description: [
      "Secondary Education Reform (Leaders in Teaching / T-SHEL) is implemented in partnership with the Ministry of Education, the Ghana Education Service and Mastercard Foundation under the Young Africa Works in Ghana strategy.",
      "The project works with school leaders and teachers to improve the quality of teaching and learning in secondary schools, strengthening leadership capacity and supporting sustainable improvements in learning outcomes for young people across Ghana.",
    ],
  },
  {
    slug: "gdcp",
    title: "Ghana District Change Project: Communities of Excellence",
    partner: "In partnership with Jacobs Foundation",
    image: "/images/work/gdcp.png",
    summary:
      "A Ministry of Education initiative, funded by Jacobs Foundation, working in the districts of Akuapem South, Bosome Freho and Lambussie since March 2022.",
    description: [
      "The Ghana District Change Project (also known as Communities of Excellence, or 'Managing for Learning') is a Ministry of Education initiative funded by the Jacobs Foundation.",
      "Since March 2022, the project has worked in the districts of Akuapem South, Bosome Freho and Lambussie to strengthen district-level education management and drive locally-led improvements in learning outcomes.",
    ],
  },
  {
    slug: "delivered",
    title: "DeliverEd",
    partner: "In partnership with University of Oxford and University of Toronto",
    image: null,
    summary:
      "A research project building knowledge on how governments can deliver education reforms and achieve policy priorities, in partnership with the University of Oxford and University of Toronto.",
    description: [
      "DeliverEd is a research project which sought to build knowledge on how to deliver education reforms by strengthening the evidence base on how governments can achieve policy priorities.",
      "The project is delivered in partnership with the Blavatnik School of Government at the University of Oxford and the University of Toronto.",
    ],
  },
  {
    slug: "edtech-hub",
    title: "COVID-19 Impact Assessment Study",
    partner: "In partnership with the EdTech Hub",
    image: "/images/work/edtech-hub.jpg",
    summary:
      "A research study, in partnership with the EdTech Hub, assessing the impact of the COVID-19 pandemic on Ghana's education system.",
    description: [
      "The COVID-19 Impact Assessment Study is a research partnership between T-TEL and the EdTech Hub, examining how the pandemic affected teaching, learning and education delivery in Ghana.",
      "Findings from the study inform T-TEL's ongoing work supporting resilient, equitable education systems.",
    ],
  },
];

export function getProjectBySlug(slug) {
  return PROJECTS.find((p) => p.slug === slug);
}

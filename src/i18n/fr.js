/**
 * French for the site's own words — the navigation, buttons, empty states and
 * labels the interface says for itself.
 *
 * Keyed by the English string rather than by an invented key, for two
 * reasons: a component reads as what it renders (`t("Read more")`), and
 * anything not in here falls through to English untouched, so a new string
 * appears in English rather than as a missing-key placeholder.
 *
 * This does not cover the content held in the CMS — pages, programmes,
 * biographies, document titles. Those carry their own French in the database;
 * see the `translations` field on the models.
 */
export default {
  // ---- navigation & chrome ----
  "Home": "Accueil",
  "About Us": "À propos",
  "Who We Are": "Qui sommes-nous",
  "Our History": "Notre histoire",
  "Our People": "Notre équipe",
  "Our Partners": "Nos partenaires",
  "Our Policies": "Nos politiques",
  "Focus Areas": "Domaines d’intervention",
  "Programmes": "Programmes",
  "Knowledge Hub": "Centre de ressources",
  "News & Media": "Actualités et médias",
  "News &amp; Media": "Actualités et médias",
  "Contact Us": "Nous contacter",
  "Join Us": "Nous rejoindre",
  "Join Our Team": "Rejoignez notre équipe",
  "Main": "Principal",
  "Mobile": "Mobile",
  "Breadcrumb": "Fil d’Ariane",
  "Pagination": "Pagination",
  "Skip to content": "Aller au contenu",
  "T-TEL home": "Accueil T-TEL",
  "Back to top": "Retour en haut",
  "Toggle menu": "Ouvrir le menu",
  "New tab": "Nouvel onglet",

  // ---- display settings ----
  "Accessibility and display settings": "Paramètres d’accessibilité et d’affichage",
  "Display settings": "Paramètres d’affichage",
  "Text size": "Taille du texte",
  "Theme": "Thème",
  "Language": "Langue",
  "Toggle dark mode": "Basculer en mode sombre",
  "Reset to defaults": "Rétablir les valeurs par défaut",

  // ---- search ----
  "Search": "Rechercher",
  "Search the site": "Rechercher sur le site",
  "Close search": "Fermer la recherche",
  "Searching…": "Recherche en cours…",
  "Search keyword…": "Mot-clé…",
  "Search this collection": "Rechercher dans cette collection",
  "Search T-TEL — reports, programmes, people…":
    "Rechercher sur T-TEL — rapports, programmes, personnes…",
  "Enter": "Entrée",
  "Esc": "Échap",

  // ---- actions ----
  "Read": "Lire",
  "Read more": "Lire la suite",
  "Learn more": "En savoir plus",
  "Download": "Télécharger",
  "Full story": "Article complet",
  "View profile": "Voir le profil",
  "View all posts": "Voir toutes les publications",
  "View all current openings": "Voir tous les postes à pourvoir",
  "Apply now": "Postuler",
  "Apply Filter": "Appliquer le filtre",
  "Browse collection": "Parcourir la collection",
  "Browse the collections": "Parcourir les collections",
  "Get in touch": "Nous écrire",
  "Talk to the team": "Contacter l’équipe",
  "Try again": "Réessayer",
  "Close": "Fermer",
  "Close preview": "Fermer l’aperçu",
  "Back to home": "Retour à l’accueil",
  "Back to News &amp; Media": "Retour aux actualités",
  "All articles": "Tous les articles",
  "All focus areas": "Tous les domaines d’intervention",
  "All programmes": "Tous les programmes",
  "More articles": "Plus d’articles",
  "Please choose…": "Veuillez choisir…",

  // ---- carousels & paging ----
  "Next page": "Page suivante",
  "Previous page": "Page précédente",
  "Next articles": "Articles suivants",
  "Previous articles": "Articles précédents",
  "Next focus areas": "Domaines suivants",
  "Previous focus areas": "Domaines précédents",
  "Next funders": "Bailleurs suivants",
  "Previous funders": "Bailleurs précédents",
  "Focus areas carousel": "Carrousel des domaines d’intervention",
  "Order": "Ordre",
  "Order by": "Trier par",
  "Ascending": "Croissant",
  "Descending": "Décroissant",
  "All": "Tous",

  // ---- section headings ----
  "At a glance": "En bref",
  "Overview": "Aperçu",
  "The Project": "Le projet",
  "Explore other areas": "Découvrir d’autres domaines",
  "Explore the full record": "Consulter le dossier complet",
  "Other programmes": "Autres programmes",
  "What we focus on": "Nos domaines d’intervention",
  "How we work": "Notre façon de travailler",
  "Where our technical assistance goes to work":
    "Où intervient notre assistance technique",
  "Delivered in partnership with government":
    "Mis en œuvre en partenariat avec le gouvernement",
  "The People": "L’équipe",
  "Behind the Work": "Derrière le travail",
  "Governance": "Gouvernance",
  "Governance & Delivery": "Gouvernance et mise en œuvre",
  "Our governing policies": "Nos politiques de gouvernance",
  "Safeguarding": "Protection",
  "Resources": "Ressources",
  "Latest Briefing": "Dernière note d’information",
  "Press &amp; Media": "Presse et médias",
  "Access our digital assets and media kits for institutional coverage.":
    "Accédez à nos ressources numériques et dossiers de presse pour vos publications.",
  "Available Positions": "Postes à pourvoir",
  "Open Role": "Poste ouvert",
  "Opportunity": "Opportunité",
  "Careers": "Carrières",
  "Inquiries": "Demandes",
  "Office": "Bureau",
  "Opening hours": "Heures d’ouverture",
  "Phone": "Téléphone",
  "Email": "E-mail",
  "LinkedIn": "LinkedIn",
  "Connect with us": "Suivez-nous",
  "Connect With Us": "Suivez-nous",
  "T-TEL office location": "Adresse du bureau de T-TEL",

  // ---- states ----
  "Loading…": "Chargement…",
  "Loading document…": "Chargement du document…",
  "Error 404": "Erreur 404",
  "Page not found": "Page introuvable",
  "The page you were looking for doesn&rsquo;t exist or has moved.":
    "La page que vous cherchez n’existe pas ou a été déplacée.",
  "No articles published yet.": "Aucun article publié pour le moment.",
  "No collections published yet.": "Aucune collection publiée pour le moment.",
  "No focus areas published yet.": "Aucun domaine d’intervention publié pour le moment.",
  "No groups yet.": "Aucun groupe pour le moment.",
  "No partners listed yet.": "Aucun partenaire répertorié pour le moment.",
  "No people listed in this group yet.": "Aucune personne répertoriée dans ce groupe.",
  "No programmes published yet.": "Aucun programme publié pour le moment.",
  "Policy documents will appear here once they are published.":
    "Les documents de politique apparaîtront ici une fois publiés.",

  // ---- menu labels held in the CMS, translated here as a fallback ----
  "Subscribers": "Membres fondateurs",
  "Board of Directors": "Conseil d’administration",
  "Key Advisors": "Conseillers principaux",
  "Management": "Direction",
  "Our Team": "Notre équipe",
  "Reports & Publications": "Rapports et publications",
  "About": "À propos",

  // ---- nouns used in counts and labels ----
  "article": "article",
  "articles": "articles",
  "collections": "collections",
  "directory": "répertoire",
  "documents": "documents",
  "focus area": "domaine d’intervention",
  "focus areas": "domaines d’intervention",
  "form": "formulaire",
  "page": "page",
  "partners": "partenaires",
  "policies": "politiques",
  "programme": "programme",
  "programmes": "programmes",
  "team": "équipe",
  "PDF": "PDF",
};

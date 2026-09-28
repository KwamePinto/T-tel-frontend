import { useSearchParams } from "react-router-dom";
import { Partners as PartnersManager, PartnerGroups as PartnerGroupsManager } from "./resources";
import s from "./Partners.module.css";

// One sidebar entry, one screen — Partners and the groups they're organised
// into used to be two separate pages, which meant leaving a partner's own
// form just to add a group it should belong to. The two lists themselves are
// unchanged (still their own ResourceManager, still fully independent CRUD);
// this only removes the need to go find the other one in the sidebar.
const TABS = [
  { value: "partners", label: "Partners" },
  { value: "groups", label: "Groups" },
];

export default function Partners() {
  const [params, setParams] = useSearchParams();
  const tab = params.get("tab") === "groups" ? "groups" : "partners";

  return (
    <div className={s.wrap}>
      <nav className={s.tabs} aria-label="Partners sections">
        {TABS.map((t) => (
          <button
            key={t.value}
            type="button"
            className={`${s.tab} ${tab === t.value ? s.tabOn : ""}`}
            onClick={() => setParams(t.value === "partners" ? {} : { tab: t.value })}
          >
            {t.label}
          </button>
        ))}
      </nav>

      {tab === "groups" ? <PartnerGroupsManager /> : <PartnersManager />}
    </div>
  );
}

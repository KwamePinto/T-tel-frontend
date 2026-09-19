import Icon from "./Icon";
import styles from "./TeamModal.module.css";

export default function TeamModal({ person, onClose }) {
  if (!person) return null;

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <button className={styles.close} onClick={onClose} aria-label="Close">
          <Icon name="close" size={20} />
        </button>
        {person.photo && (
          <img src={person.photo} alt={person.name} className={styles.photo} />
        )}
        <h3>{person.name}</h3>
        <p className={styles.position}>{person.position}</p>
        {person.bio &&
          person.bio
            .split("\n\n")
            .map((para, i) => <p key={i}>{para}</p>)}
      </div>
    </div>
  );
}

import Markdown from '../markdown';
// El texto vive en un solo archivo, src/content/aviso-privacidad.md: se edita ahí y se vuelve a desplegar.
import noticeSource from '../content/aviso-privacidad.md?raw';

export default function PrivacyPage() {
  return (
    <div className="page">
      <article className="legal">
        <Markdown source={noticeSource} />
      </article>
    </div>
  );
}

import { useInstallPrompt } from "../../hooks/useInstallPrompt";
import { useToast } from "../common/Toast";

export function InstallButton() {
  const { canInstall, promptInstall } = useInstallPrompt();
  const showToast = useToast();

  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={async () => {
        const accepted = await promptInstall();
        if (accepted) showToast("Aplicación instalada.");
      }}
      className="flex items-center gap-1 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700"
    >
      <i className="fa fa-download" aria-hidden="true" />
      Instalar
    </button>
  );
}

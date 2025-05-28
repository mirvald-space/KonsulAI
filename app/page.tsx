import dynamic from "next/dynamic";

// Используем динамический импорт для компонента CallInterface, чтобы избежать ошибок SSR
const CallInterface = dynamic(() => import("@/components/CallInterface"), {
  ssr: false,
});

export default function Page() {
  return (
    <div className="grow flex flex-col">
      <CallInterface />
    </div>
  );
}

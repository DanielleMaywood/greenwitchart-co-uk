import { performSync } from "./actions";

export default function Home() {
  return (
    <div>
      Admin
      <form action={performSync}>
        <button type="submit">Sync</button>
      </form>
    </div>
  );
}

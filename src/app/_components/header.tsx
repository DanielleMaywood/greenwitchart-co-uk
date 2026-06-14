import Link from "next/link";

export default function Header() {
  return (
    <header>
      <HeaderNav />
    </header>
  );
}

function HeaderNav() {
  return (
    <nav>
      <ul className="flex flex-row gap-6">
        <li>
          <Link href="/shop">Shop</Link>
        </li>
        <li>
          <Link href="/gallery">Gallery</Link>
        </li>
        <li>
          <Link href="/commissions">Commissions</Link>
        </li>
        <li>
          <Link href="/sustainability">Sustainability</Link>
        </li>
        <li>
          <Link href="/about">About</Link>
        </li>
        <li>
          <Link href="/contact">Contact</Link>
        </li>
      </ul>
    </nav>
  );
}

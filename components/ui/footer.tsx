import Link from "next/link";

export function Footer() {
  return (
    <footer className="w-full py-4 px-4 md:px-6 flex justify-center text-sm text-muted-foreground">
      <p>
        2025 made by{" "}
        <span className="inline-flex items-center">
          ❤️{" "}
          <Link 
            href="https://mirvald.space" 
            target="_blank" 
            rel="noopener noreferrer"
            className="hover:underline ml-1"
          >
            mirvald.space
          </Link>
        </span>
      </p>
    </footer>
  );
} 
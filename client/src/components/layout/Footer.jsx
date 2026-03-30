export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 py-8 px-6 text-center text-sm text-muted-foreground">
      © {new Date().getFullYear()} Intervue. Built to talk. Trained to understand.
    </footer>
  );
}

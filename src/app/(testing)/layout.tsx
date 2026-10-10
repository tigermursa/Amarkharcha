export default function TestLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div>
      <h1>আমার Test Layout</h1>

      {children}

      <footer>Test Footer</footer>
    </div>
  );
}

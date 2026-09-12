export default function Footer({ embedded = false }: { embedded?: boolean }) {
  return (
    <footer className={`${embedded ? "" : "mt-24"} border-t border-line bg-surface`}>
      <div className="mx-auto max-w-6xl px-5 py-8">
        <div className="flex flex-col items-center justify-center gap-3 text-center">
          <p className="font-display text-xl italic text-primary">
            ForestView <span className="not-italic text-ink">Homestay</span>
          </p>

          <p className="text-xs text-neutral-400">
            © {new Date().getFullYear()} ForestView Homestay. Đã đăng ký bản quyền.
          </p>
        </div>
      </div>
    </footer>
  );
}

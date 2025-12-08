import Container from "./ui/Container";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-slate-200 bg-white">
      <Container className="py-8 text-sm text-slate-600 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>© {new Date().getFullYear()} RentMagnify</div>
        <div className="flex items-center gap-6">
          <Link to="/privacy" className="hover:text-slate-900">Privacy</Link>
          <Link to="/terms" className="hover:text-slate-900">Terms</Link>
          <a href="mailto:contact@rentmagnify.com" className="hover:text-slate-900">Contact</a>
          <a href="mailto:corrections@rentmagnify.com" className="hover:text-slate-900">Request Correction</a>
        </div>
      </Container>
    </footer>
  );
}


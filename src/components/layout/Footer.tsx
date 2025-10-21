export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t-5 border-black mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="text-center space-y-4">
          {/* Brand */}
          <div className="font-display text-xl sm:text-2xl font-extrabold text-primary">
            ResumeMatch AI
          </div>

          {/* Description */}
          <p className="text-sm sm:text-base text-muted-foreground max-w-md mx-auto">
            Optimize your resume with AI-powered analysis for better job matches
          </p>

          {/* Links */}
          <div className="flex flex-wrap justify-center gap-4 sm:gap-6 text-sm sm:text-base">
            <a
              href="mailto:contact@resumematch.ai"
              className="text-foreground hover:text-primary transition-colors"
            >
              Contact
            </a>
            <a
              href="/privacy"
              className="text-foreground hover:text-primary transition-colors"
            >
              Privacy
            </a>
            <a
              href="/terms"
              className="text-foreground hover:text-primary transition-colors"
            >
              Terms
            </a>
          </div>

          {/* Copyright */}
          <div className="pt-4 border-t-2 border-black">
            <p className="text-xs sm:text-sm text-muted-foreground">
              © {currentYear} ResumeMatch AI. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}

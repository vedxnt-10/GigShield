import { SignUp } from "@clerk/clerk-react";
import { Sparkles } from "lucide-react";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-paper flex flex-col justify-center px-6">
      <div className="max-w-md w-full mx-auto">
        <div className="flex items-center justify-center gap-2 mb-8">
          <Sparkles className="text-alert w-6 h-6" />
          <h1 className="font-display text-3xl tracking-tight">GIGSHIELD</h1>
        </div>

        <div className="flex justify-center">
          <SignUp 
            routing="path" 
            path="/sign-up" 
            signInUrl="/login"
            appearance={{
              elements: {
                rootBox: "w-full shadow-card",
                card: "bg-surface border-hairline/70 rounded-card p-6 shadow-none",
                headerTitle: "font-display text-lg text-ink",
                headerSubtitle: "font-body text-sm text-ink/60",
                formButtonPrimary: "bg-ink hover:bg-ink/90 text-paper font-mono text-[10px] uppercase tracking-widest py-3 rounded",
                formFieldLabel: "font-mono text-[9px] uppercase tracking-widest text-ink/40 mb-1.5",
                formFieldInput: "bg-paper border-hairline/60 rounded px-3 py-2.5 font-body text-sm text-ink outline-none focus:border-ink/30 transition-colors",
                footerActionLink: "text-ink hover:text-ink/80 font-mono text-xs",
                socialButtonsBlockButton: "border-hairline/60 bg-paper hover:bg-ink/5 text-ink text-sm font-body font-medium",
                socialButtonsBlockButtonText: "font-body font-medium",
                dividerLine: "bg-hairline/60",
                dividerText: "text-ink/40 font-mono text-[9px]",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}

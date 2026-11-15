import { AuthButton } from "@/components/auth/auth-provider";
import { buttonVariants } from "@/components/ui/button";
import { products } from "@/config/products";

/** Shown instead of the workspace to a visitor who is not signed in. */
export function SignInGate() {
  // The dialog returns the visitor to the workspace page they asked for.
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="font-display text-3xl font-light tracking-tight text-heading">
        Sign in to open your workspace
      </h1>
      <p className="mt-3 text-muted-foreground">
        Your AutoFlow AI projects are private to your account.
      </p>
      <div className="mt-8 flex justify-center gap-3">
        <AuthButton mode="login" returnLabel={products.autoflow.name} className={buttonVariants()}>
          Log in
        </AuthButton>
        <AuthButton
          mode="signup"
          returnLabel={products.autoflow.name}
          className={buttonVariants({ variant: "secondary" })}
        >
          Sign up
        </AuthButton>
      </div>
    </div>
  );
}

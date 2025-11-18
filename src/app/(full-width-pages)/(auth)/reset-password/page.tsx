import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | TailAdmin",
  description:
    "Enter your email address and we'll send you a password reset link.",
};

export default function ResetPasswordPage() {
  return (
      <div className="flex w-full lg:w-1/2 items-center justify-center">
        <div className="w-full max-w-[480px] px-2 sm:px-6">
          <h1 className="mb-2 text-[28px] sm:text-[32px] font-semibold text-gray-900 dark:text-white">
            Forgot your password?
          </h1>
          <p className="mb-8 text-sm text-gray-500 dark:text-gray-400">
            Enter the email address linked to your account, and we’ll send you a
            link to reset your password.
          </p>

          <form className="space-y-5" action="#" method="post">
            <div>
              <label
                htmlFor="email"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Email<span className="text-error-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                className="block w-full rounded-lg border border-gray-200 bg-transparent px-4 py-3 text-gray-900 placeholder-gray-400 outline-none focus:ring-2 focus:ring-brand-500 dark:border-gray-800 dark:text-white dark:placeholder-gray-500"
              />
            </div>

            <button
              type="submit"
              className="w-full rounded-lg bg-brand-500 px-4 py-3 text-sm font-medium text-white transition hover:bg-brand-600 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-0"
            >
              Send reset link
            </button>
          </form>

          <p className="mt-6 text-sm text-gray-500 dark:text-gray-400">
            Wait, I remember my password…{" "}
            <Link
              href="/signin"
              className="font-medium text-brand-600 hover:underline"
            >
              Click here
            </Link>
          </p>
        </div>
      </div>
  );
}

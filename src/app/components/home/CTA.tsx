import Link from "next/link";
import { ArrowRight } from "lucide-react";

const CTA = () => {
  return (
    <section className="px-6 pb-24">
      <div className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-16 text-center text-white shadow-2xl lg:px-16">
        <h2 className="text-4xl font-bold">
          Ready to Make Medication Use Safer?
        </h2>

        <p className="mx-auto mt-6 max-w-2xl text-lg text-emerald-50">
          Join Drug Checker AI today and gain
          access to intelligent medication safety
          tools designed to help you make informed
          decisions.
        </p>

        <Link
          href="/register"
          className="mt-10 inline-flex items-center gap-2 rounded-2xl bg-white px-8 py-4 font-semibold text-emerald-700 transition hover:scale-105"
        >
          Create Free Account

          <ArrowRight className="h-5 w-5" />
        </Link>
      </div>
    </section>
  );
};

export default CTA;
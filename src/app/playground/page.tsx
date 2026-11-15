import type { Metadata } from "next";
import { Playground } from "@/components/Playground";

export const metadata: Metadata = {
  title: "ML Playground",
  description:
    "Place points, pick a classifier and watch the decision boundary. KNN, perceptron and naive Bayes, written from scratch and running in your browser.",
};

export default function PlaygroundPage() {
  return (
    <div className="pb-8 pt-12 sm:pt-16">
      <p className="label">playground</p>
      <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
        Decision boundaries, live
      </h1>
      <p className="mt-4 max-w-2xl text-lg leading-relaxed text-ink2">
        Place points or load a dataset, pick a classifier, and see what it
        learns. All three algorithms are written from scratch and run in your
        browser.
      </p>
      <Playground />
    </div>
  );
}

import type { Metadata } from "next";
import { DotGridStory } from "@/components/DotGridStory";
import { PageIntro } from "@/components/PageIntro";
import { story } from "./story";

export const metadata: Metadata = {
  title: "Try Now",
  description: "Interactive demos and experiments.",
};

export default function TryNowPage() {
  return (
    <>
      <PageIntro eyebrow="02 · Try Now" title={<>Things you can <em>play with</em></>}>
        <p>Interactive demos and experiments will live here.</p>
      </PageIntro>

      <div className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
        <DotGridStory blocks={story} credit="Translated by Cooper Stone, 2020" />
      </div>
    </>
  );
}

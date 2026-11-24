import type { Metadata } from "next";
import { DotGridStory } from "@/components/DotGridStory";
import { PageIntro } from "@/components/PageIntro";

export const metadata: Metadata = {
  title: "Try Now",
  description: "Interactive demos and experiments.",
};

const story =
  "This internship gives Barstow College students hands-on experience at a museum dedicated to the history and culture of the Mojave River. The intern compiles bookstore orders accurately and on time, completes sales, keeps inventory records current, and keeps the bookstore and front desk areas clean and organized. They greet patrons warmly and help them readily, and they bring real curiosity about the Mojave River region, both learning about it and sharing it with visitors. As needed, the intern also helps docents and board members with general tasks related to curating and maintaining exhibits.";

export default function TryNowPage() {
  return (
    <>
      <PageIntro eyebrow="02 · Try Now" title={<>Things you can <em>play with</em></>}>
        <p>Interactive demos and experiments will live here.</p>
      </PageIntro>

      <div className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
        <DotGridStory text={story} credit="Translated by Cooper Stone, 2020" />
      </div>
    </>
  );
}

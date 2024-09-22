"use client";

import { useState } from "react";
import H4 from "../H4";
import P from "../P";
import { Button } from "../ui/button";
import H2 from "../H2";
import PeerReviewComponent from "../PeerReview";
import { AvatarWithName } from "../Avatar";

interface Review {
  id: number;
  name: string;
  time: string;
  score: number;
  title: string;
  content: string;
}

export default function PaperContentComponent() {
  const [expandedReviews, setExpandedReviews] = useState<
    Record<number, boolean>
  >({});

  const toggleReview = (reviewId: number) => {
    setExpandedReviews((prev) => ({
      ...prev,
      [reviewId]: !prev[reviewId],
    }));
  };

  const reviews: Review[] = [
    {
      id: 1,
      name: "Amit Das",
      time: "4 days ago",
      score: 5.0,
      title:
        "Innovative Approach to Personalization in E-Commerce: Revolutionizing the Customer Experience",
      content:
        "In the ever-evolving world of e-commerce, personalization has become a critical factor in shaping customer experiences and determining the success of online businesses. As the market continues to grow, and consumers are presented with an overwhelming number of choices, companies that leverage personalization to offer tailored experiences are more likely to stand out. This review introduces a groundbreaking approach to personalization in e-commerce, a field that has traditionally relied on algorithms, behavioral data, and predictive analytics to deliver customized experiences. The innovative approach highlighted in this paper seeks to not only refine existing personalization techniques but also introduce new methods that are set to reshape the future of online shopping.",
    },
    {
      id: 2,
      name: "Sophia Chen",
      time: "3 days ago",
      score: 4.8,
      title: "Comprehensive Analysis of AI-Driven Personalization Techniques",
      content:
        "This paper provides a comprehensive analysis of AI-driven personalization techniques...",
    },
  ];

  return (
    <div className="mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <div className="mb-4 flex flex-wrap gap-2">
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
              E-Commerce
            </span>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
              AI
            </span>
            <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded">
              Personalization
            </span>
          </div>
          <H2 className="mb-4 text-pretty font-semibold text-zinc-700">
            E-Commerce Personalization Using AI Algorithms
          </H2>
          <P className="mb-4 text-pretty font-light">
            Analyzes how AI algorithms can personalize the e-commerce
            experience, enhancing customer satisfaction and sales.
          </P>
          <div className="flex items-center space-x-1 mb-4">
            <AvatarWithName name="Amit Das" />
            <AvatarWithName name="Mia Patel" />
            <span className="text-sm text-zinc-500">
              Mia Patel, Noah Scott • 10 minutes ago
            </span>
          </div>
          <div className="mt-6 bg-zinc-100 p-4">
            <P className="text-pretty text-sm text-zinc-900">
              Support research to show the paper
            </P>
          </div>
        </div>

        <div className="flex flex-col space-y-4 mt-10 md:mt-0">
          <Button
            className="w-full md:w-1/2 md:self-end hidden"
            variant="outline"
          >
            Write a review
          </Button>
          <div className="md:hidden mt-10">
            <H4 className="font-semibold font-atkinson mb-4">Peer-Reviews</H4>
            {reviews.map((review: Review) => (
              <PeerReviewComponent
                key={review.id}
                review={review}
                isExpanded={expandedReviews[review.id]}
                onToggle={() => toggleReview(review.id)}
              />
            ))}
          </div>
          <div className="hidden md:block">
            <H4 className="font-semibold pt-24 font-atkinson">Peer-Reviews</H4>
            {reviews.map((review: Review) => (
              <PeerReviewComponent
                key={review.id}
                review={review}
                isExpanded={expandedReviews[review.id]}
                onToggle={() => toggleReview(review.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

"use client";

import React, { useState, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { PaperSchema, RatingSchema } from "@/lib/validation";
import {
  INITIALRATING,
  RATINGCATEGORIES,
  RATINGCATEGORYLABELS,
} from "@/lib/constants";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: PaperSchema;
  onSubmit: (rating: RatingSchema) => void;
}

export default function RatingModal({
  isOpen,
  onClose,
  paper,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] = useState<RatingSchema>(INITIALRATING);

  const handleScoreChange = (category: keyof RatingSchema, value: string) => {
    setRating((prevRating) => ({
      ...prevRating,
      [category]: parseInt(value, 10) * 2, // Multiply by 2 to get the 2-10 scale
    }));
  };

  const handleSubmit = () => {
    onSubmit(rating);
    onClose();
  };

  const isAllRated = useMemo(() => {
    return Object.values(rating).every(
      (score) => typeof score === "number" && score > 0,
    );
  }, [rating]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-primary">
        <DialogHeader>
          <DialogTitle className="text-center text-xl text-black">
            Rate this paper
          </DialogTitle>
          <DialogDescription className="text-center text-sm text-zinc-200">
            Please rate the paper on the following criteria
          </DialogDescription>
        </DialogHeader>
        <div className="py-4 px-10">
          {RATINGCATEGORIES.map((category) => (
            <div key={category as string} className="mb-2">
              <Label className="block text-sm font-medium text-zinc-100 mb-2">
                {RATINGCATEGORYLABELS[category]}
              </Label>
              <RadioGroup
                onValueChange={(value) => handleScoreChange(category, value)}
                className="flex justify-between "
                value={(rating[category] / 2).toString()}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem
                      value={value.toString()}
                      id={`${category}-${value}`}
                      className={`w-4 h-4 rounded-full mb-1
                        ${
                          rating[category] === value * 2
                            ? "bg-zinc-900 border-3 border-zinc-900"
                            : "bg-violet-300/50 border-2 border-violet-300/50"
                        }`}
                    />
                    <Label
                      htmlFor={`${category}-${value}`}
                      className="text-xs text-violet-300"
                    >
                      {value}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
          ))}
        </div>
        <DialogFooter className="flex gap-3">
          <Button
            onClick={onClose}
            className="bg-violet-300 text-zinc-800 hover:bg-violet-400"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-zinc-800 text-white hover:bg-zinc-900"
            disabled={!isAllRated}
          >
            Submit Rating
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

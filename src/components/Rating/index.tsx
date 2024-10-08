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
import { Loader2 } from "lucide-react"; // Import a loading icon
import { ResearchPaperType } from "@/lib/types";

interface RatingModalProps {
  isOpen: boolean;
  onClose: () => void;
  paper: ResearchPaperType;
  onSubmit: (rating: RatingSchema) => Promise<void>;
}

export default function RatingModal({
  isOpen,
  onClose,
  paper,
  onSubmit,
}: RatingModalProps) {
  const [rating, setRating] = useState<RatingSchema>(INITIALRATING);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setError(null);
    try {
      await onSubmit(rating);
      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleScoreChange = (category: keyof RatingSchema, value: string) => {
    setRating((prevRating) => ({
      ...prevRating,
      [category]: parseInt(value, 10) * 20, // Maps 1-5 to 20-40-60-80-100
    }));
  };

  const isAllRated = useMemo(() => {
    return Object.values(rating).every((score) => score > 0);
  }, [rating]);

  const handleClose = () => {
    if (!isSubmitting) {
      setRating(INITIALRATING);
      setError(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
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
            <div key={category} className="mb-2">
              <Label className="block text-sm font-medium text-zinc-100 mb-2">
                {RATINGCATEGORYLABELS[category]}
              </Label>
              <RadioGroup
                onValueChange={(value) => handleScoreChange(category, value)}
                className="flex justify-between"
                value={(rating[category] / 20).toString()}
              >
                {[1, 2, 3, 4, 5].map((value) => (
                  <div key={value} className="flex flex-col items-center">
                    <RadioGroupItem
                      value={value.toString()}
                      id={`${category}-${value}`}
                      className={`w-4 h-4 rounded-full mb-1
                        ${
                          rating[category] === value * 20
                            ? "bg-zinc-900 border-3 border-zinc-900"
                            : "bg-violet-300/50 border-2 border-violet-300/50"
                        }`}
                      disabled={isSubmitting}
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
            onClick={handleClose}
            className="bg-violet-300 text-zinc-800 hover:bg-violet-400"
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            className="bg-zinc-800 text-white hover:bg-zinc-900"
            disabled={!isAllRated || isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Rating"
            )}
          </Button>
        </DialogFooter>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </DialogContent>
    </Dialog>
  );
}

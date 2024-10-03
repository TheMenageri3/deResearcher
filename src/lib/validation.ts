import { z } from "zod";

export const PaperState = z.enum([
  "AwaitingPeerReview",
  "InPeerReview",
  "ApprovedToPublish",
  "RequiresRevision",
  "Published",
  "Minted",
]);

export const ProfileFormData = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters"),
  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),
  email: z.string().trim().email("Invalid email address"),
  organization: z.string().trim().optional(),
  website: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  socialLink: z.string().trim().url("Invalid URL").optional().or(z.literal("")),
  bio: z.string().trim().max(500, "Bio must be 500 words or less").optional(),
  profileImage: z.string().optional(),
});

export const PaperFormData = z.object({
  title: z.string().trim().min(5, "Title must be at least 5 characters"),
  authors: z
    .union([
      z.string().transform((val) =>
        val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ),
      z.array(z.string()),
    ])
    .refine(
      (value) =>
        Array.isArray(value)
          ? value.every((author) => author.length >= 2)
          : true,
      "Each author name must be at least 2 characters long",
    )
    .refine(
      (value) => (Array.isArray(value) ? value.length > 0 : true),
      "Must have at least one author",
    ),
  price: z
    .union([z.string(), z.number()])
    .refine(
      (val) => {
        const num = typeof val === "string" ? parseFloat(val) : val;
        return !isNaN(num) && num >= 0;
      },
      {
        message: "Price must be a non-negative number",
      },
    )
    .transform((val) => {
      const num = typeof val === "string" ? parseFloat(val) : val;
      return Number(num.toFixed(2));
    }),
  abstract: z.string().trim().min(250, "Abstract must be at least 250 words"),
  domains: z
    .union([
      z.string().transform((val) =>
        val
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
      ),
      z.array(z.string()),
    ])
    .refine(
      (value) =>
        Array.isArray(value)
          ? value.every((author) => author.length >= 2)
          : true,
      "Each author name must be at least 2 characters long",
    )
    .refine(
      (value) => (Array.isArray(value) ? value.length > 0 : true),
      "Must have at least one author",
    ),
  paperImage: z
    .instanceof(File)
    .refine((file) => file.type === "image/png", "Only PNG files are allowed")
    .optional()
    .or(z.literal("")),
  paperFile: z
    .instanceof(File, { message: "Please upload a PDF file" })
    .refine(
      (file) => file.size <= 5000000,
      "File size should be less than 5 MB",
    )
    .refine(
      (file) => file.type === "application/pdf",
      "Only PDF files are allowed",
    ),
});

export const ReviewSchema = z.object({
  id: z.string().optional(),
  address: z.string(),
  reviewerPubkey: z.string(),
  paperPubkey: z.string(),
  // mapping frontend score to working with backend 1-10 scale
  qualityOfResearch: z
    .number()
    .min(1)
    .max(5)
    .transform((v) => v * 2),
  potentialForRealWorldUseCase: z
    .number()
    .min(1)
    .max(5)
    .transform((v) => v * 2),
  domainKnowledge: z
    .number()
    .min(1)
    .max(5)
    .transform((v) => v * 2),
  practicalityOfResultObtained: z
    .number()
    .min(1)
    .max(5)
    .transform((v) => v * 2),
  metaDataMerkleRoot: z.array(z.number()).length(64).optional(),
  metadata: z.object({
    reviewComments: z.string(),
  }),
  createdAt: z.date(),
  updatedAt: z.date(),
  bump: z.number().optional(),
});

export const PaperSchema = z.object({
  id: z.string(),
  address: z.string().optional(), // TODO: Will remove optional when production
  creatorPubkey: z.string(),
  state: PaperState.default("InPeerReview"),
  accessFee: z.number().nullable().default(0),
  references: z.array(z.string()).optional(),
  paperContentHash: z.array(z.number()),
  totalApprovals: z.number().default(0),
  totalCitations: z.number().default(0),
  totalMints: z.number().default(0),
  metaDataMerkleRoot: z.array(z.number()).optional(),
  version: z.number().default(1),
  metadata: z.object({
    title: z.string().trim().min(5, "Title must be at least 5 characters"),
    abstract: z.string().trim(), // TODO: Will change back when production
    // abstract: z
    //   .string()
    //   .trim()
    //   .min(250, "Description must be at least 250 words"),
    authors: z.array(z.string()),
    domain: z.string(),
    tags: z.array(z.string()),
    references: z.array(z.string()),
    paperImageURI: z.string(),
    decentralizedStorageURI: z.string(),
    datePublished: z.union([z.string(), z.date()]),
  }),
  bump: z.number().optional(),
  createdAt: z.union([z.string(), z.date()]),
  updatedAt: z.union([z.string(), z.date()]),
  peerReviews: z.array(ReviewSchema).optional(),
});

// TypeScript types
export type ProfileFormData = z.infer<typeof ProfileFormData>;
export type PaperFormData = z.infer<typeof PaperFormData>;
export type Review = z.infer<typeof ReviewSchema>;
export type Paper = z.infer<typeof PaperSchema>;

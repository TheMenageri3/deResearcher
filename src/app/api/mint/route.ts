import { NextRequest, NextResponse } from "next/server";
import { toErrResponse, toSuccessResponse } from "../helpers";
import { ResearchPaperModel, ResearchTokenAccountModel } from "@/app/models";

import {
  ResearchTokenAccountType,
  MintResearchPaperSchema,
  ResearchTokenAccountWithResearchePaper,
  ResearchPaperType,
} from "../types";

export async function GET(req: NextRequest): Promise<NextResponse> {
  try {
    const searchParams = req.nextUrl.searchParams;
    const researcherPubkey = searchParams.get("researcherPubkey");

    if (!researcherPubkey) {
      return toErrResponse("researcherPubkey is required");
    }

    const researchTokenAccounts =
      await ResearchTokenAccountModel.find<ResearchTokenAccountType>({
        researcherPubkey: researcherPubkey,
      });

    const researchTokenAccountsWithResearchPapers: ResearchTokenAccountWithResearchePaper[] =
      [];

    for (const researchTokenAccount of researchTokenAccounts) {
      const researchPaper = await ResearchPaperModel.findOne<ResearchPaperType>(
        {
          address: researchTokenAccount.address,
        }
      );

      if (researchPaper) {
        researchTokenAccountsWithResearchPapers.push({
          researchTokenAccount: researchTokenAccount,
          researchPaper: researchPaper,
        });
      }
    }

    return toSuccessResponse(researchTokenAccountsWithResearchPapers);
  } catch (err) {
    console.error("Error checking minter status:", err);
    return toErrResponse("Error checking minter status");
  }
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  try {
    const unsafeData = await req.json();

    const data = MintResearchPaperSchema.parse(unsafeData);

    const existing =
      await ResearchTokenAccountModel.findOne<ResearchTokenAccountType>({
        readerPubkey: data.researcherPubkey,
        address: data.address,
      });

    if (existing) {
      return toErrResponse("Research Token Account already exists");
    }

    const researchPaper = await ResearchTokenAccountModel.findOne({
      address: data.address,
    });

    if (!researchPaper) {
      return toErrResponse("Research Paper not found");
    }

    let newResearchTokenAccount: ResearchTokenAccountType = {
      researcherPubkey: data.researcherPubkey,
      address: data.address,
      bump: data.bump,
    };

    newResearchTokenAccount = await ResearchTokenAccountModel.create(
      newResearchTokenAccount
    );

    const newResearchTokenAccountWithResearchPaper: ResearchTokenAccountWithResearchePaper =
      {
        researchTokenAccount: newResearchTokenAccount,
        researchPaper: researchPaper,
      };

    return toSuccessResponse(newResearchTokenAccountWithResearchPaper);
  } catch (err) {
    return toErrResponse("Error creating Research Mint Collection");
  }
}

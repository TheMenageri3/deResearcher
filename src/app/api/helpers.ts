import { NextResponse } from "next/server";

export const toErrResponse = (err: string): NextResponse => {
  return NextResponse.json(
    {
      error: err,
    },
    {
      status: 400,
    }
  );
};

export const toSuccessResponse = (data: any): NextResponse => {
  return NextResponse.json(
    {
      data,
    },
    {
      status: 200,
    }
  );
};

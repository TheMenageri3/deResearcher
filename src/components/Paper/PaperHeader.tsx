import React from "react";
import { AvatarImageOrName } from "../Avatar";
import { formatTimeAgo } from "@/lib/helpers";
import H2 from "../H2";
import P from "../P";

type PaperHeaderProps = {
  title: string;
  abstract: string;
  authors: string[];
  tags: string[];
  version: number;
  createdAt?: string;
};

const PaperHeader = React.memo(
  ({
    title,
    abstract,
    authors,
    tags,
    version,
    createdAt,
  }: PaperHeaderProps) => (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <span
              key={index}
              className="bg-violet-100 text-violet-800 text-xs font-medium px-2.5 py-0.5 rounded"
            >
              {tag}
            </span>
          ))}
        </div>
        <span className="bg-violet-100 text-violet-800 text-xs font-medium px-2.5 py-0.5 rounded">
          v{version}
        </span>
      </div>
      <H2 className="mb-4 text-pretty font-semibold text-zinc-700">{title}</H2>
      <P className="mb-4 text-pretty font-light">{abstract}</P>
      <div className="flex items-center space-x-1 mb-4">
        {authors.map((author, index) => (
          <AvatarImageOrName key={index} name={author} />
        ))}
        <span className="text-sm text-zinc-500">
          {authors.join(", ")} • {formatTimeAgo(createdAt ?? "")}
        </span>
      </div>
    </>
  ),
);

PaperHeader.displayName = "PaperHeader";
export default PaperHeader;

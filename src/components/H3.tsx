import { cn } from "@/lib/utils/helpers";

export default function H3(props: React.HTMLProps<HTMLHeadingElement>) {
  return (
    <h3
      {...props}
      className={cn(
        "text-2xl font-medium text-primarytracking-tighter",
        props.className,
      )}
    />
  );
}

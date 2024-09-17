import { cn } from "@/lib/utils/helpers";

export default function H4(props: React.HTMLProps<HTMLHeadingElement>) {
  return (
    <h4
      {...props}
      className={cn(
        "text-xl font-medium text-primarytracking-tighter",
        props.className,
      )}
    />
  );
}

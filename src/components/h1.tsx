import { cn } from "@/lib/utils";

type H1Pops={
  children:React.ReactNode;
  className?: string;
}


export default function H1({children, className}:H1Pops) {
  return <h1 className={cn("text-2xl font-medium leading-6", className)}>{children}</h1>
}

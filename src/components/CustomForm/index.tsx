import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";
import { Textarea, TextareaProps } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type CustomFormItemProps = {
  label: string;
  field: any; // Replace with the specific type from react-hook-form if possible
  isEditing?: boolean;
  placeholder: string;
  InputComponent?: React.ElementType;
  inputProps?: InputProps | TextareaProps;
  labelClassName?: string;
  inputClassName?: string;
};

export default function CustomFormItem({
  label,
  field,
  isEditing = true,
  placeholder,
  InputComponent = Input,
  inputProps = {},
  labelClassName = "",
  inputClassName = "",
}: CustomFormItemProps) {
  return (
    <FormItem>
      <FormLabel
        className={cn("text-xs text-zinc-700 font-semibold", labelClassName)}
      >
        {label}
      </FormLabel>
      <FormControl>
        <InputComponent
          {...field}
          {...inputProps}
          disabled={!isEditing}
          placeholder={placeholder}
          className={cn(
            "text-sm border-zinc-200 text-zinc-700",
            "focus:ring-2 focus:ring-primary focus:border-primary",
            "transition-all duration-200 tracking-wide",
            inputClassName,
          )}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

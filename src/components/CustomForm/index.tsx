import {
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input, InputProps } from "@/components/ui/input";
import { Textarea, TextareaProps } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type BaseCustomFormItemProps = {
  label: string;
  field: any; // Replace with the specific type from react-hook-form if possible
  isEditing?: boolean;
  placeholder: string;
  labelClassName?: string;
  inputClassName?: string;
};

type CustomFormItemPropsWithInput = BaseCustomFormItemProps & {
  InputComponent?: typeof Input;
  inputProps?: InputProps;
};

type CustomFormItemPropsWithTextarea = BaseCustomFormItemProps & {
  InputComponent: typeof Textarea;
  inputProps?: TextareaProps;
};

type CustomFormItemProps =
  | CustomFormItemPropsWithInput
  | CustomFormItemPropsWithTextarea;

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
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (
      InputComponent === Input &&
      (inputProps as InputProps).type === "number"
    ) {
      // Allow leading zero only if it's followed by a decimal point
      const numberValue = value.replace(/^0+(?=\d)/, "").replace(/^\./, "0.");
      field.onChange(numberValue === "" ? "" : numberValue);
    } else {
      field.onChange(value);
    }
  };

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
          onChange={handleChange}
          value={field.value}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  );
}

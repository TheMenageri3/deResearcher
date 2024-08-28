type ButtonProps = {
  name: string;
  action: () => void;
};
export const Button = ({ name, action }: ButtonProps) => {
  return (
    <button
      className={`bg-primary text-white text-xs font-bold py-2 px-4 rounded w-fit`}
      onClick={action}
    >
      {name}
    </button>
  );
};

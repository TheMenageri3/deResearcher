type ButtonProps = {
  name: string;
  action: () => void;
};
export const Button = ({ name, action }: ButtonProps) => {
  return (
    <button
      className={`bg-primary text-white text-sm font-bold py-2 px-4 rounded w-fit hover:bg-primaryDark`}
      onClick={action}
    >
      {name}
    </button>
  );
};
